const sqlite = require('sqlite-async')

const mime = require('mime-types')
const fs = require('fs-extra')

/*
 * Pledges
 * Module handles the creation, viewing and approval of a pledge
 */
module.exports = class Pledges {

	/**
     * Create pledge object
     * @param {String} [dbName=":memory:"] is the name of the database file being used
     */
	constructor(dbName = ':memory:') {
		// create database if not yet existing
		return (async() => {
			this.db = await sqlite.open(dbName)
			const sql = 'CREATE TABLE IF NOT EXISTS pledges(\
id INTEGER PRIMARY KEY AUTOINCREMENT,\
title VARCHAR(60) NOT NULL,\
image BLOB NOT NULL,\
moneyTarget INTEGER NOT NULL,\
deadline INTEGER NOT NULL,\
description VARCHAR(600) NOT NULL,\
longitude INTEGER,\
latitude INTEGER,\
creator VARCHAR(30) NOT NULL,\
approved BOOLEAN NOT NULL CHECK (approved IN (0,1)),\
FOREIGN KEY(creator) REFERENCES users(username));'
			await this.db.run(sql)
			return this
		})()
	}

	/*
     * Creates a new pledge and adds it to database
     * @param {JSON} contains all information for the pledge that the user input
     * @param {File} the image the user selected for the pledge
     * @returns the URL the pledge can be viewed on, throws error if failed to make pledge
     */
	async newpledge(body, image) {
		let imagename
		try {
			await this.pledgeCheck(body, image)
			const [ long, lat ] = [ null, null ]
			const millisecondsInSeconds = 1000
			const unixDeadline = new Date(body.deadline).getTime() / millisecondsInSeconds

			imagename = await this.imageSetup(body, image) // upload img and make path

			// add to database
			const sql = await this.createNewPledgeSQL(body, imagename, unixDeadline, long, lat)
			await this.db.run(sql)

			return await this.createPledgeURL(imagename)

		} catch (error) {
			if(imagename) { // remove image from filesystem (if possible)
				fs.remove(`public/assets/images/pledges/${imagename}`, err => {
					throw `${error}\n\n${err}`
				})
			}
			throw error
		}
	}

	/*
     * Formats SQL to insert pledge into database
     * @param {JSON} contains all information for the pledge that the user input
     * @param {String} the path for the image selected by the user, after being saved to filesystem
     * @param {Integer} the unix time for the pledges' deadline
     * @param {Integer} longitude of the pledges' location -> currently null as feature not yet implemented
     * @param {Integer} latitude of the pledges' location -> currently null as feature not yet implemented
	 * @returns {String} returns sql string ready for executing
	 */
	async createNewPledgeSQL(body, img, unix, long, lat) {
		const sql = `INSERT INTO pledges(title, image, moneyTarget, deadline,
description, longitude, latitude, creator, approved) VALUES (
'${body.pledgename}', '${img}', ${body.fundgoal}, ${unix}, '${body.desc}',
${long}, ${lat}, '${body.creator}', 0);`
		return sql
	}

	/*
     * generates url for the pledge from the image name (deadline and title)
     * @param {String} the name of the image file
     * @returns {String} the URL for the pledge
     */
	async createPledgeURL(imagename) {
		// returns url for pledge
		const unix = imagename.substr(0,imagename.indexOf('-'))
		const imgname = imagename.substr(imagename.indexOf('-')+1)
		const name = imgname.substr(0, imgname.lastIndexOf('.'))
		return `${unix}/${name}`
	}

	/*
     * saves the pledge image to the filesystem
     * @param {JSON} contains all information for the pledge that the user input
     * @param {File} the image the user selected for the pledge
     * @returns {String} the name of the saved image
     */
	async imageSetup(body, image) {
		// upload image to filesystem
		const saveName = `${Date.now()}-${body.pledgename.replace(/\s/g, '-')}.${mime.extension(image.type)}`
		await fs.copy(image.path, `public/assets/images/pledges/${saveName}`)
		return saveName
	}

	/*
     * checks if the user inputted the form correctly
     * if not throws error that alerts the user
     * @param {JSON} contains all information for the pledge that the user input
     * @param {File} the image the user selected for the pledge
	 * @returns {Boolean} returns true if user form input is correct otherwise throws error
	 */
	async pledgeCheck(body, image) {
		// TODO
		return true
	}

	/*
     * gets data for a pledge from the imagename
     * @param {String} the name of the image, without the file extension
     * @returns {JSON} returns all data for the pledge
     *                 the calculated value of money raised from the donations table
     */
	async getPledge(unixTitle) {
		//moneyRaised
		let sql = `SELECT COUNT(id) AS count FROM pledges WHERE image LIKE '${unixTitle}.%'`
		const result = await this.db.get(sql)
		if( result.count === 1 ) {
			// get pledge data
			sql = `SELECT pledges.*, SUM(donations.amount) AS moneyRaised FROM 
pledges LEFT JOIN donations ON pledges.id = donations.pledgeId WHERE pledges.image LIKE '${unixTitle}.%';`
			const data = await this.db.get(sql)

			return data // return pledge data
		}
		throw new Error('Could not find Pledge in db')
	}

	/*
     * gets a list of pledges to display on the home screen
     * @param {Integer} this multiplied by the numOfPledges is how many pledges are currently
     *                      displayed on the home screen
     *                  this allows the user to load additional pledges while scrolling
     *                  stops long wait time for waiting for all pledges to load at once
     * @param {String} determines whether the user wants to also display finished pledges
     *                 was originally a boolean but now treated as a string after the sending
     *                     in the GET request
     * @param {Char} if the user is an admin, shows pledges that are awaiting approval
     *               was originally an integer but now treated as a string after the sending
     *                   in the GET request
     * @returns {JSON} returns json of up to 20 pledges, with data for the home screen
     */
	async listPledges(offset, showFinished, admin) {
		// get list of pledges
		let sql = `SELECT p.title, p.creator, p.deadline, d.moneyRaised, p.moneyTarget, 
p.image, p.approved FROM pledges AS p LEFT JOIN ( SELECT pledgeId, 
SUM(amount) AS moneyRaised FROM donations GROUP BY pledgeId 
) AS d ON d.pledgeId = p.id `//WHERE p.approved = 1`

		if( admin==='1' ) { // if user is not admin, display only approved listings
			// is admin
			if( showFinished === 'false' ) sql += ' WHERE'
		}else{
			// is not admin
			sql += ' WHERE p.approved = 1'
			if( showFinished === 'false' ) sql += ' AND'
		}

		const numOfPledges = 20
		if( showFinished === 'false' ) {
			// do not display finished listings
			sql += ' deadline > strftime(\'%s\', \'now\') AND ( moneyRaised < moneyTarget OR moneyRaised IS NULL)'
		}
		sql += ` ORDER BY deadline LIMIT ${numOfPledges} OFFSET ${numOfPledges*offset};`

		const data = await this.db.all(sql)
		return data
	}

	/*
     * updates a pledges' approved status to true
     * @param {Integer} id of the pledge
     */
	async approvePledge(id) {
		const sql = `UPDATE pledges SET approved = 1 WHERE id = ${id};`
		await this.db.run(sql)
	}

	/* if a pledge is not approved, it is deleted from the database
     * @param {Integer} id of the pledge
     */
	async denyPledge(id) {
		const sql = `DELETE FROM pledges WHERE id = ${id};`
		await this.db.run(sql)
	}

	async close() {
		await this.db.close()
	}

}

const sqlite = require('sqlite-async')

const mime = require('mime-types')
const fs = require('fs-extra')

module.exports = class Account {

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
PRIMARY KEY(id, image),\
FOREIGN KEY(creator) REFERENCES users(username));'
			await this.db.run(sql)
			return this
		})()
	}

	//CREATE NEW PLEDGE
	/* eslint-disable complexity, max-lines-per-function */
	async newpledge(body, image) {
		let imagename
		try {
			// TODO: error checking
			await this.pledgeCheck(body, image) // TODO: input checking
			const long = null
			const lat = null
			const unixDeadline = new Date(body.deadline).getTime() / 1000

			imagename = await this.imageSetup(body, image) // upload img and make path
            
			// add to database
			const sql = `INSERT INTO pledges(title, image, moneyTarget, deadline,\
description, longitude, latitude, creator, approved) VALUES (\
'${body.pledgename}', '${imagename}', ${body.fundgoal}, ${unixDeadline}, '${body.desc}',\
${long}, ${lat}, '${body.creator}', 0);`
			await this.db.run(sql)
          
			// returns url for pledge
			const unix = imagename.substr(0,imagename.indexOf('-'))
			const imgname = imagename.substr(imagename.indexOf('-')+1)
            const name = imgname.substr(0, imgname.lastIndexOf('.'))
			return `${unix}/${name}`

		} catch (error) {
			if(imagename) { // remove image from filesystem (if possible)
				fs.remove(`public/assets/images/pledges/${imagename}`, err => {
					throw `${error}\n\n${err}`
				})
			}
			throw error
		}
	}
	/* eslint-enable complexity, max-lines-per-function */

	async imageSetup(body, image) {
		// upload image to filesystem
		const saveName = `${Date.now()}-${body.pledgename.replace(/\s/g, '-')}.${mime.extension(image.type)}`
		await fs.copy(image.path, `public/assets/images/pledges/${saveName}`)
		return saveName
	}

	async pledgeCheck(body, image) {
        // TODO
		return true
	}


	async getPledge(unixTitle) {
        //moneyRaised
		let sql = `SELECT COUNT(id) AS count FROM pledges WHERE image LIKE '${unixTitle}.%'`
        var result = await this.db.get(sql)
        if( result.count === 1 ){
            // get pledge data
            sql = `SELECT pledges.*, SUM(donations.amount) AS moneyRaised FROM pledges LEFT JOIN donations ON pledges.id = donations.pledgeId WHERE pledges.image LIKE '${unixTitle}.%';`
            const data = await this.db.get(sql)
          
            return data // return pledge data
        }
        throw new Error("Could not find Pledge in db")
	}

	async listPledges() {
		//todo
	}

	async close() {
		await this.db.close()
	}

}

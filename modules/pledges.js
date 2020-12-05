const sqlite = require('sqlite-async')

var mime = require('mime-types')
var fs = require('fs-extra')

module.exports = class Account {

	constructor(dbName = ':memory:') {
		// todo: create database if not yet existing
		return (async() => {
			this.db = await sqlite.open(dbName)
			const sql = 'CREATE TABLE IF NOT EXISTS pledges(\
id INTEGER PRIMARY KEY AUTOINCREMENT,\
title VARCHAR(60) NOT NULL,\
image BLOB NOT NULL,\
moneyRaised INTEGER,\
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

	//CREATE NEW PLEDGE
	async newpledge(body, image) {
        let imagename
		try {
			// TODO: error checking
            var long = null
            var lat = null
            var unixDeadline = new Date(body.deadline).getTime() / 1000
            
            imagename = await this.imageSetup(body, image) // upload img and make path
            
			// add to database
            let sql = `INSERT INTO pledges(title, image, moneyRaised, moneyTarget, deadline,\
description, longitude, latitude, creator, approved) VALUES (\
'${body.pledgename}', '${imagename}', 0, ${body.fundgoal}, ${unixDeadline}, '${body.desc}',\
${long}, ${lat}, '${body.creator}', 0);`
            await this.db.run(sql)
			return true

		} catch (error) {
            if(imagename){ // remove image from filesystem (if possible)
                fs.remove(`public/assets/images/pledges/${imagename}`, err => {})
            }
			throw error
		}
	}
    
    async imageSetup(body, image){
        // upload image to filesystem
        let saveName = `${Date.now()}-${body.pledgename.replace(/\s/g, "-")}.${mime.extension(image.type)}`
        await fs.copy(image.path, `public/assets/images/pledges/${saveName}`)
        return saveName
    }


	async getPledge() {

	}

	async listPledges() {

	}

	async close() {
		await this.db.close()
	}

}

const sqlite = require('sqlite-async')


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
	async newpledge(json) {
		try {
			//throw new Error("todo")
            
            console.log( json )
                
			// check if any fields are empty
            
            
            // check deadline hasnt yet passed
            

			// add to database
            

			return true

		} catch (error) {
			throw error
		}
	}


	async getPledge() {

	}

	async listPledges() {

	}

	async close() {
		await this.db.close()
	}

}

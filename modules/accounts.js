const sqlite = require('sqlite-async')
const bcrypt = require('bcrypt-promise')


const saltRounds = 7

module.exports = class Account {

	constructor(dbName = ':memory:') {
		// create database if not yet existing
		return (async() => {
			this.db = await sqlite.open(dbName)
			const sql = 'CREATE TABLE IF NOT EXISTS users(\
id INTEGER PRIMARY KEY AUTOINCREMENT,\
email VARCHAR(345) NOT NULL,\
username VARCHAR(30) NOT NULL,\
password VARCHAR(60) NOT NULL,\
admin BOOLEAN NOT NULL CHECK (admin IN (0,1)));'
			await this.db.run(sql)
			return this
		})()
	}

	//REGISTER NEW USER
	async register(email, username, password) {
		try {
			// check if any fields are empty
			if( email.length === 0 || username.length === 0 || password.length === 0) {
				throw new Error('Not all fields are filled')
			}
			// check if username already exists
			let sql = `SELECT COUNT(id) AS count FROM users WHERE username = '${username}';`
			let result = await this.db.get(sql)
			if( result.count !== 0 ) throw new Error('This username is already in use')
			// check if email is already in use
			sql = `SELECT COUNT(id) AS count FROM users WHERE email = '${email}';`
			result = await this.db.get(sql)
			if( result.count !== 0 ) throw new Error('This email address is already in use')
			// encrypt password
			password = await bcrypt.hash(password, saltRounds)
			// add to database
			sql = `INSERT INTO users(email, username, password, admin) VALUES (\
'${email}', '${username}', '${password}', 0);`
			await this.db.run(sql)
			return true

		} catch (error) {
			// ERROR
			//console.log(error);
			throw error
		}
	}

	//LOGIN USER
	async login(encodedData) {
        try {
            const data = Buffer.from(encodedData, 'base64').toString() // decode
            const [ username, password ] = data.split(':') // split into password and username
            // check db for user
            const sql = `SELECT username, password, admin FROM users WHERE username = '${username}';`
            const result = await this.db.get(sql)
            // check if any users exist
            if(!result) throw new Error(`${username} is not a registered user`);
            // check if passwords match
            const match = await bcrypt.compare(password, result.password); // encrypt
            if(!match) throw new Error('Password is incorrect');

            return { username: username, admin: result.admin }
            
        } catch (error) {
            //ERROR
            //console.log(error)
            throw error;
        }
	}


	async close() {
		await this.db.close()
	}

}

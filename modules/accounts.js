const sqlite = require('sqlite-async')
const bcrypt = require('bcrypt-promise')

const saltRounds = 7

/**
 * Account
 * Module that handles logging in and registration of accounts
 */
module.exports = class Account {

	/**
     * Create account object
     * @param {String} [dbName=":memory:"] is the name of the database file being used
     */
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

	/*
	 * Registers a new user
	 * @param {String} the users' email address
	 * @param {String} the users' username
	 * @param {String} the users' password
	 * @returns {Boolean} returns true is new user has been added, otherwise throws error
	 */
	async register(email, username, password) {
		// check if any fields are empty
		await this.registerCheck(email, username, password) // TODO: input checking

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

	}

	/*
     * checks if the user inputted correct credentials
     * if not throws error that alerts the user
	 * @param {String} the users' email address
	 * @param {String} the users' username
	 * @param {String} the users' password
	 * @returns {Boolean} returns true if user form input is correct otherwise throws error
	 */
	async registerCheck(email, username, password) {
		/*
        if( email.length === 0 || username.length === 0 || password.length === 0) {
            throw new Error('Not all fields are filled')
        }
        */
		return true
	}

	/* checks to see if a set of login credentials are valid
	 * @param {String} base64 encoded string of both the username and password
	 * @returns {JSON} returns json containing username and if the user is admin on success
	 */
	async login(encodedData) {
		const data = Buffer.from(encodedData, 'base64').toString() // decode
		const [ username, password ] = data.split(':') // split into password and username
		// check db for user
		const sql = `SELECT username, password, admin FROM users WHERE username = '${username}';`
		const result = await this.db.get(sql)
		// check if any users exist
		if(!result) throw new Error(`${username} is not a registered user`)
		// check if passwords match
		const match = await bcrypt.compare(password, result.password) // encrypt
		if(!match) throw new Error('Password is incorrect')

		return { username: username, admin: result.admin }
	}


	async close() {
		await this.db.close()
	}

}

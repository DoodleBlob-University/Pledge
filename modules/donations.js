const sqlite = require('sqlite-async')

module.exports = class Donations {

	constructor(dbName = ':memory:') {
		// create database table if not yet existing
		return (async() => {
			this.db = await sqlite.open(dbName)
			const sql = 'CREATE TABLE IF NOT EXISTS donations(\
id INTEGER PRIMARY KEY AUTOINCREMENT,\
amount INTEGER NOT NULL,\
user VARCHAR(30) NOT NULL,\
pledgeId INTEGER NOT NULL,\
FOREIGN KEY(user) REFERENCES users(username),\
FOREIGN KEY(pledgeId) REFERENCES pledges(id));'
			await this.db.run(sql)
			return this
		})()
	}

	async donate(encodedData, username) {

		const data = Buffer.from(encodedData, 'base64').toString() // decode
		const [ pledgeid, amount, ccnumber, cvc, ccname, ccexp ] = data.split(':')
		// add donation to database
		const sql = `INSERT INTO donations(amount, user, pledgeId) VALUES (\
${amount}, '${username}', ${pledgeid});`
		const result = await this.db.run(sql)
		const donationId = result.lastID

		try {
			await this.tryPayment(arguments)
		} catch (error) {
			// delete donation from database
			// its in this order, incase payment was to go through but database fail
			const sql = `DELETE FROM donations WHERE id = ${donationId};`
			await this.db.run(sql)
			throw error // throw previous payment error
		}

	}

	async tryPayment(args) {
		const expectedArgumentLength = 3
		const expectedFailureArgumentIndex = 2
		/* This is where card payment would occur */
		// accepts x inputs as in real use, fakepaymentbutton would not be an argument
		args = Array.from(args)
		if( args.length === expectedArgumentLength ) {
			// fakes payment failure if fake payment button was clicked
			if( args[ expectedFailureArgumentIndex ] === 'true' ) {
				throw new Error('Payment Failed<br>Try another payment method or wait to try again')
			}
		}
		// do payment magic here
	}

	async donateCheck() {
		// TODO
		return true
	}

	async getDonations(pledgeId) {
		const sql = `SELECT user, amount FROM donations WHERE pledgeId = ${pledgeId} ORDER BY id DESC;`
		const data = await this.db.all(sql)
		return data
	}

}

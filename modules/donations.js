const sqlite = require('sqlite-async')

/*
 * Donations
 * Module that handles donations that the user makes to a pledge
 */
module.exports = class Donations {

	/*
     * Create donations object
     * @param {String} [dbName=":memory:"] is the name of the database file being used
     */
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

	/*
     * Adds donation to database, throws error on failure
	 * @param {String} base64 encoded string of payment credentials
	 * @param {String} the username of the user
	 */
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

	/*
     * Processes payment for the donation using users card credentials
     * Here it just throws an error if the 'Fake Payment Failure' button was pressed by the user
     * @param {Array} the array of arguments for the function, typically would have users card credentials and amount
     *                is different due to the extra argument of paymentFailure
     */
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

	/*
     * Checks if the user form was input correctly
     * TODO
     */
	async donateCheck() {
		// TODO
		return true
	}

	/*
     * Returns json of donations and their users for a specific pledge
     * @param {Integer} the id number of the pledge
     * @returns {JSON} results of the sql query
     */
	async getDonations(pledgeId) {
		const sql = `SELECT user, amount FROM donations WHERE pledgeId = ${pledgeId} ORDER BY id DESC;`
		const data = await this.db.all(sql)
		return data
	}

}

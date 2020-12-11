const Router = require('koa-router')
const koaBody = require('koa-body')({multipart: true, uploadDir: '..'})

const Account = require('../modules/accounts')
const Pledge = require('../modules/pledges')
const Donation = require('../modules/donations')

const router = new Router()
const db = './website.db'

/*
 * processes new user registrations
 * @route {POST} /register
 */
router.post('/register', koaBody, async ctx => {
	console.log('POST register')
	const acc = await new Account(db) // construct account class
	try{
		const body = JSON.parse(ctx.request.body)
		await acc.register(body.email, body.username, body.password)
		ctx.status = 201 //account created successfully
		ctx.body = { status: 'success', msg: 'Account created successfully'}

	} catch(error) {
		// account failed to be created
		ctx.status = 422
		ctx.body = { status: 'error', msg: error.message }

	} finally {
		acc.close()
	}
})

/*
 * checks user credentials for login
 * @route {GET} /login
 */
router.get('/login', async ctx => {
	console.log('GET login')
	const acc = await new Account(db) // construct account class
	try{
		const encodedData = ctx.request.headers.data
		const loginStatus = await acc.login(encodedData)

		ctx.status = 200
		ctx.body = { status: 'success', username: loginStatus.username,
			admin: loginStatus.admin, msg: 'logged in' }

	} catch(error) {
		ctx.status = 401
		ctx.body = { status: 'error', msg: error.message }

	} finally {
		acc.close()
	}
})

/*
 * processes the creation of new pledges
 * @route {POST} /pledge
 */
router.post('/pledge', koaBody, async ctx => {
	console.log('POST pledge')
	const plg = await new Pledge(db) // construct account class
	try{
		const body = ctx.request.body
		const image = ctx.request.files.image
		const url = await plg.newpledge(body, image)
		ctx.status = 201 //account created successfully
		ctx.body = { status: 'success', msg: 'Pledge created successfully.\nWaiting for admin approval', url: url }

	} catch(error) {
		// account failed to be created
		ctx.status = 422
		ctx.body = { status: 'error', msg: error.message }

	} finally {
		plg.close()
	}
})

/*
 * gets data for a specific pledge from the deadline unix timestamp and title
 * @route {GET} /pledge
 */
router.get('/pledge', async ctx => {
	console.log('GET pledge')
	const plg = await new Pledge(db) // construct account class
	try {
		const unixTitle = ctx.request.headers.unixtitle
		const pledgeData = await plg.getPledge(unixTitle)
		// return pledge information
		ctx.status = 200
		ctx.body = { status: 'success', data: pledgeData }

	} catch(error) {
		ctx.status = 401
		ctx.body = { status: 'error', msg: error.message }

	} finally {
		plg.close()
	}
})

/*
 * processes a new users donation
 * @route {GET} /donate
 */
router.get('/donate', async ctx => {
	console.log('GET donate')
	const acc = await new Account(db) // construct account class
	const don = await new Donation(db) // construct donation class
	try {
		// re-login using cookie data
		const encodedUsr = ctx.request.headers.usr
		const loginStatus = await acc.login(encodedUsr)
		// submit payment
		const encodedCc = ctx.request.headers.cc
		const forcedPaymentFailure = ctx.request.headers.fail
		await don.donate(encodedCc, loginStatus.username, forcedPaymentFailure)
		//
		ctx.status = 200
		ctx.body = { status: 'success', msg: 'Donation successful' }

	} catch(error) {
		ctx.status = 401
		ctx.body = { status: 'error', msg: error.message }

	}
})

/*
 * gets a list of donations for a specific pledge
 * @route {GET} /donations
 */
router.get('/donations', async ctx => {
	console.log('GET donations')
	const don = await new Donation(db)
	try {
		const pledgeId = ctx.request.headers.id
		const data = await don.getDonations(pledgeId)
		ctx.status = 200
		ctx.body = { status: 'success', data: data }

	} catch (error) {
		ctx.status = 401
		ctx.body = { status: 'error', msg: error.message }
	}
})

/* gets a list of pledges for the homepage
 * @route {GET} /list
 */
router.get('/list', async ctx => {
	console.log('GET list')
	const plg = await new Pledge(db)
	try{
		const showFinished = ctx.request.headers.fin
		const offset = ctx.request.headers.off
		const admin = ctx.request.headers.admin
		const data = await plg.listPledges(offset, showFinished, admin)

		ctx.status = 200
		ctx.body = { status: 'success', data: data}

	} catch (error) {
		console.log(error)
		ctx.status = 401
		ctx.body = { status: 'failure', msg: error.message }
	}
})

/*
 * processes an admins approval of a pledge
 * @route {GET} /approval
 */
router.get('/approval', async ctx => {
	console.log('GET approval')
	const acc = await new Account(db) // construct account class
	const plg = await new Pledge(db)
	try {
		// re-login using cookie dat
		const encodedUsr = ctx.request.headers.usr
		const loginStatus = await acc.login(encodedUsr)
		// check if user is actually an admin
		await adminApproval(ctx, plg, loginStatus.admin)

	} catch(error) {
		// other error
		ctx.status = 303
		ctx.body = { status: 'error', msg: error.message }
	} finally {
		acc.close()
		plg.close()
	}
})

/*
 * checks if user sending request is an admin and processed accordingly
 * @param {Object} context
 * @param {Object} instance of pledge class
 * @param {Integer} binary value of whether user is an admin
 */
async function adminApproval(ctx, plg, admin) {
	// if admin, update or delete pledge based on approval
	if ( admin ) {
		const id = ctx.request.headers.id
		const approved = ctx.request.headers.status === 'y' ? true : false

		if ( approved ) {
			await plg.approvePledge(id)
		} else {
			await plg.denyPledge(id)
		}
		// success
		ctx.status = 200
		ctx.body = { status: 'ok', msg: 'yes' }

	} else {
		// user is not admin
		ctx.status = 401
		ctx.body = { status: 'error', msg: 'user is not an admin' }
	}
}

module.exports = router

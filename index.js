const Koa = require('koa')
const send = require('koa-send')
const Router = require('koa-router')
const koaStatic = require('koa-static')

const koaBody = require('koa-body')({multipart: true, uploadDir: '.'})

const app = new Koa()

const path = require('path')
const render = require('koa-ejs')
render(app, {
	root: path.join(__dirname, 'views'),
	layout: false,
	viewExt: 'html',
	cache: false,
})

const router = new Router()

const defaultPort = 8080
const port = process.env.PORT || defaultPort

const db = 'website.db'
const Account = require('./modules/accounts')
const Pledge = require('./modules/pledges')

async function getHandlebarData(ctx, next) {
	//console.log(`${ctx.method} ${ctx.path}`)
	ctx.hbs = {
		host: `https://${ctx.host}`
	}
	for(const key in ctx.query) ctx.hbs[key] = ctx.query[key]
	await next()
}

app.use(koaStatic('public'))
app.use(getHandlebarData)

router.get('/', async ctx => {
	try {
		await send(ctx.path, { root: `${__dirname }/public/index.html` } )
	} catch(err) {
		console.log(err.message)
		await send(ctx.path, { root: `${__dirname }/public/index.html` } )
	}
})

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

router.get('/login', async ctx => {
	console.log('GET login')
	const acc = await new Account(db) // construct account class
	try{
		const header = ctx.request.headers.data
		const encodedData = header
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

router.get('/:unix/:value', async ctx => {
    ctx.hbs.title = ctx.params.value
	await ctx.render('pledge', ctx.hbs)
})

router.get('/:unix/:value/pledge', async ctx => {
	//console.log(ctx.params.value)
	//ctx.hbs.id = ctx.params.id
	await ctx.render('donate', ctx.hbs)

})


app.use(router.routes())
module.exports = app.listen(port, () => console.log(`Listening on port: ${port}`))

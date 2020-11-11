const Koa = require('koa')
const send = require('koa-send')
const Router = require('koa-router')
const koaStatic = require('koa-static')

const app = new Koa()
const router = new Router()

const defaultPort = 8080
const port = process.env.PORT || defaultPort

//const dbName = 'website.db'
//const User = require('./modules/user')
//const List = require('./modules/list')

app.use(koaStatic('public'))

router.get('/', async ctx => {
	console.log('GET /')
	try {
		await send(ctx.path, { root: __dirname + '/public/index.html' } )
	} catch(err) {
		console.log(err.message)
		await send(ctx.path, { root: __dirname + '/public/index.html' } )
	}
})

app.use(router.routes())
module.exports = app.listen(port, () => console.log(`Listening on ${port}`))

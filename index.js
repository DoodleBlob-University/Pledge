const Koa = require('koa')
const koaStatic = require('koa-static')

const router = require('./routes/routes')

const app = new Koa()

const path = require('path')
const render = require('koa-ejs')
render(app, {
	root: path.join(__dirname, 'views'),
	layout: false,
	viewExt: 'html',
	cache: false,
})

const defaultPort = 8080
const port = process.env.PORT || defaultPort

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

app.use(router.routes())
module.exports = app.listen(port, () => console.log(`Listening on port: ${port}`))

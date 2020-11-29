const Koa = require('koa')
const send = require('koa-send')
const Router = require('koa-router')
const koaStatic = require('koa-static')

const koaBody = require('koa-body')({multipart: true, uploadDir: '.'})

const app = new Koa()
const router = new Router()

const defaultPort = 8080
const port = process.env.PORT || defaultPort

const db = "website.db"
//const Account = require('./modules/user')
//const List = require('./modules/list')

app.use(koaStatic('public'))

router.get('/', async ctx => {
	try {
		await send(ctx.path, { root: __dirname + '/public/index.html' } )
	} catch(err) {
		console.log(err.message)
		await send(ctx.path, { root: __dirname + '/public/index.html' } )
	}
})

/* // CTX.RENDER NOT A FUNCTION
router.get('/login', async ctx => {
	await ctx.render('login', ctx.hbs)
})
*/

router.post("/register", koaBody, async ctx=> {
    console.log("POST: register")
    /*ctx.status = 201;
    ctx.body = {status: "success", msg: "Account successfully created"}*/
    
    try{
        
        
        
    } catch(error) {
        
        
        
    }
    
})

//router.post("/login")

app.use(router.routes())
module.exports = app.listen(port, () => console.log(`Listening on ${port}`))

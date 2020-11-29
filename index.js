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
const Account = require('./modules/accounts')

app.use(koaStatic('public'))


router.get('/', async ctx => {
	try {
		await send(ctx.path, { root: __dirname + '/public/index.html' } )
	} catch(err) {
		console.log(err.message)
		await send(ctx.path, { root: __dirname + '/public/index.html' } )
	}
})

router.post("/register", koaBody, async ctx=> {
    console.log("POST: register")
    const acc = await new Account(db); // construct account class
    try{
        const body = JSON.parse(ctx.request.body);
        await acc.register(body.email, body.username, body.password);
        ctx.status = 201; //account created successfully
        ctx.body = { status: "success", msg: "Account created successfully"}
        
    } catch(error) {
        // account failed to be created
        ctx.status = 422;
        ctx.body = { status: "error", msg: error.message };
    
    } finally {
        acc.close();
    }
})

router.get("/login", async ctx=> {
    console.log("GET: login")
    const acc = await new Account(db); // construct account class
    try{
        const header = ctx.request.headers.data;
        const encodedData = header;
        const loginStatus = await acc.login(encodedData);
       
        ctx.status = 200;
        ctx.body = { status: "success", username: loginStatus.username, 
                    admin: loginStatus.admin, msg: "logged in" };
        
    } catch(error) {
        console.log(error);
        ctx.status = 401;
        ctx.body = { status: "error", msg: error.message };
    
    } finally {
        acc.close();
    }
})



app.use(router.routes())
module.exports = app.listen(port, () => console.log(`Listening on ${port}`))

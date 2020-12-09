const Router = require('koa-router')

const path = require('path')
const ejs = require('ejs')

const router = new Router()

/*
 * formats html for a pledge on the homescreen
 * @route {GET} /pledgehtml
 */
router.get('/pledgehtml', async ctx => {
	const pledgeHTMLPath = path.join(__dirname, '../public/assets/ejs/homepledge.ejs')
	try {
		const htmlStr = await ejs.renderFile(pledgeHTMLPath, ctx.request.headers)
		ctx.status = 200
		ctx.body = { html: htmlStr }

	} catch(error) {
		ctx.status = 404
		ctx.body = { status: 'error', msg: error.message }
	}
})

module.exports = router

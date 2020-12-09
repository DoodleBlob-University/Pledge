const Router = require('koa-router')
const send = require('koa-send')

const router = new Router()

/**
 * The home page
 * @route {GET} /
 */
router.get('/', async ctx => {
	try {
		await send(ctx.path, { root: `${__dirname }/public/index.html` } )
	} catch(err) {
		console.log(err.message)
		await send(ctx.path, { root: `${__dirname }/public/index.html` } )
	}
})

/*
 * Pledge page
 * @route {GET} /[unix timestamp]/[pledge title]
 */
router.get('/:unix/:value', async ctx => {
	await ctx.render('pledge', ctx.hbs)
})

/*
 * A Pledge's donate page
 * @route {GET} /[unix timestamp]/[pledge title]/donate
 */
router.get('/:unix/:value/donate', async ctx => {
	await ctx.render('donate', ctx.hbs)
})


module.exports = router

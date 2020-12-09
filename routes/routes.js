const compose = require('koa-compose')

const ejsRouter = require('./ejs.js')
const requestRouter = require('./requests.js')
const publicRouter = require('./public.js')

/*
 * combines the routes of multiple routers into a single router
 * @params {Array} takes multiple routers an argument
 * @returns {Object} combined routes
 */
function combineRouters() {
	const routers = Array.from(arguments)
	const routes = []
	routers.forEach( router => {
		routes.push(router.routes())
	})
	return compose( routes )
}

module.exports = combineRouters( requestRouter, publicRouter, ejsRouter )

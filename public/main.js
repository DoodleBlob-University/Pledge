import { loadCookie, mainEventListeners } from './assets/js/functions.js'

// when page first loads
window.addEventListener('DOMContentLoaded', async event => {
	mainEventListeners()
	loadCookie('pledgeuser')
	load(event)
})
// every time # changes in url, event triggered
window.addEventListener('hashchange', async event => await load(event))

async function load() {

	document.querySelector('main').style.display = 'none' // hides main html
	document.getElementById('loading').style.display = 'block' // shows loading dots

	try {
		// page equals string after # or if none, 'home'
		const page = location.hash.length > 1 ? location.hash.substring(1) : 'home'
		//console.log( `${location.host }/${ location.hash}`)
		// load html and js
		document.querySelector('main').innerHTML = await
		( await fetch(`./views/${ page }.html`) ).text() // inject html into <main> of index

		const pageModule = await import(`./modules/${ page }.js`)

		// run js for page
		pageModule.setup()

	} catch(err) {
		// page doesnt exist
		console.log(err)
		window.location.href = '/#404'
	}

	document.querySelector('main').style.display = 'block' // displays upon page loading
	document.getElementById('loading').style.display = 'none' // hides loading dots

}


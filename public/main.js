// when page first loads
window.addEventListener('DOMContentLoaded', async event => {
	load()
})
// every time # changes in url, event triggered
window.addEventListener('hashchange', async event => await load())

async function load() {
	try {
        // page equals string after # or if none, 'home'
        const page = location.hash.length > 1 ? location.hash.substring(1) : 'home'
        console.log(page)
        
        document.querySelector('main').innerHTML = await ( await fetch('./views/' + page + '.html') ).text()
        const pageModule = await import('./modules/' + page + '.js')
        
        /*
		// run the setup function in whatever module has been loaded
		console.log('---------------------------------------------------------------')
		console.log(`${pageName.toUpperCase()}: ${window.location.protocol}//${window.location.host}/${window.location.hash}`)
		// window.location contains the contents of the browser address-bar (FYI)
		// console.log(`${window.location.protocol}//${window.location.host}/${window.location.hash}`)
		if(getCookie('authorization')) console.log(`Authorization: "${getCookie('authorization')}"`)
		module.setup()
        */
	} catch(err) {
		// page doesnt exist
		console.log(err)
		window.location.href = '/#404'
	}
}
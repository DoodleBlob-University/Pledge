// when page first loads
window.addEventListener('DOMContentLoaded', async event => {
	load()
})
// every time # changes in url, event triggered
window.addEventListener('hashchange', async event => await load())

async function load() {
    
    document.querySelector('main').style.display = "none"; // hides main html
    document.getElementById('loading').style.display = "block";
    
	try {
        // page equals string after # or if none, 'home'
        const page = location.hash.length > 1 ? location.hash.substring(1) : 'home'
        console.log( location.host + '/' + location.hash)
        // load html and js
        document.querySelector('main').innerHTML = await ( await fetch('./views/' + page + '.html') ).text() // inject html into <main> of index
        const pageModule = await import('./modules/' + page + '.js')
        
        // TODO: cookies auth
        
        pageModule.setup()

	} catch(err) {
		// page doesnt exist
		console.log(err)
		window.location.href = '/#404'
	}
    
    document.querySelector('main').style.display = "block"; // displays upon page loading    
    document.getElementById('loading').style.display = "none";

}

window.addEventListener('scroll', function() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrolltotop.style.display = "block";
    } else {
        scrolltotop.style.display = "none";
    }
});

document.getElementById("scrolltotop").addEventListener("click", ()=>{
    document.body.scrollTop = 0; // Safari
    document.documentElement.scrollTop = 0; // Chrome, Firefox, IE, Opera
});
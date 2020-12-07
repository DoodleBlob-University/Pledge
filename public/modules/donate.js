//
import { loadCookie, mainEventListeners, drawImageScaled } from '../assets/js/functions.js'

var loggedin

window.addEventListener('DOMContentLoaded', async event => {
	mainEventListeners()
	loggedin = loadCookie('pledgeuser')
    await load(event)
})

async function load() {
    try {
        var unixTitle = window.location.pathname.substring(1).split("/").join("-")
        console.log( unixTitle )
        
        document.querySelector('main').style.display = 'block' // shows main html
        document.getElementById('loading').style.display = 'none' // hides loading dots
        
    } catch (error) {
        console.log(error)
        //window.location.href = "/#404"
    }
}

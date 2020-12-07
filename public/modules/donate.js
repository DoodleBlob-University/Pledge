//
import { loadCookie, mainEventListeners, getPledge, checkPledgeFinished, checkDonateable } from '../assets/js/functions.js'

var loggedin

window.addEventListener('DOMContentLoaded', async event => {
	mainEventListeners()
    
	loggedin = loadCookie('pledgeuser')
    await load(event)
})

async function load() {
    try {
        let unixTitleDonate = window.location.pathname.substring(1).split("/").join("-")
        let unixTitle = unixTitleDonate.substring(0, unixTitleDonate.lastIndexOf("-"))
        var pledgeData = await getPledge(unixTitle)
        let finished = await checkPledgeFinished(pledgeData)
        document.getElementById("urltitle").innerHTML = pledgeData.title
        await displayDonate(pledgeData)
        
        if( !checkDonateable(finished, loggedin, pledgeData.creator) ){
            // if not donateable
            window.alert(finished)
            window.location.href = `${window.location.pathname.substring(0,
                window.location.pathname.lastIndexOf("/"))}` // go back pledge page 
        }
        
        
        
        document.querySelector('main').style.display = 'block' // shows main html
        document.getElementById('loading').style.display = 'none' // hides loading dots
        
    } catch (error) {
        console.log(error)
        //window.location.href = "/#404"
    }
}

async function displayDonate(pledgeData){
    document.getElementById("pledgetitle").innerHTML = pledgeData.title
}

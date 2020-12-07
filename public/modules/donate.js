//
import { loadCookie, getCookie, mainEventListeners, getPledge, 
        checkPledgeFinished, checkDonateable, encodeData } from '../assets/js/functions.js'

var loggedin

window.addEventListener('DOMContentLoaded', async event => {
	mainEventListeners()

    document.querySelector("form").addEventListener("submit", async event => await donate(event))
    
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
        window.location.href = "/#404"
    }
}

async function displayDonate(pledgeData){
    document.getElementById("pledgetitle").innerHTML = pledgeData.title
}

async function donate(event){
    event.preventDefault() // stops standard html form submission
    document.getElementById('error').style.display = 'none' // hide error message box
    // disable submit buttons
    document.getElementById("submit").disabled = true
    document.getElementById("submitfail").disabled = true
    const fail = event.submitter.id === "submitfail" ? true : false // if button invokes failed payment
    try {
        
        // todo check input fields
        
        const form = document.getElementById("donation")
		const data = Object.fromEntries(new FormData(form).entries())
        console.log(data)
        
        
        
    } catch (error) {
        const errorBox = document.getElementById('error') // display error
		errorBox.style.display = 'block'
		errorBox.firstChild.innerHTML = error // change text of inner div
    } finally {
        document.getElementById("submit").disabled = false
        document.getElementById("submitfail").disabled = false
    }
}

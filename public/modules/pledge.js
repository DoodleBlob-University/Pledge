//
import { loadCookie, mainEventListeners, drawImageScaled, getPledge, checkPledgeFinished, checkDonateable } from '../assets/js/functions.js'

var loggedin

window.addEventListener('DOMContentLoaded', async event => {
    var finishedStatus = false
	mainEventListeners()
	loggedin = loadCookie('pledgeuser')
    await load(event, finishedStatus)
    
    document.getElementById("donatebtn").addEventListener("click", () => {
        if( Boolean(loggedin) && !Boolean(finishedStatus) ){
            window.location.href = `${window.location.protocol}//${window.location.host}${window.location.pathname}/donate`
        } else if (!loggedin) { // user is not logged in
            window.location.href = "/#login"
        } else { // pledge is finished
            window.alert(`Unable to donate\n${finished}`)
        }
    })
})

async function load(event, finishedStatus) {
    try {
        var unixTitle = window.location.pathname.substring(1).split("/").join("-")
        var pledgeData = await getPledge(unixTitle)
        finishedStatus = await checkPledgeFinished(pledgeData)
        document.getElementById("urltitle").innerHTML = pledgeData.title
        await displayPledge(pledgeData, finishedStatus)
        
        document.querySelector('main').style.display = 'block' // shows main html
        document.getElementById('loading').style.display = 'none' // hides loading dots
        
    } catch (error) {
        console.log(error)
        window.location.href = "/#404"
    }
}

async function displayPledge(pledgeData, finished){
    document.getElementById("pledgetitle").innerHTML = pledgeData.title
    // load creator
    document.getElementById("creator").innerHTML = pledgeData.creator
    // load image
    document.getElementById("canvas")
    const ctx = document.getElementById('canvas').getContext('2d')
	const image = new Image()
	image.onload = function() {
		drawImageScaled(image, ctx)
	}
    const output = `${window.location.protocol}//${window.location.host}/assets/images/pledges/${pledgeData.image}`
    image.src = output
    // load deadline
    const now = new Date().getTime() / 1000 | 0
    document.getElementById("daysremaining").innerHTML = (( pledgeData.deadline - now ) / 60 / 60 / 24 ) | 0    
    // load money funded
    document.getElementById("raised").innerHTML = pledgeData.moneyRaised
    document.getElementById("goal").innerHTML = pledgeData.moneyTarget
    const progress = document.getElementById("progressbar")
    var percent = (( pledgeData.moneyRaised / pledgeData.moneyTarget ) ) * 100
    var percent = percent > 100 ? 100 : percent
    progress.style.width = `${percent}%`
    if( finished ){
        progress.style.borderBottomRightRadius = "10px"
    }
    // TODO: donators
    let donators = getDonators(pledgeData.id)
    
    
    // load description
    document.getElementById("description").innerHTML = pledgeData.description
    
    //check finished status
    // if user pledge is not donateable
    if( !checkDonateable(finished, loggedin, pledgeData.creator) ){
        notif.innerHTML = finished
        if( finished.includes("Admin") ){ // if requires admin approval
            notif.style.backgroundColor = "yellow"
        }else{ // otherwise pledge finished
            notif.style.backgroundColor = "#30FFb7"
        }
        document.getElementById("donatebtn").style.display = "none"
    } 
}

async function getDonators(id){
    console.log(id)
    // todo
    
}
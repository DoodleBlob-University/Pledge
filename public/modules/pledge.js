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
        var pledgeData = await getPledge(unixTitle)
        let finishedStatus = await displayPledge(pledgeData)
        if( finishedStatus === true ){ // if pledge is fully funded/deadline has passed
            const box = document.getElementById("notif")
            notif.innerHTML = "Pledge Finished"
            notif.style.backgroundColor = "#30FFb7"
            document.getElementById("donatebtn").style.display = "none"
        }
        
        document.querySelector('main').style.display = 'block' // shows main html
        document.getElementById('loading').style.display = 'none' // hides loading dots
        
    } catch (error) {
        console.log(error)
        //window.location.href = "/#404"
    }
}

async function getPledge(unixTitle){
    const options = { headers: { unixTitle: unixTitle } }
    const response = await fetch('/pledge', options)
    const json = await response.json()
     
    if( response.status !== 200 ) throw json.msg // if not successful throw error    
    return json.data // return json
}

async function displayPledge(pledgeData){
    var finished = false
    console.log(pledgeData)
    // load title
    document.getElementById("urltitle").innerHTML = pledgeData.title
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
    if( now < pledgeData.deadline ){
        document.getElementById("daysremaining").innerHTML = (( pledgeData.deadline - now ) / 60 / 60 / 24 ) | 0    
    } else {
        finished = true
    }
    // load money funded
    document.getElementById("raised").innerHTML = pledgeData.moneyRaised
    document.getElementById("goal").innerHTML = pledgeData.moneyTarget
    const progress = document.getElementById("progressbar")
    var percent = (( pledgeData.moneyRaised / pledgeData.moneyTarget ) ) * 100
    var percent = percent > 100 ? 100 : percent
    progress.style.width = `${percent}%`
    if( pledgeData.moneyRaised >= pledgeData.moneyTarget ){
        finished = true
        progress.style.borderBottomRightRadius = "10px"
    }
    // TODO: donators

    
    
    // load description
    document.getElementById("description").innerHTML = pledgeData.description 
    return finished
}
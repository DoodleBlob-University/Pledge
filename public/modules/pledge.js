//
import { loadCookie, mainEventListeners, drawImageScaled,
	getPledge, checkPledgeFinished, checkDonateable } from '../assets/js/functions.js'

let loggedin

window.addEventListener('DOMContentLoaded', async event => {
	const finishedStatus = false
	mainEventListeners()
	loggedin = loadCookie('pledgeuser')
	await load(event, finishedStatus)

	document.getElementById('donatebtn').addEventListener('click', () => {
		if( Boolean(loggedin) && !Boolean(finishedStatus) ) {
			window.location.href =
                `${window.location.protocol}//${window.location.host}${window.location.pathname}/donate`
		} else if (!loggedin) { // user is not logged in
			window.location.href = '/#login'
		} else { // pledge is finished
			window.alert(`Unable to donate\n${finishedStatus}`)
		}
	})
})

async function load(event, finishedStatus) {
	try {
		const unixTitle = window.location.pathname.substring(1).split('/').join('-')
		const pledgeData = await getPledge(unixTitle)
		finishedStatus = await checkPledgeFinished(pledgeData)
		document.getElementById('urltitle').innerHTML = pledgeData.title
		await displayPledge(pledgeData, finishedStatus)

		// display thank you message for donation
		if( location.search ) {
			const prevDonation = parseInt(location.search.substring(1))
			document.getElementById('donationamount').innerHTML = `£${prevDonation}`
			document.getElementById('thanks').style.display = 'block'
			window.history.replaceState({}, document.title, window.location.pathname)
		}

		document.querySelector('main').style.display = 'block' // shows main html
		document.getElementById('loading').style.display = 'none' // hides loading dots

	} catch (error) {
		console.log(error)
		window.location.href = '/#404'
	}
}

async function getDonators(id) {
	// get array of donators + their amounts
	const options = { headers: { id: id }}
	const response = await fetch('/donations', options)
	const json = await response.json()
	if ( response.status !== 200 ) throw json.msg
	return json.data
}

/* eslint-disable max-statements, complexity, max-lines-per-function */
async function displayPledge(pledgeData, finished) {
	document.getElementById('pledgetitle').innerHTML = pledgeData.title
	// load creator
	document.getElementById('creator').innerHTML = pledgeData.creator
	// load image
	document.getElementById('canvas')
	const ctx = document.getElementById('canvas').getContext('2d')
	const image = new Image()
	image.onload = function() {
		drawImageScaled(image, ctx)
	}
	const output = `${window.location.protocol}//${window.location.host}/assets/images/pledges/${pledgeData.image}`
	image.src = output
	// load deadline
	const now = new Date().getTime() / 1000 | 0
	document.getElementById('daysremaining').innerHTML = ( pledgeData.deadline - now ) / 60 / 60 / 24 | 0
	// load money funded
	document.getElementById('raised').innerHTML = pledgeData.moneyRaised !== null ? pledgeData.moneyRaised : 0
	document.getElementById('goal').innerHTML = pledgeData.moneyTarget
	const progress = document.getElementById('progressbar')
	let percent = pledgeData.moneyRaised / pledgeData.moneyTarget * 100
	percent = percent > 100 ? 100 : percent
	progress.style.width = `${percent}%`
	if( finished ) {
		progress.style.borderBottomRightRadius = '10px'
	}
	// TODO: donators
	const donators = await getDonators(pledgeData.id)
	const donatorlist = document.getElementById('donatorlist')
	donators.forEach( (e) => {
		const user = e.user
		const amount = e.amount
		donatorlist.insertAdjacentHTML('beforeend',
			`<li><div class="inner"><b>${user}</b> pledged <b>£${amount}</b></div></li>`)
	} )

	// load description
	document.getElementById('description').innerHTML = pledgeData.description

	//check finished status
	// if user pledge is not donateable
	if( !checkDonateable(finished, loggedin, pledgeData.creator) ) {
		document.getElementById('notif').innerHTML = finished
		if( finished.includes('Admin') ) { // if requires admin approval
			document.getElementById('notif').style.backgroundColor = 'yellow'
		}else{ // otherwise pledge finished
			document.getElementById('notif').style.backgroundColor = '#30FFb7'
		}
		document.getElementById('donatebtn').style.display = 'none'
	}
}
/* eslint-enable max-statements, complexity, max-lines-per-function */


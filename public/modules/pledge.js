import { getCookie, loadCookie, mainEventListeners, drawImageScaled,
	getPledge, checkPledgeFinished, checkDonateable, getDaysRemaining,
	getProgressBarSize, checkIfAdmin
} from '../assets/js/functions.js'

import http from '../assets/js/httpstatus.js'

let loggedin

/*
 * called after html contents are loaded into the main of index.html
 * sets up onclick listeners
 */
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

/*
 * gets pledge using pathname in url, loads page html content
 */
async function load(event, finishedStatus) {
	try {
		const unixTitle = window.location.pathname.substring(1).split('/').join('-')
		const pledgeData = await getPledge(unixTitle)
		finishedStatus = await checkPledgeFinished(pledgeData)
		document.getElementById('urltitle').innerHTML = pledgeData.title
		await displayPledge(pledgeData, finishedStatus)

		// display optional divs
		if( location.search ) {
			displayThanks()
		}
		await adminPanel(pledgeData)

		document.querySelector('main').style.display = 'block' // shows main html
		document.getElementById('loading').style.display = 'none' // hides loading dots

	} catch (error) {
		console.log(error)
		window.location.href = '/#404'
	}
}

/*
 * displays thank you message to user if the user has just donated
 */
function displayThanks() {
	// display thank you message for donation
	const prevDonation = parseInt(location.search.substring(1))
	document.getElementById('donationamount').innerHTML = `£${prevDonation}`
	document.getElementById('thanks').style.display = 'block'
	window.history.replaceState({}, document.title, window.location.pathname)
}

/*
 * displays admin panel and lets admin approve of deny pledges that are awaiting approval
 * @param {JSON} data of the pledge, retrieved from server
 */
async function adminPanel(pledgeData) {
	// displays admin panel if user is admin and pledge has not been approved
	if( checkIfAdmin() && pledgeData.approved === 0 ) {
		document.getElementById('adminpanel').style.display='block'
		//set up listeners for admin panel buttons
		document.querySelectorAll('#adminpanel button').forEach(btn =>
			btn.onclick = async() => {
				const cred = JSON.parse(getCookie('pledgeuser')).encodedData
				// send details to server
				const options = { headers: { id: pledgeData.id, status: btn.id, usr: cred }}
				const response = await fetch('/approval', options)
				const json = await response.json()
				if ( response.status === http.OK ) {
					adminPanelOK(btn.id)
				} else {
					console.log( json )
				}
			})
	}
}

/*
 * upon approving or denying a pledge successfully, redirects user
 * @param {Char} id of the button pressed
 */
function adminPanelOK(btnid) {
	// success
	if( btnid === 'y') {
		window.location.reload()
	} else {
		window.location=document.referrer // go to previous page
	}
}

/*
 * gets list of donators from server
 * @param {Integer} id of pledge
 * @returns {JSON} json object containing all users who donated to pledge, and the amounts donated
 */
async function getDonators(id) {
	// get array of donators + their amounts
	const options = { headers: { id: id }}
	const response = await fetch('/donations', options)
	const json = await response.json()
	if ( response.status !== http.OK ) throw json.msg
	return json.data
}

/*
 * loads html content for pledge
 * @param {JSON} data for the pledge
 * @param {Boolean} whether the pledge has finished e.g. funded / deadline
 */
async function displayPledge(pledgeData, finished) {
	const donators = await getDonators(pledgeData.id)
	// load html
	document.getElementById('pledgetitle').innerHTML = pledgeData.title
	document.getElementById('creator').innerHTML = pledgeData.creator
	document.getElementById('description').innerHTML = pledgeData.description
	// load images and calculated items
	loadImage(pledgeData.image)
	loadDeadline(pledgeData.deadline)
	loadMoney(pledgeData.moneyRaised, pledgeData.moneyTarget)
	loadDonators(donators)
	loadFinish(finished, pledgeData.approved)
}

/*
 * loads image from filesystem onto html canvas
 * @param {String} name of the pledge's image
 */
function loadImage(imageName) {
	document.getElementById('canvas')
	const ctx = document.getElementById('canvas').getContext('2d')
	const image = new Image()
	image.onload = function() {
		drawImageScaled(image, ctx)
	}
	// form image url
	const imageURL = `${window.location.protocol}//${window.location.host}/assets/images/pledges/${imageName}`
	image.src = imageURL
}

/*
 * gets deadline and changes html to display days remaining
 * @param {Integer} unix timestamp for deadline
 */
function loadDeadline(deadline) {
	// load deadline
	document.getElementById('daysremaining').innerHTML = getDaysRemaining(deadline) | 0
}

/*
 * changes html to display money raised and target, calcuates width of progress bar
 * @param {Integer} money raised to pledge
 * @param {Integer} target goal for pledge
 */
function loadMoney(raised, target) {
	// load money funded
	const percentMax = 100

	document.getElementById('raised').innerHTML = raised !== null ? raised : 0
	document.getElementById('goal').innerHTML = target
	const progress = document.getElementById('progressbar')
	const percent = getProgressBarSize(raised, target)
	progress.style.width = `${percent}%`
	if( percent === percentMax ) { // if bar is full, round right corner
		progress.style.borderBottomRightRadius = '10px'
	}
}

/*
 * displays donators on page with the money they pledged
 * @param {JSON} object containing donators and donation amounts
 */
function loadDonators(donators) {
	const donatorlist = document.getElementById('donatorlist')
	donators.forEach( (e) => {
		const user = e.user
		const amount = e.amount
		donatorlist.insertAdjacentHTML('beforeend',
			`<li><div class="inner"><b>${user}</b> pledged <b>£${amount}</b></div></li>`)
	} )
}

/*
 * checks if pledge is finished and hides donate button
 * @param {Boolean} if pledge is finished
 * @param {Boolean} if pledge has been approved by an admin
 */
function loadFinish(finished, approved) {
	// if user pledge is not donateable
	if( !checkDonateable(finished, approved) ) {
		loadNonDonateable(finished, approved)
		document.getElementById('donatebtn').style.display = 'none'
	}
}

/*
 * if pledge cannot be donated to e.g finished or not yet approved - displays message accordingly
 * @param {Boolean} if pledge is finished
 * @param {Boolean} if pledge has been approved by an admin
 */
function loadNonDonateable(finished, approved) {
	if( approved && finished ) {
		// if pledge has finished
		document.getElementById('notif').innerHTML = 'This Pledge has finished'
		document.getElementById('notif').style.backgroundColor = '#30FFb7'

	} else if ( !approved && !checkIfAdmin() ) {
		// if pledge not approved and user not admin
		document.getElementById('notif').innerHTML = 'Awaiting Admin Approval'
		document.getElementById('notif').style.backgroundColor = 'yellow'
	}
}

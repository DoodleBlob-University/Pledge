import { getCookie, getDaysRemaining, getProgressBarSize,
	checkIfAdmin } from '../assets/js/functions.js'
import http from '../assets/js/httpstatus.js'

let offset = 0
let loadedAll = false

export function setup() {

	document.getElementById('newpledgebtn').addEventListener('click', () => {
		// redirect users to login page if not yet logged in
		if ( getCookie('pledgeuser') !== null ? true : false ) {
			window.location.href = '/#new-pledge'
		} else {
			window.location.href = '/#login'
		}
	})

	// checkbox button for 'show finished pledges'
	document.querySelector('input[type=checkbox]').addEventListener('change', () => {
       	document.body.scrollTop = 0 // Safari
		document.documentElement.scrollTop = 0 // Chrome, Firefox, IE, Opera
		document.getElementById('pledges').innerHTML = ''
		offset = 0 // reset offset
		getPledges() // reload
	})

	getPledges()

}

window.onscroll = function() {
	if ( document.getElementById('loading').style.display !== 'block' && !loadedAll ) {
		// only load more if there is more to load, or not currently loading
		if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
			// if scrolled to bottom, attempt to load more
			document.getElementById('loading').style.display = 'block'
			document.getElementById('loading').style.marginTop = '30px'
			document.getElementById('loading').style.marginBottom = '30px'
			offset += 1
			getPledges()
		}
	}
}

function getPledges() {
	try{
		// this needs to be in a try catch or it doesnt work?!?!
		// no error is thrown in the catch!
		(async() => {
			await asyncGetPledges()
		})()
	} catch (e) {
		console.log(e.message)
	}
}

async function asyncGetPledges() {
	try {
		const fin = document.getElementById('fin').checked
		const admin = checkIfAdmin() ? 1 : 0

		const options = { headers: { fin: fin, off: offset, admin: admin } }
		const response = await fetch('/list', options)
		const json = await response.json()

		await getPledgesSuccess(response, json)

	} catch (error) {
		loadedAll = true // prevents loading of more
		await displayError(error)
	}
}

async function getPledgesSuccess(response, json) {
	if( response.status === http.OK ) { // success
		if( json.data.length === 0 ) {
			loadedAll = true // stop loading more if returning value is none
		} else {
			await displayPledges(json.data) // display pledges
		}
		document.getElementById('loading').style.display = 'none'

	} else { // failure
		throw new Error()
	}
}


async function displayPledges(data) {
	for ( const p of data ) {
		// prepare pledgeHTML
		p.moneyRaised = p.moneyRaised === null ? 0 : p.moneyRaised

		const url = getURLfromImgName(p.image)
		const daysRemaining = getDaysRemaining(p.deadline)
		const progressWidth = getProgressBarSize(p.moneyRaised, p.moneyTarget)
		const finished = daysRemaining <= 0 || p.moneyRaised >= p.moneyTarget ? true : false
		const approved = p.approved

		const htmlStr = await makePledgeHTML({url: url, approved: approved, title: p.title,
			creator: p.creator, daysRemaining: daysRemaining,
			moneyRaised: p.moneyRaised, moneyTarget: p.moneyTarget,
			progressWidth: progressWidth, finished: finished})
		// display pledge HTML
		createPledgeHTML(p, finished, htmlStr)
	}

}

function createPledgeHTML(p, finished, htmlStr) {
	// create new divs for pledge
	const pledgeDiv = document.getElementById('pledges')
	const mList = document.createElement('div')
	mList.setAttribute('id', 'mainlist')
	pledgeDiv.appendChild(mList)

	// set position as beforebegin if not yet approved
	// set position as beforeend if not finished
	// set position as afterend if finished
	const pos = !p.approved ? 'beforebegin' : finished ? 'afterend' : 'beforeend'

	// insert html into created attribute, unless pledge is finished or awiting approval
	document.getElementById('mainlist').insertAdjacentHTML(pos, htmlStr)
	// finished pledges are inserted outside the created element, so they appear at the bottom
	// pledges awaiting for approval are inserted above
}

function getURLfromImgName(img) {
	const plg = `${img.substring(0, img.indexOf('-'))}/${img.substring(img.indexOf('-')+1,
		img.lastIndexOf('.'))}`
	return `location.href='${window.location.protocol}//${window.location.host}/${plg}'`
}

async function makePledgeHTML(j) {
	// get html from server get request
	// server uses ejs to insert variables in j into loaded html
	const options = { headers: j }
	const response = await fetch('/pledgehtml', options)
	const json = await response.json()
	const htmlStr = json.html
	return htmlStr
}


async function displayError(error) {
	console.log(error)
}



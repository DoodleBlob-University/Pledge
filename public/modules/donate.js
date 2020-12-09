import { loadCookie, getCookie, mainEventListeners, getPledge,
	checkPledgeFinished, checkDonateable, encodeData } from '../assets/js/functions.js'
import http from '../assets/js/httpstatus.js'

/*
 * once page contents are loaded, loads event listeners and user credential cookie if logged in
 * @param {Object} page loaded object
 */
window.addEventListener('DOMContentLoaded', async event => {
	mainEventListeners()
	loadCookie('pledgeuser')
	const pledgeData = await load(event)

	document.querySelector('form').addEventListener('submit', async event => await donate(event, pledgeData))

	document.querySelector('main').style.display = 'block' // shows main html
	document.getElementById('loading').style.display = 'none' // hides loading dots
})

/*
 * gets pledge using pathname in url
 * @returns {JSON} returns all data for the pledge
 */
async function load() {
	try {
		const unixTitleDonate = window.location.pathname.substring(1).split('/').join('-')
		const unixTitle = unixTitleDonate.substring(0, unixTitleDonate.lastIndexOf('-'))
		const pledgeData = await getPledge(unixTitle)
		const finished = await checkPledgeFinished(pledgeData)
		document.getElementById('urltitle').innerHTML = pledgeData.title
		document.getElementById('pledgetitle').innerHTML = pledgeData.title

		if( !checkDonateable(finished, pledgeData.approved) ) {
			// if not donateable
			window.alert(finished)
			window.location.href = `${window.location.pathname.substring(0,
				window.location.pathname.lastIndexOf('/'))}` // go back pledge page
		}

		return pledgeData

	} catch (error) {
		console.log(error)
		window.location.href = '/#404'
	}
}

/*
 * prepares donation page for sending to server, disables buttons stopping multiple presses etc
 * @param {Object} event of form submission
 * @param {JSON} data of pledge being donated to
 */
async function donate(event, pledgeData) {
	event.preventDefault() // stops standard html form submission
	document.getElementById('error').style.display = 'none' // hide error message box
	// disable submit buttons
	document.getElementById('submit').disabled = true
	document.getElementById('submitfail').disabled = true
	const fail = event.submitter.id === 'submitfail' ? true : false // if button invokes failed payment
	try {

		await sendDonation(pledgeData, fail)

	} catch (error) {
		const errorBox = document.getElementById('error') // display error
		errorBox.style.display = 'block'
		errorBox.firstChild.innerHTML = error // change text of inner div
	} finally {
		document.getElementById('submit').disabled = false
		document.getElementById('submitfail').disabled = false
	}
}

/*
 * sends donation to server
 * @param {JSON} data of pledge being donated to
 * @param {Boolean} if user clicked the fake payment failure button
 */
async function sendDonation(pledgeData, fail) {
	const form = document.getElementById('donation')
	const data = Object.fromEntries(new FormData(form).entries())

	// get encoded data
	const cardCred = encodeData(pledgeData.id, data.amount, data.ccnumber,
		data.cvc, data.ccname, data.ccexp)
	const userCred = JSON.parse(getCookie('pledgeuser')).encodedData
	const options = { headers: { cc: cardCred, usr: userCred, fail: fail } }
	const response = await fetch('/donate', options)
	const json = await response.json()

	if( response.status === http.OK ) {
		// success
		console.log(json)
		window.location.href = `${window.location.pathname.substring(0,
			window.location.pathname.lastIndexOf('/'))}?${data.amount}`

	} else if ( response.status === http.Unauthorized ) {
		// failure
		throw json.msg
	} else {
		// any unexpected response codes
		throw `${response.status}: ${json.msg}`
	}
}


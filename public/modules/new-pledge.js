import { getCookie, previewImage } from '../assets/js/functions.js'
import http from '../assets/js/httpstatus.js'

/*
 * called after html contents are loaded into the main of index.html
 * sets up onclick listeners
 */
export function setup() {
	// redirect to login if not yet logged in
	const loggedin = getCookie('pledgeuser') !== null ? true : false
	if (!loggedin) window.location.href = '/#login'

	// adjust funding goal input box width depending on num of digits entered by user
	resizeInput.call(document.getElementById('fundinggoal'))
	document.getElementById('fundinggoal').addEventListener('input', resizeInput)
	// upon image upload, rescale and load image into canvas
	document.getElementById('fileinput').addEventListener('change', function() {
		previewImage(this)
	})

	document.getElementById('newpledge').addEventListener('submit', async event => await submitPledge(event))
}

/*
 * sends pledge creation form data to server
 * @param {Object} event containing form submission data
 */
async function submitPledge(event) {
	event.preventDefault() // stops standard html form submission
	document.getElementById('error').style.display = 'none' // hide error message box
	try {
		const formData = getPledgeData()
		// post form data
		const options = { header: 'multipart/form-data', method: 'post', body: formData }
		const response = await fetch('/pledge', options)
		const json = await response.json()

		if( response.status === http.Created ) {
			// success
			window.alert(json.msg) //alert user that pledge was created
			window.location.href = json.url

		}else{
			//unknown error
			throw `${response.status}: ${json.msg}`
		}

	} catch (error) {
		const errorBox = document.getElementById('error') // display error
		errorBox.style.display = 'block'
		errorBox.firstChild.innerHTML = error // change text of inner div
	}
}

/*
 * adds username to the form data
 * @returns {Object} the form data with the addition of username
 */
function getPledgeData() {
	const formData = new FormData( document.getElementById('newpledge') )
	try{// adds username to formdata
		formData.append('creator', JSON.parse(getCookie('pledgeuser')).username)
	} catch (notloggedin) {
		throw 'Please re-login'
	}
	return formData
}

/*
 * resizes the input box for pledge goal
 */
function resizeInput() {
	const placeholderTextLength = 3
	this.style.width =
        this.value.length > 0 ? `${+ this.value.length }ch` : `${this.value.length + placeholderTextLength }ch`
}

import { getCookie, previewImage } from '../assets/js/functions.js'

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

/* eslint-disable complexity, max-lines-per-function */
async function submitPledge(event) {
	event.preventDefault() // stops standard html form submission
	document.getElementById('error').style.display = 'none' // hide error message box
	try {
		const formData = new FormData( document.getElementById('newpledge') )
		try{// adds username to formdata
			formData.append('creator', JSON.parse(getCookie('pledgeuser')).username)
		} catch (notloggedin) {
			throw 'Please re-login'
		}
		// post form data
		const options = { header: 'multipart/form-data', method: 'post', body: formData }
		const response = await fetch('/pledge', options)
		const json = await response.json()

		if( response.status === 201 ) {
			// success
			window.alert(json.msg) //alert user that pledge was created
			// TODO: redirect to pledge page

		}else if( response.status === 422) {
			// error in creating account
			throw json.msg // throw error message
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
/* eslint-enable complexity, max-lines-per-function */


function resizeInput() {
	this.style.width = this.value.length > 0 ? `${+ this.value.length }ch` : `${this.value.length + 3 }ch`
}

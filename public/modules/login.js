import { encodeData, createCookie } from '../assets/js/functions.js'
import http from '../assets/js/httpstatus.js'

/*
 * called after html contents are loaded into the main of index.html
 * sets up onclick listeners
 */
export function setup() {
	// todo check cookie to see if already logged in
	// wait for form submission, then run login()
	document.querySelector('form').addEventListener('submit', async event => await login(event))
}

/*
 * logs user in and generates cookie
 * @param {Object} event containing form submission data
 */
async function login(event) {
	event.preventDefault() // stops standard html form submission
	document.getElementById('error').style.display = 'none' // hide error message box
	try{
		const encodedData = generateEncodedData()
		// get login data
		const options = { headers: { data: encodedData } }
		const response = await fetch('/login', options)
		const json = await response.json()

		if ( response.status === http.OK ) {
			// logged in successfully
			console.log( json )
			generateCookie( json, encodedData )
		} else {
			// any unexpected response codes
			throw `${response.status}: ${json.msg}`
		}
		window.location=document.referrer // go to previous page

	} catch (error) {
		document.getElementById('error').style.display = 'block'
		// change text of inner div
		document.getElementById('error').firstChild.innerHTML = error
	}
}

/*
 * creates base64 string of users login and password
 * @returns {String} base64 string of username and password
 */
function generateEncodedData() {
	const loginform = document.getElementById('login')
	const data = Object.fromEntries(new FormData(loginform).entries())
	const encodedData = encodeData( data.username, data.password )
	return encodedData
}

/*
 * creates cookie with 1 day expiry
 * @param {JSON} containing the users' username and whether the user is an admin
 * @param {String} the encoded base64 string containing users' username and password
 */
function generateCookie(json, encodedData) {
	const days = 1
	// create cookie with 1 day expiry
	createCookie('pledgeuser', JSON.stringify(
		{ username: json.username,encodedData: encodedData,admin: json.admin },days) )
}


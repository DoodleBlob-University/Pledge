import { encodeData, createCookie } from '../assets/js/functions.js'
import http from '../assets/js/httpstatus.js'

export function setup() {
	// todo check cookie to see if already logged in
	// wait for form submission, then run login()
	document.querySelector('form').addEventListener('submit', async event => await login(event))
}

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

function generateEncodedData() {
	const loginform = document.getElementById('login')
	const data = Object.fromEntries(new FormData(loginform).entries())
	const encodedData = encodeData( data.username, data.password )
	return encodedData
}

function generateCookie(json, encodedData) {
	const days = 1
	// create cookie with 1 day expiry
	createCookie('pledgeuser', JSON.stringify(
		{ username: json.username,encodedData: encodedData,admin: json.admin },days) )
}


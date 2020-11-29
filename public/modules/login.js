import { emptyFields, encodeUserPass, createCookie, getCookie } from '../assets/js/functions.js'

export function setup() {
	// todo check cookie to see if already logged in
	// wait for form submission, then run login()
	document.querySelector('form').addEventListener('submit', async event => await login(event))
}

async function login() {
	event.preventDefault() // stops standard html form submission
	document.getElementById('error').style.display = 'none' // hide error message box
	try{
		const loginform = document.getElementById('login')
		const data = Object.fromEntries(new FormData(loginform).entries())

		if( emptyFields(data) ) throw 'Not all fields are filled'

		const encodedData = encodeUserPass( data.username, data.password )
		// get login data
		const options = { headers: { data: encodedData } }
		const response = await fetch('/login', options)
		const json = await response.json()

		if( response.status === 401) {
			// error logging in
			throw json.msg;
		} else if ( response.status === 200) {
			// logged in successfully
			console.log( json )

		} else {
            // any unexpected response codes
			throw `${response.status}: ${json.msg}`
		}
        
        // create cookie with 1 day expiry
        createCookie("pledgeuser", JSON.stringify({ username: data.username, 
                                                   encodedData: encodedData, 
                                                   admin: json.admin }, 1) );
        console.log ( getCookie("pledgeuser") );
        //window.location.href = "/";


	} catch (error) {
		const errorBox = document.getElementById('error') // display error
		errorBox.style.display = 'block'
		errorBox.firstChild.innerHTML = error // change text of inner div
	}
}

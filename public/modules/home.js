import { getCookie } from '../assets/js/functions.js'

export function setup() {

	document.getElementById('newpledgebtn').addEventListener('click', () => {
		// redirect users to login page if not yet logged in
		if ( getCookie('pledgeuser') !== null ? true : false ) {
			window.location.href = '/#new-pledge'
		} else {
			window.location.href = '/#login'
		}
	})

}

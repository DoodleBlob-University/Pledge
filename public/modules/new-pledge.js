import { getCookie, previewImage, drawImageScaled } from '../assets/js/functions.js'

export function setup() {
	// redirect to login if not yet logged in
	const loggedin = getCookie('pledgeuser') !== null ? true : false
	if (!loggedin) window.location.href = '/#new-pledge'

	resizeInput.call(document.getElementById('fundinggoal'))
	document.getElementById('fundinggoal').addEventListener('input', resizeInput)
    document.getElementById("fileinput").addEventListener("change", function() { previewImage(this) })

	document.getElementById('newpledge').addEventListener('submit', async event => await submitPledge(event))
}

async function submitPledge(event) {
	event.preventDefault() // stops standard html form submission
	document.getElementById('error').style.display = 'none' // hide error message box
	try {
        

	} catch (error) {
		const errorBox = document.getElementById('error') // display error
		errorBox.style.display = 'block'
		errorBox.firstChild.innerHTML = error // change text of inner div
	}
}

function resizeInput() {
	this.style.width = this.value.length > 0 ? `${+ this.value.length }ch` : `${this.value.length + 3 }ch`
}

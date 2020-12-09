/* --- Login --- */

export function encodeData() {
	// encode data from x amount of arguments
	const args = Array.from(arguments)
	let data
	if( args.length === 1 ) {
		data = args[0]
	} else if ( args.length === 0 ) {
		throw new Error('No arguments in encodeData()')
	} else {
		data = args.join(':')
	}
	// encode args in base64
	const encode = btoa(data)
	return encode
}

export function getDaysRemaining(deadline) {
	const millisecondsInSeconds = 1000
	const secondsInMinute = 60
	const minutesInHour = 60
	const hoursInDay = 24

	const now = new Date().getTime() / millisecondsInSeconds | 0 // seconds, floored
	return ( deadline - now ) / secondsInMinute / minutesInHour / hoursInDay // get days
}

export function getProgressBarSize(raised, target) {
	const percentMax = 100
	let percent = raised / target * percentMax
	percent = percent > percentMax ? percentMax : percent
	return percent
}

export function checkIfAdmin() {
	return function() {
		try{
			if(JSON.parse(getCookie('pledgeuser')).admin) {
				return true
			}
		}catch(e) {
			return false
		}
		return false
	}()
}


/* --- Cookies --- */
// from plainjs.com
export function createCookie(key, value, days) {
	const millisecondsInSeconds = 1000
	const secondsInMinute = 60
	const minutesInHour = 60
	const hoursInDay = 24

	const expire = new Date() //cookie expiration
	expire.setTime(expire.getTime() +
       millisecondsInSeconds*secondsInMinute*minutesInHour*hoursInDay*days)
	// format cookie string
	document.cookie = `${key}=${value};path=/;expires=${expire.toGMTString()}`
}

export function getCookie(name) {
	const cookieContentIndex = 2
	const v = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`)
	return v ? v[ cookieContentIndex ] : null
}

export function deleteCookie(name) {
	createCookie(name, '', -1)
}

/* --- Canvas --- */

export function previewImage(input) {
	const ctx = document.getElementById('canvas').getContext('2d')
	const image = new Image()
	image.onload = function() {
		drawImageScaled(image, ctx)
	}

	if ( input.files ) {
		if (!input.files[0].name.endsWith('.jpg') &&
            !input.files[0].name.endsWith('.jpeg') &&
            !input.files[0].name.endsWith('.png')) {
			window.alert('File must be a .jpeg or .png')
			return false
		}
		const output = URL.createObjectURL( input.files[0] )
		image.src = output
		console.log(output)
	}
}

//https://stackoverflow.com/a/23105310
export function drawImageScaled(img, ctx) {
	const divideHalf = 2
	const canvas = ctx.canvas
	const hRatio = canvas.width / img.width
	const vRatio = canvas.height / img.height
	const ratio = Math.min( hRatio, vRatio )
	const centerShiftX = ( canvas.width - img.width*ratio ) / divideHalf
	const centerShiftY = ( canvas.height - img.height*ratio ) / divideHalf
	ctx.clearRect(0,0,canvas.width, canvas.height)
	ctx.drawImage(img, 0,0, img.width, img.height,
		centerShiftX,centerShiftY,img.width*ratio, img.height*ratio)
}


/* --- Main --- */

export function loadCookie(name) {
	let loggedin = false
	try{
		let json = getCookie(name)
		json = JSON.parse( json ) // json string with cookie info
		// navbar changes for user
		document.getElementById('dropdownTitle').innerHTML = json.username
		document.getElementById('logoutbtn').style.display = 'block'
		loggedin = { user: json.username, admin: json.admin }
	} catch {
		// no cookie :(
		document.getElementById('loginbtn').style.display = 'block'
		document.getElementById('registerbtn').style.display = 'block'

	} finally {
		document.getElementById('dropdownTitle').style.display = 'block'
	}
	return loggedin
}

export function mainEventListeners() {
	document.getElementById('logoutbtn').addEventListener('click', () => {
		deleteCookie('pledgeuser')
		window.location.href = '/'
	})

	/* --- scroll to top button --- */
	window.addEventListener('scroll', () => {
		const scrollDepth = 20
		if (document.body.scrollTop > scrollDepth || document.documentElement.scrollTop > scrollDepth) {
			document.getElementById('scrolltotop').style.display = 'block'
		} else {
			document.getElementById('scrolltotop').style.display = 'none'
		}
	})

	document.getElementById('scrolltotop').addEventListener('click', () => {
		document.body.scrollTop = 0 // Safari
		document.documentElement.scrollTop = 0 // Chrome, Firefox, IE, Opera
	})
}

export function emptyFields(object) {
	// check if all object values are filled
	return !Object.values(object).every( x => x !== null && x !== '')
}

/* --- Pledges --- */
import http from './httpstatus.js'

export async function getPledge(unixTitle) {
	const options = { headers: { unixTitle: unixTitle } }
	const response = await fetch('/pledge', options)
	const json = await response.json()

	if( response.status !== http.OK ) throw json.msg // if not successful throw error
	return json.data // return json
}

export async function checkPledgeFinished(pledgeData) {
	const millisecondsInSeconds = 1000
	if( pledgeData.moneyRaised >= pledgeData.moneyTarget ||
      ( new Date().getTime() / millisecondsInSeconds | 0 ) >= pledgeData.deadline ) {
		return 'Pledge Finished'
	}
	return false
}

/* --- Donations --- */

export function checkDonateable(finished, approved) {
	// if user is admin or creator, they can donate
	if( Boolean(finished) === true || approved === 0) {
		return false
	}
	return true
}

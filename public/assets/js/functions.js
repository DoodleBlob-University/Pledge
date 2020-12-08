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

/* --- Cookies --- */
// from plainjs.com
export function createCookie(key, value, days) {
	const expire = new Date() //cookie expiration
	expire.setTime(expire.getTime() + 1000*60*60*24*days) // milliseconds, minutes, hours, days
	// format cookie string
	document.cookie = `${key}=${value};path=/;expires=${expire.toGMTString()}`
}

export function getCookie(name) {
	const v = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`)
	return v ? v[2] : null
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
	const canvas = ctx.canvas
	const hRatio = canvas.width / img.width
	const vRatio = canvas.height / img.height
	const ratio = Math.min( hRatio, vRatio )
	const centerShiftX = ( canvas.width - img.width*ratio ) / 2
	const centerShiftY = ( canvas.height - img.height*ratio ) / 2
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
		if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
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

export async function getPledge(unixTitle) {
	const options = { headers: { unixTitle: unixTitle } }
	const response = await fetch('/pledge', options)
	const json = await response.json()

	if( response.status !== 200 ) throw json.msg // if not successful throw error
	return json.data // return json
}

export async function checkPledgeFinished(pledgeData) {
	if( pledgeData.moneyRaised >= pledgeData.moneyTarget ||
      ( new Date().getTime() / 1000 | 0 ) >= pledgeData.deadline ) {
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

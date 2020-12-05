export function emptyFields(object) {
	// check if all object values are filled
	return !Object.values(object).every( x => x !== null && x !== '')
}

export function encodeUserPass(user, pass) {
	const userpass = `${user}:${pass}`
	// encode user and password in base64
	const encode = btoa(userpass)
	console.log(encode)
	return encode
}

/* --- cookies --- */
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

/* --- canvas --- */

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

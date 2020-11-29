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

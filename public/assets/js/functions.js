export function emptyFields(object) {
    // check if all object values are filled
    return !Object.values(object).every( x => (x !== null && x !== ""));
}

export function encodeUserPass(user, pass) {
	const userpass = `${user}:${pass}`;
    // encode user and password in base64
	const encode = btoa(userpass);
    console.log(encode);
	return encode;
}
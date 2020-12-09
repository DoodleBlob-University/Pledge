import test from 'ava'

import Accounts from '../modules/accounts.js'

test('LOGIN/REGISTER : register and log in with a valid account', async t => {
	t.plan(2) // expected number of assertions
	// test variable declarations
	const email = 'test@test.com'
	const username = 'test'
	const password = 'password'
	//
	const acc = await new Accounts() // runs db in memory
	try {
		// create user
		await acc.register(email, username, password)
		// login user
		const data = `${username}:${password}`
		const encodedData = Buffer.from(data).toString('base64')
		const loginData = await acc.login(encodedData)
		// check values
		t.is( loginData.username, username, 'incorrect username returned' )
		t.is( loginData.admin, 0, 'incorrect admin status returned' )
	} catch (err) {
		t.fail(`${err.message} thrown`)
	} finally {
		acc.close()
	}
})

test('REGISTER : duplicate email', async t => {
	t.plan(1)
	// test variable declarations
	const email = 'test@test.com'
	//
	const acc = await new Accounts()
	try {
		await acc.register(email, 'username', 'password')
		await acc.register(email, 'other', 'password')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'This email address is already in use', 'wrong error thrown')
	} finally {
		acc.close()
	}
})

test('REGISTER : duplicate username', async t => {
	t.plan(1)
	//
	const username = 'test'
	//
	const acc = await new Accounts()
	try {
		await acc.register('test@test.com', username, 'password')
		await acc.register('other@test.com', username, 'password')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'This username is already in use', 'wrong error thrown')
	} finally {
		acc.close()
	}
})

test('REGISTER : empty email', async t => {
	t.plan(1)
	//
	const email = ''
	//
	const acc = await new Accounts()
	try {
		await acc.register(email, 'username', 'password')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'One or more fields are empty', 'wrong error thrown')
	} finally {
		acc.close()
	}
})

test('REGISTER : empty username', async t => {
	t.plan(1)
	//
	const username = ''
	//
	const acc = await new Accounts()
	try {
		await acc.register('test@test.com', username, 'password')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'One or more fields are empty', 'wrong error thrown')
	} finally {
		acc.close()
	}
})

test('REGISTER : empty password', async t => {
	t.plan(1)
	//
	const password = ''
	//
	const acc = await new Accounts()
	try {
		await acc.register('test@test.com', 'username', password)
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'One or more fields are empty', 'wrong error thrown')
	} finally {
		acc.close()
	}
})

test('REGISTER : all fields empty', async t => {
	t.plan(1)
	//
	const email = ''
	const username = ''
	const password = ''
	//
	const acc = await new Accounts()
	try {
		await acc.register(email, username, password)
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'One or more fields are empty', 'wrong error thrown')
	} finally {
		acc.close()
	}
})

test('REGISTER : one field is whitespace', async t => {
	t.plan(1)
	//
	const username = '   '
	//
	const acc = await new Accounts()
	try {
		await acc.register('test@test.com', username, 'password')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'One or more fields are empty', 'wrong error thrown')
	} finally {
		acc.close()
	}
})

test('REGISTER : email invalid', async t => {
	t.plan(1)
	//
	const invalidEmail = 'Hello! I\'m not an e-mail address'
	//
	const acc = await new Accounts()
	try {
		await acc.register(invalidEmail, 'username', 'password')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'E-mail is invalid', 'wrong error thrown')
	} finally {
		acc.close()
	}
})

test('REGISTER : username too long', async t => {
	t.plan(1)
	//
	const maxUsernameLength = 15
	//
	const acc = await new Accounts()
	try {
		await acc.register('test@test.com', 'u'.repeat( maxUsernameLength + 1 ), 'password')
		t.fail('error not thrown')
	} catch(err) {
		t.is(err.message, `Username is too long (max ${maxUsernameLength} characters)`, 'wrong error thrown')
	} finally {
		acc.close()
	}

})

test('REGISTER : password too short', async t => {
	t.plan(1)
	//
	const minPasswordLength = 8
	//
	const acc = await new Accounts()
	try {
		await acc.register('test@test.com', 'username', 'p'.repeat( minPasswordLength - 1))
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, `Password is too short (must be more than ${minPasswordLength} characters)`, 'wrong error thrown')
	} finally {
		acc.close()
	}
})

test('REGISTER : password too long', async t => {
	t.plan(1)
	//
	const maxPasswordLength = 72
	//
	const acc = await new Accounts()
	try {
		await acc.register('test@test.com', 'username', 'p'.repeat( maxPasswordLength + 1))
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, `Password is too long (max ${maxPasswordLength} characters)`, 'wrong error thrown')
	} finally {
		acc.close()
	}
})

test('LOGIN : empty username', async t => {
	t.plan(1)
	//
	const username = ''
	//
	const acc = await new Accounts()
	try {
		const data = `${username}:${'password'}`
		const encodedData = Buffer.from(data).toString('base64')
		await acc.login(encodedData)
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'One or more fields are empty', 'wrong error thrown')
	} finally {
		acc.close()
	}
})

test('LOGIN : empty password', async t => {
	t.plan(1)
	//
	const password = ''
	//
	const acc = await new Accounts()
	try {
		const data = `${'username'}:${password}`
		const encodedData = Buffer.from(data).toString('base64')
		await acc.login(encodedData)
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'One or more fields are empty', 'wrong error thrown')
	} finally {
		acc.close()
	}
})

test('LOGIN : all fields empty', async t => {
	t.plan(1)
	//
	const username = ''
	const password = ''
	//
	const acc = await new Accounts()
	try {
		const data = `${username}:${password}`
		const encodedData = Buffer.from(data).toString('base64')
		await acc.login(encodedData)
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'One or more fields are empty', 'wrong error thrown')
	} finally {
		acc.close()
	}
})

test('LOGIN : data invalid formatting', async t => {
	t.plan(2)
	//
	const invalidFormat1 = 'nobreakinformatting'
	const invalidFormat2 = 'too:many:breaks:in:formatting'
	const invalidFormats = [ invalidFormat1, invalidFormat2 ]
	//
	const acc = await new Accounts()
	for( const format in invalidFormats ) {
		try {
			const encodedData = Buffer.from(format).toString('base64')
			await acc.login(encodedData)
			t.fail('error not thrown')
		} catch (err) {
			t.is(err.message, 'Invalid Arguments', 'wrong error thrown')
		}
	}
	acc.close()
})

test('LOGIN : invalid user', async t => {
	t.plan(1)
	//
	const email = 'test@test.com'
	const username = 'test'
	const password = 'password'
	//
	const acc = await new Accounts()
	try {
		// create user
		await acc.register(email, username, password)
		// login user
		const data = `${'invalid'}:${password}`
		const encodedData = Buffer.from(data).toString('base64')
		const loginData = await acc.login(encodedData)
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'Username and/or password do not match', 'wrong error thrown')
	} finally {
		acc.close()
	}
})

test('LOGIN : invalid password', async t => {
	t.plan(1)
	//
	const email = 'test@test.com'
	const username = 'test'
	const password = 'password'
	//
	const acc = await new Accounts()
	try {
		// create user
		await acc.register(email, username, password)
		// login user
		const data = `${username}:${'invalid'}`
		const encodedData = Buffer.from(data).toString('base64')
		const loginData = await acc.login(encodedData)
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'Username and/or password do not match', 'wrong error thrown')
	} finally {
		acc.close()
	}
})

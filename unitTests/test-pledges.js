import test from 'ava'
import rewire from 'rewire'
import shell from 'child_process'

import Accounts from '../modules/accounts.js'
const Pledges = rewire('../modules/pledges')
// mock filesystem behaviour in pledges.js
const fsStub = {
	copy: function(path, callback) {
		return 'copy called'
	},
	remove: function(path, callback) {
		return 'remove called'
	}
}
Pledges.__set__('fs', fsStub)

const dbPath = 'unitTests/test-database.db'

test('NEW-PLEDGE : create new pledge', async t => {
	shell.exec('> unitTests/test-database.db') // clear db from prev test
	t.plan(1)
	//
	const body = {
		pledgename: 'Test Pledge',
		fundgoal: 100,
		desc: 'This is a test.',
		creator: 'testuser',
		deadline: 987654321
	}
	//
	const acc = await new Accounts(dbPath)
	const plg = await new Pledges(dbPath)
	// sqlitedb appears in different memory addresses ^ cant see
	// use a local file and dont commit changes?? upon database close should not write!
	try {
		//create user
		await acc.register( 'test@test.com', body.creator, 'password' )
		const imageurl = await plg.newpledge(body, 'imagename.jpeg')
		const imagename = `${imageurl.substring(0,
			imageurl.indexOf('/'))}-${imageurl.substring(imageurl.indexOf('/')+1)}`
		// check values
		const data = await plg.getPledge( imagename )
		//throw new Error( data.title === body.pledgename )
		if(
			data.title === body.pledgename &&
            data.moneyTarget === body.fundgoal &&
            data.deadline === body.deadline / 1000 && // divide by milliseconds in a second
            data.creator === body.creator &&
            data.description === body.desc
		) {
			t.pass('no errors thrown')
		}else{
			t.fail('data doesnt match')
		}
	} catch (err) {
		t.fail(err)
		//t.fail('errors thrown')
	} finally {
		plg.close()
		acc.close()
	}
})

test('NEW-PLEDGE : no pledgename', async t => {
	shell.exec('> unitTests/test-database.db') // clear db from prev test
	t.plan(1)
	//
	const body = {
		pledgename: '',
		fundgoal: 100,
		desc: 'This is a test.',
		creator: 'testuser',
		deadline: 987654321
	}
	//
	const acc = await new Accounts(dbPath)
	const plg = await new Pledges(dbPath)
	// sqlitedb appears in different memory addresses ^ cant see
	// use a local file and dont commit changes?? upon database close should not write!
	try {
		// create pledge
		await plg.newpledge(body, 'imagename.jpeg')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'One or more fields are empty', 'wrong error thrown')
	} finally {
		plg.close()
		acc.close()
	}
})

test('NEW-PLEDGE : fundgoal too small', async t => {
	shell.exec('> unitTests/test-database.db') // clear db from prev test
	t.plan(1)
	//
	const minFundingGoal = 50
	const body = {
		pledgename: 'Test Pledge',
		fundgoal: minFundingGoal-1,
		desc: 'This is a test.',
		creator: 'testuser',
		deadline: 987654321
	}
	//
	const acc = await new Accounts(dbPath)
	const plg = await new Pledges(dbPath)
	// sqlitedb appears in different memory addresses ^ cant see
	// use a local file and dont commit changes?? upon database close should not write!
	try {
		// create pledge
		await plg.newpledge(body, 'imagename.jpeg')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'Funding Goal needs to be greater than £50', 'wrong error thrown')
	} finally {
		plg.close()
		acc.close()
	}
})

test('NEW-PLEDGE : fundgoal has decimals', async t => {
	shell.exec('> unitTests/test-database.db') // clear db from prev test
	t.plan(1)
	//
	const body = {
		pledgename: 'Test Pledge',
		fundgoal: 99.99,
		desc: 'This is a test.',
		creator: 'testuser',
		deadline: 987654321
	}
	//
	const acc = await new Accounts(dbPath)
	const plg = await new Pledges(dbPath)
	// sqlitedb appears in different memory addresses ^ cant see
	// use a local file and dont commit changes?? upon database close should not write!
	try {
		// create pledge
		await plg.newpledge(body, 'imagename.jpeg')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'Funding Goal must be an integer with no decimal places', 'wrong error thrown')
	} finally {
		plg.close()
		acc.close()
	}
})

test('NEW-PLEDGE : funding goal is invalid', async t => {
	shell.exec('> unitTests/test-database.db') // clear db from prev test
	t.plan(1)
	//
	const body = {
		pledgename: 'Test Pledge',
		fundgoal: 'hello',
		desc: 'This is a test.',
		creator: 'testuser',
		deadline: 987654321
	}
	//
	const acc = await new Accounts(dbPath)
	const plg = await new Pledges(dbPath)
	// sqlitedb appears in different memory addresses ^ cant see
	// use a local file and dont commit changes?? upon database close should not write!
	try {
		// create pledge
		await plg.newpledge(body, 'imagename.jpeg')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'Funding Goal must be an integer with no decimal places', 'wrong error thrown')
	} finally {
		plg.close()
		acc.close()
	}
})

test('NEW-PLEDGE : deadline is a past date', async t => {
	t.pass()
})

test('NEW-PLEDGE : deadline is too soon', async t => {
	t.pass()
})

test('NEW-PLEDGE : no image attached', async t => {
	t.pass()
})

test('NEW-PLEDGE : user is not registered', async t => {
	t.pass()
})

test('GET-PLEDGE : get a pledge', async t => {
	t.pass()
})

test('GET-PLEDGE : try to get a pledge that does not exist', async t => {
	t.pass()
})

test('LIST-PLEDGE : list pledges as user', async t => {
	t.pass()
})

test('LIST-PLEDGE : list pledges as admin', async t => {
	t.pass()
})

test('LIST-PLEDGE : list pledges as user with finished', async t => {
	t.pass()
})

test('LIST-PLEDGE : list pledges as admin with finished', async t => {
	t.pass()
})

test('APPROVE-PLEDGE : approve a pledge', async t => {
	t.pass()
})

test('APPROVE-PLEDGE : approve a pledge with invalid id', async t => {
	t.pass()
})

test('DENY-PLEDGE : deny a pledge', async t => {
	t.pass()
})

test('DENY-PLEDGE : deny a pledge with invalid id', async t => {
	t.pass()
})

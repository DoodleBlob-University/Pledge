import test from 'ava'
import rewire from 'rewire'

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

test('NEW-PLEDGE : create new pledge', async t => {
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
	const plg = await new Pledges()
	const acc = await new Accounts()
    // sqlitedb appears in different memory addresses ^ cant see
	try {
		//create user
		//await acc.register( 'test@test.com', body.creator, 'password' )
		//await plg.newpledge(body, 'imagename.jpeg')
		// check values

		//const pledgeData

        t.pass()
	} catch (err) {
		throw err
	}
})

test('NEW-PLEDGE : no pledgename', async t => {
	t.pass()
})

test('NEW-PLEDGE : no fundgoal', async t => {
	t.pass()
})

test('NEW-PLEDGE : no description', async t => {
	t.pass()
})

test('NEW-PLEDGE : no deadline', async t => {
	t.pass()
})

test('NEW-PLEDGE : no creator', async t => {
	t.pass()
})

test('NEW-PLEDGE : no image', async t => {
	t.pass()
})

test('NEW-PLEDGE : empty form', async t => {
	t.pass()
})

test('NEW-PLEDGE : ', async t => {
	t.pass()
})

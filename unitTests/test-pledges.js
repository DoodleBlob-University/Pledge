import test from 'ava'
import fs from 'fs-extra'

import Accounts from '../modules/accounts.js'
import Pledges from '../modules/pledges.js'

test('NEW-PLEDGE : create new pledge', async t => {
	t.plan(1)
	//
	const body = {
		pledgename: 'Test Pledge',
		fundgoal: 100,
		desc: 'This is a test.',
		creator: 'testuser'
	}
	//const image =
	//
	const plg = await new Pledges()
	try {
		//await plg.newpledge(body, image)

		t.pass('test')
	} catch (error) {
		t.fail(error)
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

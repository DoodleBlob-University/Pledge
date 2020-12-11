import test from 'ava'
import rewire from 'rewire'
import fs from 'fs-extra'

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
//https://stackoverflow.com/a/17371288
fs.truncate(dbPath, 0, function(){console.log('done')})

test('DONATE : donate successfully', async t => {
	t.pass()
})

test('DONATE : missing values in form submission', async t => {
	t.pass()
})

test('DONATE : pledge does not exist', async t => {
	t.pass()
})

test('DONATE : donate from user that does not exist', async t => {
	t.pass()
})

test('DONATE : payment failure', async t => {
	t.pass()
})

test('GET-DONATIONS : get list successfully', async t => {
	t.pass()
})

test('GET-DONATIONS : pledge does not exist', async t => {
	t.pass()
})


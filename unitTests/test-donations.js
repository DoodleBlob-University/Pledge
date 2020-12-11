import test from 'ava'
import rewire from 'rewire'

import Donations from '../modules/donations.js'
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

var pledgeId = null
const dbPath = 'unitTests/test-database.db'
//https://stackoverflow.com/a/17371288
//fs.truncate(dbPath, 0, function(){console.log('done')})

test('DONATE : donate successfully', async t => {
	t.plan(1)
    //
    const deadlineMinDaysFromCreation = 7
    var deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours()+(24*deadlineMinDaysFromCreation))
	const body = {
		pledgename: 'Test Donation Pledge',
		fundgoal: 500,
		desc: 'Test donations here',
		creator: 'donateuser',
		deadline: deadlineDate.getTime()
	}
    //
    const acc = await new Accounts(dbPath)
    const plg = await new Pledges(dbPath)
    const don = await new Donations(dbPath)
    //
    try {
        // create user
        await acc.register( 'donate@test.com', body.creator, 'password' )
        // create pledge
        const imageurl = await plg.newpledge(body, 'image.jpeg')
        const imagename = `${imageurl.substring(0,
			imageurl.indexOf('/'))}-${imageurl.substring(imageurl.indexOf('/')+1)}`
		// donation args
        const d = {
            id: 1,
            amount: 10,
            ccnumber: 1234123412341234,
            cvc: 321,
            ccname: "Mr Test",
            ccexp: "05/2021"
        }
        const fakeFailure = false
        let tempArr = []
        for ( const key in d){
            tempArr.push( d[key] )
        }
        //
        const encodedCC = Buffer.from(tempArr.join(':')).toString('base64')
        // donate
        await don.donate(encodedCC, body.creator)
        // check donations
        const data = await don.getDonations(d.id)
        if( data[0].user === body.creator && data[0].amount === d.amount ) {
            t.pass('donation successful')
        } else {
            t.fail ('data didnt match')
        }
    } catch (err) {
        t.fail(err)
    } finally {
        acc.close()
        plg.close()
        don.close()
    }
})

test('DONATE : missing values in form submission', async t => {
	t.plan(1)
    //
    const deadlineMinDaysFromCreation = 7
    var deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours()+(24*deadlineMinDaysFromCreation))
	const body = {
		pledgename: 'Test Donation Pledge',
		fundgoal: 500,
		desc: 'Test donations here',
		creator: 'donateuser',
		deadline: deadlineDate.getTime()
	}
    //
    const acc = await new Accounts(dbPath)
    const plg = await new Pledges(dbPath)
    const don = await new Donations(dbPath)
    //
    try {
        const d = {
            id: null,
            amount: 10,
            ccnumber: null,
            cvc: 321,
            ccname: "",
            ccexp: ""
        }
        let tempArr = []
        for ( const key in d){
            tempArr.push( d[key] )
        }
        //
        const encodedCC = Buffer.from(tempArr.join(':')).toString('base64')
        // donate with fake payment failure
        await don.donate(encodedCC, body.creator)
        // 
        t.fail('no errors thrown')
    } catch (err) {
        t.is(err.message, 'Field(s) cannot be empty/null', 'wrong error thrown')
    } finally {
        acc.close()
        plg.close()
        don.close()
    }
})
/*
test('DONATE : pledge does not exist', async t => {
	t.pass()
})
*/
/*
test('DONATE : donate from user that does not exist', async t => {
	t.pass()
})
*/
test('DONATE : payment failure', async t => {
	t.plan(1)
    //
    const deadlineMinDaysFromCreation = 7
    var deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours()+(24*deadlineMinDaysFromCreation))
	const body = {
		pledgename: 'Test Donation Pledge',
		fundgoal: 500,
		desc: 'Test donations here',
		creator: 'donateuser',
		deadline: deadlineDate.getTime()
	}
    //
    const acc = await new Accounts(dbPath)
    const plg = await new Pledges(dbPath)
    const don = await new Donations(dbPath)
    //
    try {
        const d = {
            id: 1,
            amount: 10,
            ccnumber: 1234123412341234,
            cvc: 321,
            ccname: "Mr Test",
            ccexp: "05/2021"
        }
        const fakeFailure = false
        let tempArr = []
        for ( const key in d){
            tempArr.push( d[key] )
        }
        //
        const encodedCC = Buffer.from(tempArr.join(':')).toString('base64')
        // donate with fake payment failure
        await don.donate(encodedCC, body.creator, 'true')
        // 
        t.fail('no errors thrown')
    } catch (err) {
        t.is(err.message, 'Payment Failed<br>Try another payment method or wait to try again', 'wrong error thrown')
    } finally {
        acc.close()
        plg.close()
        don.close()
    }
})

test('GET-DONATIONS : get list successfully', async t => {
	t.plan(1)
    //
    const acc = await new Accounts(dbPath)
    const plg = await new Pledges(dbPath)
    const don = await new Donations(dbPath)
    //
    const id = 1
    //
    try {
        const list = await don.getDonations(id)
        t.pass()
    } catch (err) {
        t.fail('error thrown')
    } finally {
        don.close()
    }
})

test('GET-DONATIONS : pledge does not exist', async t => {
	t.pass()
})


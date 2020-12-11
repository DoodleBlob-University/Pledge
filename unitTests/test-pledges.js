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

test('NEW-PLEDGE : create new pledge', async t => {
	t.plan(1)
	//
    const deadlineMinDaysFromCreation = 7
    var deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours()+(24*deadlineMinDaysFromCreation))
	const body = {
		pledgename: 'Test Pledge',
		fundgoal: 100,
		desc: 'This is a test.',
		creator: 'testuser',
		deadline: deadlineDate.getTime()
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
        //shell.exec('> unitTests/test-database.db') // clear db from prev test
	}
})

test('NEW-PLEDGE : no pledgename', async t => {
	t.plan(1)
	//
    const deadlineMinDaysFromCreation = 7
    var deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours()+(24*deadlineMinDaysFromCreation))
	const body = {
		pledgename: '',
		fundgoal: 100,
		desc: 'This is a test.',
		creator: 'testuser',
		deadline: deadlineDate.getTime()
	}
	//
	const plg = await new Pledges(dbPath)
	try {
		// create pledge
		await plg.newpledge(body, 'imagename.jpeg')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'One or more fields are empty', 'wrong error thrown')
	} finally {
		plg.close()
        //shell.exec('> unitTests/test-database.db') // clear db from prev test
	}
})

test('NEW-PLEDGE : fundgoal too small', async t => {
	t.plan(1)
	//
    const deadlineMinDaysFromCreation = 7
    var deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours()+(24*deadlineMinDaysFromCreation))
	const minFundingGoal = 50
	const body = {
		pledgename: 'Test Pledge',
		fundgoal: minFundingGoal-1,
		desc: 'This is a test.',
		creator: 'testuser',
		deadline: deadlineDate.getTime()
	}
	//
	const plg = await new Pledges(dbPath)
	try {
		// create pledge
		await plg.newpledge(body, 'imagename.jpeg')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'Funding Goal needs to be greater than £50', 'wrong error thrown')
	} finally {
		plg.close()
        //shell.exec('> unitTests/test-database.db') // clear db from prev test
	}
})

test('NEW-PLEDGE : fundgoal has decimals', async t => {
	t.plan(1)
	//
    const deadlineMinDaysFromCreation = 7
    var deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours()+(24*deadlineMinDaysFromCreation))
	const body = {
		pledgename: 'Test Pledge',
		fundgoal: 99.99,
		desc: 'This is a test.',
		creator: 'testuser',
		deadline: deadlineDate.getTime()
	}
	//
	const plg = await new Pledges(dbPath)
	try {
		// create pledge
		await plg.newpledge(body, 'imagename.jpeg')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'Funding Goal must be an integer with no decimal places', 'wrong error thrown')
	} finally {
		plg.close()
        //shell.exec('> unitTests/test-database.db') // clear db from prev test
	}
})

test('NEW-PLEDGE : funding goal is invalid', async t => {
	t.plan(1)
	//
    const deadlineMinDaysFromCreation = 7
    var deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours()+(24*deadlineMinDaysFromCreation))
	const body = {
		pledgename: 'Test Pledge',
		fundgoal: 'hello',
		desc: 'This is a test.',
		creator: 'testuser',
		deadline: deadlineDate.getTime()
	}
	//
	const plg = await new Pledges(dbPath)
	try {
		// create pledge
		await plg.newpledge(body, 'imagename.jpeg')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'Funding Goal must be an integer with no decimal places', 'wrong error thrown')
	} finally {
		plg.close()
        //shell.exec('> unitTests/test-database.db') // clear db from prev test
	}
})

test('NEW-PLEDGE : deadline is a past date', async t => {
	//shell.exec('> unitTests/test-database.db') // clear db from prev test
	t.plan(1)
	//
    var deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours()-1)
	const body = {
		pledgename: 'Test Pledge',
		fundgoal: 1000,
		desc: 'This is a test.',
		creator: 'testuser',
		deadline: deadlineDate.getTime()
	}
	//
	const plg = await new Pledges(dbPath)
	try {
		// create pledge
		await plg.newpledge(body, 'imagename.jpeg')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'Deadline must be set over a week in the future', 'wrong error thrown')
	} finally {
		plg.close()
        //shell.exec('> unitTests/test-database.db') // clear db from prev test
	}
})

test('NEW-PLEDGE : deadline is too soon', async t => {
	t.plan(1)
	//
    const deadlineMinDaysFromCreation = 7
    var deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours()+(24*deadlineMinDaysFromCreation)-1)
	const body = {
		pledgename: 'Test Pledge',
		fundgoal: 1000,
		desc: 'This is a test.',
		creator: 'testuser',
		deadline: deadlineDate.getTime()
	}
	//
	const plg = await new Pledges(dbPath)
	try {
		// create pledge
		await plg.newpledge(body, 'imagename.jpeg')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'Deadline must be set over a week in the future', 'wrong error thrown')
	} finally {
		plg.close()
        //shell.exec('> unitTests/test-database.db') // clear db from prev test
	}
})

test('NEW-PLEDGE : no image attached', async t => {
	t.plan(1)
	//
    const deadlineMinDaysFromCreation = 7
    var deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours()+(24*deadlineMinDaysFromCreation))
	const body = {
		pledgename: 'Test Pledge',
		fundgoal: 1000,
		desc: 'This is a test.',
		creator: 'testuser',
		deadline: deadlineDate.getTime()
	}
	//
	const plg = await new Pledges(dbPath)
	try {
		// create pledge
		await plg.newpledge(body, '')
		t.fail('error not thrown')
	} catch (err) {
		t.is(err.message, 'Image not recieved', 'wrong error thrown')
	} finally {
		plg.close()
        //shell.exec('> unitTests/test-database.db') // clear db from prev test
	}
})

test('GET-PLEDGE : try to get a pledge that does not exist', async t => {
	t.plan(1)
	//
    const deadlineMinDaysFromCreation = 7
    var deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours()+(24*deadlineMinDaysFromCreation))
	const body = {
		pledgename: 'Test Pledge',
		fundgoal: 100,
		desc: 'This is a test.',
		creator: 'testuser',
		deadline: deadlineDate.getTime()
	}
	//
	const plg = await new Pledges(dbPath)
	try {
		// get pledge from empty table
		const data = await plg.getPledge( 'name' )
		t.fail('no error thrown')
	} catch (err) {
		t.is(err.message, 'Could not find Pledge in db')
		//t.fail('errors thrown')
	} finally {
		plg.close()
        //shell.exec('> unitTests/test-database.db') // clear db from prev test
	}
})
/*
test('LIST-PLEDGE : list pledges as user', async t => {
	shell.exec('> unitTests/test-database.db') // clear db from prev test
	t.plan(1)
	//
    const deadlineMinDaysFromCreation = 7
    var deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours()+(24*deadlineMinDaysFromCreation))
	const body = {
		pledgename: 'Test Pledge',
		fundgoal: 100,
		desc: 'This is a test.',
		creator: 'testuser',
		deadline: deadlineDate.getTime()
	}
	//
    const acc = await new Accounts(dbPath)
	const plg = await new Pledges(dbPath)
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
*/
test('APPROVE-PLEDGE : approve a pledge', async t => {
	t.plan(1)
	//
    const deadlineMinDaysFromCreation = 7
    var deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours()+(24*deadlineMinDaysFromCreation))
	const body = {
		pledgename: 'Another Test Pledge',
		fundgoal: 1337,
		desc: 'This is another test.',
		creator: 'testuser',
		deadline: deadlineDate.getTime()
	}
	//
    const acc = await new Accounts(dbPath)
	const plg = await new Pledges(dbPath)
    try {
        // create new pledge
		const imageurl = await plg.newpledge(body, 'imagename.jpeg')
		const imagename = `${imageurl.substring(0,
			imageurl.indexOf('/'))}-${imageurl.substring(imageurl.indexOf('/')+1)}`
        // get pledge data from db
		const data = await plg.getPledge( imagename )
        // APPROVE
        await plg.approvePledge( data.id )
        // check data
        const approveData = await plg.getPledge( imagename )
        // check if data matches
        if (
            approveData.id !== data.id ||
            approveData.creator !== body.creator ||
            approveData.approved !== 1
        ) {
            throw new Error('failed to approve pledge successfully')
        } else {
            t.pass('got pledge data')
        }       
    } catch (err) {
        t.fail(err)
    } finally {
        plg.close()
        acc.close()
    }
})

test('APPROVE-PLEDGE : approve a pledge with invalid id', async t => {
	t.plan(1)
    const id = 1337
	//
    const acc = await new Accounts(dbPath)
	const plg = await new Pledges(dbPath)
    try {
        // APPROVE
        await plg.approvePledge( id )
        // check data
        t.fail('no errors thrown')   
    } catch (err) {
        t.is(err.message, `pledge with id: ${id} was not found`, 'wrong error thrown')
    } finally {
        plg.close()
        acc.close()
    }
})

test('DENY-PLEDGE : deny a pledge', async t => {
	t.plan(1)
	//
    const deadlineMinDaysFromCreation = 7
    var deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours()+(24*deadlineMinDaysFromCreation))
	const body = {
		pledgename: 'Deny me!',
		fundgoal: 1337,
		desc: 'This is another test.',
		creator: 'testuser',
		deadline: deadlineDate.getTime()
	}
	//
    const acc = await new Accounts(dbPath)
	const plg = await new Pledges(dbPath)
    try {
        // create new pledge
		const imageurl = await plg.newpledge(body, 'image.jpeg')
		const imagename = `${imageurl.substring(0,
			imageurl.indexOf('/'))}-${imageurl.substring(imageurl.indexOf('/')+1)}`
        // get pledge data from db
		const data = await plg.getPledge( imagename )
        // APPROVE
        await plg.denyPledge( data.id )
        // check data
        const approveData = await plg.getPledge( imagename )
        // check pledge still exists
        t.fail('no errors thrown')    
    } catch (err) {
        t.is(err.message, 'Could not find Pledge in db', 'wrong error thrown')
    } finally {
        plg.close()
        acc.close()
    }
})

test('DENY-PLEDGE : deny a pledge with invalid id', async t => {
	t.pass()
})

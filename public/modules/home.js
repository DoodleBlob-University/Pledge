import { getCookie } from '../assets/js/functions.js'

let offset = 0
let loadedAll = false

export function setup() {

	document.getElementById('newpledgebtn').addEventListener('click', () => {
		// redirect users to login page if not yet logged in
		if ( getCookie('pledgeuser') !== null ? true : false ) {
			window.location.href = '/#new-pledge'
		} else {
			window.location.href = '/#login'
		}
	})

	// checkbox button for 'show finished pledges'
	document.querySelector('input[type=checkbox]').addEventListener('change', () => {
       	document.body.scrollTop = 0 // Safari
		document.documentElement.scrollTop = 0 // Chrome, Firefox, IE, Opera
		document.getElementById('pledges').innerHTML = ''
		offset = 0 // reset offset
		getPledges() // reload
	})

	getPledges()

}

window.onscroll = function() {
	if ( document.getElementById('loading').style.display !== 'block' && !loadedAll ) {
		// only load more if there is more to load, or not currently loading
		if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
			// if scrolled to bottom, attempt to load more
			document.getElementById('loading').style.display = 'block'
			document.getElementById('loading').style.marginTop = '30px'
			document.getElementById('loading').style.marginBottom = '30px'
			offset += 1
			getPledges()
		}
	}
}

function getPledges() {
	try{
		// this needs to be in a try catch or it doesnt work?!?!
		// no error is thrown in the catch!
		(async() => {
			await asyncGetPledges()
		})()
	} catch (e) {
		console.log(e.message)
	}
}

/* eslint-disable max-lines-per-function */
async function asyncGetPledges() {
	try {
		const fin = document.getElementById('fin').checked
		const admin = (function() { // checks if user is admin
			try {
				return JSON.parse(getCookie('pledgeuser')).admin
			} catch(e) {
				// user not logged in
				return 0
			}
		})()
		console.log(admin)

		const options = { headers: { fin: fin, off: offset, admin: admin } }
		const response = await fetch('/list', options)
		const json = await response.json()

		if( response.status === 200 ) { // success
			if( json.data.length === 0 ) {
				loadedAll = true // stop loading more if returning value is none
			} else {
				await displayPledges(json.data) // display pledges
			}
			document.getElementById('loading').style.display = 'none'

		} else { // failure
			throw new Error()
		}

	} catch (error) {
		loadedAll = true // prevents loading of more
		await displayError(error)
	}
}
/* eslint-enable max-lines-per-function */


async function displayPledges(data) {
	data.forEach( p => {
		p.moneyRaised = p.moneyRaised === null ? 0 : p.moneyRaised
		console.log(p)

		const url = getURLfromImgName(p.image)
		const daysRemaining = getDaysRemaining(p.deadline)
		const progressWidth = getProgressBarSize(p.moneyRaised, p.moneyTarget)
		const finished = daysRemaining <= 0 || p.moneyRaised >= p.moneyTarget ? true : false
		const approved = p.approved

		const htmlStr = makePledgeHTML(url, approved, p.title, p.creator, daysRemaining,
			p.moneyRaised, p.moneyTarget, progressWidth, finished)

		const pledgeDiv = document.getElementById('pledges')
		const mList = document.createElement('div')
		mList.setAttribute('id', 'mainlist')
		pledgeDiv.appendChild(mList)

		// insert html into created attribute, unless pledge is finished
		document.getElementById('mainlist').insertAdjacentHTML(
			finished ? 'afterend' : 'beforeend', htmlStr)
		// finished pledges are inserted outside the created element, so they appear at the bottom
	})

}

function getURLfromImgName(img) {
	const plg = `${img.substring(0, img.indexOf('-'))}/${img.substring(img.indexOf('-')+1,
		img.lastIndexOf('.'))}`
	return `location.href='${window.location.protocol}//${window.location.host}/${plg}'`
}

function getDaysRemaining(deadline) {
	const now = new Date().getTime() / 1000 | 0 // seconds, floored
	return ( deadline - now ) / 60 / 60 / 24 // get days, rounded down
}

function getProgressBarSize(raised, target) {
	let percent = raised / target * 100
	percent = percent > 100 ? 100 : percent
	return percent
}

/* eslint-disable max-lines-per-function, max-len, max-params */
function makePledgeHTML(url, approved, title, creator, daysRemaining, moneyRaised, moneyTarget, width, finished) {
	let htmlStr =`
    <div class="content" onclick="${url}" style="cursor: pointer;" onmouseover="">
      <div class="text" style="padding-top:5px;">
          <div class="titlebox" style="">
              <span class="pledgetitle"><h3 id="pledgetitle" style="display:inline-block;">${title}</h3>
                  <span style="font-size:14px;margin-left:10px;"><span id="creator">${creator}</span></span></span>
              <span style="display:flex;justify-content:center;align-items:center;margin-top:5px;">`
	if( !approved ) {
		htmlStr += '<div id="notif" class="timeremaining" style="font-size:13px;background-color:yellow;">Awaiting Approval</div>'
	} else if( finished ) {
		htmlStr += '<div id="notif" class="timeremaining" style="font-size:13px;background-color:#30FFB7">Pledge Finished</div>'
	} else {
		htmlStr += `<div id="notif" class="timeremaining" style="font-size:13px;">&#128197; <b><span id="daysremaining">${daysRemaining | 0}</span></b> days remaining</div>`
	}
	htmlStr += `</span>
          </div>
          <div class="progressbar" style="border-radius:5px;height:15px;display:flex;width:100%;margin: 0 auto;">
              <div id="progressbar" class="progress"
                    style="border-radius:5px;height:15px;font-size:13px;display:block;width:${width}%;" >
              </div>
          </div>
          <div style="font-size:10px;text-align:center;">£${moneyRaised}/${moneyTarget}</div>
      </div>
  </div>
`
	return htmlStr
}
/* eslint-enable max-lines-per-function, max-len, max-params */


async function displayError(error) {
	console.log(error)
}



import request from 'request'
import fs, { promises } from 'fs'
import path from 'path'
import JSZip from 'jszip'


const downloader = (() => {
	const UA = { 'Content-Type': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0'}

	let driverVersion

	function searchFromSite(){
		return new Promise((resolve, reject) => {
			request({
				url: 'https://chromedriver.chromium.org/downloads',
				headers: { ...UA },
				method: 'GET'
			}, (err, res, body) => {
				if(err)
					return reject(false)
				
				const getChromeURL = (anchors => {
					if(anchors === null)
						return 'HTML_NOT_VAILD'
					let versions = anchors
									.filter(e => /path=[0-9\.]+/.test(e))
									.map(e => e.match(/path=[0-9\.]+/))
									.filter(e => e !== null)
									.map(e => e[0].split('=').length == 2 ? e[0].split('=')[1] : false)
									.filter(e => e)
									.map(e => Object.defineProperties({}, {
										 shortVersion: {value: e.split('.')[0], enumerable: true},
										 fullVersion: {value: e, enumerable: true}
									 }))
									.sort((x, y) => parseInt(y.shortVersion) - parseInt(x.shortVersion))
					return function(chromeBrowserVersion){
						const chromeVersion = versions.find(e => chromeBrowserVersion.toString() == e.shortVersion)
						if(typeof chromeVersion == 'undefined')
							return 'VERSION_NOT_FOUND'
					
						return chromeVersion.fullVersion
					}
				})(body.match(/<a href=.+?>/gm));

				return resolve(getChromeURL)
			})
		})
	}

	function getLatestDriver(){
		return new Promise((resolve, reject) => {
			request({
				url: 'http://chromedriver.storage.googleapis.com/LATEST_RELEASE',
				headers: { ...UA },
				method: 'GET'
			}, (err, res, body) => {
				if(err)
					return reject(false)
				driverVersion = body
				return resolve(true)
			})
		})
	}

	function downloadDriver(){
		let downloadURL
		if(process.platform == 'win32')
			downloadURL = `https://chromedriver.storage.googleapis.com/${driverVersion}/chromedriver_win32.zip`
		else if(process.platform == 'linux')
			downloadURL = `https://chromedriver.storage.googleapis.com/${driverVersion}/chromedriver_linux64.zip`
		else 
			return Promise.reject({message: 'OS_NOT_SUPPORT'})

		if(!fs.existsSync(path.resolve('driver')))
			fs.mkdirSync(path.resolve('driver'))

		return new Promise((resolve, reject) => {
			request({
				url: downloadURL,
				headers: { ...UA },
				method: 'GET'
			})
			.pipe(fs.createWriteStream(path.resolve('driver/chromedriver.zip')))
			.on('finish', () => resolve(true))
			.on('error', err => reject({message: 'DOWNLOAD_ERROR'}))
		})
	}


	class driveDownload {
		constructor(){}

		checkFile(){
			const driverName = (process.platform == 'win32') ? 'chromedriver.exe' : ((process.platform == 'linux') ? 'chromedriver' : null)
			if(driverName === null)
				throw Error('Platform unknown')
			
			if(!fs.existsSync(path.resolve(`driver/${driverName}`)))
				return false
			else
				return true
		}

		async getLatestVersion(){
			try{
				await getLatestDriver()
			}
			catch(e){
				return Promise.reject({message: 'Get driver version failed'})
			}
		}

		async searchDriver(chromeVersion){
			try{
				const getDriverVersion = await searchFromSite()
				
				if(typeof getDriverVersion != 'function')
					return Promise.reject({message: 'Get driver download page failed'})
				
				const chromedriverVersion = getDriverVersion(chromeVersion)
				if(chromedriverVersion == 'VERSION_NOT_FOUND')
					return Promise.reject({message: 'Cannot find the driver version'})
				
				return driverVersion = chromedriverVersion
			}
			catch(e){
				return Promise.reject({message: `Search driver version failed: ${e.message}`})
			}
		}

		async download(){
			if(typeof driverVersion == 'undefined')
				return Promise.reject({message: 'Please get driver version first'})
			try{
				await downloadDriver()
				return Promise.resolve(true)
			}
			catch(e){
				if(e.message == 'OS_NOT_SUPPORT')
					return Promise.reject({message: 'Your platform is not supported'})
				else 
					return Promise.reject({message: `Download webdriver failed: ${e.message}`})
			}
		}

		async extractZip(){
			if(!fs.existsSync(path.resolve('driver/chromedriver.zip')))
				return Promise.reject({message: 'You did\'t download the chromedriver zip file'})
			const zip = new JSZip
				, contents = await zip.loadAsync(fs.readFileSync(path.resolve('driver/chromedriver.zip')))
			
			const extractAll = (arr) => {
				let idx = 0
				  , retryTime = 0

				async function tmp(){
					
					if(idx >= arr.length)
						return Promise.resolve(true)
					
					try{
						const file = await zip.file(arr[idx]).async('nodebuffer')
						fs.writeFileSync(path.resolve(`driver/${arr[idx]}`), file)
						idx++
						return tmp()
					}
					catch(e){
						if(retryTime == 5)
							return Promise.reject({message: e})
						retryTime++
						idx++
						return tmp()
					}
				}
				return tmp()
			}
			
			try{
				const rst = await extractAll(Object.keys(contents.files))
			
				if(fs.existsSync(path.resolve('driver/chromedriver.zip')))
					fs.unlinkSync(path.resolve('driver/chromedriver.zip'))
			
				return Promise.resolve(true)
			}
			catch(e){
				return Promise.reject({message: 'Extract file error: ' + e.message})
			}	
		}

		setDriverVersion(version){
			driverVersion = version
			return true
		}
	}
	
	return new driveDownload
})()

export default downloader
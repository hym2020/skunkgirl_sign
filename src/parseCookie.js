import fs from 'fs'
import path from 'path'
import atob from 'atob'
import linebot from 'linebot'


const cookieDir = path.resolve(`${process.cwd()}/cookies`)
    , cookiePath = path.resolve(`${process.cwd()}/cookies/skunkgirl.json`)
    , botTokens = {
		channelId: process.env.LINECHANNEL,
		channelSecret: process.env.LINESECRET,
		channelAccessToken: process.env.LINECHANNELTOKEN
	  }

function makeCookies(b64str){
    if(!fs.existsSync(cookieDir))
		fs.mkdirSync(cookieDir);
	fs.writeFileSync(cookiePath, atob(b64str), 'utf8');
}

function checkCookies(){
    if(fs.existsSync(cookiePath)){
		const sitecookies = JSON.parse(fs.readFileSync(cookiePath, 'utf8'))		
        const authKey = Object.keys(sitecookies[Object.keys(sitecookies)[0]]['/']).find(e => /auth/.test(e))
		
		if(new Date().getTime() >= new Date(sitecookies[Object.keys(sitecookies)[0]]['/'][authKey].expires).getTime()){
            const bot = linebot({ ...botTokens })
            bot.push(process.env.LINE_USERID, `SITE: skunkgirl cookies is about to expired`)
        }
	}
}

if(process.argv[2] == 'make')
    makeCookies(process.env.COOKIE)
else if(process.argv[2] == 'check')
    checkCookies()

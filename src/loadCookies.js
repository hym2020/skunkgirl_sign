import fs from 'fs'
import path from 'path'



const setCookie = (driver) => {
    if(!fs.existsSync(path.resolve('cookies/skunkgirl.json')))
        throw Error('No cookie!!')

    const jsonFile = JSON.parse(fs.readFileSync(path.resolve('cookies/skunkgirl.json'), 'utf8'))
        , hostURL = Object.keys(jsonFile)[0]
        , allCookies = jsonFile[hostURL]['/']
        , allCookiesKeys = Object.keys(allCookies)

    let idx = 0

    async function fn(){
        try{
            if(idx >= allCookiesKeys.length){
                await driver.get(`https://${hostURL}`)
                return Promise.resolve(`https://${hostURL}`)
            }


            if(idx == 0)
                await driver.get(`https://${hostURL}`)
            await driver.manage().addCookie({
                name: allCookiesKeys[idx],
                value: allCookies[allCookiesKeys[idx]].value,
                domain: allCookies[allCookiesKeys[idx]].domain
            })

            idx++
            return fn()
        }
        catch(e){
            return Promise.reject({message: 'Set cookies failed: '+ e})
        }
    }

    return fn()
}

export default setCookie

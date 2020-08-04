import webdriver from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'
import fs from 'fs'
import path from 'path'


function manually(){
    const { By, Key, until } = webdriver

    const options = new chrome.Options
    options.addArguments('--disable-gpu')
    options.addArguments('--headless')
    options.addArguments('--disable-extensions')

    let service

    const driverName = (process.platform == 'win32') ? 'chromedriver.exe' : ((process.platform == 'linux') ? 'chromedriver' : null)
    if(driverName === null)
        throw Error('Platform unknown')
    
    if(fs.existsSync(path.resolve(`driver/${driverName}`)))
        service = new chrome.ServiceBuilder(path.resolve(`driver/${driverName}`)).build()
    else
        throw Error('Webdriver not installed')
    
    chrome.setDefaultService(service)
    

    return {
        driver: new webdriver.Builder()
                    .setChromeOptions(options)
                    .withCapabilities(webdriver.Capabilities.chrome())
                    .forBrowser('chrome')
                    .build(),
        By, Key, until
    }
}

function auto(){
    const { By, Key, until } = webdriver

    const options = new chrome.Options
    options.addArguments('--disable-gpu')
    options.addArguments('--headless')
    options.addArguments('--disable-extensions')

    return {
        driver: new webdriver.Builder()
                    .setChromeOptions(options)
                    .withCapabilities(webdriver.Capabilities.chrome())
                    .forBrowser('chrome')
                    .build(),
        By, Key, until
    }
}

export { manually, auto }

import downloader from './download_driver'
import { manually as initDriver } from './initDriver'
import loadCookies from './loadCookies'
import ask from './getUserInput'

const SM_DIVIDER = '-------------------------------------------------------'
    , BG_DIVIDER = '/=======================================================/'


async function main(){
    try{
        let chromeVerion
        console.log('Step 1: Check webdriver, or download it from Google\'s site.')
        console.log(SM_DIVIDER)

        console.log('Checking...')
        let rst = downloader.checkFile()
        if(rst)
            console.log('Webdriver found!!')
        else{
            console.log('Webdriver not found, continue to download steps.')
            rst = await ask('Please specify the current version of your chrome browser, or just leave blank for default: ')
            if(rst.length == 0)
                chromeVerion = 'DEFAULT'
            else
                chromeVerion = rst
            console.log(SM_DIVIDER)

            console.log('Now setting the latest chromedriver version...')
            if(chromeVerion == 'DEFAULT')
                await downloader.getLatestVersion()
            else {
                console.log(`Your browser version is ${chromeVerion}, now searching the corresponding chromedriver version...`)
                const chromedriverVersion = await downloader.searchDriver(chromeVerion)
                console.log(`The chromedriver version is ${chromedriverVersion}`)
            }
            console.log('Version already set.')
            console.log(SM_DIVIDER)

            console.log('Now starting download chromedriver from Google...')
            await downloader.download()
            console.log('Compress file of webdriver is downloaded.')
            console.log(SM_DIVIDER)

            console.log('Now extracting the compress file...')
            await downloader.extractZip()
            console.log('Extracted. The webdriver file will be stored at \"driver\" directory.')
            console.log('Compress file is deleted')
            console.log(SM_DIVIDER)

            console.log('Webdriver is installed.')
        }
        console.log()
        console.log(BG_DIVIDER)
        console.log(BG_DIVIDER)
        console.log()


        /******************************************************************** */

        console.log()
        console.log()
        console.log('Step 2: Initilize Selenium.')
        console.log(SM_DIVIDER)

        console.log('Start initilizing Selenium webdriver...')
        const { driver, By, Key, until } = initDriver()
        console.log('Selenium webdriver is already initilized.')

        console.log()
        console.log(BG_DIVIDER)
        console.log(BG_DIVIDER)
        console.log()


        /******************************************************************** */

        console.log()
        console.log()
        console.log('Step 3: Set cookies from tough-cookie json file.')
        console.log(SM_DIVIDER)

        console.log('Start setting cookies...')
        const hostURL = await loadCookies(driver)
        console.log('Cookies are already set to webdriver.')

        console.log()
        console.log(BG_DIVIDER)
        console.log(BG_DIVIDER)
        console.log()


        /******************************************************************** */        

        console.log()
        console.log()
        console.log('Step 4: Visit other user\'s space.')
        console.log(SM_DIVIDER)

        console.log('Try visiting other user\'s space...')
        await driver.get(`${hostURL}/home.php?mod=space&uid=1`)
        
        console.log()
        console.log(BG_DIVIDER)
        console.log(BG_DIVIDER)
        console.log()


        /******************************************************************** */

        console.log()
        console.log()
        console.log('Step 5: Get your credits details of the forum.')
        console.log(SM_DIVIDER)

        console.log('Trying to get your credits details...')
        await driver.get(`${hostURL}/home.php?mod=spacecp&ac=credit&showcredit=1`)
        const creditsElement = await driver.findElements(By.css('.creditl li'))

        let creditsArr = await Promise.all(creditsElement.map(e => e.getAttribute('innerText')))

        creditsArr = creditsArr.map(e => e.split(':').map(e => e.replace(/^\s+|\s+$|\s+\(.+\)?/g, '')))
        console.log('Get credit details finished!!')
        console.log(SM_DIVIDER)

        console.log('Credit infomation: ')
        creditsArr.forEach(e => console.log(`「${e[0]}」: ${e[1]}`))

        console.log()
        console.log(BG_DIVIDER)
        console.log(BG_DIVIDER)
        console.log()


        /******************************************************************** */

        console.log()
        console.log()
        console.log('Step 6: All Done! Quit the webdriver.')
        console.log(SM_DIVIDER)

        console.log('Quiting the chrome webdriver...')
        driver.quit()
        console.log('Driver closed, all steps completed.')
        
        console.log()
        console.log(BG_DIVIDER)
        console.log(BG_DIVIDER)
        console.log()
    }
    catch(e){
        console.log('Error occured!!')
        console.log('Error message: ' + e.message)
        return
    }

}

main()
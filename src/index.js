import { auto as initDriver } from './initDriver'
import loadCookies from './loadCookies'

const SM_DIVIDER = '-------------------------------------------------------'
    , BG_DIVIDER = '/=======================================================/'


async function main(){
    try{

        console.log('Step 1: Initilize Selenium.')
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
        console.log('Step 2: Set cookies from tough-cookie json file.')
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
        console.log('Step 3: Visit other user\'s space.')
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
        console.log('Step 4: Get your credits details of the forum.')
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
        console.log('Step 5: All Done! Quit the webdriver.')
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
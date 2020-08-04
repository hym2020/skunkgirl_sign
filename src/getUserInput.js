import readline from 'readline'

export default function(ask){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise(resolve => {
        rl.question(ask, ans => {
            rl.close()
            return resolve(ans)
        })
    })
}
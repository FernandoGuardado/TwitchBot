var request = require('request');

request({
    uri: "https://www.checkmategaming.com/profile/25980/kriptonic#scheduled-matches",
}, (error, response, body) => {
    if (body.includes('No matches found')) {
        console.log('no matches found')
    } else{
        var temp = 
        console.log(temp)
    }
})
const {google} = require('googleapis')
const {JWT} = require('google-auth-library')
const keys = require('./credentials.json')

exports.onMessage = function onMessage(req, res) {
  const auth = new JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  )

  const sheets = google.sheets({version: 'v4', auth})
  const message = describe(menuFor(new Date().getDay(), sheets))

  menuFor(new Date().getDay(), sheets)
    .then(menu => res.send({ 'text': describe(menu) }))
}

// days are 1-indexed starting at Monday.
// return object keyed by menu category (e.g. Soup)
function menuFor(day, sheets) {
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get({
      spreadsheetId: '1uzlk8dpvDeHOe6cAdBnAq8W62WHjPSq-2MC5q82TKKQ',
      range: 'weekly menu!A6:F12'
    }, (err, res) => {
      if (err) return reject(err)

      const menu = {}

      res.data.values.forEach(function(row) {
        const category = row[0].trim()
        const today = row[day].trim()
        menu[category] = today || 'I do not know'
      })

      resolve(menu)
    })
  }) 
}

function describe(menu) {
  return Object.keys(menu).map(function(category) {
    return '*' + category + '*: ' + menu[category]
  }).join('\n')
}
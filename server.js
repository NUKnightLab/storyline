const path = require('path');
const express = require('express');
const google = require('googleapis');

const app = express();

  app.use(express.static(__dirname + '/dist'));
  app.get('/', function response(req, res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });

  app.get('/spreadsheets/:id', function(req,res) {
     let sheets = google.sheets('v4')
     sheets.spreadsheets.values.get({
       auth: 'API_KEY',
       spreadsheetId: req.params.id,
       range: 'A2:B'
     },function(err, response) {
       if(err) {console.log('API returned an error')}
       console.log(response.values)
       res.send(response.values)
     })
  })

app.listen('8080', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.');
});

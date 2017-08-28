const path = require('path');
const express = require('express');

const app = express();
const port = '8000'

app.use(express.static(__dirname + '/website'))

app.get('/', function response(req, res) {
  res.sendFile('/index.html', { root: __dirname }, function(err) {
    if(err) {console.log(err)}
  });
  res.end();
});

app.listen(port, function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info(`🌎  Listening on port ${port}. Open up http://0.0.0.0:${port}/ in your browser.`);
});

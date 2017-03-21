var cssmin = require('cssmin'),
    fs = require('fs-extra'),
    css = fs.readFileSync("dist/css/storyline.css", 'utf8'),
    min = cssmin(css);

fs.outputFileSync('dist/css/storyline.min.css', min, 'utf8');

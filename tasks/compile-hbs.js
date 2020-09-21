var _ = require('lodash'),
    yaml = require('yamljs'),
    fs = require('fs-extra'),
    path = require('path'),
    Handlebars = require('handlebars'),
    globby = require('globby');

/**
 * renderPage: passes a specific template through a layout and with associated data through a hbs function and returns a string
 *
 * @param string template
 * @param string layout
 * @param object data
 * @returns string html
 */
function renderPage(template, context) {
    var file = fs.readFileSync(template, 'utf8'),
        page = Handlebars.compile(file);
    return page(context);
}

/**
 * build: compile all templates under src/templates and output them to equivalent paths in dist
 *
 * @returns {undefined}
 */
function build(config_context) {
    var hbsviews = globby.sync('src/templates/**/*.hbs');

    var context = yaml.load(`src/data/${config_context}.yml`);
    _.forEach(hbsviews, function(file, i) {
        var filePattern = path.dirname(file).split('src/templates/')[1],
            fileName = path.basename(file, '.hbs'),
            outputPath = null;

        if (filePattern === undefined) {
            outputPath = `dist/${fileName}.html`;
        } else {
            outputPath = `dist/${filePattern}/${fileName}.html`;
        }

        var page = renderPage(file, context);

        fs.outputFileSync(outputPath, page, 'utf8')

    });
}

var config_context = process.env.CONFIG_CONTEXT || process.argv[2] || 'dev';

build(config_context);
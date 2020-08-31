var webpack = require('webpack'),
    path = require('path'),

    componentPath = path.resolve('./src/js');

module.exports = {
    context: path.join(__dirname),
    entry: {
        website: "./src/js/website.js"
    },
    output: {
        path: path.join(__dirname, "./dist/js"),
        filename: "[name].js",
        libraryTarget: 'var',
        library: "[name]"
    },
    node: {
        fs: "empty",
        "child_process": "empty"
    },
    target: 'web'
}
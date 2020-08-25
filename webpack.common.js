var webpack = require('webpack'),
    path = require('path'),

    componentPath = path.resolve('./src/js');

module.exports = {
    context: path.join(__dirname),
    entry: {
        storyline: "./src/js/main.js"
    },
    output: {
        path: path.join(__dirname, "./dist/js"),
        filename: "[name].js",
        libraryTarget: 'var',
        library: "[name]"
    },
    node: {
        fs: "empty",
        net: "empty",
        tls: "empty",
        child_process: "empty"
    },
    plugins: [
        new webpack.ProvidePlugin({
            PubSub: "pubsub-js"
        })
    ]
}
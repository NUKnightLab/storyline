var webpack = require('webpack'),
    path = require('path'),

    componentPath = path.resolve('./src/js');

module.exports = {
  context: path.join(__dirname),
  entry: {
    main: "./src/js/main.js",
    slider: ["./src/js/slider.js"]
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
  "browser": { "fs": false },
  resolve: {
    root: componentPath
  },
  resolveLoader: {
    root: path.join(__dirname, "node_modules")
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  webpackMiddleware: {
    noInfo: true
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "velocity-animate",
      PubSub: "pubsub-js"
    })
  ]
}

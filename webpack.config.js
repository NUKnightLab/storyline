var webpack = require('webpack'),
    path = require('path'),

    componentPath = path.resolve('./src/js');

module.exports = {
  context: path.join(__dirname), 
  entry: [
    "./src/js/main.js"
  ],
  output: {
    path: path.join(__dirname, "./dist/js"),
    filename: "[name].js"
  },
  node: {
    fs: "empty"
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
      { test: /\.json$/, loader: "json-loader" },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
}

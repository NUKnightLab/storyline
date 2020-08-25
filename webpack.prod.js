const { merge } = require('webpack-merge')
const common = require('./webpack.common')
module.exports = merge({
    mode: 'production',
}, common)
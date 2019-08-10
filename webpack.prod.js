/**
 * This is our production build configuration for the main script.
 */
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	//For prod, use 'source-map' type source maps.
	devtool: 'source-map',
	mode: 'production'
});

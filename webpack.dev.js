/**
 * This is the dev build configuration.
 */
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const WriteFilePlugin = require('write-file-webpack-plugin');
const path = require('path');

module.exports = merge(common, {
	mode: 'development',

	devServer: {
		host: '192.168.1.123',
		port: 8080,
		contentBase: path.resolve(__dirname, 'public'),
		clientLogLevel: 'none',
		https: false,
		overlay: true,
		watchContentBase: true,
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		watchOptions: {
			poll: true
		}
	},

	//Output eval-source-map type source maps.
	devtool: 'eval-source-map',

	plugins: [
		new WriteFilePlugin() //Force webpack-dev-server to write files to filesystem
	],

	//For dev, show path info in our output.
	output: {
		pathinfo: true
	}
});

const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
	context: path.resolve(__dirname, 'src'),

	entry: {
		//include fetch polyfill in generated bundle without having to add it explicitly in import statements in each file
		index: ['whatwg-fetch', './index.js']
	},

	module: {
		rules: [
			{
				//This allows us to use es6.
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							['@babel/preset-env', {
								// To see browsers that will be supported, go to https://browserl.ist/?q=defaults
								// defaults is defined as > 0.5% of global usage, last 2 versions of major browsers, Firefox ESR, not dead
								targets: 'defaults',

								// add polyfills from @babel/polyfill as needed based on what features we use in code
								useBuiltIns: 'usage'
							}]
						],
						plugins: [
							'syntax-dynamic-import',
							'@babel/plugin-proposal-class-properties',
							process.env.COVERAGE && ['istanbul', { exclude: 'test/' }]
						].filter(Boolean),
						cacheDirectory: false
					}
				}
			},
			{
				//Automatically load css files as js modules and also
				//inject them into the DOM.
				test: /\.css$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'to-string-loader'
					},
					{
						loader: 'css-loader'
					}
				]
			}
		]
	},

	plugins: [
		//This replaces any string found in the modules which match the key.
		new webpack.DefinePlugin({
			//The environment we are running in (dev, ci, or prod)
			ENVIRONMENT: JSON.stringify(process.env.ENVIRONMENT || 'prod')
		}),
		new CleanWebpackPlugin(['public']),
		new webpack.optimize.LimitChunkCountPlugin({
			maxChunks: 1 //We only want a single entry point
		}),
		process.env.ANALYZE && new BundleAnalyzerPlugin()
	].filter(Boolean),

	optimization: {
		splitChunks: {

		}
	},

	output: {
		filename: '[name].js', //The [name] is the key of the entries object.
		path: path.resolve(__dirname, 'public') //Our public directory.
	}
};

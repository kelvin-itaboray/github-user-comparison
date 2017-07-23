const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: ['./app/index.js'],
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'bundle.js'
	},
	plugins: [
		new webpack.LoaderOptionsPlugin({
			options: {
				modules: {
					loaders: [
						{
							loader: 'babel-loader',
							test: /\.js$/,
							exclude: /node_modules/
						}
					]
				}
			}
		})
	],
	devServer: {
		port: 3000,
		contentBase: './build',
		inline: true
	}
}
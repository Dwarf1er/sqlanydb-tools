//@ts-check

"use strict";

const path = require("path");
const fs = require("fs");

const getInternalPackages = (dir) => {
	return fs.readdirSync(dir)
		.filter((item) => {
			const itemPath = path.join(dir, item);
			return fs.statSync(itemPath).isDirectory() && item !== 'sqlanydb-tools-vscode';
		})
		.map((item) => path.join(dir, item, 'src', 'index.ts'));
};
  
  const packagesDir = path.resolve(__dirname, '../../packages');
  const appsDir = path.resolve(__dirname, '../../apps');

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
	target: "node",
	mode: "none",

	entry: {
		extension: "./src/extension.ts",
		...getInternalPackages(packagesDir).reduce((acc, packageEntry) => {
		  const packageName = path.basename(path.dirname(packageEntry));
		  acc[packageName] = packageEntry;
		  return acc;
		}, {}),
		...getInternalPackages(appsDir).reduce((acc, appEntry) => {
		  const appName = path.basename(path.dirname(appEntry));
		  acc[appName] = appEntry;
		  return acc;
		}, {}),
	},
	output: {
		// the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
		path: path.resolve(__dirname, "dist"),
		filename: "[name].js",
		libraryTarget: "commonjs2",
	},
	externals: {
		vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
		// modules added here also need to be added in the .vscodeignore file
	},
	resolve: {
		// support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
		extensions: [".ts", ".js"],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "ts-loader",
					},
				],
			},
		],
	},
	devtool: "nosources-source-map",
	infrastructureLogging: {
		level: "log", // enables logging required for problem matchers
	},
};
module.exports = [extensionConfig];

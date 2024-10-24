//@ts-check

"use strict";

const path = require("path");
const fs = require("fs");

const getInternalPackages = (dir) => {
	return fs
		.readdirSync(dir)
		.filter((item) => {
			const itemPath = path.join(dir, item);
			return fs.statSync(itemPath).isDirectory() && item !== "sqlanydb-tools-vscode";
		})
		.map((item) => path.join(dir, item, "src", "index.ts"));
};

const packagesDir = path.resolve(__dirname, "../../packages");
const appsDir = path.resolve(__dirname, "../../apps");

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
		path: path.resolve(__dirname, "dist"),
		filename: "[name].js",
		libraryTarget: "commonjs2",
	},
	externals: {
		vscode: "commonjs vscode",
	},
	resolve: {
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
		level: "log",
	},
};
module.exports = [extensionConfig];

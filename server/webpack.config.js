const webpack = require("webpack");
const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./index.js",
  target: "node",
  node: {
    // Need this when working with express, otherwise the build fails
    __dirname: false, // if you don't put this is, __dirname
    __filename: false, // and __filename return blank or /
  },
  mode: "production",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "../dist"),
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": { NODE_ENV: JSON.stringify(process.env.NODE_ENV) },
    }),
    new webpack.EnvironmentPlugin(),
    new webpack.NamedModulesPlugin(),
  ],
  externals: ["uws"],
};

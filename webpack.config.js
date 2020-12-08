const path = require("path"),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      { CleanWebpackPlugin } = require("clean-webpack-plugin"),
      webpack = require("webpack"),
      src = path.resolve(__dirname, 'src');

module.exports = {
  entry: path.resolve(src, 'app', 'main.js'),
  module: {
    rules: [
      { 
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ],
        include: path.resolve(src, "style")
      },
    ]
  },
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'index_bundle.js'
  },
  devServer: {
    contentBase: path.resolve(src, 'public'),
    open: true,
    hot: true,
    port: 8080
  },
  plugins: [
    new HtmlWebpackPlugin({

      template: path.resolve(src, "public", "index.html")

    }),
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development'
}
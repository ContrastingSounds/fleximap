const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './src/fleximap.ts',
  output: {
    filename: 'fleximap.js',
    path: path.resolve(__dirname),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    rules: [
      { 
        test: /\.(t|j)sx?$/, 
        use: { 
          loader: 'ts-loader' 
        }, 
        exclude: /node_modules/ 
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        loader: 'file-loader'
      }
    ]
  }
}
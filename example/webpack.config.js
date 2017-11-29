module.exports = {
  entry: "./index.js",
  output: {
    path: __dirname,
    filename: "build/bundle.js"
  }
  // module: {
  //   loaders: [
  //     {
  //       test: /\.js$/,
  //       exclude: /node_modules/,
  //       use: {
  //         loader: "babel-loader",
  //         options: {
  //           presets: ["@babel/preset-env"],
  //           compact: true
  //         }
  //       }
  //     }
  //   ]
  // }
};

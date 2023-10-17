module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    filename: "index.js",
    path: __dirname + "/public/scripts",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [{ test: /\.ts$/, loader: "ts-loader" },
    {
      test: /\.s[ac]ss$/i,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader',
      ],
    }],
  }
};

const path = require('path');

module.exports = {
  entry: {
    'reveal-pdf': './src/reveal-pdf.ts',    
    'reveal-pdf.worker': 'pdfjs-dist/build/pdf.worker.entry',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.less$/i,
        use: [
          // compiles Less to CSS
          "style-loader",
          "css-loader",
          "less-loader",
        ],
      },
      {
				test: /\.(jpe|jpg|woff|woff2|eot|ttf|svg)(\?.*$|$)/,
				type: 'asset/inline'
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'RevealPdf',
      type: 'umd',
      export: 'default'
    },
  }
};

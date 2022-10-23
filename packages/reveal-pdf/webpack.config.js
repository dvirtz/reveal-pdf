const path = require('path');

const isDevelopement = typeof process.env.CI === 'undefined';

module.exports = {
  mode: isDevelopement ? "development" : "production",
  devtool: isDevelopement ? 'eval-source-map' : 'source-map',
  entry: {
    'reveal-pdf': {
      import: './src/reveal-pdf.ts',
      library: {
        name: 'RevealPdf',
        type: 'umd',
        export: 'default'
      }
    },
    'reveal-pdf.worker': 'pdfjs-dist/build/pdf.worker.entry',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  }
};

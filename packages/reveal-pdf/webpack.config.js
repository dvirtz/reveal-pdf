const path = require('path');

const isDevelopement = typeof process.env.CI === 'undefined';

module.exports = {
  mode: isDevelopement ? "development" : "production",
  devtool: isDevelopement ? 'eval-source-map' : 'source-map',
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
      // {
      //   test: /\.less$/i,
      //   use: [
      //     // compiles Less to CSS
      //     "style-loader",
      //     "css-loader",
      //     "less-loader",
      //   ],
      // },
      // {
			// 	test: /\.(jpe|jpg|woff|woff2|eot|ttf|svg)(\?.*$|$)/,
			// 	type: 'asset/inline'
      // },
      {
        test: /pdf.js$/,
        loader: 'string-replace-loader',
        options: {
          search: /const prev = this\._transformStack\.pop\(\);\s*if \(prev\) {\s*this\._transformMatrix = prev;\s*this\._originalRestore\(\);\s*}/,
          replace: `if (this._transformStack.length > 1) {
            this._originalRestore();
          }
          this._transformMatrix = this._transformStack.pop();`
        }
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

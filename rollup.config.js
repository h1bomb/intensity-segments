const typescript = require('rollup-plugin-typescript2');
const pkg = require('./package.json');

module.exports = [
  // UMD build for browsers
  {
    input: 'src/index.ts',
    output: {
      name: 'IntensitySegments',
      file: pkg.browser,
      format: 'umd',
      exports: 'named'
    },
    plugins: [
      typescript({
        typescript: require('typescript')
      })
    ]
  },
  // CommonJS (for Node) and ES module (for bundlers) build
  {
    input: 'src/index.ts',
    output: [
      { file: pkg.main, format: 'cjs', exports: 'named' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      typescript({
        typescript: require('typescript')
      })
    ]
  }
];

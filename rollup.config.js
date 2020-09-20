import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'extract.js',
  output: {
    format: 'cjs',
    file: 'plugins/extract.js'
  },
  plugins: [
    resolve({
      browser: true,
    }),
    json(),
    commonjs()
  ]
}
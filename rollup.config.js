import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

export default [{
  input: 'music2018_main.js',
  external: ['d3'],
  output: {
    file: 'music2018bundle.js',
    format: 'iife',
    sourcemap: true,
    globals: { d3: 'd3'}
  },
  plugins: [
    resolve(),
    commonjs(),
    globals(),
    builtins()
  ]
}, {
  input: 'tree_main.js',
  external: ['d3'],
  output: {
    file: 'treebundle.js',
    format: 'iife',
    sourcemap: true,
    globals: { d3: 'd3'}
  },
  plugins: [
    resolve(),
    commonjs(),
    globals(),
    builtins()
  ]
}];
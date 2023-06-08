import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import json from 'rollup-plugin-json';

export default [{
  input: 'musicviz/musicStackedArea.js',
  external: ['d3', 'mongodb'],
  output: {
    file: 'musicviz/musicStackedAreaBundle.js',
    format: 'iife',
    sourcemap: true,
    globals: { d3: 'd3'}
  },
  plugins: [
    commonjs(),
    globals(),
    resolve(),
    builtins(),
    json()
  ]
}, {
  input: 'musicviz/tree_main.js',
  external: ['d3', 'mongoose'],
  output: {
    file: 'musicviz/treebundle.js',
    format: 'iife',
    sourcemap: true,
    globals: { d3: 'd3', mongoose: 'mongoose'}
  },
  plugins: [
    resolve(),
    commonjs(),
    globals(),
    builtins()
  ]
}];

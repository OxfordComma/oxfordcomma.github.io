import {
  select,
  json,
  cluster,
  hierarchy,
  linkHorizontal,
  zoom,
  event,
  scaleSequential,
  max,
  interpolatePlasma
} from 'd3';
import { loadData } from './loadData';
import { treemap } from './treemap';

const svg = select('svg');
const width = document.body.clientWidth;
const height = 2000//document.body.clientHeight;

const margin = { top: 0, right: 0, bottom: 0, left: 0};
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

var jsonData, artistData;
var playScale;

const zoomG = svg
    .attr('width', width)
    .attr('height', height)
  .append('g');

const treeG = zoomG.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

svg.call(zoom().on('zoom', () => {
  zoomG.attr('transform', event.transform);
}));



loadData('https://vizhub.com/OxfordComma/datasets/output-with-genre-2018.csv').then(data => {
  jsonData = data.jsonData;
  artistData = data.artistData;
 	
  playScale = scaleSequential(interpolatePlasma)
		.domain([0, Object.values(artistData).reduce((maxVal, line) => max([maxVal, line.plays]), 0) + 100]);
  //console.log(colorScale.range())
  render();
})

const render = () => {
	treeG.call(treemap, {
    jsonData,
    artistData,
    innerWidth,
    innerHeight,
    playScale
  });
}
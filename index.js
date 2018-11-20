import {
  select,
  json,
  cluster,
  hierarchy,
  linkHorizontal,
  zoom,
  event,
  scaleSequential,
  scaleOrdinal,
  max,
  interpolatePlasma,
  schemeCategory10
} from 'd3';
import { loadData } from './loadData';
import { treemap } from './treemap';
import { scatterplot } from './area';
import { colorLegend } from './colorLegend';


const treeSvg = select('.tree');
const areaSvg = select('.area');

const width = +areaSvg.attr('width');
const height = +areaSvg.attr('height');

const margin = { top: 20, right: 0, bottom: 40, left: 20 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

var jsonData, artistData, byWeekPlaysGenre, totalPlaysArtist;
var playScale;
var legend;
var selectedArtist;
var deepestGenresByArtist;

const colorValue = d => d.artist;
const colorScale = scaleOrdinal();

const zoomG = treeSvg
    // .attr('width', width)
    // .attr('height', height)
  .append('g');

const areaG = areaSvg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const treeG = zoomG.append('g')
    //.attr('transform', `translate(${margin.left},${margin.top})`);

treeSvg.call(zoom().on('zoom', () => {
  zoomG.attr('transform', event.transform);
}));

loadData('https://vizhub.com/OxfordComma/datasets/output-with-genre-2018.csv').then(data => {
  jsonData = data.jsonData;
  artistData = data.artistData;
  byWeekPlaysGenre = data.byWeekPlaysGenre;
  legend = data.sortedGenres;
  deepestGenresByArtist = data.deepestGenresByArtist;
  totalPlaysArtist = data.totalPlaysArtist;

  colorScale
    .domain(legend)
    .range(schemeCategory10);
 	
  console.log(max(Object.values(totalPlaysArtist)))
  playScale = scaleSequential(interpolatePlasma)
		.domain([0, max(Object.values(totalPlaysArtist)) + 100]);
  //console.log(colorScale.range())
  render();
})

const render = () => {
	treeG.call(treemap, {
    jsonData,
    deepestGenresByArtist,
    totalPlaysArtist,
    innerWidth,
    innerHeight,
    playScale
  });

  areaG.call(scatterplot, {
    byWeekPlaysGenre,
    legend,
    colorScale,
    colorValue,
    selectedArtist,
    innerWidth,
    innerHeight,
    circleRadius: 3
  });
}
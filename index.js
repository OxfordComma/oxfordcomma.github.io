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
  interpolateMagma,
  interpolateWarm,
  schemeCategory10,
  schemeSet3
} from 'd3';
import { loadData } from './loadData';
import { treemap } from './treemap';
import { stackedAreaHorizontal } from './stackedAreaHorizontal';
import { stackedAreaVertical } from './stackedAreaVertical';
import { colorLegend } from './colorLegend';

//Hack
// const width = 960;
// const height = 500;

// const margin = { top: 20, right: 0, bottom: 40, left: 20 };
// const innerWidth = width - margin.left - margin.right;
// const innerHeight = height - margin.top - margin.bottom;

var jsonData, artistData, byWeekPlaysGenre, byWeekPlaysArtist, totalPlaysArtist;
var artistColorScale, genreColorScale;
var topArtists, topGenres;
var playScale;
var selectedArtists = []; 
var selectedGenre;
var deepestGenresByArtist;
var byWeekPlays;
// var genreLegendG, artistLegendG;

const verticalAreaSvg = select('.stacked-area-artist-vertical');
const areaGenreSvg = select('.stacked-area-genre');
const areaArtistSvg = select('.stacked-area-artist');

const colorValue = d => d.artist;
const colorScale = scaleOrdinal();

const verticalAreaG = verticalAreaSvg.append('g')
  .attr('transform', `translate(${250}, 0), rotate(90)`);

const areaGenreG = areaGenreSvg.append('g')
    .attr('transform', `translate(${175},${10})`);
const genreLegendG = areaGenreSvg.append('g')
  .attr('class', 'genre-legend')
  .attr('transform', `translate(${10},${10})`);

const areaArtistG = areaArtistSvg.append('g')
    .attr('transform', `translate(${175},${10})`);
const artistLegendG = verticalAreaSvg.append('g')
  .attr('class', 'legend')
  .attr('transform', `translate(${5},${20})`)


loadData('https://raw.githubusercontent.com/OxfordComma/oxfordcomma.github.io/master/output_12-5-18-10-45-41.csv').then(data => {
  jsonData = data.jsonData;
  artistData = data.artistData;
  byWeekPlaysGenre = data.byWeekPlaysGenre;
  byWeekPlaysArtist = data.byWeekPlaysArtist;
  topGenres = data.topGenres;
  topArtists = data.topArtists;
  deepestGenresByArtist = data.deepestGenresByArtist;
  totalPlaysArtist = data.totalPlaysArtist;

  artistColorScale = scaleOrdinal()
    .domain(topArtists)
    .range(schemeCategory10);

 	genreColorScale = scaleOrdinal()
    .domain(topGenres)
    .range(schemeCategory10);

  // console.log(max(Object.values(totalPlaysArtist)))
  playScale = scaleSequential(interpolatePlasma)
		.domain([0, max(Object.values(totalPlaysArtist)) + 100]);
  //console.log(colorScale.range())
  render();
})

const onClickGenre = d => {
  console.log('selected genre: ' + d);
  selectedGenre = d;
  render(); 
};

const onClickArtist = d => {
  console.log(d)
  if (!selectedArtists.includes(d))
    selectedArtists.push(d);
  else
  {
    console.log('butt')
    selectedArtists = selectedArtists.filter(val => 
      {
        console.log(val)
        return val != d;
      })
  }
  console.log(selectedArtists)
  render(); 
};

const render = () => {
	// verticalAreaG.call(treemap, {
 //    jsonData,
 //    deepestGenresByArtist,
 //    totalPlaysArtist,
 //    innerWidth,
 //    innerHeight,
 //    playScale
 //  });

 verticalAreaG.call(stackedAreaVertical, {
    dataToStack: byWeekPlaysArtist,
    legend: topArtists,
    colorScale: artistColorScale,
    selectedLegendList: selectedArtists,
    width: 500,
    height: 2000,
  });

  genreLegendG.call(colorLegend, {
    colorScale: genreColorScale,
    circleRadius: 5,
    spacing: 15,
    textOffset: 12,
    backgroundRectWidth: 135,
    onClick: onClickGenre,
    selectedLegendItem: selectedGenre
  });

  artistLegendG.call(colorLegend, {
    colorScale: artistColorScale,
    circleRadius: 5,
    spacing: 15,
    textOffset: 12,
    backgroundRectWidth: 135,
    onClick: onClickArtist,
    selectedLegendList: selectedArtists
  });

  areaGenreG.call(stackedAreaHorizontal, {
    dataToStack: byWeekPlaysGenre,
    legend: topGenres,
    colorScale: genreColorScale,
    selectedLegendItem: selectedGenre,
    width: 960,
    height: 500,
  });

  areaArtistG.call(stackedAreaHorizontal, {
    dataToStack: byWeekPlaysArtist,
    legend: topArtists,
    colorScale: artistColorScale,
    selectedLegendItem: selectedArtists,
    width: 960,
    height: 500,
  });
}
import {
  select,
  json,
  cluster,
  hierarchy,
  linkHorizontal,
  scaleOrdinal,
  max,
  schemeCategory10,
  interpolateRainbow
} from 'd3';

import { loadStackedArtistData } from './loadStackedArtistData';
import { treemap } from './treemap';
import { stackedAreaHorizontal } from './stackedAreaHorizontal';
import { stackedAreaVertical } from './stackedAreaVertical';
import { colorLegend } from './colorLegend';

var jsonData, artistData;
var byWeekPlaysGenre, totalPlaysByGenre;
var byWeekPlaysArtist, totalPlaysByArtist;
var byWeekPlaysTrack, totalPlaysByTrack;
var artistColorScale, genreColorScale, trackColorScale;
var topArtists, topGenres, topTracks;
var selectedArtists = []; 
var selectedTracks = [];
var deepestGenresByArtist;
var byWeekPlays;
var numStackedAreaArtists = 25;
var numStackedTracks = 30;
var legendWidth = 250;



var verticalAreaG, artistLegendG;
var areaWidth, areaHeight;

var script_tag = document.getElementById('year')
var year = script_tag.getAttribute("data-year").toString();
var startDate = new Date(year, '00', '01');
var endDate = new Date((+year+1).toString(), '00', '01');
console.log(startDate)
console.log(endDate)

loadStackedArtistData(
  'https://raw.githubusercontent.com/OxfordComma/oxfordcomma.github.io/master/music2018.csv',
  startDate,
  endDate).then(data => {
// loadStackedArtistData('/Users/nick/oxfordcomma.github.io/musicviz/data/16Jun2019_214451.csv').then(data => {
  jsonData = data.jsonData;
  artistData = data.artistData;
  byWeekPlaysGenre = data.byWeekPlaysGenre;
  byWeekPlaysArtist = data.byWeekPlaysArtist;
  byWeekPlaysTrack = data.byWeekPlaysTrack;

  topGenres = data.topGenres;
  topArtists = data.topArtists;
  topTracks = data.topTracks;

  var topArtistsTrimmed = topArtists.slice(0, numStackedAreaArtists);
  var topTracksTrimmed = topTracks.slice(0, numStackedTracks);

  areaWidth = document.getElementById('stacked-area-artist').clientWidth;
  areaHeight = window.innerHeight - document.getElementById('navbar-placeholder').clientHeight;  

  deepestGenresByArtist = data.deepestGenresByArtist;
  totalPlaysByArtist = data.totalPlaysByArtist;

  artistColorScale = scaleOrdinal()
    .domain(topArtistsTrimmed);
  const n = artistColorScale.domain().length;
  artistColorScale
    .range(artistColorScale.domain().map((d, i) => interpolateRainbow(i/(n+1))));

  trackColorScale = scaleOrdinal()
    .domain(topTracksTrimmed);
  const m = trackColorScale.domain().length;
  trackColorScale
    .range(trackColorScale.domain().map((d, i) => interpolateRainbow(i/(m+1))));

 	genreColorScale = scaleOrdinal()
    .domain(topGenres)
    .range(schemeCategory10);

  const verticalAreaSvg = select('.stacked-area-artist-svg')
    .attr('height', areaHeight)
    .attr('width', document.getElementById('stacked-area-artist').clientWidth)

  verticalAreaG = verticalAreaSvg
    .append('g')
      .attr('class', 'stacked-area-container')

  artistLegendG = verticalAreaSvg
    .append('g')
      .attr('class', 'legend-container d-none d-md-block')
      .attr('transform', `translate(${document.getElementById('stacked-area-artist').clientWidth - legendWidth},${10})`);
  
  render();
})

const onClickArtist = d => {
  if (!selectedArtists.includes(d))
    selectedArtists.push(d);
  else
    selectedArtists = selectedArtists.filter(val => val != d);
  
  console.log(selectedArtists)
  render(); 
};

const onClickArtistUnique = d => {
  if (selectedArtists.length == 0)
    selectedArtists = [d]
  else
    selectedArtists = []
  
  console.log(selectedArtists)
  render(); 
};

const onClickTrack = d => {
  if (!selectedTracks.includes(d))
    selectedTracks.push(d);
  else
    selectedTracks = selectedTracks.filter(val => val != d);
  
  console.log(selectedTracks)
  render(); 
};

const render = () => {
  verticalAreaG.call(stackedAreaVertical, {
    dataToStack: byWeekPlaysArtist,
    topArtists: topArtists,
    colorScale: artistColorScale,
    selectedLegendList: selectedArtists,
    width: areaWidth,
    height: areaHeight,
    numArtists: numStackedAreaArtists,
    onClick: onClickArtistUnique,
    year: year,
    amplitude: 1,
    position: -100
  });

  artistLegendG.call(colorLegend, {
    colorScale: artistColorScale,
    circleRadius: 5,
    spacing: 17,
    textOffset: 12,
    backgroundRectWidth: legendWidth,
    onClick: onClickArtist,
    selectedLegendList: selectedArtists
  });

}
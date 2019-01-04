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
  schemeCategory10,
  interpolateRainbow
} from 'd3';

import { loadData } from './loadData';
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
// var playColorScale;
var selectedArtists = []; 
var selectedTracks = [];
var deepestGenresByArtist;
var byWeekPlays;
var numStackedAreaArtists = 25;
var numStackedTracks = 30;

var verticalAreaG, artistLegendG;

var areaWidth, areaHeight;

loadData('https://raw.githubusercontent.com/OxfordComma/oxfordcomma.github.io/master/music2018.csv').then(data => {
  jsonData = data.jsonData;
  artistData = data.artistData;
  byWeekPlaysGenre = data.byWeekPlaysGenre;
  byWeekPlaysArtist = data.byWeekPlaysArtist;
  byWeekPlaysTrack = data.byWeekPlaysTrack;

  topGenres = data.topGenres;
  topArtists = data.topArtists;
  topTracks = data.topTracks;

  deepestGenresByArtist = data.deepestGenresByArtist;
  totalPlaysByArtist = data.totalPlaysByArtist;

  artistColorScale = scaleOrdinal()
    .domain(topArtists.slice(0, numStackedAreaArtists));
  const n = artistColorScale.domain().length;
  artistColorScale
    .range(artistColorScale.domain().map((d, i) => interpolateRainbow(i/(n+1))));

 	genreColorScale = scaleOrdinal()
    .domain(topGenres)
    .range(schemeCategory10);

  trackColorScale = scaleOrdinal()
    .domain(topTracks.slice(0, numStackedTracks));
  const m = trackColorScale.domain().length;
  trackColorScale
    .range(trackColorScale.domain().map((d, i) => interpolateRainbow(i/(m+1))));

  // playColorScale = scaleSequential(interpolatePlasma)
		// .domain([0, max(Object.values(totalPlaysByArtist)) + 100]);

  const verticalAreaSvg = select('.stacked-area-artist-svg')
    .attr('height', window.innerHeight)
    .attr('width', document.getElementById('stacked-area-artist-vertical').clientWidth)

  verticalAreaG = verticalAreaSvg.append('g')
    .attr('class', 'stacked-area-container')

  artistLegendG = verticalAreaSvg.append('g')
    .attr('class', 'legend-container d-none d-md-block')
    .attr('transform', `translate(${document.getElementById('stacked-area-artist-vertical').clientWidth - 160},${10})`);

  areaWidth = document.getElementById('stacked-area-artist-vertical').clientWidth;
  areaHeight = window.innerHeight - document.getElementById('navbar-placeholder').clientHeight;  
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
    onClick: onClickArtist,
    year: 2018,
    amplitude: -1,
    position: 100
  });

  // verticalAreaG.call(stackedAreaVertical, {
  //   dataToStack: byWeekPlaysTrack,
  //   topArtists: topTracks,
  //   colorScale: trackColorScale,
  //   selectedLegendList: selectedTracks,
  //   width: document.getElementById('stacked-area-artist-vertical').clientWidth,
  //   height: document.body.clientHeight - document.getElementById('navbar-placeholder').clientHeight,
  //   numArtists: numStackedTracks,
  //   onClick: onClickTrack,
  //   year: 2018
  // });

  artistLegendG.call(colorLegend, {
    colorScale: artistColorScale,
    circleRadius: 5,
    spacing: 17,
    textOffset: 12,
    backgroundRectWidth: 135,
    onClick: onClickArtist,
    selectedLegendList: selectedArtists
  });

}
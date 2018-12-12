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
  interpolateRdBu,
  interpolatePlasma,
  schemeCategory10
} from 'd3';
import { loadData } from './loadData';
import { treemap } from './treemap';
import { stackedAreaVertical } from './stackedAreaVertical';
import { colorLegend } from './colorLegend';

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
const treeSvg = select('.tree')

const colorValue = d => d.artist;
const colorScale = scaleOrdinal();

const verticalAreaG = verticalAreaSvg.append('g')
  .attr('transform', `translate(${250}, 0), rotate(90)`);

const artistLegendG = verticalAreaSvg.append('g')
  .attr('class', 'legend')
  .attr('transform', `translate(${5},${20})`)

const treeG = treeSvg.append('g')
  .attr('class', 'tree')

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
    .domain(topArtists);
  const n = artistColorScale.domain().length;
  artistColorScale
    .range(artistColorScale.domain().map((d, i) => interpolatePlasma(i/(n+1))));

  genreColorScale = scaleOrdinal()
    .domain(topGenres)
    .range(schemeCategory10);

  playScale = scaleSequential(interpolatePlasma)
    .domain([0, max(Object.values(totalPlaysArtist)) + 100]);
  render();
})

const onClickGenre = d => {
  console.log('selected genre: ' + d);
  selectedGenre = d;
  render(); 
};

const onClickArtist = d => {
  if (!selectedArtists.includes(d))
    selectedArtists.push(d);
  else
  selectedArtists = selectedArtists.filter(val => val != d);
  console.log(selectedArtists)
  render(); 
};

const render = () => {
  treeG.call(treemap, {
    jsonData,
    deepestGenresByArtist,
    totalPlaysArtist,
    topArtists,
    width: 500,
    height: 2500,
    playScale,
    selectedLegendList: selectedArtists
  });

  verticalAreaG.call(stackedAreaVertical, {
    dataToStack: byWeekPlaysArtist,
    legend: topArtists,
    colorScale: artistColorScale,
    selectedLegendList: selectedArtists,
    width: 500,
    height: 2500
  });

  // genreLegendG.call(colorLegend, {
  //   colorScale: genreColorScale,
  //   circleRadius: 5,
  //   spacing: 15,
  //   textOffset: 12,
  //   backgroundRectWidth: 135,
  //   onClick: onClickGenre,
  //   selectedLegendItem: selectedGenre
  // });

  artistLegendG.call(colorLegend, {
    colorScale: artistColorScale,
    circleRadius: 5,
    spacing: 15,
    textOffset: 12,
    backgroundRectWidth: 135,
    onClick: onClickArtist,
    selectedLegendList: selectedArtists
  });

  // areaGenreG.call(stackedAreaHorizontal, {
  //   dataToStack: byWeekPlaysGenre,
  //   legend: topGenres,
  //   colorScale: genreColorScale,
  //   selectedLegendItem: selectedGenre,
  //   width: 960,
  //   height: 500,
  // });

  // areaArtistG.call(stackedAreaHorizontal, {
  //   dataToStack: byWeekPlaysArtist,
  //   legend: topArtists,
  //   colorScale: artistColorScale,
  //   selectedLegendItem: selectedArtists,
  //   width: 960,
  //   height: 500,
  // });
}
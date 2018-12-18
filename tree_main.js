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

const numStackedAreaArtists = 20;

const verticalAreaSvg = select('.stacked-area-artist-vertical');
const treeSvg = select('.tree')
  // .attr('width', 1000)
  // .attr('height', 2000)

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
    .domain(topArtists.slice(0, numStackedAreaArtists));


  const n = artistColorScale.domain().length;
  
  artistColorScale
    .range(artistColorScale.domain().map((d, i) => interpolatePlasma(i/(n+1))));

  genreColorScale = scaleOrdinal()
    .domain(topGenres)
    .range(schemeCategory10);

  playScale = scaleSequential(interpolatePlasma)
    .domain([0, max(Object.values(totalPlaysArtist)) + 100]);

  const topArtistsTrimmed = topArtists.slice(0, 20);
  const topGenresTrimmed = topArtistsTrimmed.map(a => deepestGenresByArtist[a])
  addArtistsToTree(topArtistsTrimmed, jsonData);
  // console.log(jsonData)
  removeEmptyLeaves(jsonData)


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

const addArtistsToTree = function(artists, t) {
    artists.forEach(a => (deepestGenresByArtist[a] == t.id ? t.children.push({id: a, artist: true, children: []}) : 1))
    if (t.children)
      t.children.forEach(c => addArtistsToTree(artists, c))
  }

const removeEmptyLeaves = function(t) {
  if (t.children.length > 0)
  {
    var toRemove = []
    t.children.forEach(c => {
      removeEmptyLeaves(c)

      if (!c.artist && c.children.length == 0)
      {
        toRemove.push(c.id)
      }
    })
    if (toRemove)
    {
      // console.log('to remove: ' + toRemove)
      // console.log(t.children)
      t.children = t.children.filter(c => !toRemove.includes(c.id))
      // console.log(t.children)
    }
  }
}

const render = () => {
  treeG.call(treemap, {
    jsonData,
    deepestGenresByArtist,
    totalPlaysArtist,
    topArtists,
    width: 500,
    height: 800,
    colorScale: artistColorScale,
    selectedLegendList: selectedArtists,
    numArtists: 20,
    onClick: onClickArtist
  });

  verticalAreaG.call(stackedAreaVertical, {
    dataToStack: byWeekPlaysArtist,
    topArtists: topArtists,
    colorScale: artistColorScale,
    selectedLegendList: selectedArtists,
    width: 500,
    height: 850,
    numArtists: numStackedAreaArtists,
    onClick: onClickArtist
  });

  artistLegendG.call(colorLegend, {
    colorScale: artistColorScale,
    circleRadius: 5,
    spacing: 15,
    textOffset: 12,
    backgroundRectWidth: 135,
    onClick: onClickArtist,
    selectedLegendList: selectedArtists,
    numArtists: numStackedAreaArtists
  });
}
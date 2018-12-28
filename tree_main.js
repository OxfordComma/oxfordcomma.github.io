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
  schemeCategory10,
  interpolateRainbow
} from 'd3';
import { loadData } from './loadData';
import { treemap } from './treemap';
import { stackedAreaVertical } from './stackedAreaVertical';
import { colorLegend } from './colorLegend';

var jsonData, artistData, byWeekPlaysGenre, byWeekPlaysArtist, totalPlaysArtist;
var artistColorScale, genreColorScale;
var topArtists, topArtistsTrimmed, topGenres;
var playScale;
var selectedArtists = []; 
var selectedGenre;
var deepestGenresByArtist;
var byWeekPlays;

var verticalAreaG, artistLegendG, treeG;
var treeWidth, treeHeight, areaWidth, areaHeight;

const numStackedAreaArtists = 30;

loadData('https://raw.githubusercontent.com/OxfordComma/oxfordcomma.github.io/master/music2018.csv').then(data => {
  jsonData = data.jsonData;
  artistData = data.artistData;
  byWeekPlaysGenre = data.byWeekPlaysGenre;
  byWeekPlaysArtist = data.byWeekPlaysArtist;
  topGenres = data.topGenres;
  topArtists = data.topArtists;
  deepestGenresByArtist = data.deepestGenresByArtist;
  totalPlaysArtist = data.totalPlaysArtist;



  treeHeight = window.innerHeight - document.getElementById('navbar-placeholder').clientHeight - 5;
  treeWidth = document.getElementById('tree').clientWidth;

  areaHeight = treeHeight;  
  areaWidth = document.getElementById('stacked-area-artist-vertical').clientWidth;

  const verticalAreaSvg = select('.stacked-area-artist-vertical')
    .attr('height', areaHeight)
    .attr('width', areaWidth)

  const treeSvg = select('.tree')
    .attr('height', treeHeight)
    .attr('width', treeWidth)

  // console.log(treeHeight)

  verticalAreaG = verticalAreaSvg.append('g')
    .attr('transform', `translate(${areaWidth/2}, 0), rotate(90)`);

  artistLegendG = verticalAreaSvg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${5},${5})`)

  treeG = treeSvg.append('g')
    .attr('class', 'tree')

  

  topArtistsTrimmed = topArtists.slice(0, numStackedAreaArtists);
  const topGenresTrimmed = topArtistsTrimmed.map(a => deepestGenresByArtist[a])
  addArtistsToTree(topArtistsTrimmed, jsonData);
  removeEmptyLeaves(jsonData)
  
  topArtistsTrimmed = hierarchy(jsonData).leaves().map(d=>d.data.id);


  artistColorScale = scaleOrdinal()
    .domain(topArtistsTrimmed);

  const n = artistColorScale.domain().length;
  
  artistColorScale
    .range(artistColorScale.domain().map((d, i) => interpolateRainbow(i/(n+1))));

  genreColorScale = scaleOrdinal()
    .domain(topGenres)
    .range(schemeCategory10);

  playScale = scaleSequential(interpolatePlasma)
    .domain([0, max(Object.values(totalPlaysArtist)) + 100]);


  render();
})

const onClickGenre = d => {
  selectedArtists = selectedArtists.sort().join(',') === d.sort().join(',') ? [] : d;
  console.log(selectedArtists)
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
          toRemove.push(c.id)
      })
      if (toRemove)
        t.children = t.children.filter(c => !toRemove.includes(c.id))
    }
  }

const render = () => {
  treeG.call(treemap, {
    jsonData,
    deepestGenresByArtist,
    totalPlaysArtist,
    topArtists,
    width: treeWidth,
    height: treeHeight,
    colorScale: artistColorScale,
    selectedLegendList: selectedArtists,
    onClickArtist: onClickArtist,
    onClickGenre: onClickGenre
  });

  verticalAreaG.call(stackedAreaVertical, {
    dataToStack: byWeekPlaysArtist,
    topArtists: topArtistsTrimmed,
    colorScale: artistColorScale,
    selectedLegendList: selectedArtists,
    width: areaWidth,
    height: document.getElementById('tree').clientHeight,
    numArtists: numStackedAreaArtists,
    onClick: onClickArtist,
    year: 2018
  });

  // artistLegendG.call(colorLegend, {
  //   colorScale: artistColorScale,
  //   circleRadius: 5,
  //   spacing: 15,
  //   textOffset: 12,
  //   backgroundRectWidth: 135,
  //   onClick: onClickArtist,
  //   selectedLegendList: selectedArtists,
  //   numArtists: numStackedAreaArtists
  // });
}
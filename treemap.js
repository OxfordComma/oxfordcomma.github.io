import { 
  hierarchy, 
  cluster, 
  select,
	linkHorizontal,
  linkVertical,
} from 'd3';

export const treemap = (selection, props) => {
  const {
    jsonData,
    deepestGenresByArtist,
    totalPlaysArtist,
    topArtists,
    width,
    height,
    colorScale,
    selectedLegendList,
    numArtists,
    onClick
  } = props;

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

  const topArtistsTrimmed = topArtists.slice(0, numArtists);
  const topGenresTrimmed = topArtistsTrimmed.map(a => deepestGenresByArtist[a])
  var maxGenreDepth = 0;
  
  const treeLayout = cluster()
    .size([height, width])
    .separation((a, b) => { 
      return (a.parent == b.parent ? 1 : 1); 
    })

  // addArtistsToTree(topArtistsTrimmed, jsonData);
  // console.log(jsonData)
  // removeEmptyLeaves(jsonData)
  var root = hierarchy(jsonData); 

  root.descendants().forEach(d => {
  //   const genre = d.data.id;
    maxGenreDepth = d.depth > maxGenreDepth ? d.depth : maxGenreDepth;
  //   Object.keys(deepestGenresByArtist).filter(a => deepestGenresByArtist[a] === genre).forEach(f => {
  //     if (!topArtistsTrimmed.includes(f))
  //       return;

  //     var newNode = hierarchy({
  //       id: f, 
  //       artist: f, 
  //       plays: totalPlaysArtist[f]
  //     });

  //     newNode.parent = d;  
  //     if (d.children === undefined)
  //       d.children = [];

  //     d.children.push(newNode);
  //   })
  }) 

  root.sort((a,b) => {
    var aLen = a.children === undefined ? -1 : a.children.length;
    var bLen = b.children === undefined ? -1 : b.children.length;
    return(bLen - aLen); 
  });
  
  const tree = treeLayout(root);
  var links = tree.links();   
 
  const linkPathGenerator = linkHorizontal()
    .x(d => d.y)
    .y(d => d.x);

  const treeSpread = 150

  links.forEach(d => {
    if (d.target.data.artist)
      d.target.y = (maxGenreDepth + 1) * treeSpread;
    else
  		d.target.y = (d.target.depth + 1) * treeSpread;
  }); 

  selection.selectAll('path').data(links)
    .enter().append('path')
      .attr('d', linkPathGenerator)

  const treeText = selection.selectAll('text').data(root.descendants());
  const treeTextEnter = treeText.enter().append('text')
    .attr('class', d => d.data.artist ? 'artist' : 'genre')
    .attr('x', d => d.y)
    .attr('y', d => d.x)
    .attr('dy', '0.32em')
    .attr('text-anchor', d => d.data.artist ? 'start' : 'start')
    .attr('fill', d => d.data.artist ? colorScale(d.data.id) : 'black')
    // .attr('font-size', d => d.data.artist ? 2.1*Math.log(d.data.plays) * 2 : '1.1em')
    .text(d => d.data.id); 

  treeText.merge(treeTextEnter)
    .on('click', d => d.data.artist ? onClick(d.data.id) : true)

    .transition(200)
      .attr('opacity', d => (selectedLegendList.length == 0 || selectedLegendList.includes(d.data.id)) ? 1 : 0.2)
};
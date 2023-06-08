import { 
  hierarchy, 
  cluster, 
  select,
	linkHorizontal
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
    onClickArtist,
    onClickGenre
  } = props;

  //console.log(jsonData);

  // const topArtistsTrimmed = topArtists.slice(0, numArtists);
  // console.log(topArtistsTrimmed)
  const topGenresTrimmed = topArtists.map(a => deepestGenresByArtist[a])
  var maxGenreDepth = 0;
  
  const treeLayout = cluster()
    .size([height, 0.75*width])
    .separation((a, b) => { 
      return (a.parent == b.parent ? 1 : 1); 
    })


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
    // console.log(a)
    // return (b.depth - a.depth)
  });
  console.log(root)
  
  const tree = treeLayout(root);
  var links = tree.links();   
 
  const linkPathGenerator = linkHorizontal()
    .x(d => d.y)
    .y(d => d.x);

  const treeSpread = d3.max([width/7, 95]);
  selection.width = treeSpread * maxGenreDepth

  // links.forEach(d => {
  //   if (d.target.data.artist)
  //     d.target.y = (maxGenreDepth) * treeSpread;
  //   else
  // 		d.target.y = (d.target.depth) * treeSpread;
  // }); 


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
    // .on('click', d => d.data.artist ? onClickArtist(d.data.id) : true)
    .on('click', d => {
      var artists = d.leaves()
      return d.data.artist ? 
        artists.forEach(l => onClickArtist(l.data.id)) :
        onClickGenre(artists.map(l => l.data.id))


      // console.log(d.leaves())
      // (d.data.artist ? onClickArtist(d.data.id) : d.descendants().forEach(l => onClickArtist(l.data.id)))
    })
    .transition(200)
      .attr('opacity', d => {
        const path = root.path(d).map(p => p.data.id)

        // console.log(d.descendants());
        var childNames = d.descendants().map(c => c.data.id)
        // console.log(childNames)
        return (
          selectedLegendList.length == 0 || 
          // selectedLegendList.includes(d.data.id) 
          selectedLegendList.some(r=> childNames.indexOf(r) >= 0) 
          ? 1 : 0.2
        )})

};
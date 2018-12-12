import { 
  hierarchy, 
  cluster, 
  select,
	linkHorizontal,
  linkVertical
} from 'd3';

export const treemap = (selection, props) => {
  const {
    jsonData,
    deepestGenresByArtist,
    totalPlaysArtist,
    topArtists,
    width,
    height,
    playScale,
    selectedLegendList
  } = props;

  var maxGenreDepth = 0;
  
  const treeLayout = cluster()
    .size([height, width])
    .separation((a, b) => { 
      return (a.parent == b.parent ? 1 : 1); 
    })

  const root = hierarchy(jsonData);  
  
  root.descendants().forEach(d => {
    const genre = d.data.id;
    maxGenreDepth = d.depth > maxGenreDepth ? d.depth : maxGenreDepth;
      Object.keys(deepestGenresByArtist).filter(a => deepestGenresByArtist[a] === genre).forEach(f => {
      if (totalPlaysArtist[f] < 5 || !topArtists.includes(f))
        return;

      var newNode = hierarchy({
        id: f, 
        artist: f, 
        plays: totalPlaysArtist[f]
      });

      newNode.parent = d;  
      if (d.children === undefined)
        d.children = [];

      d.children.push(newNode);
    })
  })
  
  root.sort((a,b) => {
    var aLen = a.children === undefined ? -1 : a.children.length;
    var bLen = b.children === undefined ? -1 : b.children.length;
    return(bLen - aLen); 
  });
  
  const tree = treeLayout(root);
  const links = tree.links();    
  const linkPathGenerator = linkHorizontal()
    .x(d => d.y)
    .y(d => d.x);

  const treeSpread = 170

  links.forEach(d => {
    if (d.target.data.artist)
      d.target.y = (maxGenreDepth + 1) * treeSpread;
    else
  		d.target.y = d.target.depth * treeSpread;
  }); 

  selection.selectAll('path').data(links)
    .enter().append('path')
      .attr('d', linkPathGenerator)
      // .attr('opacity', );

  const treeText = selection.selectAll('text').data(root.descendants());
  const treeTextEnter = treeText.enter().append('text')
    .attr('x', d => d.y)
    .attr('y', d => d.x)
    .attr('dy', '0.32em')
    .attr('text-anchor', d => d.data.artist ? 'start' : 'end')
    .attr('fill', d => d.data.artist ? playScale(d.data.plays) : 'black')
    .attr('font-size', d => d.data.artist ? 2.1*Math.log(d.data.plays) * 2 : '1.1em')
    .text(d => d.data.id); 

  treeText.merge(treeTextEnter)
    .transition(200)
      .attr('opacity', d => (selectedLegendList.length == 0 || selectedLegendList.includes(d.data.id)) ? 1 : 0.2)
};
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
    innerWidth,
    innerHeight,
    playScale
  } = props;
  
  const treeLayout = cluster()
    .size([2000, 500])
    .separation((a, b) => { 
      // console.log(a.parent == b.parent)
      return (a.parent == b.parent ? 1 : 1); 
    })

  const root = hierarchy(jsonData);  
  
  // var filtArtistData = [];
  // Object.keys(artistData).map(k => {
  //   if (artistData[k].plays > 5)
		// 	filtArtistData.push(artistData[k]); 
  // })
  
  // filtArtistData.forEach(f => {
  //   var deepestGenreIndex = 0;
  //   for (var i = 0; i < f.genre.length; i++)
		// 	if (f.genreDepths[i] > f.genreDepths[deepestGenreIndex])
  //       deepestGenreIndex = i;
  //   f.deepestGenre = f.genre[deepestGenreIndex];
  // })
  // //console.log(filtArtistData);
  
  root.descendants().forEach(d => {
    const genre = d.data.id;
    // console.log(Object.keys(deepestGenresByArtist))
  //   filtArtistData.filter(a => a.deepestGenre === genre).forEach(f => {
      Object.keys(deepestGenresByArtist).filter(a => deepestGenresByArtist[a] === genre).forEach(f => {
      // console.log(f);
      if (totalPlaysArtist[f] < 5)
        return;

      var newNode = hierarchy({id: f, artist: f, plays: totalPlaysArtist[f]});
      console.log(newNode)
      // newNode.data.id = newNode.data.artist; 
      newNode.parent = d;  
      if (d.children === undefined)
        d.children = [];

      d.children.push(newNode);
    })
  })
  
  // console.log(root); 
  // Todo: Fix this duplicated logic from loadData
  root.sort((a,b) => {
    // console.log(a);
    // console.log('a:' + a.data.id + ' ' + (a.children === undefined ? -1 : a.children.length));
    // console.log('b:' + b.data.id + ' ' + (b.children === undefined ? -1 : b.children.length));
    var aLen = a.children === undefined ? -1 : a.children.length;
    var bLen = b.children === undefined ? -1 : b.children.length;
    // if (a.data.artist)
    //   aLen = 100;
    // if (b.data.artist)
    //   bLen = 100;
    return(bLen - aLen); 
  });
  // console.log(root); 
  
  //console.log(root)
  const tree = treeLayout(root);
  const links = tree.links();    
  const linkPathGenerator = linkHorizontal()
    .x(d => d.y)
    .y(d => d.x);

  links.forEach(d => {
    if (d.target.data.artist)
      d.target.y = 750;
    else
  		d.target.y = d.target.depth * 150;
  }); 

  selection.selectAll('path').data(links)
    .enter().append('path')
      .attr('d', linkPathGenerator);

  selection.selectAll('text').data(root.descendants()) 
    .enter().append('text')
      .attr('x', d => d.y)
      .attr('y', d => d.x)
      .attr('dy', '0.32em')
      .attr('text-anchor', d => d.data.artist ? 'start' : 'start')
  		//.attr('font-size', d => d.children ? '1em' : '0.2em')
  		.attr('fill', d => d.data.artist ? playScale(d.data.plays) : 'black')
      .attr('font-size', d => d.data.artist ? Math.log(d.data.plays) * 2 : '0.6em')
      .text(d => d.data.id); 
};
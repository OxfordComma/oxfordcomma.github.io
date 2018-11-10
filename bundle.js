(function (d3) {
  'use strict';

  const loadData = url => {
    return Promise.all([d3.csv(url), d3.json('data.json')]).then(data => {
      const csvData = data[0];
      var jsonData = data[1];
      const artistData = [];

      var genreDict = {};
      var genreHierarchy = d3.hierarchy(jsonData); 
      genreHierarchy.data = jsonData; 
      //console.log(genreHierarchy); 

      const genreList = genreHierarchy.descendants().map(d => d.data.id);

      genreHierarchy.sort((a,b) => {
        const aLen = a.children === undefined ? 0 : a.children.length;
        const bLen = b.children === undefined ? 0 : b.children.length;
        return(bLen - aLen); 
      });
      
      
      genreHierarchy.descendants().forEach(d => {
        const name = d.data.id;
        genreDict[name] = { 
          depth: d.depth,
          plays: 0,
        };  
      });
      
  		//console.log(genreList);
      csvData.forEach(d => {
        if (!artistData[d.artist]) {
          if (d.genre === "")
            return;
          d.genre = d.genre.split(',').map(g => g.replace(/ /g, '')).filter(g => genreList.includes(g));
          d.genreDepths = d.genre.map(g => genreDict[g].depth);

  				artistData[d.artist] = {
            artist: d.artist,
            genre: d.genre,
            genreDepths : d.genreDepths,
            plays: 1
          }; 
        }
        else
  				artistData[d.artist].plays += 1;
      }); 
      
      var toReturn = {};
      toReturn.artistData = artistData;
      toReturn.jsonData = genreHierarchy.data;
      //console.log(toReturn); 
      return toReturn; 
    }).then(r => {return r;});
  };

  const treemap = (selection, props) => {
    const {
      jsonData,
      artistData,
      innerWidth,
      innerHeight,
      playScale
    } = props;
    
    const treeLayout = d3.cluster()
      .size([innerHeight, innerWidth])
      .separation((a, b) => { 
        return (a.parent == b.parent ? 1 : 1); 
      });

    const root = d3.hierarchy(jsonData); 
    
    
    
    var filtArtistData = [];
    Object.keys(artistData).map(k => {
      if (artistData[k].plays > 5)
  			filtArtistData.push(artistData[k]); 
    });
    
    filtArtistData.forEach(f => {
      var deepestGenreIndex = 0;
      for (var i = 0; i < f.genre.length; i++)
  			if (f.genreDepths[i] > f.genreDepths[deepestGenreIndex])
          deepestGenreIndex = i;
      f.deepestGenre = f.genre[deepestGenreIndex];
    });
    //console.log(filtArtistData);
    
    root.descendants().forEach(d => {
      const genre = d.data.id;
      filtArtistData.filter(a => a.deepestGenre === genre).forEach(f => {
        //console.log(f);
        var newNode = d3.hierarchy(f);
        newNode.data.id = newNode.data.artist; 
        newNode.parent = d;  
        if (d.children === undefined)
          d.children = [];
        
        d.children.push(newNode);
      });
    });
    
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
    console.log(root); 
    
    //console.log(root)
    const tree = treeLayout(root);
    const links = tree.links();    
    const linkPathGenerator = d3.linkHorizontal()
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

  const svg = d3.select('svg');
  const width = 500;//document.body.clientWidth;
  const height = 2000;//document.body.clientHeight;

  const margin = { top: 0, right: 0, bottom: 0, left: 0};
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  var jsonData, artistData;
  var playScale;

  const zoomG = svg
      .attr('width', width)
      .attr('height', height)
    .append('g');

  const treeG = zoomG.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  svg.call(d3.zoom().on('zoom', () => {
    zoomG.attr('transform', d3.event.transform);
  }));



  loadData('https://vizhub.com/OxfordComma/datasets/output-with-genre-2018.csv').then(data => {
    jsonData = data.jsonData;
    artistData = data.artistData;
   	
    playScale = d3.scaleSequential(d3.interpolatePlasma)
  		.domain([0, Object.values(artistData).reduce((maxVal, line) => d3.max([maxVal, line.plays]), 0) + 100]);
    //console.log(colorScale.range())
    render();
  });

  const render = () => {
  	treeG.call(treemap, {
      jsonData,
      artistData,
      innerWidth,
      innerHeight,
      playScale
    });
  };

}(d3));
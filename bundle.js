(function (d3$1) {
  'use strict';

  const loadData = url => {
    //return csv(url).then(data => {
    return Promise.all([d3$1.csv(url), d3$1.json('data.json')]).then(data => {
      const csvData = data[0];
      var jsonData = data[1];
      const startDate = new Date('2018-01-01');

      var sortedGenreList = [];
      var sortedArtistList = [];
      var totalPlaysArtist = {};
      var totalPlaysGenre = {};
      var deepestGenresByArtist = {};
      
      var topGenres;
      var topArtists;
      var byWeekPlaysGenre = [];
      var byWeekPlaysArtist = [];
      var weekDict = {};
      const numArtists = 9;
      const numGenres = 9;

      var genreHierarchy = d3$1.hierarchy(jsonData); 
      genreHierarchy.data = jsonData; 

      genreHierarchy.sort((a,b) => {
        const aLen = a.children === undefined ? 0 : a.children.length;
        const bLen = b.children === undefined ? 0 : b.children.length;
        return(bLen - aLen); 
      });
          
      genreHierarchy.descendants().forEach(d => {
        const name = d.data.id;
        // byWeekPlaysGenre.push(name);
        totalPlaysGenre[name] = { 
          depth: d.depth,
          plays: 0,
        };  
      });
          
      csvData.forEach(d => {
        d.listen_date = new Date(d.listen_date);  
        if (d.genre === "")
          return;
        
        // Sorted from deepest to shallowest genre
        d.genre = d.genre
          .split(',')
          .map(g => g.replace(/ /g, ''))
          .filter(g => Object.keys(totalPlaysGenre).includes(g))
          .sort((a, b) => totalPlaysGenre[b].depth - totalPlaysGenre[a].depth); 
        
        if (d.genre.length == 0)
          return;
        
        // Convert time since Jan 1, 2018 from msec to # of weeks
        // 1000 msec/sec, 60 sec/min, 60 min/hr, 24 hr/day, 7 days/week, +1 so it starts on week 1
        d.weekNum = (parseInt((d.listen_date - startDate)/1000/60/60/24/7 + 1));
        
        const maxGenre = d.genre[0];
        
        if (totalPlaysArtist[d.artist] === undefined)
          totalPlaysArtist[d.artist] = 1;
        else
          totalPlaysArtist[d.artist] += 1;
        
        if (totalPlaysGenre[d.genre[0]] === undefined)
          totalPlaysGenre[d.genre[0]].plays = 1;
        else
          totalPlaysGenre[d.genre[0]].plays += 1;

        if (deepestGenresByArtist[d.artist] === undefined)
          deepestGenresByArtist[d.artist] = d.genre[0];
        
        if (weekDict[d.weekNum] === undefined)
          weekDict[d.weekNum] = {artists: {}, genres: {}};
        
        if (weekDict[d.weekNum].artists[d.artist] === undefined)
          weekDict[d.weekNum].artists[d.artist] = 1;
        else
          weekDict[d.weekNum].artists[d.artist] += 1;
          
        if (weekDict[d.weekNum].genres[d.genre[0]] === undefined)
          weekDict[d.weekNum].genres[d.genre[0]] = 1;
        else
          weekDict[d.weekNum].genres[d.genre[0]] += 1; 
      });
      
      
      // Sort the list of genres according to total play count
      sortedGenreList = Object.keys(totalPlaysGenre).sort((a, b) => totalPlaysGenre[b].plays - totalPlaysGenre[a].plays);
      sortedArtistList = Object.keys(totalPlaysArtist).sort((a, b) => totalPlaysArtist[b] - totalPlaysArtist[a]); 
      
      Object.keys(weekDict).forEach(w => {
        const i = +w - 1;
        
        topArtists = sortedArtistList.slice(0, numArtists);
        topGenres = sortedGenreList.slice(0, numGenres);
        
        var genreObj = {week: i + 1};
        var artistObj = {week: i + 1};
        
        topArtists.forEach(a => {
          artistObj[a] = weekDict[w].artists[a] ? weekDict[w].artists[a] : 0;
        });
        
        artistObj['everything else'] = 0;
        genreObj['everything else'] = 0;
        Object.keys(weekDict[w].artists).forEach(a => {
          if (!topArtists.includes(a))
            artistObj['everything else'] += weekDict[w].artists[a];  
        });
        byWeekPlaysArtist.push(artistObj);

        
        Object.keys(weekDict[w].genres).forEach(g => {
          if (!topGenres.includes(g))
            genreObj['everything else'] += weekDict[w].genres[g];  
        });
        
        topGenres.forEach(g => {
          genreObj[g] = weekDict[w].genres[g] ? weekDict[w].genres[g] : 0;
        });
        byWeekPlaysGenre.push(genreObj); 
      });
      topArtists.push('everything else');
      topGenres.push('everything else');
      // console.log(weekDict);
      // console.log(byWeekPlaysArtist)
      // console.log(totalPlaysArtist);
      // console.log(totalPlaysGenre);
      // console.log(sortedGenreList);
      // console.log(sortedArtistList)


      var toReturn = {}; 
      // toReturn.csvData = csvData; 
      toReturn.jsonData = genreHierarchy.data;
      toReturn.byWeekPlaysGenre = byWeekPlaysGenre.reverse(); 
      toReturn.byWeekPlaysArtist = byWeekPlaysArtist;
      // toReturn.totalPlaysGenre = totalPlaysGenre;
      toReturn.totalPlaysArtist = totalPlaysArtist;
      toReturn.deepestGenresByArtist = deepestGenresByArtist;
      toReturn.sortedGenres = topGenres;
      toReturn.sortedArtists = topArtists;
      console.log(toReturn);  
      return toReturn;  
    }).then(r => {return r;}); 
  };

  const treemap = (selection, props) => {
    const {
      jsonData,
      deepestGenresByArtist,
      totalPlaysArtist,
      innerWidth,
      innerHeight,
      playScale
    } = props;
    
    const treeLayout = d3$1.cluster()
      .size([2000, 500])
      .separation((a, b) => { 
        // console.log(a.parent == b.parent)
        return (a.parent == b.parent ? 1 : 1); 
      });

    const root = d3$1.hierarchy(jsonData);  
    
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

        var newNode = d3$1.hierarchy({id: f, artist: f, plays: totalPlaysArtist[f]});
        console.log(newNode);
        // newNode.data.id = newNode.data.artist; 
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
    // console.log(root); 
    
    //console.log(root)
    const tree = treeLayout(root);
    const links = tree.links();    
    const linkPathGenerator = d3$1.linkHorizontal()
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

  // Mouseover line adapted from here

  const scatterplot = (selection, props) => {
    const {
      byWeekPlaysGenre,
      legend,
      colorScale,
      colorValue,
      selectedArtist,
      innerWidth,
      innerHeight,
      circleRadius
    } = props;
      
    const g = selection.selectAll('.container').data([null]);
    const gEnter = g.enter()
      .append('g')
        .attr('class', 'container');
   
    //const xValue = d => d.week;

    const xAxisLabel = 'Week';
    const yAxisLabel = 'Plays'; 
    
    // X-scale and x-axis
    const xScale = d3$1.scaleLinear()
      .domain(d3$1.extent(byWeekPlaysGenre, d => d.week))
      .range([0, innerWidth]);
    
    const xAxis = d3$1.axisBottom(xScale)
      .ticks(26)
      .tickSize(-innerHeight)
      .tickPadding(15);
    
    // From https://vizhub.com/curran/501f3fe24cfb4e6785ac75008b530a83
    const xAxisG = g.select('.x-axis');
    const xAxisGEnter = gEnter
      .append('g').attr('class', 'x-axis');
    
    xAxisGEnter
      .merge(xAxisG)
        .call(xAxis)
        .attr('transform', `translate(0,${innerHeight})`)
        .selectAll('.domain').remove();
    
    xAxisGEnter.append('text')
        .attr('class', 'axis-label')
        .attr('y', 50)
        .attr('x', innerWidth / 2)
        .attr('fill', 'black')
        .text(xAxisLabel);
    
    // Y-axis and scale
    const yScale = d3$1.scaleLinear()
      .domain([0, 
               //selectedArtist ? 
               //max(data.map(d => d[selectedArtist])) : 
               d3$1.max(byWeekPlaysGenre.map(d => d3$1.sum(Object.values(d))))])
      .range([innerHeight, 0])
      .nice();  
    
    const yAxisTickFormat = number =>
      d3$1.format('.2s')(number)
        .replace('.0', '');
    
    const yAxis = d3$1.axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickPadding(5)
      .tickFormat(yAxisTickFormat);
    
    const yAxisG = g.select('.y-axis');
    const yAxisGEnter = gEnter
      .append('g')
        .attr('class', 'y-axis');
    
    yAxisGEnter
      .merge(yAxisG)
        .transition().duration(200)
        .call(yAxis);
    
    yAxisGEnter.merge(yAxisG)
        .selectAll('.domain').remove();
    
    yAxisGEnter.append('text')
      .attr('class', 'axis-label')
      .attr('y', -35)
      .attr('x', -innerHeight / 2)
      .attr('fill', 'black')
      .attr('transform', `rotate(-90)`)
      .attr('text-anchor', 'middle')
      .text(yAxisLabel);
    
    var stack = d3.stack(byWeekPlaysGenre)
      .keys(legend);
    var series = stack(byWeekPlaysGenre);
    //console.log(data)
    
    const areaGenerator = d3$1.area()
      .x(d => xScale(d.data.week))
      .y0(d => {
        //console.log(d)
        return yScale(selectedArtist && (d.artist == selectedArtist) ? 0 : d[0])})
      .y1(d => yScale(selectedArtist && (d.artist == selectedArtist) ? d[1] - d[0] : d[1]))
      .curve(d3$1.curveBasis);
    
    const lines = selection.selectAll('.line-path').data(series);
    const linesEnter = lines.enter().append('path')
        .attr('class', 'line-path') 
        .attr('fill', d => colorScale(d.key))
        .attr('stroke', 'black');
        
    lines.merge(linesEnter)
      .transition()
        .duration(200)
        .attr('d', areaGenerator)
        .attr('opacity', d => (!selectedArtist || d.key === selectedArtist) ? 1 : 0)
        .attr('stroke-width', d => (selectedArtist || d.key === selectedArtist) ? 0 : 0);
  };

  const treeSvg = d3$1.select('.tree');
  const areaSvg = d3$1.select('.area');

  const width = +areaSvg.attr('width');
  const height = +areaSvg.attr('height');

  const margin = { top: 20, right: 0, bottom: 40, left: 20 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  var jsonData, artistData, byWeekPlaysGenre, totalPlaysArtist;
  var playScale;
  var legend;
  var selectedArtist;
  var deepestGenresByArtist;

  const colorValue = d => d.artist;
  const colorScale = d3$1.scaleOrdinal();

  const zoomG = treeSvg
      // .attr('width', width)
      // .attr('height', height)
    .append('g');

  const areaG = areaSvg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  const treeG = zoomG.append('g');
      //.attr('transform', `translate(${margin.left},${margin.top})`);

  treeSvg.call(d3$1.zoom().on('zoom', () => {
    zoomG.attr('transform', d3$1.event.transform);
  }));

  loadData('https://vizhub.com/OxfordComma/datasets/output-with-genre-2018.csv').then(data => {
    jsonData = data.jsonData;
    artistData = data.artistData;
    byWeekPlaysGenre = data.byWeekPlaysGenre;
    legend = data.sortedGenres;
    deepestGenresByArtist = data.deepestGenresByArtist;
    totalPlaysArtist = data.totalPlaysArtist;

    colorScale
      .domain(legend)
      .range(d3$1.schemeCategory10);
   	
    console.log(d3$1.max(Object.values(totalPlaysArtist)));
    playScale = d3$1.scaleSequential(d3$1.interpolatePlasma)
  		.domain([0, d3$1.max(Object.values(totalPlaysArtist)) + 100]);
    //console.log(colorScale.range())
    render();
  });

  const render = () => {
  	treeG.call(treemap, {
      jsonData,
      deepestGenresByArtist,
      totalPlaysArtist,
      innerWidth,
      innerHeight,
      playScale
    });

    areaG.call(scatterplot, {
      byWeekPlaysGenre,
      legend,
      colorScale,
      colorValue,
      selectedArtist,
      innerWidth,
      innerHeight,
      circleRadius: 3
    });
  };

}(d3));
//# sourceMappingURL=bundle.js.map

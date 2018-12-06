(function (d3$1) {
  'use strict';

  // import LastFM from 'last-fm';

  const loadData = url => {
    return Promise.all([d3$1.csv(url), d3$1.json('data.json')]).then(data => {
      // const lastfm = new LastFM('a66e2f168fdbcda137799a2c165678ee')

      // lastfm.trackSearch({ q: 'the greatest' }, (err, data) => {
      //   if (err) console.error(err)
      //   else console.log(data)
      // })

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
      const numArtists = 35;
      const numGenres = 10;

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
        // Object.keys(weekDict[w].artists).forEach(a => {
        //   if (!topArtists.includes(a))
        //     artistObj['everything else'] += weekDict[w].artists[a];  
        // });
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
      // topArtists.push('everything else');
      topGenres.push('everything else');


      var toReturn = {}; 
      // toReturn.csvData = csvData; 
      toReturn.jsonData = genreHierarchy.data;
      toReturn.byWeekPlaysGenre = byWeekPlaysGenre.reverse(); 
      toReturn.byWeekPlaysArtist = byWeekPlaysArtist;
      // toReturn.totalPlaysGenre = totalPlaysGenre;
      toReturn.totalPlaysArtist = totalPlaysArtist;
      toReturn.deepestGenresByArtist = deepestGenresByArtist;
      toReturn.topGenres = topGenres;
      toReturn.topArtists = topArtists;
      console.log(toReturn);  
      return toReturn;  
    }).then(r => {return r;}); 
  };

  const colorLegend = (selection, props) => {
    const {
      colorScale,
      circleRadius,
      spacing,
      textOffset,
      backgroundRectWidth,
      onClick,
      selectedLegendItem
    } = props;      

    const backgroundRect = selection.selectAll('rect')
      .data([null]);             
    
    const n = colorScale.domain().length; 

    backgroundRect.enter().append('rect')
      .merge(backgroundRect)
        .attr('x', -circleRadius * 2)   
        .attr('y', -circleRadius * 2)   
        .attr('rx', circleRadius * 2)   
        .attr('width', backgroundRectWidth)
        .attr('height', spacing * n + circleRadius * 2) 
        .attr('fill', 'white')
        .attr('opacity', 0);

    const groups = selection.selectAll('.legend')
      .data(colorScale.domain());
    
    const groupsEnter = groups
      .enter().append('g')
        .attr('class', 'legend');
    
    groupsEnter
      .merge(groups)
        .attr('transform', (d, i) => `translate(0, ${i * spacing})`)
        .on('click', d => onClick(
          d === selectedLegendItem ? null : d));
        
    groupsEnter
      .merge(groups)
        .transition().duration(200)
        .attr('transform', (d, i) => `translate(0, ${i * spacing})`)
        .attr('opacity', d =>
        {
          // console.log(!selectedLegendItem);
          return (!selectedLegendItem || d === selectedLegendItem) ? 1 : 0.2;
        });

    groups.exit().remove();
    
    groupsEnter.append('circle')
      .merge(groups.select('circle')) 
        .attr('r', circleRadius)
        .attr('fill', colorScale);      
    
    groupsEnter.append('text')
      .merge(groups.select('text'))   
        .text(d => d)
        .attr('dy', '0.32em')
        .attr('x', textOffset);
  };

  // Mouseover line adapted from here

  const stackedAreaHorizontal = (selection, props) => {
    const {
      dataToStack,
      legend,
      colorScale,
      selectedLegendItem,
      width,
      height,
    } = props;
    
    const g = selection.selectAll('.container').data([null]);
    const gEnter = g.enter()
      .append('g')
        .attr('class', 'container');
   
    const xValue = d => d.week;

    const xAxisLabel = 'Week';
    const yAxisLabel = 'Plays'; 
    
    // X-axis and scale
    // console.log(new Date(2018, 0, (extent(dataToStack, xValue)[0] - 1) * 7 + 1))
    const xScale = d3$1.scaleTime()
      .domain([
        new Date(2018, 0, (d3$1.extent(dataToStack, xValue)[0] - 1) * 7 + 1), 
        new Date(2018, 0, (d3$1.extent(dataToStack, xValue)[1] - 1) * 7 + 1)])
      .range([0, width])
      .nice();
    
    const xAxis = d3$1.axisBottom(xScale)
      // .ticks(9)
      // .tickSize(-height)
      // .tickPadding(15)
      .tickFormat(d3.timeFormat('%B'));
    
    // From https://vizhub.com/curran/501f3fe24cfb4e6785ac75008b530a83
    const xAxisG = g.select('.x-axis');
    const xAxisGEnter = gEnter
      .append('g').attr('class', 'x-axis');
    
    xAxisGEnter
      .merge(xAxisG)
        .call(xAxis)
        .attr('transform', `translate(0,${height})`);
        // .selectAll('.domain').remove()
    
    xAxisGEnter.append('text')
        .attr('class', 'axis-label')
        .attr('y', 50)
        .attr('x', width / 2)
        .attr('fill', 'black')
        .text(xAxisLabel);
    
    // Y-axis and scale
    const yScale = d3$1.scaleLinear()
      .domain([0, 
               // selectedLegendItem ? 
               // max(data.map(d => d[selectedLegendItem])) : 
               d3$1.max(dataToStack.map(d => d3$1.sum(Object.values(d))))])
      .range([height, 0])
      .nice();  
    
    const yAxis = d3$1.axisLeft(yScale);
      // .tickSize(-width)
      // .tickPadding(5)
      // .tickFormat(yAxisTickFormat);
    
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
      .attr('x', -height / 2)
      .attr('fill', 'black')
      .attr('transform', `rotate(-90)`)
      .attr('text-anchor', 'middle')
      .text(yAxisLabel);
    
    var stack = d3.stack(dataToStack)
      .keys(legend);
      // .offset(d3.stackOffsetWiggle);


    var series = stack(dataToStack);

    // console.log(series)

    const areaGenerator = d3$1.area()
      .x(d => {
        var toScale = new Date(2018, 0, (d.data.week - 1) * 7);
        // console.log(toScale)
        return xScale(toScale);
      })
      .y0(d => yScale(selectedLegendItem && (d.artist == selectedLegendItem) ? 0 : d[0]))
      .y1(d => yScale(selectedLegendItem && (d.artist == selectedLegendItem) ? d[1] - d[0] : d[1]))
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
        .attr('opacity', d => (!selectedLegendItem || d.key === selectedLegendItem) ? 1 : 0)
        .attr('stroke-width', d => (selectedLegendItem || d.key === selectedLegendItem) ? 0 : 0);
  };

  // Mouseover line adapted from here

  const stackedAreaVertical = (selection, props) => {
    const {
      dataToStack,
      legend,
      colorScale,
      selectedLegendItem,
      width,
      height,
    } = props;

    const g = selection.selectAll('.container').data([null]);
    const gEnter = g.enter()
      .append('g')
        .attr('class', 'container');
   
    const xValue = d => d.week;
    
    // X-axis and scale
    // console.log(new Date(2018, 0, (extent(dataToStack, xValue)[0] - 1) * 7 + 1))
    // This converts from the week scale to a day scale
    const xScale = d3$1.scaleTime()
      .domain([
        new Date(2018, 0, (d3$1.extent(dataToStack, xValue)[0] - 1) * 7 + 1), 
        new Date(2018, 0, (d3$1.extent(dataToStack, xValue)[1] - 1) * 7 + 1)])
      .range([0, width]);
      // .nice()
    
    const yScale = d3$1.scaleLinear()
      .domain([0, 
               // selectedLegendItem ? 
               // max(dataToStack.map(d => d[selectedLegendItem])) : 
               d3$1.max(dataToStack.map(d => d3$1.sum(Object.values(d))))])
      .range([height, 0])
      .nice(); 
    
    const xAxis = d3$1.axisBottom(xScale)
      // .ticks(9)
      .tickSize(0)
      // .tickPadding(15)
      .tickFormat(d3.timeFormat('%B'));
    
    // From https://vizhub.com/curran/501f3fe24cfb4e6785ac75008b530a83
    const xAxisG = g.select('.x-axis');
    const xAxisGEnter = gEnter
      .append('g').attr('class', 'x-axis');
    
    xAxisGEnter
      .merge(xAxisG)
        .call(xAxis)
        .attr('transform', `translate(0,${785})`)
        .selectAll('text')
          .attr('text-anchor', 'start')
          .attr('transform', `rotate(-90)`);

    xAxisGEnter.merge(xAxisG).selectAll('.domain').remove();
    
    const yAxis = d3$1.axisLeft(yScale)
      .ticks('none');
      // .tickSize(-width)
      // .tickPadding(5)
      // .tickFormat(yAxisTickFormat);
    
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
    
    // yAxisGEnter.append('text')
    //   .attr('class', 'axis-label')
    //   .attr('y', -35)
    //   .attr('x', -height / 2)
    //   .attr('fill', 'black')
    //   .attr('transform', `rotate(-90)`)
    //   .attr('text-anchor', 'middle')
    //   .text(yAxisLabel);
    
    var stack = d3.stack(dataToStack)
      .keys(legend)
      .offset(d3.stackOffsetWiggle);

    var series = stack(dataToStack);
    console.log(series);
    const areaGenerator = d3$1.area()
      .x(d => xScale(new Date(2018, 0, (d.data.week - 1) * 7)))
      .y0(d => yScale(selectedLegendItem && (d.artist == selectedLegendItem) ? 0 : d[0]))
      .y1(d => yScale(selectedLegendItem && (d.artist == selectedLegendItem) ? d[1] - d[0] : d[1]))
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
        .attr('opacity', d => (!selectedLegendItem || d.key === selectedLegendItem) ? 1 : 0)
        .attr('stroke-width', d => (selectedLegendItem || d.key === selectedLegendItem) ? 0 : 0);

    const annotations = [
    {
      note: {
        title: "Tiny Moving Parts and Mom Jeans",
        label: "February 10th at the Sinclair"
      },
      x: 230, y: xScale(new Date('10-Feb-2018')), dy: 65, dx: -117, 
      connector: {
        curve: d3.curveLinear,
        points: [[-50, 0]]
      }
    }, 
    {
      note: {
        title: "Sorority Noise",
        label: "April 4th at the Paradise Rock Club"
      },
      x: 160, y: xScale(new Date('4-Apr-2018')), dy: -50, dx: -65,
      connector: {
        curve: d3.curveLinear,
        points: [[-25, 0]]
      }
    },
    {
      note: {
        title: "Lord Huron",
        label: "April 30th at the House of  Blues"
      },
      x: 220, y: xScale(new Date('30-Apr-2018')), dy: -50, dx: -115,
      connector: {
        curve: d3.curveLinear,
        points: [[-75, 0]]
      }
    },   
    {
      note: {
        title: "The Killers, The National, and Julien Baker",
        label: "May 23rd-25th at Boston Calling"
      },
      x: 120, y: xScale(new Date('24-May-2018')), dy: -50, dx: -15,
      connector: {
        curve: d3.curveLinear,
        points: [[-50, 0]]
      }
    },   
    // {
    //   note: {
    //     title: "The National",
    //     label: "May 24th at Boston Calling"
    //   },
    //   x: 210, y: 1200, dy: 0, dx: -150
    // },   
    // {
    //   note: {
    //     title: "Julien Baker",
    //     label: "May 25th at Boston Calling"
    //   },
    //   x: 210, y: 1250, dy: 0, dx: -150
    // },   
    {
      note: {
        title: "Japanese Breakfast",
        label: "June 1st at the Sinclair"
      },
      x: 150, y: xScale(new Date('1-Jun-2018')), dy: 30, dx: -32,
      connector: {
        curve: d3.curveLinear,
        points: [[-50, 0]]
      }
    },   
    {
      note: {
        title: "Bon Iver",
        label: "August 5th at the LA Bowl"
      },
      x: 230, y: xScale(new Date('5-Aug-2018')), dy: 70, dx: -125,
      connector: {
        curve: d3.curveLinear,
        points: [[-50, 0]]
      }
    },   
    {
      note: {
        title: "Mitski",
        label: "October 20th at the House of Blues"
      },
      x: 210, y: 2150, dy: 0, dx: -150,
      connector: {
        curve: d3.curveLinear,
        points: [[-50, 0]]
      }
    },   
    {
      note: {
        title: "Mom Jeans (again)",
        label: "November 1st at the ONCE Ballroom"
      },
      x: 210, y: 2350, dy: 0, dx: -150,
      connector: {
        curve: d3.curveLinear,
        points: [[-50, 0]]
      }
    }, 
    {
      note: {
        title: "Pinegrove",
        label: "November 24th at the Sinclair"
      },
      x: 210, y: 2500, dy: 0, dx: -150,
      connector: {
        curve: d3.curveLinear,
        points: [[-50, 0]]
      }
    },
    {
      note: {
        title: "Tiny Moving Parts (again)",
        label: "November 25th at the House of Blues"
      },
      x: 210, y: 2750, dy: 0, dx: -150,
      connector: {
        curve: d3.curveLinear,
        points: [[-50, 0]]
      }
    }].map(function(d){ d.color = "#8a2d96"; return d});

    const makeAnnotations = d3.annotation()
      .type(d3.annotationCalloutCurve)
      .annotations(annotations)
      // .editMode(true)
      .notePadding(5);

    var annotationG = d3.selectAll(".stacked-area-artist-vertical")//.data([null])
    // annotationG.enter()
      .append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotations);
  };

  //Hack
  // const width = 960;
  // const height = 500;

  // const margin = { top: 20, right: 0, bottom: 40, left: 20 };
  // const innerWidth = width - margin.left - margin.right;
  // const innerHeight = height - margin.top - margin.bottom;

  var jsonData, artistData, byWeekPlaysGenre, byWeekPlaysArtist, totalPlaysArtist;
  var artistColorScale, genreColorScale;
  var topArtists, topGenres;
  var playScale;
  var selectedArtist, selectedGenre;
  var deepestGenresByArtist;
  // var genreLegendG, artistLegendG;

  const treeSvg = d3$1.select('.stacked-area-artist-vertical');
  const areaGenreSvg = d3$1.select('.stacked-area-genre');
  const areaArtistSvg = d3$1.select('.stacked-area-artist');
  const colorScale = d3$1.scaleOrdinal();

  const zoomG = treeSvg
    .append('g');

  const areaGenreG = areaGenreSvg.append('g')
      .attr('transform', `translate(${175},${10})`);
  const genreLegendG = areaGenreSvg.append('g')
    .attr('class', 'genre-legend')
    .attr('transform', `translate(${10},${10})`);

  const areaArtistG = areaArtistSvg.append('g')
      .attr('transform', `translate(${175},${10})`);
  const artistLegendG = treeSvg.append('g')
    .attr('transform', `translate(${385},${270})`);

  const treeG = zoomG.append('g')
    .attr('class', 'zoom')  
    .attr('transform', `translate(785, 0), rotate(90)`);

  // treeSvg.call(zoom().on('zoom', () => {
  //   zoomG.attr('transform', event.transform);
  // }));

  loadData('https://vizhub.com/OxfordComma/datasets/output-with-genre-2018.csv').then(data => {
    jsonData = data.jsonData;
    artistData = data.artistData;
    byWeekPlaysGenre = data.byWeekPlaysGenre;
    byWeekPlaysArtist = data.byWeekPlaysArtist;
    topGenres = data.topGenres;
    topArtists = data.topArtists;
    deepestGenresByArtist = data.deepestGenresByArtist;
    totalPlaysArtist = data.totalPlaysArtist;

    artistColorScale = d3$1.scaleOrdinal()
      .domain(topArtists)
      .range(d3$1.schemeCategory10);

   	genreColorScale = d3$1.scaleOrdinal()
      .domain(topGenres)
      .range(d3$1.schemeCategory10);

    // console.log(max(Object.values(totalPlaysArtist)))
    playScale = d3$1.scaleSequential(d3$1.interpolatePlasma)
  		.domain([0, d3$1.max(Object.values(totalPlaysArtist)) + 100]);
    //console.log(colorScale.range())
    render();
  });

  const onClickGenre = d => {
    console.log('selected genre: ' + d);
    selectedGenre = d;
    render(); 
  };

  const onClickArtist = d => {
    console.log('selected artist: ' + d);
    selectedArtist = (d);
    render(); 
  };

  const render = () => {
  	// treeG.call(treemap, {
   //    jsonData,
   //    deepestGenresByArtist,
   //    totalPlaysArtist,
   //    innerWidth,
   //    innerHeight,
   //    playScale
   //  });

   treeG.call(stackedAreaVertical, {
      dataToStack: byWeekPlaysArtist,
      legend: topArtists,
      colorScale: artistColorScale,
      selectedLegendItem: selectedArtist,
      width: 1960,
      height: 500,
      circleRadius: 3,
    });

    genreLegendG.call(colorLegend, {
      colorScale: genreColorScale,
      circleRadius: 5,
      spacing: 15,
      textOffset: 12,
      backgroundRectWidth: 135,
      onClick: onClickGenre,
      selectedLegendItem: selectedGenre
    });

    artistLegendG.call(colorLegend, {
      colorScale: artistColorScale,
      circleRadius: 5,
      spacing: 15,
      textOffset: 12,
      backgroundRectWidth: 135,
      onClick: onClickArtist,
      selectedLegendItem: selectedArtist
    });

    areaGenreG.call(stackedAreaHorizontal, {
      dataToStack: byWeekPlaysGenre,
      legend: topGenres,
      colorScale: genreColorScale,
      selectedLegendItem: selectedGenre,
      width: 960,
      height: 500,
    });

    areaArtistG.call(stackedAreaHorizontal, {
      dataToStack: byWeekPlaysArtist,
      legend: topArtists,
      colorScale: artistColorScale,
      selectedLegendItem: selectedArtist,
      width: 960,
      height: 500,
    });
  };

}(d3));
//# sourceMappingURL=bundle.js.map

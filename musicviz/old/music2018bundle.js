(function (d3$1) {
  'use strict';

  // import LastFM from 'last-fm';

  const loadStackedArtistData = (url, startDate, endDate) => {
    return Promise.all([
      d3$1.csv(url), 
      d3$1.json('genreHierarchy.json'),
      d3$1.json('data/artists.json'), 
      d3$1.json('data/tracks.json')]
    ).then(data => {
      // const csvData = data[0];
      var jsonData = data[1];
      const artistData = data[2];
      const trackData = data[3];
      // const startDate = new Date(new Date(csvData[0].listen_date).getFullYear().toString(), '00', '01');

      console.log(startDate);
      var sortedArtistList = [];
      var sortedTrackList = [];
      var totalPlaysByArtist = {};
      var totalPlaysByGenre = {};
      var totalPlaysByTrack = {};
      var deepestGenresByArtist = {};
      
      var topGenres = [];
      var topArtists = [];
      var topTracks = [];
      var byWeekPlaysArtist = [];
      var byWeekPlaysTrack = [];
      var weekDict = {};
      // const numArtists = 100;
      // const numGenres = 50;

      // Bad tags included in the data set. Removed anything country-specific or anything I considered 'not a genre'
      // const genresToRemove = ['seenlive', 'femalevocalists', '', 'british', 'japanese', 'ofwgkta', 'irish', 'usa', 'australia', 
        // 'australian', 'under2000 listeners', '90s', '80s', '70s', '60s', 'all', 'philadelphia', 'scottish', 'sanremo', 'newzealand', 
        // 'twinkledaddies', 'sanremo2009', 'political', 'american', 'canadian', 'italian', 'psychadelic', 'instrumental', 'ambient', 
        // 'chillout', 'singersongwriter', 'acoustic'];

      // Remove these character from the genre names
      // const punctuationToRemove = [' ', '-'];

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
        totalPlaysByGenre[name] = { 
          depth: d.depth,
          plays: 0,
        };  
      });
          
      trackData.forEach(d => {
        // console.log(d.listen_date.$date)

        d.listen_date = new Date(d.listen_date.$date);
        if (d.listen_date < startDate)
          return;

        // d.genre = artistData.filter(a => a.name == d.artist)[0].genres
        // console.log(d.genre)
        // if (d.genre === "")
        //   return;
        // // console.log(d)
        // d.genre = d.genre
        //   .replace(/[[\]]/g, '')
        //   .split(',')
        //   .map(g => g.toLowerCase().replace(/\s|-/g, ''))
        //   .filter(g => !genresToRemove.includes(g))
        
        // //If there's no genre we can't do much
        // if (d.genre.length == 0)
        //   return;

        // Convert time since Jan 1, 2018 from msec to # of weeks
        // 1000 msec/sec, 60 sec/min, 60 min/hr, 24 hr/day, 7 days/week, +1 so it starts on week 1
        d.weekNum = (parseInt((d.listen_date - startDate)/1000/60/60/24/7 + 1));
        // console.log(d.weekNum)
        // const maxGenre = d.genre[0];
        
        if (totalPlaysByArtist[d.artist] === undefined)
          totalPlaysByArtist[d.artist] = 1;
        else
          totalPlaysByArtist[d.artist] += 1;

        if (totalPlaysByTrack[d.track] === undefined)
          totalPlaysByTrack[d.track] = {artist: d.artist, track: d.track, plays: 1};
        else
          totalPlaysByTrack[d.track].plays += 1;
        
        //Add in the genres not in the tree but  give them negative depth so they are sorted last
        // d.genre.forEach(g => {
        //   if (totalPlaysByGenre[g] === undefined)
        //     totalPlaysByGenre[g] = { depth: -1, plays: 1};
        //   else
        //     totalPlaysByGenre[g].plays += 1;
        // })

        // d.genre.sort((a, b) => totalPlaysByGenre[b].depth - totalPlaysByGenre[a].depth); 


        // if (deepestGenresByArtist[d.artist] === undefined)
        //   deepestGenresByArtist[d.artist] = d.genre[0];
        
        if (weekDict[d.weekNum] === undefined)
          weekDict[d.weekNum] = {artists: {}, genres: {}, tracks: {}};
        
        if (weekDict[d.weekNum].artists[d.artist] === undefined)
          weekDict[d.weekNum].artists[d.artist] = 1;
        else
          weekDict[d.weekNum].artists[d.artist] += 1;
          
        // if (weekDict[d.weekNum].genres[d.genre[0]] === undefined)
        //   weekDict[d.weekNum].genres[d.genre[0]] = 1;
        // else
        //   weekDict[d.weekNum].genres[d.genre[0]] += 1;

        if (weekDict[d.weekNum].tracks[d.track] === undefined)
          weekDict[d.weekNum].tracks[d.track] = 1;
        else
          weekDict[d.weekNum].tracks[d.track] += 1;
      });
      
      // Sort the list of genres according to total play count
      // sortedGenreList = Object.keys(totalPlaysByGenre).sort((a, b) => totalPlaysByGenre[b].plays - totalPlaysByGenre[a].plays);
      sortedArtistList = Object.keys(totalPlaysByArtist).sort((a, b) => totalPlaysByArtist[b] - totalPlaysByArtist[a]); 
      sortedTrackList = Object.keys(totalPlaysByTrack).sort((a, b) => totalPlaysByTrack[b].plays - totalPlaysByTrack[a].plays);
      console.log(sortedTrackList);
      Object.keys(weekDict).forEach(w => {
        const i = +w - 1;
        
        topArtists = sortedArtistList;//.slice(0, numArtists);
        // topGenres = sortedGenreList//.slice(0, numGenres);
        topTracks = sortedTrackList;
        
        // var genreObj = {week: i + 1};
        var artistObj = {week: i + 1};
        var trackObj = {week: i + 1};
        
        topArtists.forEach(a => {
          artistObj[a] = weekDict[w].artists[a] ? weekDict[w].artists[a] : 0;
        });
        
        // artistObj['everything else'] = 0;
        // genreObj['everything else'] = 0;
        // Object.keys(weekDict[w].artists).forEach(a => {
        //   if (!topArtists.includes(a))
        //     artistObj['everything else'] += weekDict[w].artists[a];  
        // });
        byWeekPlaysArtist.push(artistObj);

        
        // Object.keys(weekDict[w].genres).forEach(g => {
        //   if (!topGenres.includes(g))
        //     genreObj['everything else'] += weekDict[w].genres[g];  
        // });
        
        // topGenres.forEach(g => {
        //   genreObj[g] = weekDict[w].genres[g] ? weekDict[w].genres[g] : 0;
        // });
        // byWeekPlaysGenre.push(genreObj); 


        topTracks.forEach(g => {
          trackObj[g] = weekDict[w].tracks[g] ? weekDict[w].tracks[g] : 0;
        });
        byWeekPlaysTrack.push(trackObj); 
      });
      // topArtists.push('everything else');
      // console.log(topGenres)
      // topGenres.push('everything else');


      var toReturn = {}; 
      // toReturn.csvData = csvData; 
      toReturn.jsonData = genreHierarchy.data;
      // toReturn.byWeekPlaysGenre = byWeekPlaysGenre.reverse(); 
      toReturn.byWeekPlaysArtist = byWeekPlaysArtist;
      toReturn.byWeekPlaysTrack = byWeekPlaysTrack;

      // toReturn.totalPlaysByGenre = totalPlaysByGenre;
      toReturn.totalPlaysByArtist = totalPlaysByArtist;
      toReturn.totalPlaysByTrack = totalPlaysByTrack;

      toReturn.deepestGenresByArtist = deepestGenresByArtist;
      toReturn.topGenres = topGenres;
      toReturn.topArtists = topArtists;
      toReturn.topTracks = topTracks;

      toReturn.artistData = artistData;
      toReturn.trackData = trackData;

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
      selectedLegendList,
      numArtists
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

    const groups = selection.selectAll('.legend').data(colorScale.domain().slice(0, numArtists));
    
    const groupsEnter = groups
      .enter().append('g')
        .attr('class', 'legend');
    
    groupsEnter
      .merge(groups)
        .attr('transform', (d, i) => `translate(0, ${i * spacing})`)
        .on('click', onClick);
        
    groupsEnter
      .merge(groups)
        .transition().duration(200)
        .attr('transform', (d, i) => `translate(0, ${i * spacing})`)
        .attr('opacity', d => (selectedLegendList.length == 0 || selectedLegendList.includes(d)) ? 1 : 0.2);

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

  // Mouseover line adapted from here

  const stackedAreaVertical = (selection, props) => {
    const {
      dataToStack,
      topArtists,
      colorScale,
      selectedLegendList,
      width,
      height,
      numArtists,
      onClick,
      year,
      amplitude,
      position
    } = props;

    const topArtistsTrimmed = topArtists.slice(0, numArtists);
    
    selection
      .attr('transform', `rotate(-90)`);

    const g = selection.selectAll('.container').data([null]);
    const gEnter = g.enter()
      .append('g')
        .attr('class', 'container');

    const h = selection.selectAll('.axes').data([null]);
    const hEnter = h.enter()
      .append('g')
        .attr('class', 'axes');

    const artistText = selection.selectAll('.artist-text').data(selectedLegendList);
    const artistTextEnter = artistText.enter().append('g')
        .attr('class', 'artist-text d-block d-md-none')
        .attr('transform', 'translate(-20, 95) rotate(90)');
    
    artistTextEnter.merge(artistText)
      .append('text')
        .transition()
          .duration(500)
        .attr('x', '0')
        .attr('y', '0')
        .attr('fill', d => colorScale(d))
        .text(d => d);

    artistText.exit()
      .remove();
    
    // X-axis and scale
    // This converts from the week scale to a day scale
    const getDateFromWeek = (weekNumber) => {
      const numberOfDays = 7*(weekNumber-1)+1;
      return new Date(year, 0, numberOfDays);
    };

    const xScale = d3$1.scaleTime()
      .domain([
        new Date(year, 0, 1), 
        new Date(year, 11, 31)])
        // getDateFromWeek(max(Object.keys(dataToStack).map(d => parseInt(d, 10))))])
      .range([0, -height]);
      // .nice()

    const yScale = d3$1.scaleLinear()
      .domain([0, d3$1.max(dataToStack.map(d => d3$1.sum(Object.values(d))))])
      .range([0, width * amplitude])
      .nice(); 
    
    const xAxis = d3$1.axisBottom(xScale)
      .ticks(12)
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
        .selectAll('text')
          .attr('text-anchor', 'start')
          .attr('transform', `rotate(90)`);

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
    
    yAxisGEnter.merge(yAxisG).selectAll('.domain').remove();
    
    // yAxisGEnter.append('text')
    //   .attr('class', 'axis-label')
    //   .attr('y', -35)
    //   .attr('x', -height / 2)
    //   .attr('fill', 'black')
    //   .attr('transform', `rotate(-90)`)
    //   .attr('text-anchor', 'middle')
    //   .text(yAxisLabel);
    
    var stack = d3.stack(dataToStack)
      .keys(topArtistsTrimmed)
      // .offset(d3.stackOffsetSilhouette)
      .offset(d3.stackOffsetWiggle);


    var series = stack(dataToStack);
    
    console.log(series);
    console.log(series[0].map(d => d[0]));

    const ag = d3$1.area()
      .x();

    const areaGenerator = d3$1.area()
      .x(d => xScale(getDateFromWeek(d.data.week)))
      .y0(d => yScale(selectedLegendList.length != 0 && (selectedLegendList.includes(d.artist)) ? 0 : d[0]))
      .y1(d => yScale(selectedLegendList.length != 0 && (selectedLegendList.includes(d.artist)) ? d[1] - d[0] : d[1]))
      .curve(d3$1.curveBasis);
    
    const lines = selection.selectAll('.line-path').data(series);

    const linesEnter = lines.enter()
      .append('path')
        .attr('class', 'line-path') 
        .attr('fill', d => colorScale(d.key))
        .attr('transform', `translate(0, ${(width)/2 + position})`);

    lines.merge(linesEnter)
      .on('click', d => onClick(d.key))
      .attr('d', areaGenerator)
      .append('title')
        .text(d => d.key);
    
    lines.merge(linesEnter)
      .transition()
        .duration(200)
          .attr('opacity', d => {
            return (selectedLegendList.length == 0 || selectedLegendList.includes(d.key)) ? 1 : 0})
          .attr('stroke-width', d => (selectedLegendList.length != 0 || selectedLegendList.includes(d.key)) ? 0.05 : 0);

    const annotations = [];
    d3$1.csv('https://raw.githubusercontent.com/OxfordComma/oxfordcomma.github.io/master/concert_dates.csv').then(annotationData => {
      annotationData.forEach(a => {
        a.date = new Date(a.date);
        annotations.push({
          note: {
            title: a.artists,
            label: a.date.getMonth() + ' ' + a.date.getDate() + ' at ' + a.venue
          },
          x: 400,
          y: 200, 
          dx: 0,
          dy: 0,
          connector: {
            curve: d3.curveLinear,
            points: [[-50, 0]]
          }
        });
      });
    });
  };

  var jsonData, artistData;
  var byWeekPlaysGenre;
  var byWeekPlaysArtist, totalPlaysByArtist;
  var byWeekPlaysTrack;
  var artistColorScale, genreColorScale, trackColorScale;
  var topArtists, topGenres, topTracks;
  var selectedArtists = []; 
  var deepestGenresByArtist;
  var numStackedAreaArtists = 25;
  var numStackedTracks = 30;
  var legendWidth = 160;

  var verticalAreaG, artistLegendG;
  var areaWidth, areaHeight;

  loadStackedArtistData(
    'https://raw.githubusercontent.com/OxfordComma/oxfordcomma.github.io/master/music2018.csv',
    new Date('2018', '00', '01'),
    new Date('2018', '11', '31')).then(data => {
    jsonData = data.jsonData;
    artistData = data.artistData;
    byWeekPlaysGenre = data.byWeekPlaysGenre;
    byWeekPlaysArtist = data.byWeekPlaysArtist;
    byWeekPlaysTrack = data.byWeekPlaysTrack;

    topGenres = data.topGenres;
    topArtists = data.topArtists;
    topTracks = data.topTracks;

    var topArtistsTrimmed = topArtists.slice(0, numStackedAreaArtists);
    var topTracksTrimmed = topTracks.slice(0, numStackedTracks);

    areaWidth = document.getElementById('stacked-area-artist').clientWidth;
    areaHeight = window.innerHeight - document.getElementById('navbar-placeholder').clientHeight;  

    deepestGenresByArtist = data.deepestGenresByArtist;
    totalPlaysByArtist = data.totalPlaysByArtist;

    artistColorScale = d3$1.scaleOrdinal()
      .domain(topArtistsTrimmed);
    const n = artistColorScale.domain().length;
    artistColorScale
      .range(artistColorScale.domain().map((d, i) => d3$1.interpolateRainbow(i/(n+1))));

    trackColorScale = d3$1.scaleOrdinal()
      .domain(topTracksTrimmed);
    const m = trackColorScale.domain().length;
    trackColorScale
      .range(trackColorScale.domain().map((d, i) => d3$1.interpolateRainbow(i/(m+1))));

   	genreColorScale = d3$1.scaleOrdinal()
      .domain(topGenres)
      .range(d3$1.schemeCategory10);

    const verticalAreaSvg = d3$1.select('.stacked-area-artist-svg')
      .attr('height', areaHeight)
      .attr('width', document.getElementById('stacked-area-artist').clientWidth);

    verticalAreaG = verticalAreaSvg
      .append('g')
        .attr('class', 'stacked-area-container');

    artistLegendG = verticalAreaSvg
      .append('g')
        .attr('class', 'legend-container d-none d-md-block')
        .attr('transform', `translate(${document.getElementById('stacked-area-artist').clientWidth - legendWidth},${10})`);
    
    render();
  });

  const onClickArtist = d => {
    if (!selectedArtists.includes(d))
      selectedArtists.push(d);
    else
      selectedArtists = selectedArtists.filter(val => val != d);
    
    console.log(selectedArtists);
    render(); 
  };

  const onClickArtistUnique = d => {
    if (selectedArtists.length == 0)
      selectedArtists = [d];
    else
      selectedArtists = [];
    
    console.log(selectedArtists);
    render(); 
  };

  const render = () => {
    verticalAreaG.call(stackedAreaVertical, {
      dataToStack: byWeekPlaysArtist,
      topArtists: topArtists,
      colorScale: artistColorScale,
      selectedLegendList: selectedArtists,
      width: areaWidth,
      height: areaHeight,
      numArtists: numStackedAreaArtists,
      onClick: onClickArtistUnique,
      year: 2018,
      amplitude: -1,
      position: 100
    });

    artistLegendG.call(colorLegend, {
      colorScale: artistColorScale,
      circleRadius: 5,
      spacing: 17,
      textOffset: 12,
      backgroundRectWidth: legendWidth,
      onClick: onClickArtist,
      selectedLegendList: selectedArtists
    });

  };

}(d3));
//# sourceMappingURL=music2018bundle.js.map

import { csv, hierarchy, json, nest } from 'd3';

export const loadData = url => {
  //return csv(url).then(data => {
  return Promise.all([csv(url), json('data.json')]).then(data => {
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

    // Bad tags included in the data set. Removed anything country-specific or anything I considered 'not a genre'
    const genresToRemove = ['seenlive', 'femalevocalists', '', 'british', 'japanese', 'ofwgkta', 'irish', 'usa', 'australia', 'australian', 'under2000 listeners', '90s', '80s', '70s', '60s', 'all', 'philadelphia', 'scottish', 'sanremo', 'newzealand', 'twinkledaddies', 'sanremo2009', 'political', 'american', 'canadian', 'italian', 'psychadelic', 'instrumental', 'ambient', 'chillout'];

    // Remove these character from the genre names
    const punctuationToRemove = [' ', '-'];

    var genreHierarchy = hierarchy(jsonData); 
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
    })
        
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
      var obj = {week: i + 1};
      
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
    topArtists.push('everything else')
    topGenres.push('everything else')
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
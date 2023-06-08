import { csv, hierarchy, json } from 'd3';
// import LastFM from 'last-fm';

export const loadTreeData = url => {
  return Promise.all([
    csv(url), 
    json('genreHierarchy.json'),
    json('data/artists.json'), 
    json('data/tracks.json')]
  ).then(data => {
    // const csvData = data[0];
    var jsonData = data[1];
    const artistData = data[2];
    const trackData = data[3];
    const startDate = new Date('2018', '00', '01')
    const endDate = new Date('2019', '00', '01')

    console.log(artistData)
    var sortedGenreList = [];
    var sortedArtistList = [];
    var sortedTrackList = [];
    var totalPlaysByArtist = {};
    var totalPlaysByGenre = {};
    var totalPlaysByTrack = {};
    var deepestGenresByArtist = {};
    
    var topGenres = [];
    var topArtists = [];
    var topTracks = [];
    var topTracksUniqueArtists = [];
    var byWeekPlaysGenre = [];
    var byWeekPlaysArtist = [];
    var byWeekPlaysTrack = [];
    var weekDict = {};
    const numArtists = 100;
    const numGenres = 50;

    // Bad tags included in the data set. Removed anything country-specific or anything I considered 'not a genre'
    const genresToRemove = ['seenlive', 'femalevocalists', '', 'british', 'japanese', 'ofwgkta', 'irish', 'usa', 'australia', 
      'australian', 'under2000 listeners', '90s', '80s', '70s', '60s', 'all', 'philadelphia', 'scottish', 'sanremo', 'newzealand', 
      'twinkledaddies', 'sanremo2009', 'political', 'american', 'canadian', 'italian', 'psychadelic', 'instrumental', 'ambient', 
      'chillout', 'singersongwriter', 'acoustic'];

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
      totalPlaysByGenre[name] = { 
        depth: d.depth,
        plays: 0,
      };  
    })
        
    trackData.forEach(d => {
      d.listen_date = new Date(d.listen_date.$date);
      if (d.listen_date < startDate || d.listen_date > endDate)
        return;
      // console.log(d)


      d.genre = artistData.filter(a => a.name == d.artist)[0].genres
      // console.log(d.genre)
      if (d.genre === "")
        return;
      d.genre = d.genre
        // .replace(/[[\]]/g, '')
        // .split(',')
        .map(g => g.toLowerCase().replace(/\s|-/g, ''))
        .filter(g => !genresToRemove.includes(g))
      
      //If there's no genre we can't do much
      if (d.genre.length == 0)
        return;

      // Convert time since Jan 1, 2018 from msec to # of weeks
      // 1000 msec/sec, 60 sec/min, 60 min/hr, 24 hr/day, 7 days/week, +1 so it starts on week 1
      d.weekNum = (parseInt((d.listen_date - startDate)/1000/60/60/24/7 + 1));
      // console.log(d.weekNum)
      const maxGenre = d.genre[0];
      
      if (totalPlaysByArtist[d.artist] === undefined)
        totalPlaysByArtist[d.artist] = 1;
      else
        totalPlaysByArtist[d.artist] += 1;

      if (totalPlaysByTrack[d.track] === undefined)
        totalPlaysByTrack[d.track] = {artist: d.artist, track: d.track, plays: 1};
      else
        totalPlaysByTrack[d.track].plays += 1;
      
      //Add in the genres not in the tree but  give them negative depth so they are sorted last
      d.genre.forEach(g => {
        if (totalPlaysByGenre[g] === undefined)
          totalPlaysByGenre[g] = { depth: -1, plays: 1};
        else
          totalPlaysByGenre[g].plays += 1;
      })

      d.genre.sort((a, b) => totalPlaysByGenre[b].depth - totalPlaysByGenre[a].depth); 


      if (deepestGenresByArtist[d.artist] === undefined)
        deepestGenresByArtist[d.artist] = d.genre[0];
      
      if (weekDict[d.weekNum] === undefined)
        weekDict[d.weekNum] = {artists: {}, genres: {}, tracks: {}};
      
      if (weekDict[d.weekNum].artists[d.artist] === undefined)
        weekDict[d.weekNum].artists[d.artist] = 1;
      else
        weekDict[d.weekNum].artists[d.artist] += 1;
        
      if (weekDict[d.weekNum].genres[d.genre[0]] === undefined)
        weekDict[d.weekNum].genres[d.genre[0]] = 1;
      else
        weekDict[d.weekNum].genres[d.genre[0]] += 1;

      if (weekDict[d.weekNum].tracks[d.track] === undefined)
        weekDict[d.weekNum].tracks[d.track] = 1;
      else
        weekDict[d.weekNum].tracks[d.track] += 1;
    });
    
    // Sort the list of genres according to total play count
    sortedGenreList = Object.keys(totalPlaysByGenre).sort((a, b) => totalPlaysByGenre[b].plays - totalPlaysByGenre[a].plays);
    sortedArtistList = Object.keys(totalPlaysByArtist).sort((a, b) => totalPlaysByArtist[b] - totalPlaysByArtist[a]); 
    sortedTrackList = Object.keys(totalPlaysByTrack).sort((a, b) => totalPlaysByTrack[b].plays - totalPlaysByTrack[a].plays);
    console.log(sortedTrackList);
    Object.keys(weekDict).forEach(w => {
      const i = +w - 1;
      var obj = {week: i + 1};
      
      topArtists = sortedArtistList//.slice(0, numArtists);
      topGenres = sortedGenreList//.slice(0, numGenres);
      topTracks = sortedTrackList
      
      var genreObj = {week: i + 1};
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
      
      topGenres.forEach(g => {
        genreObj[g] = weekDict[w].genres[g] ? weekDict[w].genres[g] : 0;
      });
      byWeekPlaysGenre.push(genreObj); 


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
    toReturn.byWeekPlaysGenre = byWeekPlaysGenre.reverse(); 
    toReturn.byWeekPlaysArtist = byWeekPlaysArtist;
    toReturn.byWeekPlaysTrack = byWeekPlaysTrack;

    toReturn.totalPlaysByGenre = totalPlaysByGenre;
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
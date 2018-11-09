import { csv, hierarchy, json } from 'd3';

export const loadData = url => {
  return Promise.all([csv(url), json('data.json')]).then(data => {
    const csvData = data[0];
    var jsonData = data[1];
    const artistData = [];

    // Bad tags included in the data set. Removed anything country-specific or anything I considered 'not a genre'
    const genresToRemove = ['seenlive', 'femalevocalists', '', 'british', 'japanese', 'ofwgkta', 'irish', 'usa', 'australia', 'australian', 'under2000 listeners', '90s', '80s', '70s', '60s', 'all', 'philadelphia', 'scottish', 'sanremo', 'newzealand', 'twinkledaddies', 'sanremo2009', 'political', 'american', 'canadian', 'italian', 'psychadelic', 'instrumental', 'ambient', 'chillout'];

    // Remove these character from the genre names
    const punctuationToRemove = [' ', '-'];

    var genreDict = {};
    var genreHierarchy = hierarchy(jsonData); 
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
    })
    
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
        } 
      }
      else
				artistData[d.artist].plays += 1;
    }); 
    
    var toReturn = {}
    toReturn.artistData = artistData;
    toReturn.jsonData = genreHierarchy.data;
    //console.log(toReturn); 
    return toReturn; 
  }).then(r => {return r;});
};



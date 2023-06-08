export const colorLegend = (selection, props) => {
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
      .attr('opacity', d => (selectedLegendList.length == 0 || selectedLegendList.includes(d)) ? 1 : 0.2)

  groups.exit().remove();
  
  groupsEnter.append('circle')
    .merge(groups.select('circle')) 
      .attr('r', circleRadius)
      .attr('fill', colorScale);      
  
  groupsEnter.append('text')
    .merge(groups.select('text'))   
      .text(d => d)
      .attr('dy', '0.32em')
      .attr('x', textOffset)
}
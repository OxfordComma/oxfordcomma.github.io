// Mouseover line adapted from here
// https://bl.ocks.org/larsenmtl/e3b8b7c2ca4787f77d78f58d41c3da91

import { 
  select, 
  scaleTime, 
  scaleLinear, 
  extent,
  axisLeft,
  axisBottom,
  format,
  nest,
  line,
  area,
  curveBasis,
  mouse,
  stack,
  max,
  sum,
  time,
  stackOffsetWiggle,
  stackOrderAscending,
  csv
} from 'd3';
import { colorLegend } from './colorLegend';

export const stackedAreaVertical = (selection, props) => {
  const {
    dataToStack,
    topArtists,
    colorScale,
    selectedLegendList,
    width,
    height,
    numArtists,
    onClick,
    year
  } = props;

  const topArtistsTrimmed = topArtists.slice(0, numArtists);
  const margin = {left: 0, right: 0}
  const innerWidth = width - margin.left - margin.right

  const g = selection.selectAll('.container').data([null]);
  const gEnter = g.enter()
    .append('g')
      .attr('class', 'container');
 
  const xValue = d => d.week;

  const xAxisLabel = 'Week';
  const yAxisLabel = 'Plays';
  
  // X-axis and scale
  // This converts from the week scale to a day scale
  const getDateFromWeek = (weekNumber) => {
    const numberOfDays = 7*(weekNumber-1)+1;
    return new Date(year, 0, numberOfDays);
  }

  const xScale = scaleTime()
    .domain([
      new Date(year, 0, 1), 
      new Date(year, 11, 31)])
      // getDateFromWeek(max(Object.keys(dataToStack).map(d => parseInt(d, 10))))])
    .range([0, height])
    .nice()
  
  const yScale = scaleLinear()
    .domain([0, max(dataToStack.map(d => sum(Object.values(d))))])
    .range([0, innerWidth])
    .nice(); 
  
  const xAxis = axisBottom(xScale)
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
        .attr('transform', `translate(0,${-width/2}), rotate(0)`)
      .selectAll('text')
        .attr('text-anchor', 'end')
        .attr('transform', `rotate(-90)`);

  xAxisGEnter.merge(xAxisG).selectAll('.domain').remove()
  
  // xAxisGEnter.append('text')
  //     .attr('class', 'axis-label')
  //     .attr('transform', `rotate(90)`)
  //     .attr('y', 50)
  //     .attr('x', 0 / 2)
  //     .attr('fill', 'black')
  //     .text(xAxisLabel);
 
  const yAxisTickFormat = number =>
    format('.2s')(number)
      .replace('.0', '');
  
  const yAxis = axisLeft(yScale)
    .ticks('none')
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
    .offset(d3.stackOffsetWiggle)

  var series = stack(dataToStack);
  const areaGenerator = area()
    .x(d => xScale(new Date(year, 0, (d.data.week - 1) * 7)))
    .y0(d => yScale(selectedLegendList.length != 0 && (selectedLegendList.includes(d.artist)) ? 0 : d[0]))
    .y1(d => yScale(selectedLegendList.length != 0 && (selectedLegendList.includes(d.artist)) ? d[1] - d[0] : d[1]))
    .curve(curveBasis);
  
  const lastYValue = d =>
    yValue(d.values[d.values.length - 1]);
  
  const lines = selection.selectAll('.line-path').data(series);
  const linesEnter = lines.enter()
    .append('path')
      .attr('class', 'line-path') 
      .attr('fill', d => colorScale(d.key))
      // .attr('stroke', 'black')

  lines.merge(linesEnter)
    .on('click', d => onClick(d.key))
    .attr('d', areaGenerator)
    .append('title')
      .text(d => d.key)
  
  lines.merge(linesEnter)
    .transition()
      .duration(200)
      .attr('opacity', d => (selectedLegendList.length == 0 || selectedLegendList.includes(d.key)) ? 1 : 0)
      .attr('stroke-width', d => (selectedLegendList.length != 0 || selectedLegendList.includes(d.key)) ? 0.05 : 0);

  // console.log(document.getElementById('legend'));
  const annotations = []
  csv('https://raw.githubusercontent.com/OxfordComma/oxfordcomma.github.io/master/concert_dates.csv').then(annotationData => 
  {
    annotationData.forEach(a => {
      a.date = new Date(a.date)
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
      })
    });
  });

};

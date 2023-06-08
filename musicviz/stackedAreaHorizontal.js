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
  stackOffsetWiggle
} from 'd3';
import { colorLegend } from './colorLegend';

export const stackedAreaHorizontal = (selection, props) => {
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
  const xScale = scaleTime()
    .domain([
      new Date(2018, 0, (extent(dataToStack, xValue)[0] - 1) * 7 + 1), 
      new Date(2018, 0, (extent(dataToStack, xValue)[1] - 1) * 7 + 1)])
    .range([0, width])
    .nice()
  
  const xAxis = axisBottom(xScale)
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
      .attr('transform', `translate(0,${height})`)
      // .selectAll('.domain').remove()
  
  xAxisGEnter.append('text')
      .attr('class', 'axis-label')
      .attr('y', 50)
      .attr('x', width / 2)
      .attr('fill', 'black')
      .text(xAxisLabel);
  
  // Y-axis and scale
  const yScale = scaleLinear()
    .domain([0, 
             // selectedLegendItem ? 
             // max(data.map(d => d[selectedLegendItem])) : 
             max(dataToStack.map(d => sum(Object.values(d))))])
    .range([height, 0])
    .nice();  
  
  const yAxisTickFormat = number =>
    format('.2s')(number)
      .replace('.0', '');
  
  const yAxis = axisLeft(yScale)
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
    .keys(legend)
    // .offset(d3.stackOffsetWiggle);


  var series = stack(dataToStack);

  // console.log(series)

  const areaGenerator = area()
    .x(d => {
      var toScale = new Date(2018, 0, (d.data.week - 1) * 7)
      // console.log(toScale)
      return xScale(toScale);
    })
    .y0(d => yScale(selectedLegendItem && (d.artist == selectedLegendItem) ? 0 : d[0]))
    .y1(d => yScale(selectedLegendItem && (d.artist == selectedLegendItem) ? d[1] - d[0] : d[1]))
    .curve(curveBasis);
  
  const lastYValue = d =>
    yValue(d.values[d.values.length - 1]);
  
  const lines = selection.selectAll('.line-path').data(series);
  const linesEnter = lines.enter().append('path')
      .attr('class', 'line-path') 
      .attr('fill', d => colorScale(d.key))
      .attr('stroke', 'black')
      
  lines.merge(linesEnter)
    .transition()
      .duration(200)
      .attr('d', areaGenerator)
      .attr('opacity', d => (!selectedLegendItem || d.key === selectedLegendItem) ? 1 : 0)
      .attr('stroke-width', d => (selectedLegendItem || d.key === selectedLegendItem) ? 0 : 0);
};

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
    onClick
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
  // console.log(new Date(2018, 0, (extent(dataToStack, xValue)[0] - 1) * 7 + 1))
  // This converts from the week scale to a day scale
  const getDateFromWeek = (weekNumber) => {
    const numberOfDays = 7*(weekNumber-1)+1;
    return new Date(2018, 0, numberOfDays);
  }

  const xScale = scaleTime()
    .domain([
      new Date(2018, 0, 1), 
      new Date(2018, 11, 31)])
    .range([0, height])
    // .nice()
  
  const yScale = scaleLinear()
    .domain([0, max(dataToStack.map(d => sum(Object.values(d))))])
    .range([0, innerWidth])
    .nice(); 
  
  const xAxis = axisBottom(xScale)
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
      .attr('transform', `translate(0,${-250})`)
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
    .offset(d3.stackOffsetWiggle);

  var series = stack(dataToStack);
  // console.log(series)
  const areaGenerator = area()
    .x(d => xScale(new Date(2018, 0, (d.data.week - 1) * 7)))
    .y0(d => yScale(selectedLegendList.length != 0 && (selectedLegendList.includes(d.artist)) ? 0 : d[0]))
    .y1(d => yScale(selectedLegendList.length != 0 && (selectedLegendList.includes(d.artist)) ? d[1] - d[0] : d[1]))
    .curve(curveBasis);
  
  const lastYValue = d =>
    yValue(d.values[d.values.length - 1]);
  
  const lines = selection.selectAll('.line-path').data(series);
  const linesEnter = lines.enter().append('path')
      .attr('class', 'line-path') 
      .attr('fill', d => colorScale(d.key))
      .attr('stroke', 'black')
      
  lines.merge(linesEnter)
    .on('click', d => onClick(d.key))
    .transition()
      .duration(200)
      .attr('d', areaGenerator)
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
    // console.log(annotations);
  //   annotations.map(function(d){ d.color = "#8a2d96"; return d});
  //   const makeAnnotations = d3.annotation()
  //     .type(d3.annotationCalloutCurve)
  //     .annotations(annotations)
  //     // .editMode(true)
  //     .notePadding(5)

  //   var annotationG = d3.selectAll(".stacked-area-artist-vertical")//.data([null])
  //   // annotationG.enter()
  //     .append("g")
  //     .attr("class", "annotation-group")
  //     .call(makeAnnotations)
  });

  // const annotations = [
  // {
  //   note: {
  //     title: "Tiny Moving Parts and Mom Jeans",
  //     label: "February 10th at the Sinclair"
  //   },
  //   x: 230, y: xScale(new Date('10-Feb-2018')), dy: 65, dx: -117, 
  //   connector: {
  //     curve: d3.curveLinear,
  //     points: [[-50, 0]]
  //   }
  // }, 
  // {
  //   note: {
  //     title: "Sorority Noise",
  //     label: "April 4th at the Paradise Rock Club"
  //   },
  //   x: 160, y: xScale(new Date('4-Apr-2018')), dy: -50, dx: -65,
  //   connector: {
  //     curve: d3.curveLinear,
  //     points: [[-25, 0]]
  //   }
  // },
  // {
  //   note: {
  //     title: "Lord Huron",
  //     label: "April 30th at the House of  Blues"
  //   },
  //   x: 220, y: xScale(new Date('30-Apr-2018')), dy: -50, dx: -115,
  //   connector: {
  //     curve: d3.curveLinear,
  //     points: [[-75, 0]]
  //   }
  // },   
  // {
  //   note: {
  //     title: "The Killers, The National, and Julien Baker",
  //     label: "May 23rd-25th at Boston Calling"
  //   },
  //   x: 120, y: xScale(new Date('24-May-2018')), dy: -50, dx: -15,
  //   connector: {
  //     curve: d3.curveLinear,
  //     points: [[-50, 0]]
  //   }
  // },   
  // // {
  // //   note: {
  // //     title: "The National",
  // //     label: "May 24th at Boston Calling"
  // //   },
  // //   x: 210, y: 1200, dy: 0, dx: -150
  // // },   
  // // {
  // //   note: {
  // //     title: "Julien Baker",
  // //     label: "May 25th at Boston Calling"
  // //   },
  // //   x: 210, y: 1250, dy: 0, dx: -150
  // // },   
  // {
  //   note: {
  //     title: "Japanese Breakfast",
  //     label: "June 1st at the Sinclair"
  //   },
  //   x: 150, y: xScale(new Date('1-Jun-2018')), dy: 30, dx: -32,
  //   connector: {
  //     curve: d3.curveLinear,
  //     points: [[-50, 0]]
  //   }
  // },   
  // {
  //   note: {
  //     title: "Bon Iver",
  //     label: "August 5th at the LA Bowl"
  //   },
  //   x: 230, y: xScale(new Date('5-Aug-2018')), dy: 70, dx: -125,
  //   connector: {
  //     curve: d3.curveLinear,
  //     points: [[-50, 0]]
  //   }
  // },   
  // {
  //   note: {
  //     title: "Mitski",
  //     label: "October 20th at the House of Blues"
  //   },
  //   x: 210, y: 2150, dy: 0, dx: -150,
  //   connector: {
  //     curve: d3.curveLinear,
  //     points: [[-50, 0]]
  //   }
  // },   
  // {
  //   note: {
  //     title: "Mom Jeans (again)",
  //     label: "November 1st at the ONCE Ballroom"
  //   },
  //   x: 210, y: 2350, dy: 0, dx: -150,
  //   connector: {
  //     curve: d3.curveLinear,
  //     points: [[-50, 0]]
  //   }
  // }, 
  // {
  //   note: {
  //     title: "Pinegrove",
  //     label: "November 24th at the Sinclair"
  //   },
  //   x: 210, y: 2500, dy: 0, dx: -150,
  //   connector: {
  //     curve: d3.curveLinear,
  //     points: [[-50, 0]]
  //   }
  // },
  // {
  //   note: {
  //     title: "Tiny Moving Parts (again)",
  //     label: "November 25th at the House of Blues"
  //   },
  //   x: 210, y: 2750, dy: 0, dx: -150,
  //   connector: {
  //     curve: d3.curveLinear,
  //     points: [[-50, 0]]
  //   }
  // }].map(function(d){ d.color = "#8a2d96"; return d})
};

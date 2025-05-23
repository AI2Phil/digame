import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box, Typography, Paper } from '@mui/material';

/**
 * Heatmap visualization component for behavioral patterns by hour and day
 * @param {Object} data - Heatmap data from the API
 * @param {string} title - Chart title
 * @returns {JSX.Element} - Rendered component
 */
const HeatmapChart = ({ data, title = 'Activity Patterns by Hour and Day' }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!data || !data.data || data.data.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Set dimensions and margins
    const margin = { top: 50, right: 50, bottom: 70, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Extract days and hours for scales
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Create scales
    const xScale = d3.scaleBand()
      .domain(hours)
      .range([0, width])
      .padding(0.05);
    
    const yScale = d3.scaleBand()
      .domain(days)
      .range([0, height])
      .padding(0.05);
    
    // Find min and max values for color scale
    const values = data.data.map(d => d.value);
    const minValue = d3.min(values);
    const maxValue = d3.max(values);
    
    // Create color scale
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateViridis)
      .domain([minValue, maxValue]);
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(h => `${h}:00`))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-65)');
    
    // Add X axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .style('text-anchor', 'middle')
      .text('Hour of Day');
    
    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(yScale));
    
    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Day of Week');
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);
    
    // Create heatmap cells
    svg.selectAll('rect')
      .data(data.data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.hour))
      .attr('y', d => yScale(d.day))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .style('fill', d => colorScale(d.value))
      .style('stroke', '#fff')
      .style('stroke-width', 1)
      .on('mouseover', function(event, d) {
        // Show tooltip on hover
        d3.select(this).style('stroke', '#000').style('stroke-width', 2);
        
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${xScale(d.hour) + xScale.bandwidth() / 2},${yScale(d.day) - 10})`);
        
        tooltip.append('rect')
          .attr('x', -60)
          .attr('y', -30)
          .attr('width', 120)
          .attr('height', 30)
          .attr('fill', 'white')
          .attr('stroke', '#000')
          .attr('rx', 5)
          .attr('ry', 5);
        
        tooltip.append('text')
          .attr('x', 0)
          .attr('y', -10)
          .attr('text-anchor', 'middle')
          .text(`${d.day} ${d.hour}:00 - ${d.value.toFixed(2)}`);
      })
      .on('mouseout', function() {
        // Remove tooltip on mouseout
        d3.select(this).style('stroke', '#fff').style('stroke-width', 1);
        svg.selectAll('.tooltip').remove();
      });
    
    // Add color legend
    const legendWidth = 20;
    const legendHeight = height;
    
    // Create gradient for legend
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'heatmap-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');
    
    // Add color stops
    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
      const offset = i / numStops;
      const value = minValue + offset * (maxValue - minValue);
      gradient.append('stop')
        .attr('offset', `${offset * 100}%`)
        .attr('stop-color', colorScale(value));
    }
    
    // Create legend rectangle
    svg.append('rect')
      .attr('x', width + 10)
      .attr('y', 0)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#heatmap-gradient)');
    
    // Add legend axis
    const legendScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([legendHeight, 0]);
    
    svg.append('g')
      .attr('transform', `translate(${width + 10 + legendWidth},0)`)
      .call(d3.axisRight(legendScale).ticks(5));
    
    // Add legend title
    svg.append('text')
      .attr('transform', 'rotate(90)')
      .attr('x', legendHeight / 2)
      .attr('y', -width - 40)
      .style('text-anchor', 'middle')
      .text('Activity Intensity');
    
  }, [data, title]);
  
  if (!data || !data.data || data.data.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" align="center">
          No heatmap data available
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <svg ref={svgRef}></svg>
      </Box>
      {data.categories && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Pattern Categories:
          </Typography>
          {Object.entries(data.categories).map(([category, info]) => (
            <Box key={category} sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>{category}:</strong> Most active on {info.peak_day} at {info.peak_hour}:00
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default HeatmapChart;
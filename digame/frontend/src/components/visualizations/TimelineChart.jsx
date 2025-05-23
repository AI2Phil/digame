import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box, Typography, Paper } from '@mui/material';

/**
 * Timeline visualization component for behavioral patterns over time
 * @param {Object} data - Timeline data from the API
 * @param {string} title - Chart title
 * @returns {JSX.Element} - Rendered component
 */
const TimelineChart = ({ data, title = 'Behavioral Patterns Timeline' }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!data || !data.timeline || data.timeline.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Set dimensions and margins
    const margin = { top: 50, right: 150, bottom: 70, left: 80 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Extract data
    const timelineData = data.timeline;
    
    // Get unique dates and patterns
    const dates = [...new Set(timelineData.map(d => d.date))].sort();
    const patterns = [...new Set(timelineData.map(d => d.pattern))];
    
    // Create scales
    const xScale = d3.scaleBand()
      .domain(dates)
      .range([0, width])
      .padding(0.1);
    
    const yScale = d3.scalePoint()
      .domain(patterns)
      .range([height, 0])
      .padding(0.5);
    
    // Create color scale for pattern categories
    const categories = [...new Set(timelineData.map(d => d.category))];
    const colorScale = d3.scaleOrdinal()
      .domain(categories)
      .range(d3.schemeCategory10);
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
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
      .text('Date');
    
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
      .text('Behavioral Pattern');
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);
    
    // Create a nested data structure for line generation
    const nestedData = d3.group(timelineData, d => d.pattern);
    
    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.date) + xScale.bandwidth() / 2)
      .y(d => yScale(d.pattern))
      .curve(d3.curveMonotoneX);
    
    // Add pattern lines
    svg.selectAll('.pattern-line')
      .data(Array.from(nestedData.entries()))
      .enter()
      .append('path')
      .attr('class', 'pattern-line')
      .attr('d', d => line(d[1].sort((a, b) => new Date(a.date) - new Date(b.date))))
      .attr('fill', 'none')
      .attr('stroke', d => colorScale(d[1][0].category))
      .attr('stroke-width', 2)
      .attr('opacity', 0.7);
    
    // Add pattern points
    svg.selectAll('.pattern-point')
      .data(timelineData)
      .enter()
      .append('circle')
      .attr('class', 'pattern-point')
      .attr('cx', d => xScale(d.date) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.pattern))
      .attr('r', d => Math.sqrt(d.intensity) * 5)
      .attr('fill', d => colorScale(d.category))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        // Highlight point on hover
        d3.select(this)
          .attr('r', Math.sqrt(d.intensity) * 6)
          .attr('stroke-width', 2);
        
        // Show tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${xScale(d.date) + xScale.bandwidth() / 2},${yScale(d.pattern) - 15})`);
        
        tooltip.append('rect')
          .attr('x', -100)
          .attr('y', -70)
          .attr('width', 200)
          .attr('height', 70)
          .attr('fill', 'white')
          .attr('stroke', colorScale(d.category))
          .attr('rx', 5)
          .attr('ry', 5);
        
        tooltip.append('text')
          .attr('x', 0)
          .attr('y', -50)
          .attr('text-anchor', 'middle')
          .attr('font-weight', 'bold')
          .text(d.pattern);
        
        tooltip.append('text')
          .attr('x', 0)
          .attr('y', -30)
          .attr('text-anchor', 'middle')
          .text(`Date: ${d.date}`);
        
        tooltip.append('text')
          .attr('x', 0)
          .attr('y', -10)
          .attr('text-anchor', 'middle')
          .text(`Category: ${d.category}`);
        
        tooltip.append('text')
          .attr('x', 0)
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .text(`Intensity: ${d.intensity.toFixed(2)}`);
      })
      .on('mouseout', function(event, d) {
        // Restore point on mouseout
        d3.select(this)
          .attr('r', Math.sqrt(d.intensity) * 5)
          .attr('stroke-width', 1);
        
        // Remove tooltip
        svg.selectAll('.tooltip').remove();
      });
    
    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width + 20}, 0)`);
    
    categories.forEach((category, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);
      
      legendRow.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', colorScale(category));
      
      legendRow.append('text')
        .attr('x', 15)
        .attr('y', 10)
        .attr('text-anchor', 'start')
        .attr('font-size', '12px')
        .text(category);
    });
    
    // Add intensity legend
    const intensityLegend = svg.append('g')
      .attr('transform', `translate(${width + 20}, ${categories.length * 20 + 30})`);
    
    intensityLegend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Intensity:');
    
    const intensities = [1, 3, 5];
    
    intensities.forEach((intensity, i) => {
      const intensityRow = intensityLegend.append('g')
        .attr('transform', `translate(0, ${i * 25 + 20})`);
      
      intensityRow.append('circle')
        .attr('cx', 5)
        .attr('cy', 0)
        .attr('r', Math.sqrt(intensity) * 5)
        .attr('fill', '#999')
        .attr('stroke', '#fff');
      
      intensityRow.append('text')
        .attr('x', 20)
        .attr('y', 5)
        .attr('text-anchor', 'start')
        .attr('font-size', '12px')
        .text(intensity.toString());
    });
    
  }, [data, title]);
  
  if (!data || !data.timeline || data.timeline.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" align="center">
          No timeline data available
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
      {data.insights && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Timeline Insights:
          </Typography>
          {data.insights.map((insight, index) => (
            <Typography key={index} variant="body2" paragraph>
              {insight}
            </Typography>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default TimelineChart;
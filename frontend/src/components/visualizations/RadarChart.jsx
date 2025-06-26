import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box, Typography, Paper } from '@mui/material';

/**
 * Radar chart visualization component for behavioral pattern categories
 * @param {Object} data - Radar chart data from the API
 * @param {string} title - Chart title
 * @returns {JSX.Element} - Rendered component
 */
const RadarChart = ({ data, title = 'Pattern Categories Distribution' }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!data || !data.categories || Object.keys(data.categories).length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Set dimensions and margins
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);
    
    // Extract categories and values
    const categories = Object.keys(data.categories);
    const values = categories.map(category => data.categories[category].value);
    
    // Create scales
    const angleScale = d3.scalePoint()
      .domain(categories)
      .range([0, 2 * Math.PI])
      .padding(0.1);
    
    const radiusScale = d3.scaleLinear()
      .domain([0, d3.max(values)])
      .range([0, radius])
      .nice();
    
    // Create color scale
    const colorScale = d3.scaleOrdinal()
      .domain(categories)
      .range(d3.schemeCategory10);
    
    // Create radar line generator
    const radarLine = d3.lineRadial()
      .angle(d => angleScale(d.category))
      .radius(d => radiusScale(d.value))
      .curve(d3.curveLinearClosed);
    
    // Create data points for radar
    const radarData = categories.map(category => ({
      category,
      value: data.categories[category].value
    }));
    
    // Add radar grid circles
    const gridCircles = radiusScale.ticks(5);
    
    svg.selectAll('.grid-circle')
      .data(gridCircles)
      .enter()
      .append('circle')
      .attr('class', 'grid-circle')
      .attr('r', d => radiusScale(d))
      .attr('fill', 'none')
      .attr('stroke', '#ddd')
      .attr('stroke-dasharray', '3,3');
    
    // Add grid circle labels
    svg.selectAll('.grid-label')
      .data(gridCircles)
      .enter()
      .append('text')
      .attr('class', 'grid-label')
      .attr('y', d => -radiusScale(d))
      .attr('dy', '-0.3em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .text(d => d);
    
    // Add radar grid lines
    svg.selectAll('.grid-line')
      .data(categories)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d, i) => radius * Math.cos(angleScale(d) - Math.PI / 2))
      .attr('y2', (d, i) => radius * Math.sin(angleScale(d) - Math.PI / 2))
      .attr('stroke', '#ddd')
      .attr('stroke-dasharray', '3,3');
    
    // Add radar grid line labels
    svg.selectAll('.axis-label')
      .data(categories)
      .enter()
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', d => (radius + 20) * Math.cos(angleScale(d) - Math.PI / 2))
      .attr('y', d => (radius + 20) * Math.sin(angleScale(d) - Math.PI / 2))
      .attr('text-anchor', d => {
        const angle = angleScale(d);
        if (Math.abs(angle - Math.PI / 2) < 0.1 || Math.abs(angle - 3 * Math.PI / 2) < 0.1) {
          return 'middle';
        }
        return angle < Math.PI ? 'start' : 'end';
      })
      .attr('dy', d => {
        const angle = angleScale(d);
        if (Math.abs(angle) < 0.1 || Math.abs(angle - Math.PI) < 0.1) {
          return '0.3em';
        }
        return angle < Math.PI ? '0.5em' : '-0.1em';
      })
      .attr('font-size', '12px')
      .attr('fill', d => colorScale(d))
      .text(d => d);
    
    // Add radar area
    svg.append('path')
      .datum(radarData)
      .attr('d', radarLine)
      .attr('fill', 'rgba(70, 130, 180, 0.3)')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2);
    
    // Add radar points
    svg.selectAll('.radar-point')
      .data(radarData)
      .enter()
      .append('circle')
      .attr('class', 'radar-point')
      .attr('cx', d => radiusScale(d.value) * Math.cos(angleScale(d.category) - Math.PI / 2))
      .attr('cy', d => radiusScale(d.value) * Math.sin(angleScale(d.category) - Math.PI / 2))
      .attr('r', 5)
      .attr('fill', d => colorScale(d.category))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        // Highlight point on hover
        d3.select(this)
          .attr('r', 8)
          .attr('stroke-width', 2);
        
        // Show tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${radiusScale(d.value) * Math.cos(angleScale(d.category) - Math.PI / 2)},${radiusScale(d.value) * Math.sin(angleScale(d.category) - Math.PI / 2) - 15})`);
        
        tooltip.append('rect')
          .attr('x', -80)
          .attr('y', -40)
          .attr('width', 160)
          .attr('height', 40)
          .attr('fill', 'white')
          .attr('stroke', colorScale(d.category))
          .attr('rx', 5)
          .attr('ry', 5);
        
        tooltip.append('text')
          .attr('x', 0)
          .attr('y', -20)
          .attr('text-anchor', 'middle')
          .attr('font-weight', 'bold')
          .text(d.category);
        
        tooltip.append('text')
          .attr('x', 0)
          .attr('y', 0)
          .attr('text-anchor', 'middle')
          .text(`Value: ${d.value.toFixed(2)}`);
      })
      .on('mouseout', function() {
        // Restore point on mouseout
        d3.select(this)
          .attr('r', 5)
          .attr('stroke-width', 1);
        
        // Remove tooltip
        svg.selectAll('.tooltip').remove();
      });
    
    // Add title
    svg.append('text')
      .attr('x', 0)
      .attr('y', -radius - 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text(title);
    
    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${-width / 2 + 20}, ${-height / 2 + 20})`);
    
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
    
  }, [data, title]);
  
  if (!data || !data.categories || Object.keys(data.categories).length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" align="center">
          No category data available
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <svg ref={svgRef}></svg>
      </Box>
      {data.insights && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Category Insights:
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

export default RadarChart;
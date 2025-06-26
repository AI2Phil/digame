import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { Box, Typography, Paper } from '@mui/material';

/**
 * Sankey diagram visualization component for transitions between behavioral patterns
 * @param {Object} data - Sankey diagram data from the API
 * @param {string} title - Chart title
 * @returns {JSX.Element} - Rendered component
 */
const SankeyChart = ({ data, title = 'Pattern Transitions' }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!data || !data.nodes || !data.links || data.nodes.length === 0 || data.links.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Set dimensions and margins
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 900 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create sankey generator
    const sankeyGenerator = sankey()
      .nodeWidth(20)
      .nodePadding(10)
      .extent([[0, 0], [width, height]]);
    
    // Format data for d3-sankey
    const sankeyData = {
      nodes: data.nodes.map(node => ({
        name: node.name,
        category: node.category
      })),
      links: data.links.map(link => ({
        source: link.source,
        target: link.target,
        value: link.value
      }))
    };
    
    // Generate sankey layout
    const { nodes, links } = sankeyGenerator(sankeyData);
    
    // Create color scale for nodes based on categories
    const categories = [...new Set(nodes.map(d => d.category))];
    const colorScale = d3.scaleOrdinal()
      .domain(categories)
      .range(d3.schemeCategory10);
    
    // Add links
    svg.append('g')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => d3.color(colorScale(d.source.category)).darker(0.5))
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('fill', 'none')
      .attr('opacity', 0.5)
      .on('mouseover', function(event, d) {
        // Highlight link on hover
        d3.select(this)
          .attr('opacity', 0.8)
          .attr('stroke-width', d => Math.max(1, d.width + 2));
        
        // Show tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${width / 2},${height / 2})`);
        
        tooltip.append('rect')
          .attr('x', -120)
          .attr('y', -40)
          .attr('width', 240)
          .attr('height', 80)
          .attr('fill', 'white')
          .attr('stroke', '#000')
          .attr('rx', 5)
          .attr('ry', 5);
        
        tooltip.append('text')
          .attr('x', 0)
          .attr('y', -15)
          .attr('text-anchor', 'middle')
          .text(`${d.source.name} → ${d.target.name}`);
        
        tooltip.append('text')
          .attr('x', 0)
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .text(`Transitions: ${d.value}`);
        
        tooltip.append('text')
          .attr('x', 0)
          .attr('y', 35)
          .attr('text-anchor', 'middle')
          .text(`${d.source.category} → ${d.target.category}`);
      })
      .on('mouseout', function() {
        // Restore link on mouseout
        d3.select(this)
          .attr('opacity', 0.5)
          .attr('stroke-width', d => Math.max(1, d.width));
        
        // Remove tooltip
        svg.selectAll('.tooltip').remove();
      });
    
    // Add nodes
    const node = svg.append('g')
      .selectAll('rect')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);
    
    // Add node rectangles
    node.append('rect')
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => colorScale(d.category))
      .attr('stroke', d => d3.color(colorScale(d.category)).darker(0.5))
      .on('mouseover', function(event, d) {
        // Highlight node on hover
        d3.select(this)
          .attr('stroke-width', 2);
        
        // Show tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${(d.x0 + d.x1) / 2},${d.y0 - 10})`);
        
        tooltip.append('rect')
          .attr('x', -100)
          .attr('y', -50)
          .attr('width', 200)
          .attr('height', 50)
          .attr('fill', 'white')
          .attr('stroke', '#000')
          .attr('rx', 5)
          .attr('ry', 5);
        
        tooltip.append('text')
          .attr('x', 0)
          .attr('y', -25)
          .attr('text-anchor', 'middle')
          .text(d.name);
        
        tooltip.append('text')
          .attr('x', 0)
          .attr('y', 0)
          .attr('text-anchor', 'middle')
          .text(`Category: ${d.category}`);
      })
      .on('mouseout', function() {
        // Restore node on mouseout
        d3.select(this)
          .attr('stroke-width', 1);
        
        // Remove tooltip
        svg.selectAll('.tooltip').remove();
      });
    
    // Add node labels
    node.append('text')
      .attr('x', d => d.x0 < width / 2 ? 6 + (d.x1 - d.x0) : -6)
      .attr('y', d => (d.y1 - d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .text(d => d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name)
      .style('fill', d => d3.color(colorScale(d.category)).darker(2))
      .style('font-size', '10px')
      .style('pointer-events', 'none');
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);
    
    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 150}, 10)`);
    
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
        .style('font-size', '12px')
        .text(category);
    });
    
  }, [data, title]);
  
  if (!data || !data.nodes || !data.links || data.nodes.length === 0 || data.links.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" align="center">
          No transition data available
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
            Transition Insights:
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

export default SankeyChart;
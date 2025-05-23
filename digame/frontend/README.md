# Digame Frontend

This is the frontend application for the Digame Behavioral Pattern Analysis platform. It provides interactive visualizations for behavioral patterns, including heatmaps, Sankey diagrams, radar charts, and timelines.

## Features

- **Interactive Visualizations**: Explore behavioral patterns through various visualization types
- **Filtering Options**: Filter visualizations by model, time window, and other parameters
- **Responsive Design**: Works on desktop and mobile devices
- **Material UI**: Modern and clean user interface

## Visualization Types

1. **Heatmap**: Visualize activity patterns by hour and day
2. **Sankey Diagram**: Explore transitions between behavioral patterns
3. **Radar Chart**: Analyze pattern category distribution
4. **Timeline**: Track patterns over time

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Digame backend API running

### Installation

1. Clone the repository (if not already done)
2. Navigate to the frontend directory:
   ```
   cd digame/frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Running the Development Server

Start the development server:

```
npm start
```
or
```
yarn start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

Build the application for production:

```
npm run build
```
or
```
yarn build
```

The build artifacts will be stored in the `build/` directory.

## Project Structure

```
frontend/
├── public/              # Public assets
├── src/                 # Source code
│   ├── components/      # React components
│   │   ├── visualizations/  # Visualization components
│   │   │   ├── HeatmapChart.jsx
│   │   │   ├── SankeyChart.jsx
│   │   │   ├── RadarChart.jsx
│   │   │   └── TimelineChart.jsx
│   │   └── VisualizationDashboard.jsx
│   ├── services/        # API services
│   │   └── visualizationService.js
│   ├── App.jsx          # Main App component
│   └── index.js         # Entry point
└── package.json         # Dependencies and scripts
```

## API Integration

The frontend communicates with the Digame backend API to fetch visualization data. The API endpoints used are:

- `/pattern-recognition/visualizations/heatmap` - Heatmap data
- `/pattern-recognition/visualizations/sankey` - Sankey diagram data
- `/pattern-recognition/visualizations/radar` - Radar chart data
- `/pattern-recognition/visualizations/timeline` - Timeline data

## Technologies Used

- **React**: Frontend library for building user interfaces
- **D3.js**: Data visualization library
- **Material UI**: React component library
- **React Router**: For navigation
- **Axios**: For API requests

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
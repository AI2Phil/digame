export default function handler(req, res) {
  // Simple health check endpoint
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'frontend',
    version: process.env.npm_package_version || '1.0.0'
  });
}
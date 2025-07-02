const net = require('net');

/**
 * Check if a port is available
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>} - True if port is available, false otherwise
 */
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
};

/**
 * Find an available port from a list of preferred ports
 * @param {number[]} preferredPorts - Array of ports to try in order
 * @returns {Promise<number>} - First available port
 */
const findAvailablePort = async (preferredPorts = [8001, 8000, 3001, 5000, 4000]) => {
  console.log('🔍 Searching for available port...');
  
  for (const port of preferredPorts) {
    console.log(`   Checking port ${port}...`);
    const available = await isPortAvailable(port);
    
    if (available) {
      console.log(`✅ Port ${port} is available`);
      return port;
    } else {
      console.log(`❌ Port ${port} is in use`);
    }
  }
  
  // If no preferred ports are available, find a random available port
  console.log('🎲 No preferred ports available, finding random port...');
  return findRandomAvailablePort();
};

/**
 * Find a random available port
 * @returns {Promise<number>} - Random available port
 */
const findRandomAvailablePort = () => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(0, () => {
      const port = server.address().port;
      server.close(() => {
        console.log(`✅ Random port ${port} assigned`);
        resolve(port);
      });
    });
    
    server.on('error', reject);
  });
};

/**
 * Get the optimal port for the backend server
 * @returns {Promise<number>} - Optimal port number
 */
const getOptimalPort = async () => {
  // Check environment variable first
  const envPort = process.env.PORT;
  if (envPort) {
    const port = parseInt(envPort, 10);
    if (await isPortAvailable(port)) {
      console.log(`✅ Using environment port: ${port}`);
      return port;
    } else {
      console.log(`⚠️  Environment port ${port} is in use, searching for alternatives...`);
    }
  }
  
  // Try preferred ports in order
  const preferredPorts = [8001, 8000, 3001, 5000, 4000];
  return await findAvailablePort(preferredPorts);
};

module.exports = {
  isPortAvailable,
  findAvailablePort,
  findRandomAvailablePort,
  getOptimalPort
};
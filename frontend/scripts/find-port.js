const net = require('net');

function findAvailablePort(startPort = 3001) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use, try the next one
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

if (require.main === module) {
  findAvailablePort(3001)
    .then(port => {
      console.log(port);
      process.exit(0);
    })
    .catch(err => {
      console.error('Error finding available port:', err);
      process.exit(1);
    });
}

module.exports = findAvailablePort;
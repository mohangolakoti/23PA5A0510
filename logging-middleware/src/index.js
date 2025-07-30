const { Log } = require('./logger');

async function main() {
  try {
    console.log('Logging handler error...');
    console.log(await Log('backend', 'error', 'handler', 'received string, expected bool'));
    
    console.log('Logging database failure...');
    console.log(await Log('backend', 'fatal', 'db', 'Critical database connection failure'));
    
    console.log('Logging successful operation...');
    console.log(await Log('backend', 'info', 'controller', 'User data retrieved successfully'));
    
    console.log('Logging frontend event...');
    console.log(await Log('frontend', 'debug', 'component', 'Button clicked with id: btn-123'));
    
    console.log('Logging auth warning...');
    console.log(await Log('frontend', 'warn', 'auth', 'User session timeout detected'));
    
    console.log('Logging middleware info...');
    console.log(await Log('backend', 'info', 'middleware', 'Request processed successfully'));
  } catch (error) {
    console.error('Error in main:', error.message);
  }
}

main();
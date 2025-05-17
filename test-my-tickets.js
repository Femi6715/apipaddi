const http = require('http');

console.log('Starting ticket test...');

const data = JSON.stringify({
  user_id: 4  // Use the ID from your logged-in user
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/simple/tickets',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Testing tickets endpoint with data:', data);

const req = http.request(options, (res) => {
  console.log('Response status:', res.statusCode);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Raw response:', responseData);
    try {
      const response = JSON.parse(responseData);
      console.log('Parsed response:', response);
      console.log('Number of tickets:', response.tickets.length);
    } catch (e) {
      console.error('Error parsing response:', e);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();

console.log('Request sent, waiting for response...'); 
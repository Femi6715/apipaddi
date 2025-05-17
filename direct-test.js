const http = require('http');

const testData = {
  user_id: 1  // Replace with an actual user ID from your database
};

console.log('Testing tickets endpoint with data:', testData);

const data = JSON.stringify(testData);

const options = {
  hostname: '127.0.0.1',
  port: 8080,
  path: '/api/simple/tickets',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Sending request to:', options.hostname + ':' + options.port + options.path);

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      console.log('Raw response:', responseData);
      
      const parsedResponse = JSON.parse(responseData);
      console.log('Parsed response:', JSON.stringify(parsedResponse, null, 2));
      
      if (parsedResponse.success && Array.isArray(parsedResponse.tickets)) {
        console.log(`Found ${parsedResponse.tickets.length} tickets for user ID ${testData.user_id}`);
        if (parsedResponse.tickets.length > 0) {
          console.log('Sample ticket:', JSON.stringify(parsedResponse.tickets[0], null, 2));
        } else {
          console.log('No tickets found for this user. Try a different user_id or check your database.');
        }
      } else {
        console.error('Invalid response format or no tickets found:', parsedResponse);
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      console.error('Raw response was:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end(); 
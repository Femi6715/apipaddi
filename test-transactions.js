const http = require('http');

const testData = {
  user_id: 1
};

console.log('Testing simple transactions endpoint with data:', testData);

const data = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/simple/transactions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Sending request...');

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response data:', responseData);
    try {
      const parsedResponse = JSON.parse(responseData);
      if (parsedResponse.success && Array.isArray(parsedResponse.transactions)) {
        console.log(`Found ${parsedResponse.transactions.length} transactions for user ID ${testData.user_id}`);
      }
    } catch (error) {
      console.error('Error parsing response:', error);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end(); 
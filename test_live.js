const https = require('https');

const data = JSON.stringify({
  data: ["A->B", "B->C"]
});

const options = {
  hostname: 'bfhl-api-90c6.onrender.com',
  port: 443,
  path: '/bfhl',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response:', JSON.stringify(JSON.parse(responseData), null, 2));
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
  process.exit(1);
});

req.write(data);
req.end();

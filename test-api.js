const https = require('https');
https.get('https://musk-backend.onrender.com/api/orders', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Orders sample:', data.slice(0, 500)));
});
https.get('https://musk-backend.onrender.com/api/companies', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Companies sample:', data.slice(0, 500)));
});

const https = require('https');

https.get('https://api.muskmover.ng/api/orders', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Orders sample:', data.slice(0, 500)));
}).on('error', err => console.error('Orders error:', err.message));

https.get('https://api.muskmover.ng/api/companies', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Companies sample:', data.slice(0, 500)));
}).on('error', err => console.error('Companies error:', err.message));

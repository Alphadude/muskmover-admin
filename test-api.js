const http = require('http');
http.get('http://206.189.238.173:5000/api/orders', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Orders sample:', data.slice(0, 500)));
});
http.get('http://206.189.238.173:5000/api/companies', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Companies sample:', data.slice(0, 500)));
});

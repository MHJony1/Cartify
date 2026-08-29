const http = require('http');
const fs = require('fs');
const out = fs.createWriteStream('test-output.html', { encoding: 'utf8' });
http.get('http://localhost:3000', (res) => {
  res.on('data', (chunk) => {
    out.write(chunk);
  });
  res.on('end', () => {
    out.end();
  });
});

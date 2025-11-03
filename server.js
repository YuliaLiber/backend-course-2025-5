const http = require('http');
const fs = require('fs');
const path = require('path');
const { program } = require('commander');

program
  .requiredOption('-h, --host <host>')
  .requiredOption('-p, --port <port>')
  .requiredOption('-c, --cache <dir>');
program.parse(process.argv);

const opt = program.opts();
const HOST = opt.host;
const PORT = Number(opt.port);
const CACHE_DIR = path.resolve(opt.cache);

// якщо нема папки кешу - створюю
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('сервер працює');
});

server.listen(PORT, HOST);

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

// формую шлях до файла в кеші
function getCacheFile(code) {
  return path.join(CACHE_DIR, code + '.jpg');
}

const server = http.createServer(async (req, res) => {
  // розбираю шлях
  const url = new URL(req.url, `http://${req.headers.host}`);
  const code = url.pathname.slice(1);  

  // якщо просто "/"
  if (!code) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('вкажи код, напр. /200');
    return;
  }

  const filePath = getCacheFile(code);

  //GET 
  if (req.method === 'GET') {
    try {
      // 1) пробую зчитати з кешу
      const data = await fsp.readFile(filePath);
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
      return;
    } catch (e) {
      // 2) якщо в кеші нема - тягну з http.cat
      try {
        const resp = await superagent.get('https://http.cat/' + code).buffer(true);
        const img = resp.body;
        // зберігаю в кеш
        await fsp.writeFile(filePath, img);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(img);
        return;
      } catch (e2) {
        // нема навіть на http.cat
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('нема ні в кеші, ні на http.cat');
        return;
      }
    }
  }

  
  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('метод не підтримується');
});

server.listen(PORT, HOST);
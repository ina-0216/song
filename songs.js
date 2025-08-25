const http = require('http');
const mysql = require('mysql2');
const url = require('url');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'songs'   // change database name here
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  const method = req.method;

  // ===== GET =====
  if (path === '/songs' && method === 'GET') {
    if (query.id) {
      db.query('SELECT * FROM songs WHERE song_id = ?', [query.id], (err, result) => {
        if (err) throw err;
        res.end(JSON.stringify(result[0] || {}));
      });
    } else {
      db.query('SELECT * FROM songs', (err, result) => {
        if (err) throw err;
        res.end(JSON.stringify(result));
      });
    }
  }

  // ===== POST =====
  else if (path === '/songs' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { title, artist, album, release_year, genre } = JSON.parse(body);
      db.query(
        'INSERT INTO songs (title, artist, album, release_year, genre) VALUES (?, ?, ?, ?, ?)',
        [title, artist, album, release_year, genre],
        (err, result) => {
          if (err) throw err;
          res.end(JSON.stringify({ song_id: result.insertId, title, artist, album, release_year, genre }));
        }
      );
    });
  }

  // ===== PUT =====
  else if (path === '/songs' && method === 'PUT') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { title, artist, album, release_year, genre } = JSON.parse(body);
      db.query(
        'UPDATE songs SET title=?, artist=?, album=?, release_year=?, genre=? WHERE song_id=?',
        [title, artist, album, release_year, genre, query.id],
        (err, result) => {
          if (err) throw err;
          res.end(JSON.stringify({ song_id: query.id, title, artist, album, release_year, genre }));
        }
      );
    });
  }

  // ===== DELETE =====
  else if (path === '/songs' && method === 'DELETE') {
    db.query('DELETE FROM songs WHERE song_id=?', [query.id], (err, result) => {
      if (err) throw err;
      res.end(JSON.stringify({ message: 'Song deleted' }));
    });
  }

  // ===== NOT FOUND =====
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

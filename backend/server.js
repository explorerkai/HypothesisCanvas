const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const dbPath = path.join(__dirname, '..', 'database', 'hypothesis_canvas.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Canvas table
    db.run(`
      CREATE TABLE IF NOT EXISTS canvases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Canvas items table
    db.run(`
      CREATE TABLE IF NOT EXISTS canvas_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        canvas_id INTEGER,
        item_type TEXT NOT NULL,
        content TEXT,
        position_x INTEGER DEFAULT 0,
        position_y INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (canvas_id) REFERENCES canvases (id)
      )
    `);

    // Sessions table for user tracking
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        canvas_id INTEGER,
        user_name TEXT,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (canvas_id) REFERENCES canvases (id)
      )
    `);
  });
}

// Routes
app.get('/api/canvases', (req, res) => {
  db.all('SELECT * FROM canvases ORDER BY updated_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ canvases: rows });
  });
});

app.get('/api/canvases/:id', (req, res) => {
  const canvasId = req.params.id;
  db.get('SELECT * FROM canvases WHERE id = ?', [canvasId], (err, canvas) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!canvas) {
      res.status(404).json({ error: 'Canvas not found' });
      return;
    }

    // Get canvas items
    db.all('SELECT * FROM canvas_items WHERE canvas_id = ? ORDER BY item_type', [canvasId], (err, items) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ canvas, items });
    });
  });
});

app.post('/api/canvases', (req, res) => {
  const { title } = req.body;
  db.run('INSERT INTO canvases (title) VALUES (?)', [title], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: 'Canvas created successfully' });
  });
});

app.put('/api/canvases/:id/items', (req, res) => {
  const canvasId = req.params.id;
  const { items } = req.body;

  // Update canvas timestamp
  db.run('UPDATE canvases SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [canvasId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Delete existing items and insert new ones
    db.run('DELETE FROM canvas_items WHERE canvas_id = ?', [canvasId], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Insert new items
      const stmt = db.prepare('INSERT INTO canvas_items (canvas_id, item_type, content, position_x, position_y) VALUES (?, ?, ?, ?, ?)');
      items.forEach(item => {
        stmt.run([canvasId, item.type, item.content, item.position.x, item.position.y]);
      });
      stmt.finalize();

      res.json({ message: 'Canvas items updated successfully' });
    });
  });
});

app.post('/api/sessions', (req, res) => {
  const { canvasId, userName } = req.body;
  db.run('INSERT OR REPLACE INTO sessions (canvas_id, user_name, last_activity) VALUES (?, ?, CURRENT_TIMESTAMP)',
    [canvasId, userName], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ sessionId: this.lastID, message: 'Session created' });
  });
});

app.get('/api/sessions/:canvasId', (req, res) => {
  const canvasId = req.params.canvasId;
  db.all('SELECT user_name, last_activity FROM sessions WHERE canvas_id = ? AND last_activity > datetime("now", "-5 minutes")',
    [canvasId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ activeUsers: rows });
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;</content>
<parameter name="filePath">c:\Users\tksna\OneDrive\ドキュメント\04_Codex\06_HypothesisCanvas\backend\server.js
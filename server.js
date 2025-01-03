const express = require('express');
const fs = require('fs');
const path = require('path');
// const config = require('./config.json')

const app = express();
const PORT = readConfig();

function readConfig() {
  try {
    const rawConfig = fs.readFileSync("config.json", 'utf-8');
    const config = JSON.parse(rawConfig);
    return config.port;
  } catch (error) {
    console.error(`Error while loading config.json: ${error.message}`);
    console.error(`Defaulting to port 3000...`);
    return 3000;
  }
}

// Middleware om JSON-data te parseren
app.use(express.json());

// Maak de map 'public' beschikbaar voor statische bestanden
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint om achievements op te halen
app.get('/api/achievements', (req, res) => {
  const category = req.query.category;

  fs.readFile(category + '_achievements.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Failed to load achievements' });
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// Endpoint om achievements op te slaan
app.post('/api/achievements', (req, res) => {
  const category = req.body.category;
  const achievements = req.body.achievements;

  if (!category || !achievements) {
    return res.status(400).json({ error: 'Category or achievements data is missing' });
  }

  fs.writeFile(category + '_achievements.json', JSON.stringify(achievements, null, 2), 'utf8', (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to save achievements' });
    } else {
      res.json({ message: 'Achievements saved successfully!' });
    }
  });
});

app.get('/api/categories', (req, res) => {
  fs.readFile('categories.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Failed to load achievements' });
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// Start de server
app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}, open the url in your browser to start.`);
  console.log(`Close this window if you want to stop the application.`);
});


const fs = require('fs');
const path = require('path');

// Create a package.json specifically for deployment
const packageJson = {
  "name": "volunteer-activity-tracker",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "preview": "vite preview",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "compression": "^1.7.4"
  },
  "engines": {
    "node": ">=16.0.0"
  }
};

// Create a simple express server for hosts that support Node.js
const serverCode = `
import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable compression
app.use(compression());

// Serve static files from 'dist' directory
app.use(express.static('.'));

// Log all requests to help with debugging
app.use((req, res, next) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.originalUrl}\`);
  next();
});

// Special handler for favicon.ico
app.get('/favicon.ico', (req, res) => {
  // Serve a simple SVG favicon
  const svgFavicon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">V</text></svg>';
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svgFavicon);
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  console.log(\`Serving index.html for route: \${req.originalUrl}\`);
  res.sendFile(resolve(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;

// Create PHP fallback file for shared hosting that doesn't support Node.js
const phpFallbackCode = `<?php
// Set the content type to HTML
header('Content-Type: text/html');

// If the requested file is favicon.ico, serve a simple SVG
if ($_SERVER['REQUEST_URI'] === '/favicon.ico') {
    header('Content-Type: image/svg+xml');
    echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">V</text></svg>';
    exit;
}

// For all other routes, serve the main index.html
include_once('index.html');
`;

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  console.error('Error: dist directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Write deployment package.json
fs.writeFileSync(path.join('dist', 'package.json'), JSON.stringify(packageJson, null, 2));

// Write server.js
fs.writeFileSync(path.join('dist', 'server.js'), serverCode);

// Write PHP fallback for shared hosting
fs.writeFileSync(path.join('dist', 'index.php'), phpFallbackCode);

// Make a copy of index.html in the root to ensure routing works properly
fs.copyFileSync(path.join('dist', 'index.html'), path.join('dist', 'index.php'));

// Copy htaccess and redirects
try {
  fs.copyFileSync(path.join('public', '.htaccess'), path.join('dist', '.htaccess'));
  fs.copyFileSync(path.join('public', '_redirects'), path.join('dist', '_redirects'));
  
  console.log('Deployment files created successfully in dist directory.');
  console.log('For shared hosting (like SpaceWeb): Upload the contents of the dist folder to your hosting root directory.');
  console.log('For Node.js hosting: Upload the dist folder and run "npm install" followed by "node server.js".');
  console.log('\nПОДСКАЗКА: Для успешной работы на простом хостинге, загружайте все файлы из папки dist, а не исходные файлы проекта.');
} catch (err) {
  console.warn('Warning: Some files could not be copied. This is OK if you\'re not using all hosting types.');
}

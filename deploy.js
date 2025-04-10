
const fs = require('fs');
const path = require('path');

// Create a package.json specifically for deployment
const packageJson = {
  "name": "volunteer-activity-tracker",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "preview": "vite preview"
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
app.use(express.static('dist'));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(resolve(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
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

// Copy htaccess and redirects
try {
  fs.copyFileSync(path.join('public', '.htaccess'), path.join('dist', '.htaccess'));
  fs.copyFileSync(path.join('public', '_redirects'), path.join('dist', '_redirects'));
  console.log('Deployment files created successfully in dist directory.');
  console.log('For shared hosting (like SpaceWeb): Upload the contents of the dist folder to your hosting root directory.');
  console.log('For Node.js hosting: Upload the dist folder and run "npm install" followed by "node server.js".');
} catch (err) {
  console.warn('Warning: Some files could not be copied. This is OK if you\'re not using all hosting types.');
}

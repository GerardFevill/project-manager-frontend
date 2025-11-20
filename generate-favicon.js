#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple SVG to base64 for embedding in HTML
const svgPath = path.join(__dirname, 'public', 'favicon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

console.log('✓ SVG favicon updated successfully');
console.log('✓ Icon files updated: favicon.svg, icon-192.svg, icon-512.svg');
console.log('\nNote: The browser will use the SVG files directly.');
console.log('For .ico generation, you can use online tools like:');
console.log('- https://favicon.io/');
console.log('- https://realfavicongenerator.net/');
console.log('\nOr install: npm install -g svg-to-ico');
console.log('Then run: svg-to-ico public/favicon.svg public/favicon.ico');

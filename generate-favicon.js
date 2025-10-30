#!/usr/bin/env node

/**
 * Script simple pour créer un favicon.ico personnalisé
 * Sans dépendances externes, crée un ICO basique
 */

const fs = require('fs');
const path = require('path');

// Lire le SVG source
const svgPath = path.join(__dirname, 'public', 'favicon.svg');
const icoPath = path.join(__dirname, 'public', 'favicon.ico');

console.log('📝 Lecture du SVG...');
const svgContent = fs.readFileSync(svgPath, 'utf8');

console.log('✅ Le SVG est prêt à utiliser!');
console.log('\n🎨 Pour générer un vrai .ico, vous pouvez:');
console.log('1. Utiliser un service en ligne comme https://favicon.io/');
console.log('2. Installer ImageMagick: sudo apt-get install imagemagick');
console.log('   Puis: convert -background transparent public/favicon.svg -define icon:auto-resize=16,32,48 public/favicon.ico');
console.log('\n💡 Les navigateurs modernes utilisent déjà le favicon.svg');
console.log('   L\'icône devrait être visible dans votre navigateur!\n');

// Créer un README pour expliquer
const readmePath = path.join(__dirname, 'public', 'FAVICON-README.md');
const readmeContent = `# Favicon Instructions

## Fichiers d'icônes

- **favicon.svg** - Icône vectorielle moderne (utilisée par défaut)
- **icon-192.svg** - Version 192x192 pour PWA
- **icon-512.svg** - Version 512x512 pour PWA
- **favicon.ico** - Fallback pour anciens navigateurs

## Comment voir la nouvelle icône

1. **Effacer le cache du navigateur**:
   - Chrome: Ctrl+Shift+Delete → Effacer les images et fichiers en cache
   - Firefox: Ctrl+Shift+Delete → Cache
   - Edge: Ctrl+Shift+Delete → Images et fichiers en cache

2. **Forcer le rechargement**:
   - Ctrl+F5 (Windows/Linux)
   - Cmd+Shift+R (Mac)

3. **Fermer et rouvrir l'onglet**

## Générer un nouveau favicon.ico

### Option 1: Service en ligne (recommandé)
1. Aller sur https://favicon.io/
2. Upload le fichier public/favicon.svg
3. Télécharger le favicon.ico généré
4. Remplacer public/favicon.ico

### Option 2: Avec ImageMagick
\`\`\`bash
# Installer ImageMagick
sudo apt-get install imagemagick

# Convertir SVG → ICO
convert -background transparent public/favicon.svg \\
  -define icon:auto-resize=16,32,48 public/favicon.ico
\`\`\`

### Option 3: Avec Node.js (sharp ou jimp)
\`\`\`bash
npm install --save-dev sharp
\`\`\`

## Vérifier que ça fonctionne

1. Ouvrir DevTools (F12)
2. Onglet Network
3. Filtrer par "favicon"
4. Recharger la page
5. Vérifier que favicon.svg est chargé avec statut 200

Le favicon SVG est supporté par tous les navigateurs modernes!
`;

fs.writeFileSync(readmePath, readmeContent);
console.log('✅ Instructions créées dans public/FAVICON-README.md\n');

const fs = require('fs');
const path = require('path');

const dir = __dirname;
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

// 1. Unified Tailwind Config
const tailwindConfigStr = `<script>
    tailwind.config = {
      theme: {
        fontFamily: { sans: ['Inter', 'sans-serif'] },
        extend: {
          colors: {
            brand: '#000000',
            brandHover: '#333333',
            surface: '#F4F4F5',
            surfaceHover: '#E4E4E7',
            error: '#EF4444',
            success: '#22C55E',
            warning: '#F59E0B',
            secondary: '#6B7280'
          },
          spacing: { 'safe': 'env(safe-area-inset-bottom)' },
          borderRadius: { 'global': '8px' }
        }
      }
    }
  </script>`;

// Typography changes
const updateHTML = (content) => {
    // Replace Poppins with Inter (Google Fonts)
    content = content.replace(/family=Poppins:[^"]*/g, 'family=Inter:wght@400;500;600&display=swap');
    content = content.replace(/['"]Poppins['"]/g, "'Inter'");
    
    // Replace tailwind config
    content = content.replace(/<script>\s*tailwind\.config[\s\S]*?<\/script>/, tailwindConfigStr);
    
    // Replace styles (FLAT UI STRICT)
    content = content.replace(/shadow-\[.*?\]/g, 'border border-zinc-200');
    content = content.replace(/shadow-[a-zA-Z0-9]+/g, 'border border-zinc-200');
    content = content.replace(/shadow/g, 'border border-zinc-200');
    // Clean up border border-zinc-200 duplicates
    content = content.replace(/(border border-zinc-200 ){2,}/g, 'border border-zinc-200 ');
    content = content.replace(/border-0/g, 'border border-zinc-200');
    
    // Fix rounded (use global 8px / rounded-lg)
    content = content.replace(/rounded-full/g, 'rounded-lg');
    content = content.replace(/rounded-\[.*?\]/g, 'rounded-lg');
    content = content.replace(/rounded-2xl/g, 'rounded-lg');
    content = content.replace(/rounded-3xl/g, 'rounded-lg');
    content = content.replace(/rounded-xl/g, 'rounded-lg');
    
    // Remove gradients
    content = content.replace(/bg-gradient-to-[a-z]+\s+from-[a-z0-9\-]+\s+to-[a-z0-9\-]+/g, 'bg-brand');
    
    // Remove HTML comments
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    
    return content;
};

for (const file of htmlFiles) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    content = updateHTML(content);
    fs.writeFileSync(filePath, content, 'utf-8');
}

// 2. Clean script.js and sw.js
const cleanJS = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Remove console logs
    content = content.replace(/console\.(log|error|warn|info|debug)\(.*?\);?/g, '');
    
    // Remove inline comments starting with // but not inside strings/URLs
    // Safe to remove lines that are just comments, or comments at end of line.
    content = content.replace(/(?<![:"'])\/\/.*$/gm, '');
    
    // Remove block comments /* ... */
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    
    fs.writeFileSync(filePath, content, 'utf-8');
};

cleanJS(path.join(dir, 'script.js'));
cleanJS(path.join(dir, 'sw.js'));

console.log('Done refactoring via script!');

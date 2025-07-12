const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size} icon:`, error.message);
    }
  }
  
  // Generate additional icons for shortcuts
  const shortcutIcons = [
    { name: 'dashboard', color: '#007bff' },
    { name: 'analytics', color: '#28a745' },
    { name: 'reports', color: '#ffc107' }
  ];
  
  for (const icon of shortcutIcons) {
    const outputPath = path.join(outputDir, `${icon.name}-96x96.png`);
    
    // Create a simple colored square for shortcuts
    const svgBuffer = Buffer.from(`
      <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
        <rect width="96" height="96" rx="12" fill="${icon.color}"/>
        <text x="48" y="55" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">
          ${icon.name.charAt(0).toUpperCase()}
        </text>
      </svg>
    `);
    
    try {
      await sharp(svgBuffer)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${icon.name} shortcut icon`);
    } catch (error) {
      console.error(`❌ Failed to generate ${icon.name} shortcut icon:`, error.message);
    }
  }
  
  console.log('🎉 Icon generation complete!');
}

generateIcons().catch(console.error);
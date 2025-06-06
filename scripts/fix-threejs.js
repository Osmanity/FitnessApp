const fs = require('fs');
const path = require('path');

const threeJsPath = path.join(__dirname, '..', 'node_modules', 'three', 'build', 'three.cjs');

console.log('🔧 Applying Three.js fix for Hermes compatibility...');

try {
  if (!fs.existsSync(threeJsPath)) {
    console.log('❌ Three.js file not found at:', threeJsPath);
    process.exit(1);
  }

  // Read the file
  let content = fs.readFileSync(threeJsPath, 'utf8');
  
  // Apply the fix: add program check before checkShaderErrors
  const originalPattern = /if\s*\(\s*renderer\.debug\.checkShaderErrors\s*\)/g;
  const fixedPattern = 'if ( renderer.debug.checkShaderErrors && program )';
  
  if (content.includes('renderer.debug.checkShaderErrors && program')) {
    console.log('✅ Three.js fix already applied!');
    return;
  }
  
  const matches = content.match(originalPattern);
  if (matches) {
    content = content.replace(originalPattern, fixedPattern);
    
    // Write the fixed content back
    fs.writeFileSync(threeJsPath, content, 'utf8');
    
    console.log(`✅ Three.js fix applied successfully! (${matches.length} occurrence(s) fixed)`);
    console.log('   Fixed: "Cannot read property \'trim\' of undefined" error');
  } else {
    console.log('⚠️  Pattern not found. Three.js might have been updated.');
    console.log('   Manual fix: Find "if ( renderer.debug.checkShaderErrors )" and add "&& program"');
  }
  
} catch (error) {
  console.error('❌ Error applying Three.js fix:', error.message);
  process.exit(1);
} 
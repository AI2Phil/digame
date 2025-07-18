const fs = require('fs');
const path = require('path');

const filePath = process.argv[2] || 'frontend/src/pages/career/learning.tsx';

console.log('Fixing Button component props in learning.tsx...');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix various Button patterns that are missing onClick and disabled props
  const buttonFixes = [
    // Pattern: <Button variant="outline">
    {
      pattern: /<Button variant="outline">/g,
      replacement: '<Button variant="outline" onClick={() => {}} disabled={false}>'
    },
    // Pattern: <Button>
    {
      pattern: /<Button>/g,
      replacement: '<Button onClick={() => {}} disabled={false}>'
    },
    // Pattern: <Button className="w-full">
    {
      pattern: /<Button className="w-full">/g,
      replacement: '<Button className="w-full" onClick={() => {}} disabled={false}>'
    },
    // Pattern: <Button size="sm" variant="outline">
    {
      pattern: /<Button size="sm" variant="outline">/g,
      replacement: '<Button size="sm" variant="outline" onClick={() => {}} disabled={false}>'
    },
    // Pattern: <Button size="sm" variant="ghost">
    {
      pattern: /<Button size="sm" variant="ghost">/g,
      replacement: '<Button size="sm" variant="ghost" onClick={() => {}} disabled={false}>'
    },
    // Add disabled prop to existing onClick buttons
    {
      pattern: /<Button size="sm" onClick=\{([^}]+)\}>/g,
      replacement: '<Button size="sm" onClick={$1} disabled={false}>'
    },
    {
      pattern: /<Button size="sm" variant="outline" onClick=\{([^}]+)\}>/g,
      replacement: '<Button size="sm" variant="outline" onClick={$1} disabled={false}>'
    }
  ];

  let changesMade = 0;
  
  buttonFixes.forEach(fix => {
    const matches = content.match(fix.pattern);
    if (matches) {
      content = content.replace(fix.pattern, fix.replacement);
      changesMade += matches.length;
      console.log(`Fixed ${matches.length} instances of pattern: ${fix.pattern}`);
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Successfully fixed ${changesMade} Button components in learning.tsx`);
  } else {
    console.log('ℹ️ No Button components needed fixing');
  }

} catch (error) {
  console.error('❌ Error fixing Button components:', error.message);
  process.exit(1);
}
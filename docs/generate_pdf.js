const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = path.join(__dirname, 'WORKOUTS_SAAS_BACKEND_BLUEPRINT.html');
const pdfPath = path.join(__dirname, 'WORKOUTS_SAAS_BACKEND_BLUEPRINT.pdf');
const desktopPath = path.join(process.env.USERPROFILE || 'C:\\Users\\yasse', 'Desktop', 'WORKOUTS_SAAS_BACKEND_BLUEPRINT.pdf');

console.log('Generating PDF from:', htmlPath);
console.log('Target PDF path:', pdfPath);

if (!fs.existsSync(chromePath)) {
  console.error('Error: Google Chrome not found at:', chromePath);
  process.exit(1);
}

if (!fs.existsSync(htmlPath)) {
  console.error('Error: HTML file not found at:', htmlPath);
  process.exit(1);
}

const command = `"${chromePath}" --headless --disable-gpu --no-sandbox --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`;

console.log('Running Chrome headless...');
try {
  execSync(command, { stdio: 'inherit' });
  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log(`Success! PDF generated. Size: ${(stats.size / 1024).toFixed(1)} KB`);
    
    // Copy to Desktop
    try {
      fs.copyFileSync(pdfPath, desktopPath);
      console.log('Successfully copied to Desktop:', desktopPath);
    } catch (e) {
      console.warn('Could not copy to Desktop:', e.message);
    }
  } else {
    console.error('Error: PDF file was not created.');
    process.exit(1);
  }
} catch (err) {
  console.error('Execution error:', err);
  process.exit(1);
}

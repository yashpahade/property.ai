const fs = require('fs');

// Read the mockData.ts file
let content = fs.readFileSync('../frontend/src/lib/mockData.ts', 'utf8');

// The file exports MOCK_PROPERTIES, MOCK_LOCALITIES, etc.
// We can strip 'export const ' and eval it or just replace the exports with a module.exports assignment.
// We'll create a temporary JS file, evaluate it, and write it to JSON.

let jsContent = content.replace(/export const/g, 'const');
jsContent += '\nmodule.exports = { MOCK_PROPERTIES, MOCK_LOCALITIES };\n';

fs.writeFileSync('temp_mock.js', jsContent);

const mockData = require('./temp_mock.js');

fs.writeFileSync('mockData.json', JSON.stringify(mockData, null, 2));
console.log('Successfully wrote mockData.json');

// Cleanup
fs.unlinkSync('temp_mock.js');

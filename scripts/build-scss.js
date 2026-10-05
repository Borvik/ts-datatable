const path = require('path');
const fs = require('fs');
const sass = require('sass');
const mkdirp = require('mkdirp');

const rootFolder = path.join(__dirname, '..');
const distFolder = path.join(rootFolder, 'dist');
const rawFile = 'src/library/style.scss';
const actualFile = path.join(rootFolder, rawFile);
const outFile = path.join(rootFolder, 'dist/style.css');
const nodeModulesFolder = path.join(rootFolder, 'node_modules');

if (!fs.existsSync(actualFile)) {
  console.log('No css to build');
  process.exit(0);
}

console.log('Building css');
mkdirp.sync(distFolder);
sass.compileAsync(actualFile, {
  style: 'expanded',
  sourceMap: true,
  loadPaths: [nodeModulesFolder],
}).then((result) => {
  fs.writeFileSync(outFile, result.css);
  fs.writeFileSync(outFile + '.map', JSON.stringify(result.sourceMap));
  console.log('  ...completed');
}).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
const Handlebars = require('handlebars');
const fs = require('node:fs');
const path = require('node:path');

const getFilesRecursively = (folderPath) => {
  let fileList = [];

  const files = fs.readdirSync(folderPath);

  files.forEach((file) => {
    const fullPath = path.join(folderPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      fileList = fileList.concat(getFilesRecursively(fullPath));
    } else {
      fileList.push(fullPath);
    }
  });

  return fileList;
};

const templatePaths = getFilesRecursively(
  path.resolve('src', 'legacy', 'handlebars', 'templates'),
);

const compiledDirPath = path.resolve('src', 'legacy', 'handlebars', 'compiled');

if (fs.existsSync(compiledDirPath)) {
  fs.rmdirSync(compiledDirPath, {
    recursive: true,
  });
}

templatePaths.forEach((templatePath) => {
  const template = fs.readFileSync(templatePath, 'utf8').toString().trim();

  const compiled = Handlebars.precompile(template, {
    knownHelpers: {
      camelCase: true,
      equals: true,
      ifServicesResponse: true,
      ifdef: true,
      notEquals: true,
      transformServiceName: true,
    },
    knownHelpersOnly: true,
    noEscape: true,
    preventIndent: true,
    strict: true,
  });

  const parts = templatePath.split(path.sep);
  const fileName = parts[parts.length - 1];
  const fileNameParts = fileName.split('.');
  const fileNameBase = fileNameParts
    .slice(0, fileNameParts.length - 1)
    .join('.');
  const compiledPath = path.resolve(
    compiledDirPath,
    ...parts.slice(parts.lastIndexOf('templates') + 1, parts.length - 1),
    `${fileNameBase}.js`,
  );

  const compiledDir = path.dirname(compiledPath);

  if (!fs.existsSync(compiledDir)) {
    fs.mkdirSync(compiledDir, { recursive: true });
  }

  fs.writeFileSync(compiledPath, `export default ${compiled};`);
});

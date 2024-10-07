const Handlebars = require('handlebars');
const {
  readFileSync,
  readdirSync,
  statSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  rmdirSync,
} = require('node:fs');
const path = require('node:path');

const getFilesRecursively = (folderPath) => {
  let fileList = [];

  const files = readdirSync(folderPath);

  files.forEach((file) => {
    const fullPath = path.join(folderPath, file);

    if (statSync(fullPath).isDirectory()) {
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

if (existsSync(compiledDirPath)) {
  rmdirSync(compiledDirPath, {
    recursive: true,
  });
}

templatePaths.forEach((templatePath) => {
  const template = readFileSync(templatePath, 'utf8').toString().trim();

  const compiled = Handlebars.precompile(template, {
    knownHelpers: {
      camelCase: true,
      equals: true,
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

  if (!existsSync(compiledDir)) {
    mkdirSync(compiledDir, { recursive: true });
  }

  writeFileSync(compiledPath, `export default ${compiled};`);
});

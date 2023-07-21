const fs = require('fs');
const path = require('path');

/* função  lê o conteúdo de um diretório, filtra os arquivos Markdown e retorna uma Promise que, quando resolvida, 
contém um array de objetos { file, data }, 
onde file é o caminho absoluto para o arquivo Markdown e data é o conteúdo do arquivo.  */

function readMDFilesInDirectory(pathDir) {
  return fs.promises.readdir(pathDir)
    .then(files => {
      const mdFilesPromises = files
        .filter(file => path.extname(file) === '.md')
        .map(file => readDirFile(path.resolve(pathDir, file)));

      return Promise.all(mdFilesPromises);
       /*O Promise.all aguarda todas as 
      Promises dentro do array serem resolvidas antes de resolver a própria Promise 
      retornando um array com os resultados de todas as Promise*/
    });
}

// função que lê o arquivo
function readMDFile(file) {
  const fileMD = path.extname(file) === '.md';
  if (!fileMD) {
    return Promise.reject(new Error('ERROR_FILE_NOT_MD'));
  }

  return fs.promises.readFile(file, 'utf8')
    .then(data => {
      return { file: file, data: data.toString()};
    });
}

// função que passa o caminho do diretório ou arquivo e ela irá ler e processar os arquivos de acordo com a sua estrutura.
function readDirFile(pathFile) {
  return fs.promises.stat(pathFile)
    .then(statsObj => {
      if (statsObj.isDirectory()) {
        return readMDFilesInDirectory (pathFile);
      } else {
        return readMDFile(pathFile);
      }
    });
}

function extractLinksFromMarkdown(markdownContent) {
  const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
  const links = [];

  let match;
  while ((match = linkRegex.exec(markdownContent))) { //loop enquanto a expressão retornar verdadeiro
    const linkText = match[1];
    const linkUrl = match[2];
    links.push({ text: linkText, url: linkUrl });
  }

  return links;
}


readDirFile(__dirname, 'mslink.js')
  .then(result => {
    console.log('Arquivos Markdown encontrados:', result);

    const links = extractLinksFromMarkdown(result[0].data);
    console.log('Links encontrados:', links);   
  })
 

 
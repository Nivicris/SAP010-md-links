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
        return readMDFilesInDirectory(pathFile);
      } else {
        return readMDFile(pathFile)
          .then(fileData => {
            if (!fileData.data.trim()) {
              return { file: pathFile, data: 'O arquivo está vazio.' };
            } else {
              return fileData;
            }
          });
      }
    });
}

function extractLinksFromMarkdown(markdownContent) {
  const textFile = markdownContent.data;
  const regexLink = /\[([^\]]+)\]\(([^\)]+)\)/g;
  const links = [];

  let match;
  while ((match = regexLink.exec(textFile))) {
    const linkText = match[1];
    const linkUrl = match[2];
    links.push({ text: linkText, url: linkUrl });
  }
    return links;
  };

  function validateFunction(links) {
    const promises = links.map(function(element) {
      return fetch(element.url)
        .then(function(response) {
          return {
            ...element,
            status: response.status,
            ok: response.ok,
          };
        })
        .catch(function(error) {
          return {
            ...element,
            status: 'Link error',
            ok: false,
          };
        });
    });
  
    return Promise.all(promises);
  }

  // function mdLinks(pathFile, option) {
  //   return new Promise((resolve, reject) => {
  //     readDirFile(pathFile)
  //       .then(result => {
  //         const linksPromises = result.map(fileContent => {
  //           if (!Array.isArray(fileContent)) {
  //             const linksObj = extractLinksFromMarkdown(fileContent);
  //             if (!option.validate) {
  //               return linksObj;
  //             } else {
  //               return validateFunction(linksObj);
  //             }
  //           } else {
  //             return Promise.resolve(fileContent);
  //           }
  //         });
  
  //         Promise.all(linksPromises)
  //           .then(linksArrays => {
  //             const allLinks = linksArrays.flat();
  //             resolve(allLinks);
  //           })
  //           .catch(reject);
  //       })
  //       .catch(reject);
  //   });
  // }

 
  readDirFile(__dirname, 'mdlink.js')
  .then(result => {
    console.log('Arquivos Markdown encontrados:', result);

    
    const markdownContent = result[0];

    const links = extractLinksFromMarkdown(markdownContent);
    if (links.length === 0) {
      console.log('O arquivo não contém links.');
    } else {
      console.log('Links encontrados:', links);
      validateFunction(links)
        .then(validatedLinks => {
          console.log('Links validados:', validatedLinks);
        })
        .catch(error => {
          console.error('Erro ao validar os links:', error);
        });
    }
  })
  .catch(error => {
    console.error('Erro ao ler o arquivo ou diretório:', error);
  });
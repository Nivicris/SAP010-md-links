// const { fail } = require('assert');
const fs = require("fs");
const path = require("path");

/* função  lê o conteúdo de um diretório, filtra os arquivos Markdown e retorna uma Promise que, quando resolvida, 
contém um array de objetos { file, data }, 
onde file é o caminho absoluto para o arquivo Markdown e data é o conteúdo do arquivo.  */

function readMDFilesInDirectory(pathDir) {
  return fs.promises.readdir(pathDir).then((files) => {
    const mdFilesPromises = files
      .filter((file) => path.extname(file) === ".md")
      .map((file) => readDirFile(path.resolve(pathDir, file)));

    return Promise.all(mdFilesPromises);
    /*O Promise.all aguarda todas as 
      Promises dentro do array serem resolvidas antes de resolver a própria Promise 
      retornando um array com os resultados de todas as Promise*/
  });
}

// // função que lê o arquivo
function readMDFile(file) {
  const fileMD = path.extname(file) === ".md";
  if (!fileMD) {
    return Promise.reject(new Error("ERROR_FILE_NOT_MD"));
  }

  return fs.promises.readFile(file, "utf8").then((data) => {
    return { file: file, data: data.toString() };
  });
}

// // função que passa o caminho do diretório ou arquivo e ela irá ler e processar os arquivos de acordo com a sua estrutura.
function readDirFile(pathFile) {
  return fs.promises.stat(pathFile).then((statsObj) => {
    if (statsObj.isDirectory()) {
      return readMDFilesInDirectory(pathFile);
    } else {
      return readMDFile(pathFile).then((fileData) => {
        if (!fileData.data.trim()) {
          return { file: pathFile, data: "O arquivo está vazio." };
        } else {
          return fileData;
        }
      });
    }
  });
}

function extractLinksFromMarkdown(markdownContent, pathFile) {
  const file = markdownContent.data;
  const regexLink = /\[([^\]]+)\]\(([^\)]+)\)/g;
  const links = [];

  let match;
  while ((match = regexLink.exec(file))) {
    const linkText = match[1];
    const linkUrl = match[2];
    links.push({ text: linkText, href: linkUrl, file: pathFile });
  }
  return links;
}

function validateFunction(links) {
  const promises = links.map(function (element) {
    return fetch(element.href)
      .then(function (response) {
        return {
          ...element,
          status: response.status,
          ok: response.ok ? "ok" : "fail",
        };
      })
      .catch(function (error) {
        return {
          ...element,
          status: 404,
          ok: "fail",
        };
      });
  });

  return Promise.all(promises);
}

function mdLinks(path, options = { validate: true }) {
  return readDirFile(path).then((resolve) => {
    const dataArray = Array.isArray(resolve) ? resolve : [resolve];
    const linksPromises = dataArray.flatMap((fileContent) => {
      const linksObj = extractLinksFromMarkdown(fileContent, fileContent.file);
      return options.validate ? validateFunction(linksObj) : linksObj;
    });

    return Promise.all(linksPromises).then((linksArrays) => {
      const allLinks = linksArrays.flat();
      return allLinks;
    });
  });
}

// mdLinks('./src', option = { validate: true })
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

module.exports = {
  readMDFilesInDirectory,
  readMDFile,
  readDirFile,
  extractLinksFromMarkdown,
  validateFunction,
  mdLinks,
};

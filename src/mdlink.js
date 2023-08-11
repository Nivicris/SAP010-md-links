const fs = require("fs");
const path = require("path");

// função que lê o diretório
function readMDFilesInDirectory(pathDir) {
  return fs.promises.readdir(pathDir).then((files) => { //objeto promises do modulo Fs
    const mdFilesPromises = files
      .filter((file) => path.extname(file) === ".md")
      .map((file) => readDirFile(path.resolve(pathDir, file))); //path.resolve caminho absoluto completo do diretorio e arquivo

    return Promise.all(mdFilesPromises);
    /*O Promise.all aguarda todas as 
      Promises dentro do array serem resolvidas antes de resolver a própria Promise 
      retornando um array com os resultados de todas as Promise*/
  });
}

// função que lê o arquivo
function readMDFile(file) {
  const fileMD = path.extname(file) === ".md";
  if (!fileMD) {
    return Promise.reject(new Error("ERROR_FILE_NOT_MD"));
  }

  return fs.promises.readFile(file, "utf8").then((data) => {
    return { file: file, data: data.toString() };
  });
}

// função que passa o caminho do diretório ou arquivo e ela irá ler e processar os arquivos de acordo com a sua estrutura.
function readDirFile(pathFile) {
  return fs.promises.stat(pathFile).then((statsObj) => {  //fs.promises.stat Ela é usada para obter informações sobre um arquivo ou diretório específico
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
 
// função para extrair os links do arquivo .md
function extractLinksFromMarkdown(markdownContent, pathFile) {
  const file = markdownContent.data;
  const regexLink = /\[([^\]]+)\]\(([^\)]+)\)/g;
  const links = [];

  let match;
  while ((match = regexLink.exec(file))) { //loop que vai executar enquanto regexLink for verdadeira
    const linkText = match[1]; //extrai o texto do link encontrado pela expressão regular e armazena na variável
    const linkUrl = match[2]; //extrai o URL do link encontrado pela expressão regular e armazena na variável
    links.push({ text: linkText, href: linkUrl, file: pathFile });
  }
  return links;
}

//função para validar os links 
function validateFunction(links) {
  // Cria um array de promessas, uma para cada link
  const promises = links.map((element) => {
    return fetch(element.href)
    // Para cada link, faz uma requisição HTTP usando fetch
      .then(function (response) {
        // Quando a requisição é bem-sucedida, cria um objeto com informações do link e status
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
    //Se resolve for um array, dataArray recebe o próprio resolve, caso contrário, ele cria um array contendo resolve.
    const linksPromises = dataArray.flatMap((fileContent) => {
      const linksObj = extractLinksFromMarkdown(fileContent, fileContent.file);
      return options.validate ? validateFunction(linksObj) : linksObj;
    });

    return Promise.all(linksPromises).then((linksArrays) => {
      const allLinks = linksArrays.flat(); //flat() é usado para "achatar" esse array de arrays em um único array, que contém todos os links.
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

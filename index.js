
const fs = require('fs');
const path = require ('path');

console.log (path.basename(__filename));

console.log (path.dirname(__filename));

console.log(path.extname('READEME.md'));

// regex = /\[([^\]]+)\]\((http[s]?:\/\/[^\)]+)\)/gm // verifica padrões de link markdown

// function fileMD(file) {
//   const extensao = path.extname(file); //é usado para verificar a extensão do arquivo
  
//   if (extensao !== '.md') {
//     console.log('O arquivo fornecido não é um arquivo Markdown.');
//     return;
//   }
// }
// fileMD();


//   fs.readFile(file, 'utf8', (err, data) => {
//     if (err) {
//       console.error('Erro ao ler o arquivo:', err);
//       return;
//     }  
// })
// }

// module.exports = fileMD;
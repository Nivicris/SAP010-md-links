const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const {readMDFilesInDirectory}= require('../src/mdlink');

describe('readMDFilesInDirectory', () => {
  // Crie um diretório temporário e alguns arquivos para teste antes de cada caso de teste
  beforeEach(async () => {
    await fse.ensureDir('./tempDir');
    await fse.writeFile('./tempDir/file1.md', 'conteúdo do arquivo 1');
    await fse.writeFile('./tempDir/file2.js', 'conteúdo do arquivo 2');
    await fse.writeFile('./tempDir/file3.md', 'conteúdo do arquivo 3');
  });

  // Exclua o diretório temporário após cada caso de teste
  afterEach(async () => {
    await fse.remove('./tempDir');
  });

  it('deve filtrar apenas os arquivos Markdown', () => {
    const pathDir = './tempDir';
    return readMDFilesInDirectory(pathDir).then((result) => {
      // Verifique se apenas os arquivos Markdown foram filtrados
      expect(result.length).toBe(2);
      expect(result[0].file).toEqual(expect.stringContaining(pathDir));
      expect(result[1].file).toEqual(expect.stringContaining(pathDir));
    });
  });

  // Adicione mais testes aqui, por exemplo, para verificar o comportamento quando o diretório está vazio.
});


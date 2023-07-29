const fs = require('fs');
const path = require('path');
const {
  readMDFilesInDirectory,
  readMDFile, 
  readDirFile,
  extractLinksFromMarkdown
 }= require('../src/mdlink');


describe('Testes das função da pasta mdlink.js', () => {
  test('Deve ler o conteúdo de um diretório', () => {
    const testDir = path.join(__dirname, '..', 'src');
  return readMDFilesInDirectory(testDir)
      .then(result => {
        // Verifique se o resultado é um array
        expect(Array.isArray(result)).toBe(true);

        // Verifique se o array contém o  arquivo "test.md"
        const testMDFile = result.find(file => file.file === path.join(testDir, 'test.md'));
        expect(testMDFile).toBeDefined();
        // Verifique se o array contém arquivo "vazio.md"
        const vazioMDContents = result.find(file => file.file === path.join(testDir, 'vazio.md'));
        expect(vazioMDContents.data).toBeDefined();
      });
  });

  test('Deve ler o conteúdo do arquivo Markdown', () => {
    const testFile = path.join(__dirname, '..', 'src', 'test.md'); // Caminho para o arquivo test.md

    return readMDFile(testFile)
      .then(result => {
        // Verifique se o resultado é um objeto com as propriedades corretas
        expect(result).toHaveProperty('file', testFile);
        expect(result).toHaveProperty('data');
      });
  });

  test('Deve rejeitar a promessa se o arquivo não for um Markdown', () => {
    const invalidFile = path.join(__dirname, '..', 'src', 'cli.js'); // Caminho para o arquivo cli.js (não é um Markdown)

    return expect(readMDFile(invalidFile)).rejects.toThrowError('ERROR_FILE_NOT_MD');
  });

  test('Deve retornar "O arquivo está vazio." para um arquivo vazio', () => {
    const emptyFile = path.join(__dirname, '..', 'src', 'vazio.md'); // Caminho para o arquivo vazio.md (arquivo vazio)

    return readDirFile(emptyFile)
      .then(result => {
        // Verifique se o resultado é um objeto com a propriedade "data" contendo a mensagem "O arquivo está vazio."
        expect(result).toHaveProperty('data', 'O arquivo está vazio.');
      });
  });

  test('Deve rejeitar a promessa se o caminho não for válido', () => {
    const invalidPath = path.join(__dirname, '..', 'src', 'invalid-file.md'); // Caminho inválido (arquivo não existe)

    return expect(readDirFile(invalidPath)).rejects.toThrowError('ENOENT');
  });

  test('Deve extrair os links do conteúdo do arquivo Markdown', () => {
    const markdownContent = {
      data: `Este é um arquivo Markdown com alguns links:
        [Google](https://www.google.com/)
        [OpenAI](https://openai.com/)
        [GitHub](https://github.com/)
      `,
    };
    const pathFile = './src/test.md';

    const result = extractLinksFromMarkdown(markdownContent, pathFile);

    expect(result).toEqual([
      { text: 'Google', url: 'https://www.google.com/', file: pathFile },
      { text: 'OpenAI', url: 'https://openai.com/', file: pathFile },
      { text: 'GitHub', url: 'https://github.com/', file: pathFile },
    ]);
  });

  test('Deve retornar um array vazio se não houver links no conteúdo do arquivo Markdown', () => {
    const markdownContent = {
      data: `Este é um arquivo Markdown sem links.`,
    };
    const pathFile = './src/vazio.md';

    const result = extractLinksFromMarkdown(markdownContent, pathFile);

    expect(result).toEqual([]);
  });
});


 



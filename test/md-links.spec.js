const fs = require("fs");
const path = require("path");
const {
  readMDFilesInDirectory,
  readMDFile,
  readDirFile,
  extractLinksFromMarkdown,
  validateFunction,
  mdLinks,
} = require("../src/mdlink");

describe("Testes das função readMDFilesInDirectory,readMDFile, readDirFile", () => {
  test("Deve ler o conteúdo de um diretório", () => {
    const testDir = path.join(__dirname, "..", "src"); //criar um caminho de arquivo ou diretório
    return readMDFilesInDirectory(testDir).then((result) => {
      // Verifique se o resultado é um array
      expect(Array.isArray(result)).toBe(true);

      // Verifique se o array contém o  arquivo "test.md"
      const testMDFile = result.find(
        (file) => file.file === path.join(testDir, "test.md")
      );
      expect(testMDFile).toBeDefined();
      // Verifique se o array contém arquivo "vazio.md"
      const vazioMDContents = result.find(
        (file) => file.file === path.join(testDir, "vazio.md")
      );
      expect(vazioMDContents.data).toBeDefined();
    });
  });

  test("Deve ler o conteúdo do arquivo Markdown", () => {
    const testFile = path.join(__dirname, "..", "src", "test.md"); // Caminho para o arquivo test.md

    return readMDFile(testFile).then((result) => {
      // Verifique se o resultado é um objeto com as propriedades corretas
      expect(result).toHaveProperty("file", testFile);
      expect(result).toHaveProperty("data");
    });
  });

  test("Deve rejeitar a promessa se o arquivo não for um Markdown", () => {
    const invalidFile = path.join(__dirname, "..", "src", "cli.js"); // Caminho para o arquivo cli.js (não é um Markdown)

    return expect(readMDFile(invalidFile)).rejects.toThrowError(
      "ERROR_FILE_NOT_MD"
    );
  });

  test('Deve retornar "O arquivo está vazio." para um arquivo vazio', () => {
    const emptyFile = path.join(__dirname, "..", "src", "vazio.md"); // Caminho para o arquivo vazio.md (arquivo vazio)

    return readDirFile(emptyFile).then((result) => {
      // Verifique se o resultado é um objeto com a propriedade "data" contendo a mensagem "O arquivo está vazio."
      expect(result).toHaveProperty("data", "O arquivo está vazio.");
    });
  });

  test("Deve rejeitar a promessa se o caminho não for válido", () => {
    const invalidPath = path.join(__dirname, "..", "src", "invalid-file.md"); // Caminho inválido (arquivo não existe)

    return expect(readDirFile(invalidPath)).rejects.toThrowError("ENOENT");
  });
});

describe("Teste da função extractLinksFromMarkdown", () => {
  test("Deve extrair os links do conteúdo do arquivo Markdown", () => {
    const markdownContent = {
      data: `Este é um arquivo Markdown com alguns links:
        [Google](https://www.google.com/)
        [OpenAI](https://openai.com/)
        [GitHub](https://github.com/)
      `,
    };
    const pathFile = "./src/test.md";

    const result = extractLinksFromMarkdown(markdownContent, pathFile);

    expect(result).toEqual([
      { text: "Google", href: "https://www.google.com/", file: pathFile },
      { text: "OpenAI", href: "https://openai.com/", file: pathFile },
      { text: "GitHub", href: "https://github.com/", file: pathFile },
    ]);
  });

  test("Deve retornar um array vazio se não houver links no conteúdo do arquivo Markdown", () => {
    const markdownContent = {
      data: `Este é um arquivo Markdown sem links.`,
    };
    const pathFile = "./src/vazio.md";

    const result = extractLinksFromMarkdown(markdownContent, pathFile);

    expect(result).toEqual([]);
  });

  describe("Teste da função validateFunction", () => {
    test("Deve validar corretamente os links", () => {
      const links = [
        {
          text: "Google",
          href: "http://google.com/",
          file: "./src/test.md",
        },
        {
          text: "OpenAI",
          href: "https://openai.com/",
          file: "./src/test.md",
        },
        {
          text: "GitHub",
          href: "https://github.com/",
          file: "./src/test.md",
        },
      ];

      // Simulando as requisições HTTP usando a biblioteca node-fetch      
      const fetchMock = jest.fn().mockResolvedValue({ status: 200, ok: true });

      // Substituindo a função fetch pela implementação de mock
      global.fetch = fetchMock;

      return validateFunction(links).then((result) => {
        expect(result).toEqual([
          {
            text: "Google",
            href: "http://google.com/",
            file: "./src/test.md",
            status: 200,
            ok: "ok",
          },
          {
            text: "OpenAI",
            href: "https://openai.com/",
            file: "./src/test.md",
            status: 200,
            ok: "ok",
          },
          {
            text: "GitHub",
            href: "https://github.com/",
            file: "./src/test.md",
            status: 200,
            ok: "ok",
          },
        ]);

        // Verificando se a função fetch foi chamada três vezes com os URLs corretos
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(fetchMock).toHaveBeenCalledWith("http://google.com/");
        expect(fetchMock).toHaveBeenCalledWith("https://openai.com/");
        expect(fetchMock).toHaveBeenCalledWith("https://github.com/");
      });
    });

    
    test("Deve lidar corretamente com links inválidos", () => {
      // Links para validar 
      const links = [
        {
          text: "Sitio oficial de npm (em inglês)",
          href: "https://www.npmjs.@@@@com/",
          file: "/src/test.md",
        },
      ];

      // Simulando uma requisição HTTP falha usando a biblioteca node-fetch
      const fetchMock = jest.fn().mockRejectedValue({ status: 404 });

      // Substituindo a função fetch pela implementação de mock
      global.fetch = fetchMock;

      return validateFunction(links).then((result) => {
        expect(result).toEqual([
          {
            text: "Sitio oficial de npm (em inglês)",
            href: "https://www.npmjs.@@@@com/",
            file: "/src/test.md",
            status: 404,
            ok: "fail",
          },
        ]);

        // Verificando se a função fetch foi chamada uma vez com o URL correto
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith("https://www.npmjs.@@@@com/");
      });
    });
  });
});

describe('Teste da função mdLinks', () => {
test("Deve retornar os links com validação", () => {
  const fetchMockResponse = (status, ok) => {
    return Promise.resolve({
      status: status,
      ok: ok,
    });
  };

  global.fetch = jest.fn().mockImplementation((href) => {
    if (href === "https://jestjs.io/docs/pt-BR/getting-started") {
      return fetchMockResponse(200, true);
    } else if (href === "https://www.npmjs.@@@@com/") {
      return fetchMockResponse(404, false);
    } else if (href === "https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status") {
      return fetchMockResponse(200, true);
    } else if (href === "http://google.com/") {
      return fetchMockResponse(200, true);
    } 
  });

  return mdLinks("./src/test.md", { validate: true }).then((result) => {
    expect(result).toEqual([
      {
        href: "https://jestjs.io/docs/pt-BR/getting-started",
        text: "Introdução ao Jest - Documentação oficial",
        file: "./src/test.md",
        status: 200,
        ok: "ok",
      },
      {
        href: "https://www.npmjs.@@@@com/",
        text: "Sitio oficial de npm (em inglês)",
        file: "./src/test.md",
        status: 404,
        ok: "fail",
      },
      {
        href: "https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status",
        text: "Códigos de status de respostas HTTP - MDN",
        file: "./src/test.md",
        status: 200,
        ok: "ok",
      },
      {
        href: "http://google.com/",
        text: "google",
        file: "./src/test.md",
        status: 200,
        ok: "ok",
      },
    ]);
  });
});

test("deve retornar os links sem validação", () => {
  return mdLinks("./src/test.md", { validate: false }).then((result) => {
    expect(result).toEqual([
      {
        href: "https://jestjs.io/docs/pt-BR/getting-started",
        text: "Introdução ao Jest - Documentação oficial",
        file: "./src/test.md"        
      },
      {
        href: "https://www.npmjs.@@@@com/",
        text: "Sitio oficial de npm (em inglês)",
        file: "./src/test.md"        
      },
      {
        href: "https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status",
        text: "Códigos de status de respostas HTTP - MDN",
        file: "./src/test.md"        
      },
      {
        href: "http://google.com/",
        text: "google",
        file: "./src/test.md"        
      },
    ]);
  });
});
test("deve retornar os links sem validação", () => {
  const arquivo = path.join(__dirname, "..", "src", "test.md");
  return mdLinks("./src", { validate: false }).then((result) => {
    expect(result).toEqual([
      {
        href: "https://jestjs.io/docs/pt-BR/getting-started",
        text: "Introdução ao Jest - Documentação oficial",
        file: arquivo        
      },
      {
        href: "https://www.npmjs.@@@@com/",
        text: "Sitio oficial de npm (em inglês)",
        file: arquivo        
      },
      {
        href: "https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status",
        text: "Códigos de status de respostas HTTP - MDN",
        file: arquivo        
      },
      {
        href: "http://google.com/",
        text: "google",
        file: arquivo        
      },
    ]);
  });
});
test("deve retornar os links sem validação", () => {
  const arquivo = path.join(__dirname, "..", "src", "test.md");
  return mdLinks("./src", { validate: true }).then((result) => {
    expect(result).toEqual([
      {
        href: "https://jestjs.io/docs/pt-BR/getting-started",
        text: "Introdução ao Jest - Documentação oficial",
        file: arquivo,
        status: 200,
        ok: "ok",      
      },
      {
        href: "https://www.npmjs.@@@@com/",
        text: "Sitio oficial de npm (em inglês)",
        file: arquivo,
        status: 404,
        ok: "fail",     
      },
      {
        href: "https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status",
        text: "Códigos de status de respostas HTTP - MDN",
        file: arquivo, 
        status: 200,   
        ok: "ok",
      },
      {
        href: "http://google.com/",
        text: "google",
        file: arquivo,   
        status: 200,
        ok: "ok",    
      },
    ]);
  });
});
})

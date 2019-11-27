import fs from "fs";
import path from "path";

let gameXML: XMLDocument;

function folderTree(directory: string) {
  let files: string[] = [];

  fs.readdirSync(directory).forEach((file: string) => {
    const newPath = path.join(directory, file);

    if (fs.statSync(newPath).isDirectory()) {
      files = files.concat(folderTree(newPath));
    } else {
      if (path.extname(file) === ".xml") files.push(newPath);
    }
  });

  return files;
}

function xmlNode(file: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(fs.readFileSync(file, "utf8"), "text/xml");

  return document.getElementsByTagName(document.documentElement.nodeName)[0];
}

function readGameXML(gameFiles: string[]) {
  let XMLDocument = document.implementation.createDocument(null, "config", null);

  gameFiles.forEach(file => {
    XMLDocument.documentElement.append(xmlNode(file));
  });

  return XMLDocument;
}

function evaluateXPath(xpath: string, newValue: string | null): string | undefined {
  let nodes = [];

  const result = gameXML.evaluate(xpath, gameXML, null, XPathResult.ANY_TYPE, null);
  let xmlItem = result.iterateNext();

  while (xmlItem) {
    nodes.push(xmlItem);
    xmlItem = result.iterateNext();
  }

  if (!nodes.length) return `Could not apply ${xpath}`;
  if (newValue !== null) nodes.forEach(node => (node.nodeValue = newValue));
}

export default function validateXML(options: { gameFolder: string; modletFolder: string }) {
  const { gameFolder, modletFolder } = options;

  console.info("Running XML Validation against", modletFolder);

  return new Promise<string[]>((resolve, reject) => {
    let errorArray: string[] = [];

    gameXML = readGameXML(folderTree(path.join(gameFolder, "Data", "Config")));

    folderTree(path.join(modletFolder, "Config")).forEach((file: string) => {
      const node = xmlNode(file);

      if (node) {
        const set = node.getElementsByTagName("set");

        if (set.length) {
          Array.from(set).forEach(setItem => {
            const fileXPath = setItem.getAttribute("xpath");
            const newValue = setItem.textContent;

            if (fileXPath) {
              // xpath must begin with '//' to match items in gameXML
              const xpath = fileXPath.replace(/^\/*(\w+)/, "//$1");

              let result = evaluateXPath(xpath, newValue);
              if (result) errorArray.push(result);
            }
          });
        }
      } else {
        reject(new Error(`Could not read XML Node from ${file}`));
      }
    });

    console.info("Returning with", errorArray.length ? "errors!" : "no errors");

    resolve(errorArray);
  });
}

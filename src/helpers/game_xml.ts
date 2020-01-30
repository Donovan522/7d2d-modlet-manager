import fs from "fs";
import path from "path";

export default class GameXML {
  private _gameFolder: string;
  private _configFolder: string;
  private _gameXML: XMLDocument;
  private _gameXMLCache: XMLDocument;

  constructor(gameFolder: string) {
    this._gameFolder = gameFolder;
    this._configFolder = path.normalize(path.join(this._gameFolder, "Data", "Config"));
    this._gameXML = this.readGameXML(this.folderTree(this._configFolder));
    this._gameXMLCache = this.copyXMLDocument(this._gameXML);
  }

  private copyXMLDocument(doc: XMLDocument) {
    const newDoc = doc.implementation.createDocument(doc.namespaceURI, null, null);
    const newNode = newDoc.importNode(doc.documentElement, true);

    newDoc.appendChild(newNode);

    return newDoc;
  }

  private folderTree(directory: string) {
    let files: string[] = [];

    fs.readdirSync(directory).forEach((file: string) => {
      const newPath = path.join(directory, file);

      if (fs.statSync(newPath).isDirectory()) {
        files = files.concat(this.folderTree(newPath));
      } else {
        if (path.extname(file) === ".xml") files.push(newPath);
      }
    });

    return files;
  }

  private xmlNode(file: string) {
    const parser = new DOMParser();
    const document = parser.parseFromString(fs.readFileSync(file, "utf8"), "text/xml");

    return document.getElementsByTagName(document.documentElement.nodeName)[0];
  }

  private readGameXML(gameFiles: string[]): XMLDocument {
    let xml: XMLDocument = document.implementation.createDocument(null, "config", null);

    gameFiles.forEach(file => {
      xml.documentElement.append(this.xmlNode(file));
    });

    return xml;
  }

  private evaluateXPath(
    command: string,
    xpath: string,
    newValue: string | NodeListOf<ChildNode> | null
  ): string | undefined {
    let nodes = [];

    const result = this._gameXML.evaluate(xpath, this._gameXML, null, XPathResult.ANY_TYPE, null);
    let xmlItem = result.iterateNext();

    while (xmlItem) {
      nodes.push(xmlItem);
      xmlItem = result.iterateNext();
    }

    if (!nodes.length) return `Could not apply ${xpath}`;
    if (command === "set" && newValue && typeof newValue === "string")
      nodes.forEach(node => (node.nodeValue = newValue));
    if (command === "append" && newValue && typeof newValue !== "string") {
      nodes.forEach(node => {
        newValue.forEach((child: ChildNode) => {
          if (node.parentNode) node.appendChild(child);
        });
      });
    }
    if (command === "remove") {
      nodes.forEach(node => {
        if (node.parentNode) node.parentNode.removeChild(node);
      });
    }
  }

  public reset(hard: boolean = false) {
    if (hard) this._gameXMLCache = this.readGameXML(this.folderTree(this._configFolder));
    this._gameXML = this.copyXMLDocument(this._gameXMLCache);
    console.log(`Resetting gameXML (${hard ? "hard" : "soft"})`);
  }

  public validate(modlet: Modlet): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      let errorArray: string[] = [];
      let commandArray = ["set", "append", "remove"];

      this.folderTree(path.join(modlet.modInfo.folderPath, "Config")).forEach((file: string) => {
        const node = this.xmlNode(file);

        if (node) {
          Array.from(node.childNodes).forEach(childNode => {
            const command = childNode.nodeName;
            let newValue = null;

            if (commandArray.includes(command)) {
              let fileXPath;

              if (command === "set") newValue = childNode.textContent;
              if (command === "append") {
                newValue = childNode.childNodes;
              }

              if (childNode.childNodes[0] && childNode.childNodes[0].parentElement)
                fileXPath = childNode.childNodes[0].parentElement.getAttribute("xpath");

              if (fileXPath) {
                // xpath must begin with '//' to match items in gameXML
                const xpath = fileXPath.replace(/^\/*(\w+)/, "//$1");

                let result = this.evaluateXPath(command, xpath, newValue);
                if (result) errorArray.push(result);
              }
            }
          });
        } else {
          reject(new Error(`Could not read XML Node from ${file}`));
        }
      });

      resolve(errorArray);
    });
  }
}

import fs from "fs";
import path from "path";
import { Parser } from "xml2js";

export default class Modlet {
  author: string;
  compat: string;
  description: string;
  enabled: boolean;
  errors: string[];
  modInfoFile: string;
  modInfoXML: string;
  name: string;
  version: string;

  constructor(file: string) {
    let xml: any | undefined;

    if (fs.existsSync(file)) {
      const xmlparser = new Parser({
        trim: true,
        normalizeTags: true,
        explicitRoot: false,
        explicitArray: false
      });

      xmlparser.parseString(fs.readFileSync(file, "utf8"), (err: Error, xmlfile: any) => {
        if (err) {
          console.log("ERROR:", err);
          this.name = "Not a valid modlet";
          return;
        }

        xml = xmlfile.modinfo;
      });
    }

    this.author = Modlet._getXMLValue(xml, "author");
    this.compat = Modlet._getXMLValue(xml, "version", "compat");
    this.description = Modlet._getXMLValue(xml, "description");
    this.name = Modlet._getXMLValue(xml, "name");
    this.version = Modlet._getXMLValue(xml, "version");

    this.modInfoFile = file;
    this.modInfoXML = xml;

    this.enabled = !path.basename(file).match(/disabled/i);

    this.errors = [];

    this._validate();
  }

  isValid(): boolean {
    this._validate();
    return this.errors.length === 0;
  }

  enable(enabled: boolean) {
    // disable request
    if (!enabled && this.enabled) {
      this._renameModInfo(path.join(path.dirname(this.modInfoFile), "disabled-ModInfo.xml"));
    }

    // enable request
    if (enabled && !this.enabled) {
      this._renameModInfo(path.join(path.dirname(this.modInfoFile), "ModInfo.xml"));
    }

    this.enabled = enabled;
  }

  // TODO: Validate code goes here
  // validate(gameFolder: string) {}

  _renameModInfo(newModInfoFile: string) {
    fs.renameSync(this.modInfoFile, newModInfoFile);
    this.modInfoFile = newModInfoFile;
  }

  private _validate(): void {
    let errorString;

    ["author", "description", "name", "version"].forEach(attribute => {
      errorString = `${attribute} is unknown`;

      if (this[attribute] === "unknown" && !this.errors.includes(errorString)) this.errors.push(errorString);
    });
  }

  // class methods
  static _getXMLValue(xml: any, key: string, valueKey: string = "value"): string {
    if (xml && key in xml && valueKey in xml[key].$) return xml[key].$[valueKey];
    return "unknown";
  }
}

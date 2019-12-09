import fs from "fs";
import { fileExists } from "helpers";
import path from "path";
import { Parser } from "xml2js";

export default class Modlet {
  private _data: { [index: string]: string };
  private _validationErrors: string[];
  private _enabled: boolean;
  private _xmlParser: Parser;

  modInfo: { [index in "file" | "folderName" | "folderPath"]: string };

  constructor(file: string) {
    let xml: any | undefined;

    const folderPath = path.normalize(path.dirname(file));
    const folderName = path.basename(folderPath);
    const normalizedFile = path.normalize(file);

    this._data = {};
    this._validationErrors = [];
    this._xmlParser = new Parser({
      trim: true,
      normalizeTags: true,
      explicitRoot: false,
      explicitArray: false
    });

    if (fileExists(normalizedFile)) {
      this._xmlParser.parseString(fs.readFileSync(normalizedFile, "utf8"), (err: Error, xmlfile: any) => {
        if (err) {
          console.error("ERROR:", err);
          this._validationErrors.push(`Error parsing XML file: ${err}`);
          throw err;
        }

        xml = xmlfile.modinfo;
      });
    }

    this._data.author = Modlet._getXMLValue(xml, "author");
    this._data.compat = Modlet._getXMLValue(xml, "version", "compat");
    this._data.description = Modlet._getXMLValue(xml, "description");
    this._data.name = Modlet._getXMLValue(xml, "name");
    this._data.version = Modlet._getXMLValue(xml, "version");

    this.modInfo = { file: normalizedFile, folderName, folderPath };

    this._enabled = !path.basename(normalizedFile).match(/disabled/i);

    this._validateModInfo();
  }

  get(key: string) {
    return this._data[key];
  }

  errors(): string[] {
    return this._validationErrors;
  }

  isValid(): boolean {
    this._validateModInfo();
    return this.errors().length === 0;
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  enable(enabled: boolean): void {
    // disable request
    if (!enabled && this.isEnabled()) {
      this._renameModInfo(path.join(path.dirname(this.modInfo.file), "disabled-ModInfo.xml"));
    }

    // enable request
    if (enabled && !this.isEnabled()) {
      this._renameModInfo(path.join(path.dirname(this.modInfo.file), "ModInfo.xml"));
    }

    this._enabled = enabled;
  }

  _renameModInfo(newModInfoFile: string) {
    fs.renameSync(this.modInfo.file, newModInfoFile);
    this.modInfo.file = newModInfoFile;
  }

  private _validateModInfo(): void {
    let errorString: string;

    ["author", "description", "name", "version"].forEach((attribute: any) => {
      errorString = `${attribute} is unknown`;

      if (this.get(attribute) === "unknown" && !this._validationErrors.includes(errorString))
        this._validationErrors.push(errorString);
    });
  }

  // class methods
  static _getXMLValue(xml: any, key: string, valueKey: string = "value"): string {
    if (xml && key in xml && valueKey in xml[key].$) return xml[key].$[valueKey];
    return "unknown";
  }
}

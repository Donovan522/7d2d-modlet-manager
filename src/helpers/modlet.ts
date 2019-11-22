import fs from "fs";
import path from "path";
import { Parser } from "xml2js";

export default class Modlet {
  private _data: { [index: string]: string };
  private _errors: string[];
  private _enabled: boolean;
  modInfo: { [index in "file" | "xml" | "raw"]: string };

  constructor(file: string) {
    let xml: any | undefined;
    let raw: any | undefined;

    this._data = {};
    this._errors = [];

    if (fs.existsSync(file)) {
      const xmlparser = new Parser({
        trim: true,
        normalizeTags: true,
        explicitRoot: false,
        explicitArray: false
      });

      xmlparser.parseString(fs.readFileSync(file, "utf8"), (err: Error, xmlfile: any) => {
        if (err) {
          console.error("ERROR:", err);
          this._errors.push(`Error parsing XML file: ${err}`);
          throw err;
        }

        raw = xmlfile;
        xml = xmlfile.modinfo;
      });
    }

    this._data.author = Modlet._getXMLValue(xml, "author");
    this._data.compat = Modlet._getXMLValue(xml, "version", "compat");
    this._data.description = Modlet._getXMLValue(xml, "description");
    this._data.name = Modlet._getXMLValue(xml, "name");
    this._data.version = Modlet._getXMLValue(xml, "version");

    this.modInfo = { file, xml, raw };

    this._enabled = !path.posix.basename(file).match(/disabled/i);

    this._validate();
  }

  get(key: string) {
    return this._data[key];
  }

  isValid(): boolean {
    this._validate();
    return this._errors.length === 0;
  }

  errors(): string[] {
    return this._errors;
  }

  isEnabled() {
    return this._enabled;
  }

  enable(enabled: boolean) {
    // disable request
    if (!enabled && this.isEnabled()) {
      this._renameModInfo(path.posix.join(path.posix.dirname(this.modInfo.file), "disabled-ModInfo.xml"));
    }

    // enable request
    if (enabled && !this.isEnabled()) {
      this._renameModInfo(path.posix.join(path.posix.dirname(this.modInfo.file), "ModInfo.xml"));
    }

    this._enabled = enabled;
  }

  // TODO: Validate code goes here
  // validate(gameFolder: string) {}

  _renameModInfo(newModInfoFile: string) {
    fs.renameSync(this.modInfo.file, newModInfoFile);
    this.modInfo.file = newModInfoFile;
  }

  private _validate(): void {
    let errorString: string;

    ["author", "description", "name", "version"].forEach((attribute: any) => {
      errorString = `${attribute} is unknown`;

      if (this.get(attribute) === "unknown" && !this._errors.includes(errorString)) this._errors.push(errorString);
    });
  }

  // class methods
  static _getXMLValue(xml: any, key: string, valueKey: string = "value"): string {
    if (xml && key in xml && valueKey in xml[key].$) return xml[key].$[valueKey];
    return "unknown";
  }
}

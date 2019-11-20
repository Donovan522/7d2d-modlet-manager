import fs from "fs";
import path from "path";
import { Parser } from "xml2js";

export class Modlet {
  author: string;
  compat: string;
  description: string;
  enabled: boolean;
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
    this.description = xml.description.$.value || "unknown";
    this.enabled = !path.basename(file).match(/disabled/i);
    this.modInfoFile = file;
    this.modInfoXML = xml;
    this.name = xml.name.$.value || "unknown";
    this.version = xml.version.$.value || "unknown";
  }

  _renameModInfo(newModInfoFile: string) {
    fs.renameSync(this.modInfoFile, newModInfoFile);
    this.modInfoFile = newModInfoFile;
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

  // class methods
  static _getXMLValue(xml: any, key: string, valueKey: string = "value"): string {
    if (xml && key in xml) return xml[key].$[valueKey];
    return "unknown";
  }
}

export function getModlets(searchFolder: string): Modlet[] {
  let modletArray: Modlet[] = [];

  if (!searchFolder) return modletArray;
  if (!fs.existsSync(searchFolder)) return modletArray;

  fs.readdirSync(searchFolder).forEach(entry => {
    const filename = path.join(searchFolder, entry);

    if (fs.statSync(filename).isDirectory()) {
      fs.readdirSync(filename).some(file => {
        if (file.match(/modinfo/i)) {
          modletArray.push(new Modlet(path.join(filename, file)));
          return true;
        }
        return false;
      });
    }
  });

  return modletArray;
}

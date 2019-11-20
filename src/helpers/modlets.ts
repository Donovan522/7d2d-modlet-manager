import fs from "fs";
import path from "path";
import { Parser } from "xml2js";

export class Modlet {
  author: string;
  compat: string;
  description: string;
  enabled: boolean;
  modInfo: string;
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

      console.log("Reading from", file);

      xmlparser.parseString(fs.readFileSync(file, "utf8"), (err: Error, xmlfile: any) => {
        if (err) {
          console.log("ERROR:", err);
          this.name = "Not a valid modlet";
          return;
        }

        xml = xmlfile.modinfo;
        console.log(xml);
      });
    }

    this.author = xml.author.$.value || "unknown";
    this.compat = "compat" in xml.version.$ ? xml.version.$.compat : "unknown";
    this.description = xml.description.$.value || "unknown";
    this.enabled = !path.basename(file).match(/disabled/i);
    this.modInfo = file;
    this.name = xml.name.$.value || "unknown";
    this.version = xml.version.$.value || "unknown";
  }

  _renameModInfo(newModInfo: string) {
    fs.renameSync(this.modInfo, newModInfo);
    this.modInfo = newModInfo;
  }

  enable(enabled: boolean) {
    // disable request
    if (!enabled && this.enabled) {
      this._renameModInfo(path.join(path.dirname(this.modInfo), "disabled-ModInfo.xml"));
    }

    // enable request
    if (enabled && !this.enabled) {
      this._renameModInfo(path.join(path.dirname(this.modInfo), "ModInfo.xml"));
    }

    this.enabled = enabled;
  }

  // TODO: Validate code goes here
  // validate(gameFolder: string) {}
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

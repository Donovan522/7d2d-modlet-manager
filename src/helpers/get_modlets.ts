import fs from "fs";
import { fileExists, Modlet } from "helpers";
import path from "path";

export default function getModlets(searchFolder: string): IModletState[] | null[] {
  let modletArray: IModletState[] = [];

  if (!searchFolder) return modletArray;
  if (!fileExists(searchFolder)) return modletArray;

  fs.readdirSync(path.posix.normalize(searchFolder)).forEach(entry => {
    const filename: string = path.posix.join(searchFolder, entry);

    if (fs.statSync(filename).isDirectory()) {
      fs.readdirSync(filename).some(file => {
        if (file.match(/modinfo/i)) {
          modletArray.push({
            modlet: new Modlet(path.posix.join(filename, file)),
            validated: false
          });
          return true;
        }
        return false;
      });
    }
  });

  return modletArray;
}

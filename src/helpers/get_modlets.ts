import fs from "fs";
import { fileExists, Modlet } from "helpers";
import path from "path";

export default function getModlets(searchFolder: string): Modlet[] {
  let modletArray: Modlet[] = [];

  if (!searchFolder) return modletArray;
  if (!fileExists(searchFolder)) return modletArray;

  fs.readdirSync(searchFolder).forEach(entry => {
    const filename: string = path.posix.join(searchFolder, entry);

    if (fs.statSync(filename).isDirectory()) {
      fs.readdirSync(filename).some(file => {
        if (file.match(/modinfo/i)) {
          modletArray.push(new Modlet(path.posix.join(filename, file)));
          return true;
        }
        return false;
      });
    }
  });

  return modletArray;
}

import fs from "fs";
import path from "path";
import Modlet from "./modlet";

export default function getModlets(searchFolder: string): Modlet[] {
  let modletArray: Modlet[] = [];

  if (!searchFolder) return modletArray;
  if (!fs.existsSync(searchFolder)) return modletArray;

  fs.readdirSync(searchFolder).forEach(entry => {
    const filename: string = path.join(searchFolder, entry);

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

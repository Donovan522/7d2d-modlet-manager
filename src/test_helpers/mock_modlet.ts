import fs from "fs";
import path from "path";
import { Modlet } from "helpers";

type modType = "normal" | "extended" | "invalid";

function mkModInfo(type: modType) {
  const versionData = {
    normal: '<Version value="normal 1.0.1" />',
    extended: '<Version value="extended 1.0.1" compat="A100" />',
    invalid: ""
  }[type || "normal"];

  return `<xml>
  <ModInfo>
    <Name value="test name" />
    <Description value="test description" />
    <Author value="test author" />
    ${versionData}
  </ModInfo>
</xml>`;
}

interface mockModletOptions {
  type: modType;
  modinfo: string;
}

const defaults = {
  type: "normal" as modType,
  modinfo: "/foo/bar/bat/ModInfo.xml"
};

function createMockModlet(options: mockModletOptions = defaults) {
  const type = options.type || defaults.type;
  const modinfo = options.modinfo || defaults.modinfo;
  const modinfoName = path.basename(modinfo);

  jest.mock("fs");
  fs.accessSync = jest.fn(fs.accessSync).mockReturnValue();
  // @ts-ignore
  fs.readFileSync = jest.fn(fs.readFileSync).mockReturnValue(mkModInfo(type));
  // @ts-ignore
  fs.readdirSync = jest.fn(fs.readdirSync).mockReturnValue([modinfoName]);
  // @ts-ignore
  fs.statSync = jest.fn(fs.statSync).mockReturnValue({
    isDirectory: jest.fn(() => true)
  });

  return new Modlet(modinfo);
}

export default createMockModlet;

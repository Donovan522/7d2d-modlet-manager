import fs from "fs";
import { Modlet } from "helpers";

function mkModInfo(type) {
  const versionData = {
    normal: '<Version value="normal 1.0.1" />',
    extended: '<Version value="extended 1.0.1" compat="A100" />',
    invalid: ""
  };

  return `<xml>
  <ModInfo>
    <Name value="test name" />
    <Description value="test description" />
    <Author value="test author" />
    ${versionData[type || "normal"]}
  </ModInfo>
</xml>`;
}

function createMockModlet(type, path) {
  fs.existsSync = jest.fn(fs.existsSync).mockReturnValue(true);
  fs.readFileSync = jest.fn(fs.readFileSync).mockReturnValue(mkModInfo(type));

  return new Modlet(path || "/foo/bar/baz/ModInfo.xml");
}

export default createMockModlet;

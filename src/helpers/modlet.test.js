import Modlet from "./modlet";
import fs from "fs";

const mockModInfoXML = `
<?xml version="1.0" encoding="UTF-8" ?>
<xml>
  <ModInfo>
    <Name value="test name" />
    <Description value="test description" />
    <Author value="test author" />
    <Version value="foobar 1.0.1" compat="A100" />
  </ModInfo>
</xml>
`;

fs.existsSync = jest.fn().mockReturnValue(true);
fs.readFileSync = jest.fn(fs.readFileSync).mockReturnValue(mockModInfoXML);

const modlet = new Modlet("/path/to/ModInfo.xml");

it("returns a valid Modlet object", () => {
  expect(modlet.modInfoFile).toEqual("/path/to/ModInfo.xml");
  expect(modlet.author).toEqual("test author");
  expect(modlet.description).toEqual("test description");
  expect(modlet.name).toEqual("test name");
  expect(modlet.version).toEqual("foobar 1.0.1");
  expect(modlet.compat).toEqual("A100");
});

it("should be enabled", () => {
  expect(modlet.enabled).toBe(true);
});

it("should be disabled", () => {
  const modlet = new Modlet("/path/to/disabled-ModInfo.xml");
  expect(modlet.enabled).toBe(false);
});

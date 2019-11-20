import Modlet from "./modlet";
import fs from "fs";

let modlet;
const modinfoPath = "/path/to/ModInfo.xml";

const normalVersion = '<Version value="normal 1.0.1" />';
const extendedVersion = '<Version value="extended 1.0.1" compat="A100" />';
const invalidVersion = "";

const mockModInfoXML = (version = normalVersion) => {
  return `
<?xml version="1.0" encoding="UTF-8" ?>
<xml>
  <ModInfo>
    <Name value="test name" />
    <Description value="test description" />
    <Author value="test author" />
    ${version}
  </ModInfo>
</xml>
`;
};

fs.existsSync = jest.fn().mockReturnValue(true);
fs.readFileSync = jest.fn(fs.readFileSync);

beforeEach(() => {
  fs.readFileSync.mockReturnValue(mockModInfoXML());
  modlet = new Modlet(modinfoPath);
});

it("returns a valid Modlet object", () => {
  expect(modlet.isValid()).toBe(true);
  expect(modlet.errors).toEqual([]);
});

it("returns an invalid Modlet when attribute is unknown", () => {
  fs.readFileSync.mockReturnValue(mockModInfoXML(invalidVersion));
  modlet = new Modlet(modinfoPath);

  expect(modlet.isValid()).toBe(false);
  expect(modlet.errors).toEqual(["version is unknown"]);
});

it("assigns the proper attributes", () => {
  expect(modlet.modInfoFile).toEqual(modinfoPath);
  expect(modlet.author).toEqual("test author");
  expect(modlet.description).toEqual("test description");
  expect(modlet.name).toEqual("test name");
  expect(modlet.version).toEqual("normal 1.0.1");
  expect(modlet.compat).toEqual("unknown");
});

it("reads compat attribute on version element, if it exists", () => {
  fs.readFileSync.mockReturnValue(mockModInfoXML(extendedVersion));
  modlet = new Modlet(modinfoPath);

  expect(modlet.version).toEqual("extended 1.0.1");
  expect(modlet.compat).toEqual("A100");
});

it("should be enabled by default", () => {
  expect(modlet.enabled).toBe(true);
});

it("should be disabled when modinfo is prefixed with 'disabled'", () => {
  const modinfoPath = "/path/to/disabled-modinfo.xml";
  const modlet = new Modlet(modinfoPath);

  expect(modlet.modInfoFile).toEqual(modinfoPath);
  expect(modlet.enabled).toBe(false);
});

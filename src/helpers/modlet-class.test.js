import createMockModlet from "test_helpers/mock_modlet";
import path from "path";

let modlet;
const modinfoPath = path.normalize("/foo/bar/bat/ModInfo.xml");

beforeEach(() => {
  modlet = createMockModlet();
});

it("returns a valid Modlet object", () => {
  expect(modlet.isValid()).toBe(true);
  expect(modlet.errors()).toEqual([]);
});

it("returns an invalid Modlet when attribute is unknown", () => {
  modlet = createMockModlet({ type: "invalid" });

  expect(modlet.isValid()).toBe(false);
  expect(modlet.errors()).toEqual(["version is unknown"]);
});

it("assigns the proper attributes", () => {
  expect(modlet.modInfo.file).toEqual(modinfoPath);
  expect(modlet.get("author")).toEqual("test author");
  expect(modlet.get("description")).toEqual("test description");
  expect(modlet.get("name")).toEqual("test name");
  expect(modlet.get("version")).toEqual("normal 1.0.1");
  expect(modlet.get("compat")).toEqual("unknown");
});

it("reads compat attribute on version element, if it exists", () => {
  modlet = createMockModlet({ type: "extended" });

  expect(modlet.get("version")).toEqual("extended 1.0.1");
  expect(modlet.get("compat")).toEqual("A100");
});

it("should be enabled by default", () => {
  expect(modlet.isEnabled()).toBe(true);
});

it("should be disabled when modinfo is prefixed with 'disabled'", () => {
  const modinfoPath = path.normalize("/foo/bar/bat/Disabled-ModInfo.xml");
  const modlet = createMockModlet({ modinfo: modinfoPath });

  expect(modlet.modInfo.file).toEqual(modinfoPath);
  expect(modlet.isEnabled()).toBe(false);
});

it("should return the modlet directory", () => {
  expect(modlet.modInfo.folderPath).toEqual(path.normalize("/foo/bar/bat"));
});

it("should return the modlet directory name", () => {
  expect(modlet.modInfo.folderName).toEqual("bat");
});

/*
describe("Installing and Uninstalling Modlets", () => {
  it("Should thow an error when given the same directory to install into", () => {
    expect(() => modlet.install("/foo/bar/bat").toThrow(Error));
  });

  it("should install into a provided directory via junction", () => {
    expect(() => fs.accessSync("/bif/baz/bat")).toThrow(fs.Error);
    return modlet.install("/bif/baz/bat").then(() => {
      expect(() => fs.accessSync("/bif/baz/bat")).not.toThrow(fs.Error);
      expect(fs.statSync("/bif/baz/bat").isDirectory()).toBe(true);
    });
  });
});
*/

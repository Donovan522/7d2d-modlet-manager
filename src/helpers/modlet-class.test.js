import { Modlet } from "helpers";
import createMockModlet from "test_helpers/mock_modlet";
import fs from "fs";
import mock_fs from "mock-fs";

let modlet;
const modInfoPath = "/foo/bar/bat/ModInfo.xml";

beforeAll(() => {
  mock_fs({
    "/foo/bar/bat": {
      "ModInfo.xml": `<?xml version="1.0" encoding="UTF-8" ?>
<xml>
  <ModInfo>
    <Name value="test name" />
    <Description value="test description" />
    <Author value="test author" />
    <Version value="Test 0.0.1" compat="N/A" />
  </ModInfo>
</xml>`
    },
    "/bif/baz": {}
  });
});

afterAll(() => mock_fs.restore());

beforeEach(() => {
  modlet = createMockModlet();
});

it("returns a valid Modlet object", () => {
  expect(modlet.isValid()).toBe(true);
  expect(modlet.errors()).toEqual([]);
});

it("returns an invalid Modlet when attribute is unknown", () => {
  modlet = createMockModlet("invalid");

  expect(modlet.isValid()).toBe(false);
  expect(modlet.errors()).toEqual(["version is unknown"]);
});

it("assigns the proper attributes", () => {
  expect(modlet.modInfo.file).toEqual(modInfoPath);
  expect(modlet.get("author")).toEqual("test author");
  expect(modlet.get("description")).toEqual("test description");
  expect(modlet.get("name")).toEqual("test name");
  expect(modlet.get("version")).toEqual("normal 1.0.1");
  expect(modlet.get("compat")).toEqual("unknown");
});

it("reads compat attribute on version element, if it exists", () => {
  modlet = createMockModlet("extended");

  expect(modlet.get("version")).toEqual("extended 1.0.1");
  expect(modlet.get("compat")).toEqual("A100");
});

it("should be enabled by default", () => {
  expect(modlet.isEnabled()).toBe(true);
});

it("should be disabled when modinfo is prefixed with 'disabled'", () => {
  const modinfoPath = "/foo/bar/bat/disabled-modinfo.xml";
  const modlet = new Modlet(modinfoPath);

  expect(modlet.modInfo.file).toEqual(modinfoPath);
  expect(modlet.isEnabled()).toBe(false);
});

it("should return the modlet directory name", () => {
  expect(modlet.modInfo.folder).toEqual("bat");
});

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

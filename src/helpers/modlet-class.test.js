import { Modlet } from "helpers";
import createMockModlet from "test_helpers/mock_modlet";

let modlet;
const modInfoPath = "/foo/bar/baz/ModInfo.xml";

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
  const modinfoPath = "/foo/bar/baz/disabled-modinfo.xml";
  const modlet = new Modlet(modinfoPath);

  expect(modlet.modInfo.file).toEqual(modinfoPath);
  expect(modlet.isEnabled()).toBe(false);
});

it("should return the modlet directory name", () => {
  expect(modlet.modInfo.folder).toEqual("baz");
});

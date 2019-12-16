import getModlets from "./get_modlets";
import createMockModlet from "test_helpers/mock_modlet";

const mockModlet = createMockModlet();

describe("get_modlets", () => {
  it("returns an empty array when no searchFolder provided", () => expect(getModlets(null)).toEqual([]));

  it("returns an array of Modlet instances", () => {
    const modlets = getModlets("/foo/bar");
    expect(modlets.length).toEqual(1);
    expect(modlets[0].modlet.name).toEqual(mockModlet.name);
  });
});

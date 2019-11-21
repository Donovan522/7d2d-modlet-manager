import React from "react";
import { shallow } from "enzyme";
import Modlets from ".";

it("renders without crashing", () => {
  shallow(<Modlets advancedMode={false} gameFolder={"/foo/bar"} modletFolder={"/foo/bar/baz"} modlets={[]} />);
});

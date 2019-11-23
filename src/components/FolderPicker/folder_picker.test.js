import React from "react";
import { shallow } from "enzyme";
import FolderPicker from ".";

it("renders without crashing", () => {
  shallow(<FolderPicker advancedMode={false} folder={"/foo/bar"} handleClick={jest.fn()} label={"foo"} />);
});

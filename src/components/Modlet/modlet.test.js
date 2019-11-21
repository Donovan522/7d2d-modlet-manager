import React from "react";
import { shallow } from "enzyme";
import ModletComp from ".";
import createMockModlet from "test_helpers/mock_modlet";

it("renders without crashing", () => {
  shallow(<ModletComp advancedMode={false} modlet={createMockModlet()} />);
});

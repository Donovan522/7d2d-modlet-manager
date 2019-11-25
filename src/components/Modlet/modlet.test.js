import React from "react";
import { shallow } from "enzyme";
import Modlet from ".";
import createMockModlet from "test_helpers/mock_modlet";
import mock_state from "test_helpers/mock_state";

it("renders without crashing", () => {
  shallow(<Modlet state={mock_state} modlet={createMockModlet()} />);
});

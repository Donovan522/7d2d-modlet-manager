import React from "react";
import { shallow } from "enzyme";
import Modlet from ".";
import createMockModlet from "test_helpers/mock_modlet";
import mock_state from "test_helpers/mock_state";

let modlet;
let component;

describe("Modlet", () => {
  beforeEach(() => {
    modlet = createMockModlet();
  });

  afterEach(() => {
    component = null;
  });

  describe("Basic Mode", () => {
    beforeEach(() => {
      mock_state.advancedMode = false;
      component = shallow(<Modlet state={mock_state} modlet={modlet} />);
    });

    it("should render correctly", () => {
      expect(component).toMatchSnapshot();
    });
  });

  describe("Advanced Mode", () => {
    beforeEach(() => {
      mock_state.advancedMode = true;
      component = shallow(<Modlet state={mock_state} modlet={modlet} />);
    });

    it("should render correctly", () => {
      expect(component).toMatchSnapshot();
    });
  });
});

import React from "react";
import { shallow } from "enzyme";
import Modlet from ".";
import createMockModlet from "src/test_helpers/mock_modlet";
import mock_state from "src/test_helpers/mock_state";

let modletState;
let component;

describe("Modlet", () => {
  beforeEach(() => {
    modletState = {
      modlet: createMockModlet(),
      validated: false,
      errors: []
    };
  });

  afterEach(() => {
    component = null;
  });

  describe("Basic Mode", () => {
    beforeEach(() => {
      mock_state.advancedMode = false;
      component = shallow(<Modlet state={mock_state} modletState={modletState} handleValidation={jest.fn()} />);
    });

    it("should render correctly", () => {
      expect(component).toMatchSnapshot();
    });
  });

  describe("Advanced Mode", () => {
    beforeEach(() => {
      mock_state.advancedMode = true;
      component = shallow(<Modlet state={mock_state} modletState={modletState} handleValidation={jest.fn()} />);
    });

    it("should render correctly", () => {
      expect(component).toMatchSnapshot();
    });
  });
});

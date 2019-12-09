import React from "react";
import Modlet from ".";
import createMockModlet from "test_helpers/mock_modlet";
import mock_state from "test_helpers/mock_state";
import { render } from "@testing-library/react";

let modletState;

describe("Modlet", () => {
  beforeEach(() => {
    modletState = {
      modlet: createMockModlet(),
      validated: false,
      errors: []
    };
  });

  describe("Basic Mode", () => {
    beforeEach(() => {
      mock_state.advancedMode = false;
    });

    it("should render correctly", () => {
      const { asFragment } = render(
        <Modlet state={mock_state} modletState={modletState} handleValidation={jest.fn()} />
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe("Advanced Mode", () => {
    beforeEach(() => {
      mock_state.advancedMode = true;
    });

    it("should render correctly", () => {
      const { asFragment } = render(
        <Modlet state={mock_state} modletState={modletState} handleValidation={jest.fn()} />
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });
});

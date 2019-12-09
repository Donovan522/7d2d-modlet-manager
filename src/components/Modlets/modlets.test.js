import React from "react";
import Modlets from ".";
import mock_state from "test_helpers/mock_state";
import { render } from "@testing-library/react";

it("renders without crashing", () => {
  const { asFragment } = render(<Modlets state={mock_state} stateDispatch={jest.fn()} />);

  expect(asFragment()).toMatchSnapshot();
});

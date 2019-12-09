import App from "App";
import React from "react";
import mock_store from "test_helpers/mock_store";
import { render } from "@testing-library/react";

jest.mock("electron", () => ({
  remote: {
    Menu: {
      buildFromTemplate: jest.fn(),
      setApplicationMenu: jest.fn()
    }
  }
}));

jest.mock("electron-util", () => ({
  aboutMenuItem: jest.fn()
}));

it("renders without crashing", () => {
  const { asFragment } = render(<App store={mock_store} />);

  expect(asFragment()).toMatchSnapshot();
});

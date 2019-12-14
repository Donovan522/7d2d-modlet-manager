import App from "App";
import React from "react";
import mock_store from "test_helpers/mock_store";
import { render } from "@testing-library/react";
import mock_fs from "mock-fs";
import path from "path";

jest.mock("electron", () => ({
  remote: {
    Menu: {
      buildFromTemplate: jest.fn(),
      setApplicationMenu: jest.fn()
    },
    dialog: {
      showOpenDialog: jest.fn(() => ({
        canceled: true,
        filePaths: [mock_store.store.gameFolder]
      }))
    }
  }
}));

jest.mock("electron-util", () => ({
  aboutMenuItem: jest.fn()
}));

mock_fs({
  [path.posix.normalize(mock_store.store.gameFolder)]: {
    "7DaysToDie.exe": ""
  },
  [path.posix.normalize(mock_store.store.modletFolder)]: {}
});

it("renders without crashing", () => {
  const { asFragment } = render(<App config={mock_store} />);

  expect(asFragment()).toMatchSnapshot();
});

import React from "react";
import { shallow } from "enzyme";
import App from "App";
import mock_store from "test_helpers/mock_store";

it("renders without crashing", () => {
  shallow(<App store={mock_store} />);
});

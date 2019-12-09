// react-testing-library renders your components to document.body,
// this adds jest-dom's custom assertions
import "@testing-library/jest-dom/extend-expect";
import mock_console from "test_helpers/mock_console";

global.console = mock_console; // mock-fs is unable to handle console.log output

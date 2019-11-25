import { configure } from "enzyme";
import mock_console from "test_helpers/mock_console";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

global.console = mock_console; // mock-fs is unable to handle console.log output

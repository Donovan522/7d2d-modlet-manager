import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import mock_console from "src/test_helpers/mock_console";

Enzyme.configure({ adapter: new Adapter() });

global.console = mock_console; // mock-fs is unable to handle console.log output

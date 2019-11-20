import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

global.store = {
  get: jest.fn(),
  set: jest.fn(),
  store: {
    gameFolder: "C:\\Steam\\SteamLibrary\\steamapps\\common\\7 Day to Die",
    modletFolder: "C:\\Steam\\SteamLibrary\\steamapps\\common\\7 Days to Die\\Mods"
  }
};

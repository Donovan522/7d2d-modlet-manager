import getModlets from "helpers/get_modlets";
import { useReducer } from "react";
import { GameXML } from ".";

const defaultState: IState = {
  advancedMode: false,
  config: null,
  gameFolder: "",
  gameXML: null,
  modletFolder: "",
  modlets: []
};

function initialState(config: any): IState {
  return {
    config: config,
    advancedMode: !!parseInt(config.get("mode")),
    gameFolder: config.get("gameFolder"),
    gameXML: config.get("gameFolder") ? new GameXML(config.get("gameFolder")) : null,
    modletFolder: config.get("modletFolder"),
    modlets: []
  };
}

function sortModlets(a: IModletState, b: IModletState) {
  return a.modlet.get("name") > b.modlet.get("name") ? 1 : -1;
}

function reducer(state: IState, action: { type: string; payload?: any }): IState {
  switch (action.type) {
    case "setAdvancedMode": {
      if (state.config) state.config.set("mode", action.payload ? 1 : 0);

      return {
        ...state,
        advancedMode: action.payload
      };
    }

    case "setGameFolder": {
      if (state.config) state.config.set("gameFolder", action.payload);

      return {
        ...state,
        gameFolder: action.payload,
        gameXML: new GameXML(action.payload)
      };
    }

    case "setModletFolder": {
      if (state.config) state.config.set("modletFolder", action.payload);

      return {
        ...state,
        modletFolder: action.payload,
        modlets: getModlets(action.payload)
      };
    }

    case "setModlets": {
      return {
        ...state,
        modlets: action.payload.sort(sortModlets)
      };
    }

    case "clearModlets": {
      return {
        ...state,
        modlets: []
      };
    }

    case "syncModlets": {
      const modletState = state.modlets.filter((obj: IModletState) => obj.modlet === action.payload.modlet)[0];

      if (!modletState) throw new Error("syncModlets dispatch received invalid modlet");

      const modletStates = state.modlets.filter((obj: IModletState) => obj.modlet !== action.payload.modlet);
      const newModletState = { ...modletState, ...action.payload };

      return {
        ...state,
        modlets: [...modletStates, newModletState].sort(sortModlets)
      };
    }

    case "setGameXML": {
      return {
        ...state,
        gameXML: new GameXML(state.gameFolder)
      };
    }

    default:
      return state;
  }
}

export default (config: any) => useReducer(reducer, initialState(config || defaultState));

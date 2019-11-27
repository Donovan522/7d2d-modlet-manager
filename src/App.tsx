import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Collapse from "@material-ui/core/Collapse";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import List from "@material-ui/core/List";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import FolderPicker from "components/FolderPicker";
import Modlets from "components/Modlets";
import { remote } from "electron";
import { getModlets } from "helpers";
import path from "path";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { hot } from "react-hot-loader";
import theme from "helpers/theme";
import isDev from "electron-is-dev";
import menuTemplate from "menu";

const useStyles = makeStyles(theme => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh"
  },
  bodyContainer: {
    marginTop: 10,
    overflowY: "auto",
    height: "100%"
  },
  modeControl: {
    padding: theme.spacing(1)
  },
  noGameFolder: {
    display: "block",
    margin: "auto",
    marginTop: 200
  }
}));

interface AppProps {
  store: any;
}

function App(props: AppProps): React.ReactElement {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);

  let initialState = (): IState => ({
    advancedMode: !!parseInt(props.store.get("mode")),
    config: props.store.store,
    gameFolder: null,
    modletFolder: null,
    modlets: []
  });

  const stateReducer = (state: IState, action: { type: string; payload?: any }) => {
    const sortModlets = (a: IModletState, b: IModletState) => (a.modlet.get("name") > b.modlet.get("name") ? 1 : -1);

    if (isDev) console.log("Dispatch received:", action);

    switch (action.type) {
      case "setAdvancedMode":
        props.store.set("mode", action.payload ? 1 : 0);

        return {
          ...state,
          advancedMode: action.payload
        };

      case "setGameFolder":
        props.store.set("gameFolder", action.payload);

        return {
          ...state,
          config: { ...props.store.store, gameFolder: action.payload }
        };

      case "setModletFolder":
        props.store.set("modletFolder", action.payload);

        return {
          ...state,
          config: { ...props.store.store, modletFolder: action.payload }
        };

      case "setModlets":
        return {
          ...state,
          modlets: action.payload.sort(sortModlets)
        };

      case "syncModlets":
        const modletState = state.modlets.filter((obj: IModletState) => obj.modlet === action.payload.modlet)[0];

        if (!modletState) throw new Error("syncModlets dispatch received invalid modlet");

        const modletStates = state.modlets.filter((obj: IModletState) => obj.modlet !== action.payload.modlet);
        const newModletState = { ...modletState, ...action.payload };

        return {
          ...state,
          modlets: [...modletStates, newModletState].sort(sortModlets)
        };

      default:
        return state;
    }
  };

  const [state, stateDispatch] = useReducer(stateReducer, null, initialState);

  const getFolder = async (title: string) => {
    setLoading(true);

    const dialog = await remote.dialog.showOpenDialog({
      title: title,
      properties: ["openDirectory"]
    });

    setLoading(false);

    if (!dialog.canceled) return dialog.filePaths[0];

    return null;
  };

  const getGameFolder = useCallback(() => {
    getFolder('Please select the "7 Days to Die" game folder').then(newFolder => {
      if (newFolder) {
        stateDispatch({ type: "clearModlets" });
        stateDispatch({ type: "setGameFolder", payload: newFolder });

        if (!state.config.modletFolder)
          stateDispatch({ type: "setModletFolder", payload: path.posix.join(newFolder, "Mods") });
      }
    });
  }, [state.config.modletFolder]);

  const getModletFolder = () => {
    getFolder('Please Select a valid "7 Days to Die" Modlet Folder').then(newFolder => {
      if (newFolder) {
        stateDispatch({ type: "clearModlets" });
        stateDispatch({ type: "setModletFolder", payload: newFolder });
      }
    });
  };

  const toggleAdvancedMode = () => {
    stateDispatch({ type: "clearModlets" });
    stateDispatch({ type: "setAdvancedMode", payload: !state.advancedMode });
  };

  useEffect(() => {
    if (!state.config.gameFolder) getGameFolder();
  }, [state.config.gameFolder, getGameFolder]);

  useEffect(() => {
    if (state.config.mode === undefined) stateDispatch({ type: "setAdvancedMode", payload: false });
  }, [state.config.mode]);

  useEffect(() => {
    if (!loading && !state.config.modletFolder && state.config.gameFolder)
      stateDispatch({ type: "setModletFolder", payload: path.posix.join(state.config.gameFolder, "Mods") });
  }, [loading, state.config.gameFolder, state.config.modletFolder]);
  // Get list of modlets
  useEffect(() => {
    if (state.config.modletFolder && state.config.gameFolder) {
      let newModletList = getModlets(
        state.advancedMode ? state.config.modletFolder : path.posix.join(state.config.gameFolder, "Mods")
      );
      if (newModletList.length) stateDispatch({ type: "setModlets", payload: newModletList });
    }
  }, [state.advancedMode, state.config.modletFolder, state.config.gameFolder]);

  if (!loading && (state === undefined || state.config.gameFolder === undefined)) {
    return (
      <Button variant="contained" color="secondary" onClick={getGameFolder} className={classes.noGameFolder}>
        Please Select the 7 days to die game folder to continue...
      </Button>
    );
  }

  if (loading && (!state.config.gameFolder || !state.config.modletFolder))
    return <CircularProgress className={classes.noGameFolder} />;

  const commands = {
    chooseGameFolder: getGameFolder,
    chooseModletFolder: getModletFolder,
    toggleMode: toggleAdvancedMode
  };

  // @ts-ignore
  remote.Menu.setApplicationMenu(remote.Menu.buildFromTemplate(menuTemplate(commands)));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={classes.mainContainer}>
        <Container maxWidth="xl" className={classes.bodyContainer}>
          <FormControlLabel
            className={classes.modeControl}
            control={<Switch size="small" checked={state.advancedMode} onChange={toggleAdvancedMode} />}
            label={state.advancedMode ? "Advanced Mode" : "Basic Mode"}
          />
          <List dense={true}>
            <FolderPicker
              advancedMode={state.advancedMode}
              folder={state.config.gameFolder}
              handleClick={getGameFolder}
              label="Game Folder"
              tooltip="Click to select Game Folder"
            />
            <Collapse in={state.advancedMode}>
              <FolderPicker
                advancedMode={state.advancedMode}
                folder={state.config.modletFolder}
                handleClick={getModletFolder}
                label="Modlet Folder"
                tooltip="Click to select Modlet folder"
              />
            </Collapse>
          </List>
          <Modlets state={state} stateDispatch={stateDispatch} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default hot(module)(App);

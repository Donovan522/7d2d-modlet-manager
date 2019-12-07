import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Collapse from "@material-ui/core/Collapse";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Fab from "@material-ui/core/Fab";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import List from "@material-ui/core/List";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import LaunchIcon from "@material-ui/icons/Launch";
import { execFile } from "child_process";
import { remote } from "electron";
import FolderPicker from "src/components/FolderPicker";
import Modlets from "src/components/Modlets";
import { fileExists, GameXML, getModlets } from "src/helpers";
import theme from "src/helpers/theme";
import menuTemplate from "./menu";
import path from "path";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { hot } from "react-hot-loader";

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
  controlsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center"
  },
  modeControl: {
    padding: theme.spacing(1)
  },
  noGameFolder: {
    display: "block",
    margin: "auto",
    marginTop: 200
  },
  launchButton: {
    margin: theme.spacing(1)
  },
  launchIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.secondary.main
  }
}));

interface AppProps {
  store: any;
}

function App(props: AppProps): React.ReactElement {
  const classes = useStyles();
  const gameExecutable = "7DaysToDie.exe";
  // const gameExecutableEAC = "7DaysToDie_EAC.exe";
  const [loading, setLoading] = useState(false);

  const initialState: IState = {
    advancedMode: false,
    config: {
      gameFolder: "",
      modletFolder: "",
      mode: 0
    },
    gameXML: null,
    modlets: []
  };

  const initState = (): IState => ({
    advancedMode: !!parseInt(props.store.get("mode")),
    config: props.store.store,
    gameXML: props.store.get("gameFolder") ? new GameXML(props.store.get("gameFolder")) : null,
    modlets: []
  });

  const sortModlets = (a: IModletState, b: IModletState) => (a.modlet.get("name") > b.modlet.get("name") ? 1 : -1);

  const stateReducer = (state: IState, action: { type: string; payload?: any }): IState => {
    switch (action.type) {
      case "setAdvancedMode": {
        props.store.set("mode", action.payload ? 1 : 0);

        return {
          ...state,
          advancedMode: action.payload
        };
      }

      case "setGameFolder": {
        props.store.set("gameFolder", action.payload);

        return {
          ...state,
          config: { ...props.store.store, gameFolder: action.payload },
          gameXML: new GameXML(action.payload)
        };
      }

      case "setModletFolder": {
        props.store.set("modletFolder", action.payload);

        return {
          ...state,
          config: { ...props.store.store, modletFolder: action.payload },
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
          gameXML: new GameXML(state.config.gameFolder)
        };
      }

      default:
        return state;
    }
  };

  const [state, stateDispatch] = useReducer(stateReducer, initialState, initState);

  const errorDialog = (title: string, err: Error) => {
    remote.dialog.showMessageBox({
      type: "error",
      title: title,
      message: err.message
    });
  };

  const launchGame = () => {
    const game = path.normalize(path.join(state.config.gameFolder, gameExecutable));

    if (fileExists(game))
      execFile(game, err => {
        if (err) {
          errorDialog("Unable to start 7 Days to Die", err);
          return;
        }
      });
  };

  const refreshModlets = useCallback(
    (modletsPath?: string) => {
      let newModletList = getModlets(
        modletsPath || state.advancedMode ? state.config.modletFolder : path.join(state.config.gameFolder, "Mods")
      );
      if (newModletList.length) stateDispatch({ type: "setModlets", payload: newModletList });
    },
    [state.advancedMode, state.config.gameFolder, state.config.modletFolder]
  );

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
        if (fileExists(path.join(newFolder, gameExecutable))) {
          stateDispatch({ type: "setGameFolder", payload: newFolder });
          if (!state.config.modletFolder) {
            const newModletFolder = path.posix.join(newFolder, "Mods");
            stateDispatch({ type: "setModletFolder", payload: newModletFolder });
          } else {
            refreshModlets();
          }
        } else {
          errorDialog("Invalid Game Folder", new Error("The chosen folder is not a valid 7 Days to Die game folder"));
        }
      }
    });
  }, [refreshModlets, state.config.modletFolder]);

  const getModletFolder = () => {
    getFolder('Please Select a valid "7 Days to Die" Modlet Folder').then(newFolder => {
      if (newFolder) {
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
    if (!loading && !state.config.modletFolder && state.config.gameFolder) {
      const newModletFolder = path.join(state.config.gameFolder, "Mods");
      stateDispatch({ type: "setModletFolder", payload: newModletFolder });
    }
  }, [loading, state.config.gameFolder, state.config.modletFolder]);

  useEffect(() => {
    if (state.config.modletFolder && state.config.gameFolder) refreshModlets();
  }, [refreshModlets, state.config.modletFolder, state.config.gameFolder]);

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
    toggleMode: toggleAdvancedMode,
    refreshModlets: refreshModlets
  };

  // @ts-ignore
  remote.Menu.setApplicationMenu(remote.Menu.buildFromTemplate(menuTemplate(commands)));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={classes.mainContainer}>
        <Container maxWidth="xl" className={classes.bodyContainer}>
          <Box className={classes.controlsContainer}>
            <FormControlLabel
              className={classes.modeControl}
              control={<Switch size="small" checked={state.advancedMode} onChange={toggleAdvancedMode} />}
              label={state.advancedMode ? "Advanced Mode" : "Basic Mode"}
            />
            <Fab
              variant="extended"
              size="medium"
              color="primary"
              aria-label="Launch 7 Days to Die"
              className={classes.launchButton}
              onClick={launchGame}
            >
              <LaunchIcon className={classes.launchIcon} />
              Play Game
            </Fab>
          </Box>
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

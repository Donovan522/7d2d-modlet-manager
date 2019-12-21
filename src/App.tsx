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
import FolderPicker from "components/FolderPicker";
import Modlets from "components/Modlets";
import { remote } from "electron";
import { fileExists, getModlets } from "helpers";
import theme from "helpers/theme";
import path from "path";
import React, { useCallback, useEffect, useState } from "react";
import { hot } from "react-hot-loader";
import menuTemplate from "./menu";
import Typography from "@material-ui/core/Typography";

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
  footerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.palette.background.paper,
    borderTop: "1px solid silver"
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
    marginTop: 200,
    textAlign: "center"
  },
  noGameFolderIcon: {
    display: "block",
    margin: "auto",
    marginTop: 25
  },
  launchButton: {
    margin: theme.spacing(1)
  },
  launchIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.secondary.main
  },
  footer: {
    margin: theme.spacing(1)
  }
}));

interface AppProps {
  state: IState;
  stateDispatch: (action: { type: string; payload?: any }) => IState;
}

function App({ state, stateDispatch }: AppProps): React.ReactElement {
  const classes = useStyles();
  const gameExecutable = "7DaysToDie.exe";
  // const gameExecutableEAC = "7DaysToDie_EAC.exe";
  const [loading, setLoading] = useState(false);

  const errorDialog = (title: string, err: Error) => {
    remote.dialog.showMessageBox({
      type: "error",
      title: title,
      message: err.message
    });
  };

  const launchGame = () => {
    const game = path.normalize(path.join(state.gameFolder, gameExecutable));

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
        modletsPath || state.advancedMode ? state.modletFolder : path.join(state.gameFolder, "Mods")
      );
      if (newModletList.length) stateDispatch({ type: "setModlets", payload: newModletList });
    },
    [stateDispatch, state.advancedMode, state.gameFolder, state.modletFolder]
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
          if (!state.modletFolder) {
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
  }, [stateDispatch, refreshModlets, state.modletFolder]);

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

  // Check for invalid gameFolder
  useEffect(() => {
    if (state.gameFolder && !fileExists(state.gameFolder)) stateDispatch({ type: "clearGameFolder" });
  }, [stateDispatch, state.gameFolder]);

  // Check for empty gameFolder
  useEffect(() => {
    if (!state.gameFolder) getGameFolder();
  }, [state.gameFolder, getGameFolder]);

  // If advancedMode isn't already set, set it to default
  useEffect(() => {
    if (state.advancedMode === undefined) stateDispatch({ type: "setAdvancedMode", payload: false });
  }, [stateDispatch, state.advancedMode]);

  useEffect(() => {
    if (!loading && !state.modletFolder && state.gameFolder) {
      const newModletFolder = path.join(state.gameFolder, "Mods");
      stateDispatch({ type: "setModletFolder", payload: newModletFolder });
    }
  }, [stateDispatch, loading, state.gameFolder, state.modletFolder]);

  useEffect(() => {
    if (state.modletFolder && state.gameFolder) refreshModlets();
  }, [refreshModlets, state.modletFolder, state.gameFolder]);

  if (!loading && (state.config === undefined || !state.gameFolder)) {
    return (
      <Button variant="contained" color="secondary" onClick={getGameFolder} className={classes.noGameFolder}>
        Please Select the 7 days to die game folder to continue.
      </Button>
    );
  }

  if (loading && (!state.gameFolder || !state.modletFolder)) {
    return (
      <Box>
        <Typography variant="h5" className={classes.noGameFolder}>
          Waiting for Selection
        </Typography>
        <CircularProgress className={classes.noGameFolderIcon} />
      </Box>
    );
  }

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
              folder={state.gameFolder}
              handleClick={getGameFolder}
              label="Game Folder"
              toolTip="Click to select Game Folder"
            />
            <Collapse in={state.advancedMode}>
              <FolderPicker
                advancedMode={state.advancedMode}
                folder={state.modletFolder}
                handleClick={getModletFolder}
                label="Modlet Folder"
                toolTip="Click to select Modlet folder"
              />
            </Collapse>
          </List>
          <Modlets state={state} stateDispatch={stateDispatch} />
        </Container>
        <Box className={classes.footerContainer}>
          <Typography className={classes.footer} component="div">
            {remote.app.name}
          </Typography>
          <Typography className={classes.footer} component="div">
            Version v.{remote.app.getVersion()}
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default hot(module)(App);

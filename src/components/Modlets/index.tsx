import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Modlet from "components/Modlet";
import fs from "fs";
import { fileExists } from "helpers";
import path from "path";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

interface ModletsProps {
  state: IState;
  stateDispatch: any;
}

const useStyles = makeStyles(theme => ({
  noModsButton: {
    display: "block",
    margin: "auto",
    marginTop: 30
  },
  card: {},
  cardEmpty: {
    flex: "1 1 auto",
    color: "silver",
    textAlign: "center",
    marginTop: 50
  },
  noModletsHeader: {
    paddingBottom: 20
  },
  noModletsBody: {
    paddingTop: 10
  },
  paper: {
    width: "100%",
    margin: theme.spacing(1)
  },
  root: {
    marginTop: 20
  },
  tableHeader: {
    fontSize: 14,
    fontWeight: "bold"
    // textTransform: "uppercase"
  },
  tableTitle: {
    flexGrow: 1
  },
  validatingButton: {
    margin: theme.spacing(1)
  }
}));

function Modlets(props: ModletsProps): React.ReactElement {
  const { state, stateDispatch } = props;
  const [noModsButton, setNoModsButton] = useState(<span />);
  const [validating, setValidating] = useState(false);
  const [validateButtonLabel, setValidateButtonLabel] = useState("Validate XMLs");
  const classes = useStyles();
  const modsPath = state.gameFolder ? path.win32.normalize(path.join(state.gameFolder, "Mods")) : "";

  const handleValidation = async (modletState: IModletState, reset: boolean = true) => {
    let errors = [];
    if (state.gameXML) {
      errors = await state.gameXML.validate(modletState.modlet);
      stateDispatch({ type: "syncModlets", payload: { ...modletState, validated: true, errors: errors } });
      if (reset) state.gameXML.reset();
    }
  };

  const handleValidateAll = () => {
    setValidating(true);
    setValidateButtonLabel("Validating");

    setTimeout(() => {
      Promise.all(
        state.modlets.map((modletState: IModletState) => {
          // This runs the promises in single-order, so that they can dispatch between runs.
          // I still can't get the page to update fast enough, but that's a problem for another day.
          return handleValidation(modletState, false);
        })
      ).then(() => {
        if (state.gameXML) state.gameXML.reset();
        setValidateButtonLabel("Validate XMLs");
        setValidating(false);
      });
    }, 500);
  };

  const modletsListBasic = (): React.ReactNode => {
    return state.modlets.map((modletState: any, index: number) => {
      return (
        <Grid item xs={12} md={6} lg={4} xl={3} key={index} className={classes.card}>
          <Modlet modletState={modletState} state={state} handleValidation={handleValidation} />
        </Grid>
      );
    });
  };

  const modletsListAdvanced = (): React.ReactNode => {
    return (
      <Paper className={classes.paper}>
        <Toolbar>
          <Typography variant="h6" className={classes.tableTitle}>
            Modlets
          </Typography>
          <Button
            disabled={validating}
            variant="contained"
            color="secondary"
            size="small"
            className={classes.validatingButton}
            onClick={handleValidateAll}
            endIcon={validating ? <CircularProgress color="secondary" size={14} /> : null}
          >
            {validateButtonLabel}
          </Button>
        </Toolbar>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableHeader}>Name / Description</TableCell>
              <TableCell className={classes.tableHeader}>Author</TableCell>
              <TableCell className={classes.tableHeader} align="right">
                Version
              </TableCell>
              <TableCell className={classes.tableHeader}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.modlets.map((modletState: any, index: number) => (
              <Modlet key={index} modletState={modletState} handleValidation={handleValidation} state={state} />
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  };

  const noModlets = (): React.ReactNode => {
    return (
      <Grid item key="no-modlets" className={classes.cardEmpty}>
        <Typography variant="h6" className={classes.noModletsHeader}>
          No Modlets Installed
        </Typography>
        <Divider variant="middle" />
        <Typography variant="body1" className={classes.noModletsBody}>
          To install mods, place them in {modsPath}
          {noModsButton}
        </Typography>
      </Grid>
    );
  };

  const modletList = state.modlets.length
    ? state.advancedMode
      ? modletsListAdvanced()
      : modletsListBasic()
    : noModlets();

  useEffect(() => {
    const createModsFolder = () => {
      if (!fileExists(modsPath)) {
        fs.mkdirSync(modsPath);
        setNoModsButton(<span />);
      }
    };

    if (!noModsButton && !fileExists(modsPath)) {
      setNoModsButton(
        <Button className={classes.noModsButton} onClick={createModsFolder}>
          Create Mods Folder?
        </Button>
      );
    }
  }, [state.gameFolder, noModsButton, modsPath, classes.noModsButton]);

  return (
    <Grid container spacing={2} className={classes.root}>
      {modletList}
    </Grid>
  );
}

Modlets.propTypes = {
  state: PropTypes.object.isRequired,
  stateDispatch: PropTypes.func.isRequired
};

export default Modlets;

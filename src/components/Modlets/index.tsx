import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Modlet from "components/Modlet";
import fs from "fs";
import { fileExists } from "helpers";
import path from "path";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

interface ModletsProps {
  state: any;
}

const useStyles = makeStyles(theme => ({
  button: {
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
  }
}));

// apparently "Record" isn't seen by eslint as a part of TypeScript
// eslint-disable-next-line no-undef
function modletsListBasic(props: ModletsProps, classes: Record<"card", string>): React.ReactNode {
  return props.state.modlets.map((modletObj: any, index: number) => {
    return (
      <Grid item xs={12} md={6} lg={4} xl={3} key={index} className={classes.card}>
        <Modlet modlet={modletObj} state={props.state} />
      </Grid>
    );
  });
}

// apparently "Record" isn't seen by eslint as a part of TypeScript
// eslint-disable-next-line no-undef
function modletsListAdvanced(props: ModletsProps, classes: Record<"paper" | "tableHeader", string>): React.ReactNode {
  return (
    <Paper className={classes.paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell className={classes.tableHeader}>Name / Description</TableCell>
            <TableCell className={classes.tableHeader}>Author</TableCell>
            <TableCell className={classes.tableHeader} align="right">
              Version
            </TableCell>
            <TableCell className={classes.tableHeader} align="center">
              Status
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.state.modlets.map((modletObj: any, index: number) => (
            <Modlet key={index} modlet={modletObj} state={props.state} />
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

function noModlets(
  modsPath: string,
  button: React.ReactNode,
  classes: Record<"cardEmpty" | "noModletsHeader" | "noModletsBody", string> // eslint-disable-line no-undef
): React.ReactNode {
  return (
    <Grid item key="no-modlets" className={classes.cardEmpty}>
      <Typography variant="h6" className={classes.noModletsHeader}>
        No Modlets Installed
      </Typography>
      <Divider variant="middle" />
      <Typography variant="body1" className={classes.noModletsBody}>
        To install mods, place them in {modsPath}
        {button}
      </Typography>
    </Grid>
  );
}

function Modlets(props: ModletsProps): React.ReactElement {
  let modletList: React.ReactNode[] | React.ReactNode;
  const [button, setButton] = useState(<span />);
  const classes = useStyles();
  const modsPath = props.state.config.gameFolder
    ? path.win32.normalize(path.join(props.state.config.gameFolder, "Mods"))
    : "";

  modletList = props.state.modlets.length
    ? props.state.advancedMode
      ? modletsListAdvanced(props, classes)
      : modletsListBasic(props, classes)
    : noModlets(modsPath, button, classes);

  useEffect(() => {
    const createModsFolder = () => {
      if (!fileExists(modsPath)) {
        fs.mkdirSync(modsPath);
        setButton(<span />);
      }
    };

    if (!button && !fileExists(modsPath)) {
      setButton(
        <Button className={classes.button} onClick={createModsFolder}>
          Create Mods Folder?
        </Button>
      );
    }
  }, [props.state.config.gameFolder, button, modsPath, classes.button]);

  return (
    <Grid container spacing={2} className={classes.root}>
      {modletList}
    </Grid>
  );
}

Modlets.propTypes = {
  state: PropTypes.object.isRequired
};

export default Modlets;

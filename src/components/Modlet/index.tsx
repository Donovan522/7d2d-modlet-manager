import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Checkbox from "@material-ui/core/Checkbox";
import { green, red } from "@material-ui/core/colors";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import CancelIcon from "@material-ui/icons/Cancel";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";
import { remote } from "electron";
import fs from "fs";
import { fileExists } from "helpers";
import path from "path";
import PropTypes from "prop-types";
import React, { useState } from "react";

interface ModletProps {
  state: IState;
  modletState: IModletState;
  handleValidation: any;
}

const useStyles = makeStyles(theme => ({
  root: {
    height: "auto"
  },
  box: {
    display: "flex",
    flexFlow: "column",
    alignContent: "flex-start",
    justifyContent: "flex-end",
    marginLeft: "auto"
  },
  cardVersion: {
    fontStyle: "italic",
    marginRight: "auto",
    paddingLeft: theme.spacing(1)
  },
  enableControl: {
    marginLeft: "auto",
    paddingRight: theme.spacing(1)
  },
  italic: {
    fontStyle: "italic"
  },
  description: {
    paddingTop: theme.spacing(1)
  },
  iconOK: {
    color: green[500]
  },
  iconNotOK: {
    color: red[500]
  },
  checkbox: {
    padding: 0,
    paddingRight: theme.spacing(1)
  },
  validationErrors: {
    color: red[500],
    paddingTop: theme.spacing(1)
  }
}));

function ModletComponent(props: ModletProps): React.ReactElement {
  const { modletState, state } = props;

  const modletDir = path.win32.normalize(path.dirname(modletState.modlet.modInfo.file));
  const modletInstallPath = path.win32.normalize(path.join(state.gameFolder, "Mods", path.basename(modletDir)));
  const modletLocal = modletDir === modletInstallPath;

  const classes = useStyles();

  const checkedOK: React.ReactNode = <CheckCircleIcon className={classes.iconOK} />;
  const checkedFAIL: React.ReactNode = <CancelIcon className={classes.iconNotOK} />;
  const checkedDISABLED: React.ReactNode = <CancelIcon color="primary" />;
  const checkedNeutral: React.ReactNode = <RadioButtonUncheckedIcon />;

  const [enabled, setEnabled] = useState(modletState.modlet.isEnabled());
  const [installed, setInstalled] = useState(fileExists(modletInstallPath));

  const conditions: React.ReactNode[] = [];
  if (!modletLocal)
    conditions.push(
      <FormControlLabel
        key="status-installed"
        control={
          <Checkbox
            disableRipple
            disabled={modletDir === modletInstallPath}
            icon={checkedNeutral}
            checkedIcon={checkedOK}
            checked={installed}
            onChange={() => handleInstallClick()}
            className={classes.checkbox}
          />
        }
        label={installed ? "Installed" : "Not Installed"}
      />
    );

  conditions.push(
    <FormControlLabel
      key="status-enabled"
      control={
        <Checkbox
          disableRipple
          icon={checkedDISABLED}
          checkedIcon={checkedOK}
          checked={enabled}
          onChange={e => handleEnableClick(e)}
          className={classes.checkbox}
        />
      }
      label={enabled ? "Enabled" : "Disabled"}
    />,
    <FormControlLabel
      key="status-validated"
      control={
        <Checkbox
          disableRipple
          icon={checkedNeutral}
          checkedIcon={modletState.errors.length === 0 ? checkedOK : checkedFAIL}
          checked={modletState.validated}
          onChange={() => props.handleValidation(modletState)}
          className={classes.checkbox}
        />
      }
      label={modletState.validated ? (modletState.errors.length === 0 ? "Valid" : "Errors") : "Validate"}
    />
  );

  const errorDialog = (title: string, err: Error) => {
    remote.dialog.showMessageBox({
      type: "error",
      title: title,
      message: err.message
    });
  };

  const handleInstallClick = () => {
    if (installed) {
      setInstalled(false);
      try {
        if (modletLocal) throw new Error(`Error: Will not remove original modlet ${modletInstallPath}`);

        if (!fileExists(modletInstallPath) || !fs.statSync(modletInstallPath).isDirectory())
          throw new Error(`Error: ${modletState.modlet.modInfo.folderName} is not installed`);

        fs.unlinkSync(modletInstallPath);
      } catch (err) {
        setInstalled(true);
        errorDialog("Unable to uninstall modlet", err);
      }
    } else {
      setInstalled(true);
      try {
        if (modletLocal || fileExists(modletInstallPath))
          throw new Error(`Error: ${modletInstallPath} is already installed`);

        fs.promises
          .symlink(modletDir, modletInstallPath, "junction")
          .then(() => setInstalled(true))
          .catch(err => errorDialog("Unable to install modlet", err));
      } catch (err) {
        setInstalled(false);
        errorDialog("Unable to install modlet", err);
      }
    }
  };

  const handleEnableClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(event.target.checked);
    modletState.modlet.enable(event.target.checked);
  };

  const modletData = {
    name: modletState.modlet.get("name"),
    author: modletState.modlet.get("author"),
    description: modletState.modlet.get("description"),
    version: modletState.modlet.get("version"),
    compatibility: modletState.modlet.get("compat")
  };

  const errorBlock = (
    <ul>
      {modletState.errors.map((error, index) => (
        <li key={index}>
          <Typography className={classes.validationErrors} variant="body2" color="textSecondary">
            {error}
          </Typography>
        </li>
      ))}
    </ul>
  );

  return state.advancedMode ? (
    <TableRow>
      <TableCell>
        <Typography>{modletData.name}</Typography>
        <Typography className={classes.description} variant="body2" color="textSecondary">
          {modletData.description}
        </Typography>
        {modletState.errors.length !== 0 && errorBlock}
      </TableCell>
      <TableCell>
        <Typography>{modletData.author}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography>{modletData.version}</Typography>
        <Typography className={classes.italic} variant="body2" color="textSecondary">
          {modletData.compatibility}
        </Typography>
      </TableCell>
      <TableCell>
        <Box className={classes.box}>{conditions}</Box>
      </TableCell>
    </TableRow>
  ) : (
    <Card className={classes.root}>
      <CardContent>
        <Typography>{modletData.name}</Typography>
        <Typography className={classes.description} variant="body2" color="textSecondary">
          {modletData.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Typography className={classes.cardVersion} variant="caption" component="div" color="textSecondary">
          By {modletData.author} - v{modletData.version}{" "}
          {modletData.compatibility !== "unknown" && <i> (compatibility: {modletData.compatibility})</i>}
        </Typography>
        <FormControlLabel
          className={classes.enableControl}
          control={<Switch size="small" checked={enabled} onChange={e => handleEnableClick(e)} />}
          label={enabled ? "Enabled" : "Disabled"}
          labelPlacement="start"
        />
      </CardActions>
    </Card>
  );
}

ModletComponent.propTypes = {
  state: PropTypes.object.isRequired,
  modletState: PropTypes.object.isRequired,
  handleValidation: PropTypes.func.isRequired
};

export default ModletComponent;

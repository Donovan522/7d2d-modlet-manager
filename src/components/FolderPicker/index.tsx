import Fade from "@material-ui/core/Fade";
import IconButton from "@material-ui/core/IconButton";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import FolderIcon from "@material-ui/icons/Folder";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import { shell } from "electron";
import PropTypes from "prop-types";
import React from "react";

interface IFolderPickerProps {
  advancedMode: boolean;
  folder: string;
  handleClick: (event: React.MouseEvent | null) => void;
  label: string;
  tooltip: string | undefined;
}

const useStyles = makeStyles(theme => ({
  listItem: {
    backgroundColor: theme.palette.background.paper,
    cursor: "pointer",
    margin: "5px 0px",
    borderRadius: 5
  }
}));

function FolderPicker(props: IFolderPickerProps): React.ReactElement {
  const classes = useStyles();

  const handleFolderExternalClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    shell.openItem(props.folder);
  };

  return (
    <Tooltip
      title={props.tooltip}
      color="secondary"
      placement="top-start"
      enterDelay={500}
      leaveDelay={200}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 600 }}
    >
      <ListItem className={classes.listItem} onClick={props.handleClick}>
        <ListItemIcon>
          <FolderIcon />
        </ListItemIcon>
        <ListItemText primary={props.label} secondary={props.folder} />
        {props.advancedMode && (
          <ListItemIcon style={{ marginLeft: "auto" }}>
            <IconButton size="small" aria-label="open-folder" onClick={handleFolderExternalClick}>
              <MoreHorizIcon />
            </IconButton>
          </ListItemIcon>
        )}
      </ListItem>
    </Tooltip>
  );
}

FolderPicker.propTypes = {
  advancedMode: PropTypes.bool.isRequired,
  folder: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  tooltip: PropTypes.string
};

export default FolderPicker;

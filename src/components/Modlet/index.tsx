import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { Modlet } from "../../helpers";

interface ModletProps {
  advancedMode: boolean;
  modlet: Modlet;
}

const ModletComponent = (props: ModletProps) => {
  const [enabled, setEnabled] = useState(props.modlet.enabled);

  const handleEnableClick = (event: React.ChangeEvent<HTMLInputElement>, modlet: Modlet) => {
    setEnabled(event.target.checked);
    modlet.enable(event.target.checked);
  };

  return (
    <Card>
      <CardContent>
        <Typography>{props.modlet.name}</Typography>
        <Typography variant="body2" color="textSecondary">
          {props.modlet.description}
        </Typography>
        <Typography style={{ paddingTop: 15 }} variant="caption" component="div" color="textSecondary">
          By {props.modlet.author} - v.{props.modlet.version}&nbsp;
          {props.modlet.compat !== "unknown" && <i>(compatible with: {props.modlet.compat})</i>}
        </Typography>
      </CardContent>
      <CardActions>
        {props.advancedMode || (
          <FormControlLabel
            style={{ marginLeft: "auto" }}
            control={<Switch size="small" checked={enabled} onChange={e => handleEnableClick(e, props.modlet)} />}
            label={enabled ? "Enabled" : "Disabled"}
          />
        )}
      </CardActions>
    </Card>
  );
};

ModletComponent.prototypes = {
  advancedMode: PropTypes.bool.isRequired,
  modlet: PropTypes.string.isRequired
};

export default ModletComponent;

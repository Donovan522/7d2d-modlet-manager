import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import { Modlet } from "helpers";
import PropTypes from "prop-types";
import React, { useState } from "react";

interface ModletProps {
  advancedMode: boolean;
  modlet: Modlet;
}

const ModletComponent = (props: ModletProps) => {
  const [enabled, setEnabled] = useState(props.modlet.isEnabled());

  const handleEnableClick = (event: React.ChangeEvent<HTMLInputElement>, modlet: Modlet) => {
    setEnabled(event.target.checked);
    modlet.enable(event.target.checked);
  };

  let formControl: React.ReactNode;

  if (!props.advancedMode) {
    // what to render in Basic mode
    formControl = (
      <FormControlLabel
        style={{ marginLeft: "auto" }}
        control={<Switch size="small" checked={enabled} onChange={e => handleEnableClick(e, props.modlet)} />}
        label={enabled ? "Enabled" : "Disabled"}
      />
    );
  } else {
    // What to render in advancedMode
    formControl = <span />;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="body1">{props.modlet.get("name")}</Typography>
        <Typography variant="body2" color="textSecondary">
          {props.modlet.get("description")}
        </Typography>
        <Typography style={{ paddingTop: 15 }} variant="caption" component="div" color="textSecondary">
          By {props.modlet.get("author")} - v.{props.modlet.get("version")}&nbsp;
          {props.modlet.get("compat") !== "unknown" && <i>(compatible with: {props.modlet.get("compat")})</i>}
        </Typography>
      </CardContent>
      <CardActions>{formControl}</CardActions>
    </Card>
  );
};

ModletComponent.prototypes = {
  advancedMode: PropTypes.bool.isRequired,
  modlet: PropTypes.instanceOf(Modlet).isRequired
};

export default ModletComponent;

import { Paper } from "@mui/material";

export function PropertyView() {
  return (
    <Paper elevation={3} style={{ padding: "1em", height: "100%" }}>
      <h2>Properties</h2>
      <p>Select a node to view its properties.</p>
    </Paper>
  );
}

import React, { useState } from "react";
import type { Uniforms, Uniform } from "../../compiler/graph/uniform";
import { allTypeNames } from "@glsl/types/typenames";
import { Box, Typography, Button, TextField, Select, MenuItem, InputLabel, FormControl, Stack, Paper } from "@mui/material";
import UniformItem from "./UniformItem";

interface UniformsPanelProps {
  uniforms: Uniforms;
  onAdd: (name: string, type: string) => void;
  onRemove: (name: string) => void;
}

export const UniformsPanel: React.FC<UniformsPanelProps> = ({ uniforms, onAdd, onRemove }) => {
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState(allTypeNames[0]);

  const handleAdd = () => {
    if (newName.trim() && newType) {
      onAdd(newName.trim(), newType);
      setNewName("");
      setNewType(allTypeNames[0]);
    }
  };

  return (
    <Paper sx={{ p: 2, height: "100%", overflowY: "auto", width: "100%", bgcolor: "#222", color: "#fff" }}>
      <Typography variant="h6" gutterBottom>Uniforms</Typography>
      <Stack spacing={1}>
        {Object.entries(uniforms).map(([name, uniform]) => (
          <UniformItem key={name} name={name} uniform={uniform as Uniform} onRemove={onRemove} />
        ))}
      </Stack>
      <Box mt={3} display="flex" gap={1} alignItems="center">
        <TextField
          label="Name"
          variant="outlined"
          size="small"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          sx={{ flex: 2, bgcolor: "#111", input: { color: "#fff" }, label: { color: "#aaa" } }}
        />
        <FormControl size="small" sx={{ flex: 1, minWidth: 100 }}>
          <InputLabel sx={{ color: "#aaa" }}>Type</InputLabel>
          <Select
            value={newType}
            label="Type"
            onChange={(e) => setNewType(e.target.value)}
            sx={{ bgcolor: "#111", color: "#fff" }}
          >
            {allTypeNames.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="success"
          onClick={handleAdd}
          sx={{ height: 40 }}
        >
          Add
        </Button>
      </Box>
    </Paper>
  );
};

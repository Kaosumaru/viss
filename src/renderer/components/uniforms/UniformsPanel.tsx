import React, { useContext, useState } from "react";
import type { Uniform } from "../../../compiler/graph/uniform";

import { uniformVisualizers, uniformComponents } from "./entries";
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Stack,
  Paper,
} from "@mui/material";
import UniformItem from "./UniformItem";
import type { ParameterValue } from "@graph/parameter";
import { EditorContext } from "@renderer/context/EditorContext";

export const UniformsPanel: React.FC = () => {
  const editorData = useContext(EditorContext).editor;
  const [newName, setNewName] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!editorData) {
    return null;
  }

  const uniforms = editorData.uniforms();

  const handleAdd = async () => {
    const entry = uniformVisualizers[selectedIndex];
    if (newName.trim() && entry) {
      const uniform: Uniform = {
        id: newName.trim(),
        type: entry.type,
        defaultValue: entry.defaultValue,
        visualizer: entry.visualizer,
      };
      await editorData.updateUniform(uniform);
      setNewName("");
      setSelectedIndex(0);
    }
  };

  const onChange = async (uniform: Uniform) => {
    await editorData.updateUniform(uniform);
  };

  const onChangeValue = async (name: string, defaultValue: ParameterValue) => {
    await editorData.updateUniformDefaultValue(name, defaultValue);
  };

  const handleRemove = async (name: string) => {
    await editorData?.removeUniform(name);
  };

  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        overflowY: "auto",
        width: "100%",
        bgcolor: "#222",
        color: "#fff",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Uniforms
      </Typography>
      <Stack spacing={1}>
        {Object.entries(uniforms).map(([name, uniform]) => {
          const Comp =
            uniformComponents[
              uniform.visualizer?.id as keyof typeof uniformComponents
            ] || UniformItem;
          return (
            <Comp
              key={name}
              name={name}
              uniform={uniform}
              onChange={onChange}
              onChangeValue={(value) => onChangeValue(name, value)}
              onRemove={handleRemove}
            />
          );
        })}
      </Stack>
      <Box mt={3} display="flex" gap={1} alignItems="center">
        <TextField
          label="Name"
          variant="outlined"
          size="small"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          sx={{
            flex: 2,
            bgcolor: "#111",
            input: { color: "#fff" },
            label: { color: "#aaa" },
          }}
        />
        <FormControl size="small" sx={{ flex: 1, minWidth: 100 }}>
          <InputLabel sx={{ color: "#aaa" }}>Type</InputLabel>
          <Select
            value={selectedIndex}
            label="Type"
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            sx={{ bgcolor: "#111", color: "#fff" }}
          >
            {uniformVisualizers.map((entry, idx) => (
              <MenuItem key={entry.name} value={idx}>
                {entry.name}
              </MenuItem>
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

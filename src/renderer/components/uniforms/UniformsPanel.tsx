import React, { useEffect, useState } from "react";
import type {
  Uniforms,
  Uniform,
  UniformVisualizer,
} from "../../../compiler/graph/uniform";
import { type ScalarTypeName } from "@glsl/types/typenames";
import { uniformVisualizers } from "./entries";
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
import type { EditorAPI } from "renderer/graph/interface";

interface UniformsPanelProps {
  editorData: EditorAPI | undefined;
}

export const UniformsPanel: React.FC<UniformsPanelProps> = ({ editorData }) => {
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState(uniformVisualizers[0]?.name || "");
  const [uniforms, setUniforms] = useState<Uniforms>({});

  useEffect(() => {
    if (editorData) {
      setUniforms(editorData.uniforms());
    }
  }, [editorData]);

  if (!editorData) {
    return null;
  }

  const handleAdd = async () => {
    if (newName.trim() && newType) {
      // Only support scalar types for now
      const uniform: Uniform = {
        id: newName.trim(),
        type: {
          id: "scalar",
          type: newType as ScalarTypeName,
        },
      };
      await editorData.updateUniform(uniform);
      setUniforms(editorData.uniforms());
      setNewName("");
  setNewType(uniformVisualizers[0]?.name || "");
    }
  };

  const onChange = async (uniform: Uniform) => {
    await editorData.updateUniform(uniform);
    setUniforms(editorData.uniforms());
  };

  const handleRemove = async (name: string) => {
    await editorData?.removeUniform(name);
    setUniforms(editorData.uniforms());
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
        {Object.entries(uniforms).map(([name, uniform]) => (
          <UniformItem
            key={name}
            name={name}
            uniform={uniform as Uniform}
            onChange={onChange}
            onRemove={handleRemove}
          />
        ))}
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
            value={newType}
            label="Type"
            onChange={(e) => setNewType(e.target.value)}
            sx={{ bgcolor: "#111", color: "#fff" }}
          >
            {uniformVisualizers.map((entry) => (
              <MenuItem key={entry.name} value={entry.name}>
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

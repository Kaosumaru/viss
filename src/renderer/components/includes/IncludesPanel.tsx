import React, { useContext, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { EditorContext } from "@renderer/context/EditorContext";

export const IncludesPanel: React.FC = () => {
  const editorData = useContext(EditorContext).editor;
  const [newIncludeName, setNewIncludeName] = useState("");

  if (!editorData) {
    return null;
  }

  const includes = editorData.includes();

  const handleAdd = async () => {
    if (newIncludeName.trim()) {
      await editorData.addInclude(newIncludeName.trim());
      setNewIncludeName("");
    }
  };

  const handleRemove = async (includeName: string) => {
    await editorData.removeInclude(includeName);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      void handleAdd();
    }
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
        Included Files
      </Typography>

      {includes.length === 0 ? (
        <Typography variant="body2" sx={{ color: "#aaa", mb: 2 }}>
          No includes added yet
        </Typography>
      ) : (
        <List sx={{ mb: 2 }}>
          {includes.map((includeName) => (
            <ListItem
              key={includeName}
              sx={{
                px: 0,
                py: 1,
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "#333",
                },
              }}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  size="small"
                  color="error"
                  onClick={() => void handleRemove(includeName)}
                  sx={{ color: "#ff6b6b" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText
                primary={includeName}
                slotProps={{
                  primary: {
                    sx: { color: "#fff", fontSize: "0.875rem" },
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Box mt={3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Include Name"
            variant="outlined"
            size="small"
            fullWidth
            value={newIncludeName}
            onChange={(e) => {
              setNewIncludeName(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g., myInclude.glsl"
            sx={{
              bgcolor: "#111",
              input: { color: "#fff" },
              label: { color: "#aaa" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#555",
                },
                "&:hover fieldset": {
                  borderColor: "#777",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1976d2",
                },
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => void handleAdd()}
            disabled={!newIncludeName.trim()}
            startIcon={<AddIcon />}
            sx={{
              height: 40,
              minWidth: "auto",
              px: 2,
            }}
          >
            Add
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

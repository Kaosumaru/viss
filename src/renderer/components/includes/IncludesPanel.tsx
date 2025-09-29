import React, { useContext, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { EditorContext } from "@renderer/context/EditorContext";
import type { FilePath } from "@graph/graph";

export const IncludesPanel: React.FC = () => {
  const editorData = useContext(EditorContext).editor;
  const [includes, setIncludes] = React.useState<FilePath[]>([]);

  useEffect(() => {
    setIncludes(editorData?.includes() ?? []);
  }, [editorData]);

  if (!editorData) {
    return null;
  }

  const handleAdd = async () => {
    await editorData.addIncludeFromFile();
    setIncludes(editorData.includes());
  };

  const handleRemove = async (include: FilePath) => {
    await editorData.removeInclude(include);
    setIncludes(editorData.includes());
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
          {includes.map((include) => (
            <ListItem
              key={include.path}
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
                  onClick={() => void handleRemove(include)}
                  sx={{ color: "#ff6b6b" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText
                primary={include.path}
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
        <Button
          variant="contained"
          color="primary"
          onClick={() => void handleAdd()}
          startIcon={<AddIcon />}
          sx={{
            height: 40,
            minWidth: "auto",
            px: 2,
          }}
        >
          Add
        </Button>
      </Box>
    </Paper>
  );
};

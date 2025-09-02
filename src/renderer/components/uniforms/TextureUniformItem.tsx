import React, { useContext } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { typeToName } from "../../../compiler/glsl/types/typeToString";
import type { UniformItemProps } from "./UniformItem";
import { EditorContext } from "@renderer/context/EditorContext";

const TextureUniformItem: React.FC<UniformItemProps> = ({
  name,
  uniform,
  onChangeValue,
  onRemove,
}) => {
  const { editor } = useContext(EditorContext);

  const handleClick = async () => {
    if (
      uniform.defaultValue &&
      uniform.defaultValue.type === "string" &&
      editor
    ) {
      const imgUrl = await editor.selectImage();
      if (imgUrl) {
        onChangeValue({ ...uniform.defaultValue, value: imgUrl });
      }
    }
  };

  return (
    <Box display="flex" alignItems="center" mb={1} gap={1}>
      <Typography variant="body1" sx={{ flex: 1 }}>
        {name}{" "}
        <span style={{ color: "#aaa" }}>({typeToName(uniform.type)})</span>
      </Typography>
      <Button onClick={handleClick}>Load</Button>
      <IconButton
        aria-label="delete"
        size="small"
        color="error"
        onClick={() => onRemove(name)}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default TextureUniformItem;

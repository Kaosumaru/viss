import React from "react";
import {
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const SearchContainer = styled(Box)(() => ({
  padding: "8px 8px",
  borderBottom: "1px solid #464647",
  backgroundColor: "#383838",
}));

const StyledTextField = styled(TextField)(() => ({
  "& .MuiInputBase-root": {
    color: "#ffffff",
    fontSize: "14px",
    backgroundColor: "#1e1e1e",
    "& fieldset": {
      border: "1px solid #464647",
    },
    "&:hover fieldset": {
      borderColor: "#007acc",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#007acc",
    },
  },
  "& .MuiInputAdornment-root": {
    color: "#cccccc",
  },
}));

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  inputRef,
}) => {
  return (
    <SearchContainer>
      <StyledTextField
        inputRef={inputRef}
        placeholder="Search nodes..."
        variant="outlined"
        size="small"
        fullWidth
        value={searchTerm}
        onChange={(e) => {
          onSearchChange(e.target.value);
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
    </SearchContainer>
  );
};
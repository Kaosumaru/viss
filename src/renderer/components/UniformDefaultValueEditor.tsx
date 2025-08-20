import React from "react";

type UniformDefaultValueType = number | number[];

interface UniformDefaultValueEditorProps {
  type: string;
  value: UniformDefaultValueType;
  onChange: (value: UniformDefaultValueType) => void;
}

export const UniformDefaultValueEditor: React.FC<
  UniformDefaultValueEditorProps
> = ({ type, value, onChange }) => {
  // Only support float and vector types for now
  if (type === "float") {
    return (
      <input
        type="number"
        value={typeof value === "number" ? value : ""}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: 80, marginLeft: 8 }}
        step="any"
      />
    );
  }

  if (type.startsWith("vec")) {
    const dim = parseInt(type.replace("vec", ""), 10);
    const arr = Array.isArray(value) ? value : Array(dim).fill(0);
    return (
      <span style={{ marginLeft: 8 }}>
        {arr.map((v: number, i: number) => (
          <input
            key={i}
            type="number"
            value={v}
            onChange={e => {
              const newArr = [...arr];
              newArr[i] = parseFloat(e.target.value);
              onChange(newArr);
            }}
            style={{ width: 50, marginRight: 4 }}
            step="any"
          />
        ))}
      </span>
    );
  }

  return null;
};

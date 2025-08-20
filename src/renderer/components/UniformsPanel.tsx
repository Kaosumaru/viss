import React, { useState } from "react";
import type { Uniforms, Uniform } from "../../compiler/graph/uniform";
import { typeToName } from "../../compiler/glsl/types/typeToString";
import { allTypeNames } from "@glsl/types/typenames";

interface UniformsPanelProps {
  uniforms: Uniforms;
  onAdd: (name: string, type: string) => void;
  onRemove: (name: string) => void;
}

export const UniformsPanel: React.FC<UniformsPanelProps> = ({
  uniforms,
  onAdd,
  onRemove,
}) => {
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
    <div
      style={{
        padding: 16,
        height: "100%",
        overflowY: "auto",
        width: "100%",
        background: "#222",
        color: "#fff",
      }}
    >
      <h3>Uniforms</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {Object.entries(uniforms).map(([name, uniform]) => (
          <li
            key={name}
            style={{ display: "flex", alignItems: "center", marginBottom: 8 }}
          >
            <span style={{ flex: 1 }}>
              {name}{" "}
              <span style={{ color: "#aaa" }}>
                ({typeToName((uniform as Uniform).type)})
              </span>
            </span>
            <button
              onClick={() => onRemove(name)}
              style={{
                marginLeft: 8,
                background: "#c00",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                padding: "2px 8px",
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 24 }}>
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{
            width: "45%",
            marginRight: 8,
            padding: 4,
            borderRadius: 4,
            border: "1px solid #444",
            background: "#111",
            color: "#fff",
          }}
        />
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          style={{
            width: "35%",
            marginRight: 8,
            padding: 4,
            borderRadius: 4,
            border: "1px solid #444",
            background: "#111",
            color: "#fff",
          }}
        >
          {allTypeNames.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          style={{
            padding: "4px 12px",
            borderRadius: 4,
            background: "#28a745",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import type { Uniforms, Uniform } from "../../compiler/graph/uniform";
import { allTypeNames } from "@glsl/types/typenames";
import { UniformDisplay } from "./UniformDisplay";
import { UniformDefaultValueEditor } from "./UniformDefaultValueEditor";

interface UniformsPanelProps {
  uniforms: Uniforms;
  onAdd: (name: string, type: string) => void;
  onRemove: (name: string) => void;
  onSetDefaultValue?: (name: string, value: number | number[]) => void;
}

export const UniformsPanel: React.FC<UniformsPanelProps> = ({
  uniforms,
  onAdd,
  onRemove,
  onSetDefaultValue,
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
        {Object.entries(uniforms).map(([name, uniform]) => {
          let canEditDefault = false;
          let typeString = "";
          if (uniform.type.id === "scalar" && uniform.type.type === "float") {
            canEditDefault = true;
            typeString = "float";
          } else if (
            uniform.type.id === "vector" &&
            uniform.type.type === "float"
          ) {
            canEditDefault = true;
            typeString = `vec${uniform.type.size}`;
          }
          return (
            <li
              key={name}
              style={{ display: "flex", alignItems: "center", marginBottom: 8 }}
            >
              <span style={{ flex: 1 }}>
                <UniformDisplay name={name} uniform={uniform as Uniform} />
                {canEditDefault && onSetDefaultValue && (
                  <UniformDefaultValueEditor
                    type={typeString}
                    value={(() => {
                      if (
                        uniform.defaultValue &&
                        "value" in uniform.defaultValue
                      ) {
                        const v = uniform.defaultValue.value;
                        if (typeof v === "number") return v;
                        if (
                          Array.isArray(v) &&
                          v.every((x) => typeof x === "number")
                        )
                          return v;
                      }
                      if (typeString === "float") return 0;
                      if (typeString.startsWith("vec"))
                        return Array(
                          parseInt(typeString.replace("vec", ""), 10)
                        ).fill(0);
                      return 0;
                    })()}
                    onChange={(v) => onSetDefaultValue(name, v)}
                  />
                )}
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
          );
        })}
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

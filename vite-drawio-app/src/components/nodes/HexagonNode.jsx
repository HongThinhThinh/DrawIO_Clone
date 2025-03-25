import React, { useState, useRef, useEffect } from "react";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import useStore from "../../store/useStore";

function HexagonNode({ id, data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label || "Hexagon");
  const inputRef = useRef(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const updateNodeData = useStore((state) => state.updateNodeData);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setLabel(data?.label || "Hexagon");
  }, [data?.label]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    updateNodeData(id, { ...data, label });
    updateNodeInternals(id);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      updateNodeData(id, { ...data, label });
      updateNodeInternals(id);
    }
  };

  // Get node style with proper hexagon shape
  const getNodeStyle = () => {
    return {
      width: "120px",
      height: "104px", // Adjusted for better hexagon proportions
      backgroundColor: data?.color || "#e1bee7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
      // Remove border and use box-shadow instead for better appearance
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
      padding: "10px",
    };
  };

  const getContentStyle = () => {
    return {
      width: "100%",
      textAlign: "center",
      fontSize: data?.style?.fontSize || "14px",
      color: "var(--text-dark)",
      fontWeight: "500",
    };
  };

  return (
    <div
      className={`custom-node hexagon-node ${selected ? "selected" : ""}`}
      style={getNodeStyle()}
      onDoubleClick={handleDoubleClick}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="handle"
        style={{
          top: "-5px", // Adjust handle position
        }}
      />
      <div style={getContentStyle()}>
        {isEditing ? (
          <input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="node-input"
            style={{
              maxWidth: "80px",
              color: "var(--text-dark)",
            }}
          />
        ) : (
          <div className="node-content">{label}</div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="handle"
        style={{
          bottom: "-5px", // Adjust handle position
        }}
      />
    </div>
  );
}

export default HexagonNode;

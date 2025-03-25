import { useState, useRef, useEffect } from "react";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import useStore from "../../store/useStore";

function DiamondNode({ id, data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || "Diamond");
  const inputRef = useRef(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const updateNodeData = useStore((state) => state.updateNodeData);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Cập nhật label khi data thay đổi từ bên ngoài
  useEffect(() => {
    setLabel(data.label || "Diamond");
  }, [data.label]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Cập nhật node data khi hoàn thành chỉnh sửa
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

  // Xử lý style từ data - tạo hình thoi
  const getNodeStyle = () => {
    const baseStyle = {
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "#1a192b",
      backgroundColor: data.color || "#ffffff",
      width: "100px",
      height: "100px",
      transform: "rotate(45deg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
      color: "var(--text-dark)",
    };

    // Nếu có style trong data, áp dụng nó
    if (data.style) {
      return {
        ...baseStyle,
        ...data.style,
        backgroundColor:
          data.color || data.style.backgroundColor || baseStyle.backgroundColor,
        transform: data.style.transform || "rotate(45deg)",
      };
    }

    return baseStyle;
  };

  // Xử lý nội dung để hiển thị ngược với góc xoay của node
  const getContentStyle = () => {
    return {
      transform: "rotate(-45deg)",
      width: "100%",
      textAlign: "center",
      fontSize: "14px",
      color: "var(--text-dark)",
    };
  };

  // Xử lý vị trí của handle
  const getHandleStyle = (position, baseStyle = {}) => {
    return {
      ...baseStyle,
    };
  };

  return (
    <div
      className={`custom-node diamond-node ${selected ? "selected" : ""}`}
      onDoubleClick={handleDoubleClick}
      style={getNodeStyle()}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="handle"
        style={getHandleStyle(Position.Top, {
          transform: "rotate(-45deg)",
          top: "-15px",
        })}
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
              maxWidth: "70px",
              transform: "rotate(-45deg)",
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
        style={getHandleStyle(Position.Bottom, {
          transform: "rotate(-45deg)",
          bottom: "-15px",
        })}
      />
    </div>
  );
}

export default DiamondNode;

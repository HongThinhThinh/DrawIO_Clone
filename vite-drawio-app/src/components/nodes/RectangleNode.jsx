import { useState, useRef, useEffect } from "react";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import useStore from "../../store/useStore";

function RectangleNode({ id, data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || "Rectangle");
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
    setLabel(data.label || "Rectangle");
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

  // Xử lý style từ data
  const getNodeStyle = () => {
    const baseStyle = {
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "#1a192b",
      borderRadius: "3px",
      padding: "10px",
      fontSize: "14px",
      backgroundColor: data.color || "#ffffff",
      color: "var(--text-dark)",
    };

    // Nếu có style trong data, áp dụng nó
    if (data.style) {
      return {
        ...baseStyle,
        ...data.style,
        backgroundColor:
          data.color || data.style.backgroundColor || baseStyle.backgroundColor,
        color: "var(--text-dark)", // Đảm bảo text luôn có màu đen
      };
    }

    return baseStyle;
  };

  // Xử lý position của handles theo góc xoay
  const getHandleStyle = (position) => {
    // Không cần điều chỉnh vị trí của handle trong node hình chữ nhật
    return {};
  };

  return (
    <div
      className={`custom-node rect-node ${selected ? "selected" : ""}`}
      onDoubleClick={handleDoubleClick}
      style={getNodeStyle()}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="handle"
        style={getHandleStyle(Position.Top)}
      />
      {isEditing ? (
        <input
          ref={inputRef}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="node-input"
          style={{ color: "var(--text-dark)" }}
        />
      ) : (
        <div className="node-content">{label}</div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="handle"
        style={getHandleStyle(Position.Bottom)}
      />
    </div>
  );
}

export default RectangleNode;

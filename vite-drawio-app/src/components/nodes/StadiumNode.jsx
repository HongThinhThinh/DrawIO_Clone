import { useState, useRef, useEffect } from "react";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import useStore from "../../store/useStore";

function StadiumNode({ id, data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || "Stadium");
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
    setLabel(data.label || "Stadium");
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

  // Xử lý style từ data - tạo hình stadium (hình tròn dẹt)
  const getNodeStyle = () => {
    const baseStyle = {
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "#1a192b",
      backgroundColor: data.color || "#ffffff",
      width: "160px",
      height: "60px",
      borderRadius: "30px", // Radius lớn tạo hình stadium
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
      padding: "10px",
      fontSize: "14px",
      color: "var(--text-dark)",
    };

    // Nếu có style trong data, áp dụng nó
    if (data.style) {
      return {
        ...baseStyle,
        ...data.style,
        backgroundColor:
          data.color || data.style.backgroundColor || baseStyle.backgroundColor,
        borderRadius: "30px", // Đảm bảo luôn giữ hình stadium
      };
    }

    return baseStyle;
  };

  // Xử lý vị trí của handle
  const getHandleStyle = (position) => {
    return {}; // Không cần điều chỉnh vị trí handle
  };

  return (
    <div
      className={`custom-node stadium-node ${selected ? "selected" : ""}`}
      onDoubleClick={handleDoubleClick}
      style={getNodeStyle()}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="handle"
        style={getHandleStyle(Position.Left)}
      />
      {isEditing ? (
        <input
          ref={inputRef}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="node-input"
          style={{
            maxWidth: "140px",
            color: "var(--text-dark)",
          }}
        />
      ) : (
        <div className="node-content">{label}</div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="handle"
        style={getHandleStyle(Position.Right)}
      />
    </div>
  );
}

export default StadiumNode;

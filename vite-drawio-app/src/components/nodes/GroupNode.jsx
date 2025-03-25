import { useState, useRef, useEffect } from "react";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import useStore from "../../store/useStore";

function GroupNode({ id, data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(data?.label || "Group");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const updateNodeData = useStore((state) => state.updateNodeData);
  const resizeGroupNode = useStore((state) => state.resizeGroupNode);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Cập nhật tên nhóm khi data thay đổi
  useEffect(() => {
    setGroupName(data?.label || "Group");
  }, [data?.label]);

  const handleDoubleClick = (e) => {
    // Chỉ double-click vào header mới sửa tên
    if (e.target.closest(".group-node-header")) {
      setIsEditing(true);
      e.stopPropagation();
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (data) {
      updateNodeData(id, { ...data, label: groupName });
    }
    updateNodeInternals(id);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      if (data) {
        updateNodeData(id, { ...data, label: groupName });
      }
      updateNodeInternals(id);
    }
  };

  // Xử lý resize group
  const handleResizeStart = (e, position) => {
    e.stopPropagation();
    setIsDragging(true);

    const handleResize = (moveEvent) => {
      if (!isDragging) return;

      const { clientX, clientY } = moveEvent;
      const groupRect = e.target.closest(".group-node").getBoundingClientRect();

      let newWidth = data?.width || 300;
      let newHeight = data?.height || 200;

      switch (position) {
        case "br":
          newWidth = Math.max(100, clientX - groupRect.left);
          newHeight = Math.max(100, clientY - groupRect.top);
          break;
        case "bl":
          newWidth = Math.max(100, groupRect.right - clientX);
          newHeight = Math.max(100, clientY - groupRect.top);
          break;
        case "tr":
          newWidth = Math.max(100, clientX - groupRect.left);
          newHeight = Math.max(100, groupRect.bottom - clientY);
          break;
        case "tl":
          newWidth = Math.max(100, groupRect.right - clientX);
          newHeight = Math.max(100, groupRect.bottom - clientY);
          break;
        default:
          break;
      }

      if (resizeGroupNode) {
        resizeGroupNode(id, { width: newWidth, height: newHeight });
      }
    };

    const handleResizeEnd = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", handleResizeEnd);
    };

    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const width = data?.width || 300;
  const height = data?.height || 200;

  return (
    <div
      className={`group-node ${selected ? "selected" : ""}`}
      style={{
        width,
        height,
        backgroundColor: data?.color || "rgba(240, 240, 240, 0.7)",
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Group header */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="group-input"
        />
      ) : (
        <div className="group-node-header">{groupName}</div>
      )}

      {/* Resize handles */}
      <div
        className="group-node-resize group-node-resize-br"
        onMouseDown={(e) => handleResizeStart(e, "br")}
      />
      <div
        className="group-node-resize group-node-resize-bl"
        onMouseDown={(e) => handleResizeStart(e, "bl")}
      />
      <div
        className="group-node-resize group-node-resize-tr"
        onMouseDown={(e) => handleResizeStart(e, "tr")}
      />
      <div
        className="group-node-resize group-node-resize-tl"
        onMouseDown={(e) => handleResizeStart(e, "tl")}
      />

      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="handle" />
      <Handle type="source" position={Position.Bottom} className="handle" />
      <Handle type="source" position={Position.Left} className="handle" />
      <Handle type="source" position={Position.Right} className="handle" />
    </div>
  );
}

export default GroupNode;

import React from "react";
import { Handle, Position } from "reactflow";

function TerminatorNode({ data, selected }) {
  return (
    <div
      className={`custom-node terminator-node ${selected ? "selected" : ""}`}
    >
      <Handle type="target" position={Position.Top} className="handle" />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
}

export default TerminatorNode;

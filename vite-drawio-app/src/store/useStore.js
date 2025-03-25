import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";

const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  nodeIdCounter: 1,
  undoStack: [],
  redoStack: [],
  selectedNodeColor: null,
  copiedNodes: [],
  copiedEdges: [],
  propertyPanelVisible: false,
  contextMenuPosition: null,

  setNodes: (nodes) => {
    const currentState = { nodes: get().nodes, edges: get().edges };

    set({
      nodes,
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });
  },

  setEdges: (edges) => {
    const currentState = { nodes: get().nodes, edges: get().edges };

    set({
      edges,
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });
  },

  onNodesChange: (changes) => {
    // Lưu state hiện tại vào undo stack chỉ nếu có changes vị trí hoặc xóa node
    const hasPositionChange = changes.some(
      (change) => change.type === "position" || change.type === "remove"
    );

    if (hasPositionChange) {
      const currentState = { nodes: get().nodes, edges: get().edges };
      set({ undoStack: [...get().undoStack, currentState], redoStack: [] });
    }

    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    // Lưu state hiện tại vào undo stack nếu edge bị xóa
    const hasRemoveChange = changes.some((change) => change.type === "remove");

    if (hasRemoveChange) {
      const currentState = { nodes: get().nodes, edges: get().edges };
      set({ undoStack: [...get().undoStack, currentState], redoStack: [] });
    }

    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    const currentState = { nodes: get().nodes, edges: get().edges };

    set({
      edges: addEdge(
        {
          ...connection,
          animated: false,
          style: { stroke: "#555" },
        },
        get().edges
      ),
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });
  },

  addNode: (nodeType, position) => {
    const id = `node_${get().nodeIdCounter}`;
    const currentState = { nodes: get().nodes, edges: get().edges };

    const nodeWidth = nodeType === "group" ? 300 : undefined;
    const nodeHeight = nodeType === "group" ? 200 : undefined;

    const newNode = {
      id,
      type: nodeType,
      position,
      data: {
        label: `${nodeType} ${get().nodeIdCounter}`,
        width: nodeWidth,
        height: nodeHeight,
      },
    };

    set({
      nodes: [...get().nodes, newNode],
      nodeIdCounter: get().nodeIdCounter + 1,
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });

    return id;
  },

  // Cập nhật data của một node
  updateNodeData: (id, data) => {
    const currentState = { nodes: get().nodes, edges: get().edges };

    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data };
        }
        return node;
      }),
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });
  },

  // Resize group node
  resizeGroupNode: (id, dimensions) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              width: dimensions.width,
              height: dimensions.height,
            },
          };
        }
        return node;
      }),
    });
  },

  deleteElements: (selectedNodes, selectedEdges) => {
    const currentState = { nodes: get().nodes, edges: get().edges };
    const nodeIdsToRemove = selectedNodes.map((node) => node.id);

    set({
      nodes: get().nodes.filter((node) => !nodeIdsToRemove.includes(node.id)),
      edges: get().edges.filter(
        (edge) =>
          !selectedEdges.some((e) => e.id === edge.id) &&
          !nodeIdsToRemove.includes(edge.source) &&
          !nodeIdsToRemove.includes(edge.target)
      ),
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });
  },

  // Tạo group từ các nodes đã chọn
  createGroup: (selectedNodes) => {
    if (selectedNodes.length < 2) return;

    const currentState = { nodes: get().nodes, edges: get().edges };

    // Tính toán vị trí và kích thước của group
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedNodes.forEach((node) => {
      const x = node.position.x;
      const y = node.position.y;
      const width = node.width || 200;
      const height = node.height || 100;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    // Thêm padding cho group
    minX -= 20;
    minY -= 40; // Thêm không gian cho header
    maxX += 20;
    maxY += 20;

    const groupId = `node_${get().nodeIdCounter}`;
    const groupNode = {
      id: groupId,
      type: "group",
      position: { x: minX, y: minY },
      data: {
        label: `Group ${get().nodeIdCounter}`,
        width: maxX - minX,
        height: maxY - minY,
      },
      zIndex: -1, // Đặt group ở dưới các elements khác
    };

    set({
      nodes: [...get().nodes, groupNode],
      nodeIdCounter: get().nodeIdCounter + 1,
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });

    return groupId;
  },

  // Copy selected nodes & edges
  copySelection: (selectedNodes, selectedEdges) => {
    // Deep copy để tránh reference issues
    const nodesToCopy = JSON.parse(JSON.stringify(selectedNodes));
    const edgesToCopy = JSON.parse(
      JSON.stringify(
        selectedEdges.filter(
          (edge) =>
            selectedNodes.some((node) => node.id === edge.source) &&
            selectedNodes.some((node) => node.id === edge.target)
        )
      )
    );

    set({
      copiedNodes: nodesToCopy,
      copiedEdges: edgesToCopy,
    });
  },

  // Paste copied nodes & edges
  pasteSelection: (position) => {
    const { copiedNodes, copiedEdges } = get();
    if (copiedNodes.length === 0) return;

    const currentState = { nodes: get().nodes, edges: get().edges };

    // Tính offset cho vị trí paste
    const offsetX = position.x - (copiedNodes[0].position.x || 0);
    const offsetY = position.y - (copiedNodes[0].position.y || 0);

    // Tạo mapping từ ID cũ sang ID mới
    const idMapping = {};

    // Tạo nodes mới với ID mới
    const newNodes = copiedNodes.map((node) => {
      const newId = `node_${get().nodeIdCounter++}`;
      idMapping[node.id] = newId;

      return {
        ...node,
        id: newId,
        position: {
          x: (node.position.x || 0) + offsetX,
          y: (node.position.y || 0) + offsetY,
        },
      };
    });

    // Tạo edges mới với các source/target mới
    const newEdges = copiedEdges.map((edge) => {
      return {
        ...edge,
        id: `edge_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        source: idMapping[edge.source],
        target: idMapping[edge.target],
      };
    });

    set({
      nodes: [...get().nodes, ...newNodes],
      edges: [...get().edges, ...newEdges],
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });
  },

  clearCanvas: () => {
    const currentState = { nodes: get().nodes, edges: get().edges };

    // Chỉ lưu vào undo stack nếu có nội dung để clear
    if (get().nodes.length > 0 || get().edges.length > 0) {
      set({
        nodes: [],
        edges: [],
        nodeIdCounter: 1,
        undoStack: [...get().undoStack, currentState],
        redoStack: [],
      });
    } else {
      set({
        nodes: [],
        edges: [],
        nodeIdCounter: 1,
      });
    }
  },

  // Chức năng lưu flow hiện tại thành object
  getFlowObject: () => {
    return {
      nodes: get().nodes,
      edges: get().edges,
      nodeIdCounter: get().nodeIdCounter,
    };
  },

  // Chức năng tải flow từ file JSON
  loadFlowFromJSON: (flowData) => {
    const currentState = { nodes: get().nodes, edges: get().edges };

    set({
      nodes: flowData.nodes || [],
      edges: flowData.edges || [],
      nodeIdCounter: flowData.nodeIdCounter || 1,
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });
  },

  // Chức năng undo
  undo: () => {
    const undoStack = get().undoStack;
    if (undoStack.length === 0) return;

    const currentState = { nodes: get().nodes, edges: get().edges };
    const previousState = undoStack[undoStack.length - 1];

    set({
      nodes: previousState.nodes,
      edges: previousState.edges,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, currentState],
    });
  },

  // Chức năng redo
  redo: () => {
    const redoStack = get().redoStack;
    if (redoStack.length === 0) return;

    const currentState = { nodes: get().nodes, edges: get().edges };
    const nextState = redoStack[redoStack.length - 1];

    set({
      nodes: nextState.nodes,
      edges: nextState.edges,
      undoStack: [...get().undoStack, currentState],
      redoStack: redoStack.slice(0, -1),
    });
  },

  // Chức năng thay đổi màu cho node được chọn
  setSelectedNodeColor: (color) => {
    set({ selectedNodeColor: color });
  },

  // Chức năng áp dụng màu cho node được chọn
  applyColorToSelectedNodes: (selectedNodes, color) => {
    if (!selectedNodes || selectedNodes.length === 0) return;

    const currentState = { nodes: get().nodes, edges: get().edges };

    set({
      nodes: get().nodes.map((node) => {
        if (selectedNodes.some((selectedNode) => selectedNode.id === node.id)) {
          return {
            ...node,
            data: {
              ...node.data,
              color: color,
            },
            style: {
              ...node.style,
              backgroundColor: color,
            },
          };
        }
        return node;
      }),
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });
  },

  // Chức năng tạo snapshot của flow
  createSnapshot: () => {
    const currentState = { nodes: get().nodes, edges: get().edges };
    set({ undoStack: [...get().undoStack, currentState] });
  },

  // Chức năng tạo một copy của node được chọn
  duplicateNodes: (selectedNodes) => {
    if (selectedNodes.length === 0) return;

    const currentState = { nodes: get().nodes, edges: get().edges };
    const nodeIdCounter = get().nodeIdCounter;

    const newNodes = selectedNodes.map((node, index) => {
      const newId = `node_${nodeIdCounter + index}`;
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 20,
          y: node.position.y + 20,
        },
      };
    });

    set({
      nodes: [...get().nodes, ...newNodes],
      nodeIdCounter: nodeIdCounter + selectedNodes.length,
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });
  },

  // Hiển thị/ẩn panel thuộc tính
  setPropertyPanelVisible: (visible) => {
    set({ propertyPanelVisible: visible });
  },

  // Hiển thị menu ngữ cảnh
  showContextMenu: (position) => {
    set({ contextMenuPosition: position });
  },

  // Ẩn menu ngữ cảnh
  hideContextMenu: () => {
    set({ contextMenuPosition: null });
  },

  // Thay đổi style của edge
  updateEdgeStyle: (edgeId, style) => {
    const currentState = { nodes: get().nodes, edges: get().edges };

    set({
      edges: get().edges.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            style: {
              ...edge.style,
              ...style,
            },
          };
        }
        return edge;
      }),
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });
  },

  // Căn chỉnh nodes theo kiểu
  alignNodes: (selectedNodes, alignmentType) => {
    if (!selectedNodes || selectedNodes.length < 2) return;

    const currentState = { nodes: get().nodes, edges: get().edges };
    let updatedNodes = [...get().nodes];

    // Tính toán giá trị căn chỉnh
    switch (alignmentType) {
      case "left": {
        const minX = Math.min(...selectedNodes.map((node) => node.position.x));
        updatedNodes = updatedNodes.map((node) => {
          if (selectedNodes.find((n) => n.id === node.id)) {
            return {
              ...node,
              position: {
                ...node.position,
                x: minX,
              },
            };
          }
          return node;
        });
        break;
      }
      case "center": {
        const centerX =
          selectedNodes.reduce(
            (sum, node) => sum + node.position.x + (node.width || 100) / 2,
            0
          ) / selectedNodes.length;
        updatedNodes = updatedNodes.map((node) => {
          if (selectedNodes.find((n) => n.id === node.id)) {
            return {
              ...node,
              position: {
                ...node.position,
                x: centerX - (node.width || 100) / 2,
              },
            };
          }
          return node;
        });
        break;
      }
      case "right": {
        const maxX = Math.max(
          ...selectedNodes.map((node) => node.position.x + (node.width || 100))
        );
        updatedNodes = updatedNodes.map((node) => {
          if (selectedNodes.find((n) => n.id === node.id)) {
            return {
              ...node,
              position: {
                ...node.position,
                x: maxX - (node.width || 100),
              },
            };
          }
          return node;
        });
        break;
      }
      case "top": {
        const minY = Math.min(...selectedNodes.map((node) => node.position.y));
        updatedNodes = updatedNodes.map((node) => {
          if (selectedNodes.find((n) => n.id === node.id)) {
            return {
              ...node,
              position: {
                ...node.position,
                y: minY,
              },
            };
          }
          return node;
        });
        break;
      }
      case "middle": {
        const centerY =
          selectedNodes.reduce(
            (sum, node) => sum + node.position.y + (node.height || 40) / 2,
            0
          ) / selectedNodes.length;
        updatedNodes = updatedNodes.map((node) => {
          if (selectedNodes.find((n) => n.id === node.id)) {
            return {
              ...node,
              position: {
                ...node.position,
                y: centerY - (node.height || 40) / 2,
              },
            };
          }
          return node;
        });
        break;
      }
      case "bottom": {
        const maxY = Math.max(
          ...selectedNodes.map((node) => node.position.y + (node.height || 40))
        );
        updatedNodes = updatedNodes.map((node) => {
          if (selectedNodes.find((n) => n.id === node.id)) {
            return {
              ...node,
              position: {
                ...node.position,
                y: maxY - (node.height || 40),
              },
            };
          }
          return node;
        });
        break;
      }
      default:
        return;
    }

    set({
      nodes: updatedNodes,
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });
  },

  // Phân phối đều các node theo chiều ngang
  distributeNodesHorizontally: (selectedNodes) => {
    if (!selectedNodes || selectedNodes.length < 3) return;

    const currentState = { nodes: get().nodes, edges: get().edges };

    // Sắp xếp nodes theo vị trí x
    const sortedNodes = [...selectedNodes].sort(
      (a, b) => a.position.x - b.position.x
    );

    // Tính khoảng cách đều giữa các node
    const firstNode = sortedNodes[0];
    const lastNode = sortedNodes[sortedNodes.length - 1];
    const totalSpace = lastNode.position.x - firstNode.position.x;
    const spacing = totalSpace / (sortedNodes.length - 1);

    // Cập nhật vị trí các node ở giữa
    const updatedNodes = [...get().nodes];
    for (let i = 1; i < sortedNodes.length - 1; i++) {
      const node = sortedNodes[i];
      const newX = firstNode.position.x + i * spacing;

      const index = updatedNodes.findIndex((n) => n.id === node.id);
      if (index !== -1) {
        updatedNodes[index] = {
          ...updatedNodes[index],
          position: {
            ...updatedNodes[index].position,
            x: newX,
          },
        };
      }
    }

    set({
      nodes: updatedNodes,
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });
  },

  // Phân phối đều các node theo chiều dọc
  distributeNodesVertically: (selectedNodes) => {
    if (!selectedNodes || selectedNodes.length < 3) return;

    const currentState = { nodes: get().nodes, edges: get().edges };

    // Sắp xếp nodes theo vị trí y
    const sortedNodes = [...selectedNodes].sort(
      (a, b) => a.position.y - b.position.y
    );

    // Tính khoảng cách đều giữa các node
    const firstNode = sortedNodes[0];
    const lastNode = sortedNodes[sortedNodes.length - 1];
    const totalSpace = lastNode.position.y - firstNode.position.y;
    const spacing = totalSpace / (sortedNodes.length - 1);

    // Cập nhật vị trí các node ở giữa
    const updatedNodes = [...get().nodes];
    for (let i = 1; i < sortedNodes.length - 1; i++) {
      const node = sortedNodes[i];
      const newY = firstNode.position.y + i * spacing;

      const index = updatedNodes.findIndex((n) => n.id === node.id);
      if (index !== -1) {
        updatedNodes[index] = {
          ...updatedNodes[index],
          position: {
            ...updatedNodes[index].position,
            y: newY,
          },
        };
      }
    }

    set({
      nodes: updatedNodes,
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });
  },

  // Xoay node theo góc nhất định
  rotateNode: (nodeId, angle) => {
    const currentState = { nodes: get().nodes, edges: get().edges };

    // Console log để debug
    console.log("rotateNode được gọi với:", { nodeId, angle });

    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // Lấy góc xoay hiện tại
          const currentRotation = node.data?.rotation || 0;

          // Tính toán góc xoay mới
          const newRotation = (currentRotation + angle + 360) % 360;

          console.log("Đang xoay node:", {
            id: node.id,
            currentRotation,
            newRotation,
            angle,
          });

          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              rotation: newRotation,
            },
            style: {
              ...node.style,
              transform: `rotate(${newRotation}deg)`,
            },
          };

          console.log("Node sau khi xoay:", updatedNode);
          return updatedNode;
        }
        return node;
      }),
    });

    // Chỉ lưu vào undo stack nếu sự thay đổi đã hoàn tất (khi xoay xong)
    if (Math.abs(angle) >= 5) {
      set({
        undoStack: [...get().undoStack, currentState],
        redoStack: [],
      });
    }
  },

  // Xoay nhiều node cùng lúc
  rotateNodes: (selectedNodes, angle) => {
    if (!selectedNodes || selectedNodes.length === 0) return;

    const currentState = { nodes: get().nodes, edges: get().edges };

    set({
      nodes: get().nodes.map((node) => {
        if (selectedNodes.find((n) => n.id === node.id)) {
          // Lấy style hiện tại hoặc tạo mới
          const currentStyle = node.style || {};
          // Tính toán góc xoay mới
          const currentRotation = parseInt(
            currentStyle.transform?.match(/rotate\((-?\d+)deg\)/)?.[1] || 0
          );
          const newRotation = (currentRotation + angle) % 360;

          return {
            ...node,
            data: {
              ...node.data,
              rotation: newRotation,
            },
            style: {
              ...currentStyle,
              transform: `rotate(${newRotation}deg)`,
            },
          };
        }
        return node;
      }),
      undoStack: [...get().undoStack, currentState],
      redoStack: [],
    });
  },
}));

export default useStore;

import { useCallback, useRef, useState, useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  useReactFlow,
  Panel,
  MiniMap,
  SelectionMode,
} from "reactflow";
import {
  ButtonGroup,
  Menu,
  MenuItem,
  Divider,
  Box,
  Paper,
  IconButton,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import GridOnIcon from "@mui/icons-material/GridOn";
import GridOffIcon from "@mui/icons-material/GridOff";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import MouseIcon from "@mui/icons-material/Mouse";
import PanToolIcon from "@mui/icons-material/PanTool";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import useStore from "../store/useStore";
import RectangleNode from "./nodes/RectangleNode";
import CircleNode from "./nodes/CircleNode";
import StadiumNode from "./nodes/StadiumNode";
import DiamondNode from "./nodes/DiamondNode";
import IONode from "./nodes/IONode";
import TerminatorNode from "./nodes/TerminatorNode";
import GroupNode from "./nodes/GroupNode";
import PropertyPanel from "./panels/PropertyPanel";

// Màu sắc cho node - Sử dụng các màu pastel mới
const nodeColors = [
  "var(--node-color-1)", // Pastel Pink
  "var(--node-color-2)", // Soft Gray
  "var(--node-color-3)", // Light Green
  "var(--node-color-4)", // Peach
  "var(--node-color-5)", // Rose
  "var(--node-color-6)", // Cream
  "var(--node-color-7)", // Light Blue
  "var(--node-color-8)", // Light Pink
  "var(--node-color-9)", // Mint
  "var(--node-color-10)", // Lavender
];

// Màu viền - Sử dụng các màu mới hơn
const borderColors = [
  "var(--border-color-1)", // Coral
  "var(--border-color-2)", // Slate Blue
  "var(--border-color-3)", // Lime Green
  "var(--border-color-4)", // Pink
  "var(--border-color-5)", // Turquoise
  "var(--border-color-6)", // Dark Orange
  "var(--border-color-7)", // Royal Blue
  "var(--border-color-8)", // Orchid
  "var(--border-color-9)", // Forest Green
  "var(--border-color-10)", // Dark Orchid
];

// Định nghĩa các node types
const nodeTypes = {
  rectangle: RectangleNode,
  circle: CircleNode,
  stadium: StadiumNode,
  diamond: DiamondNode,
  io: IONode,
  terminator: TerminatorNode,
  start: TerminatorNode,
  process: RectangleNode,
  decision: StadiumNode,
  group: GroupNode,
};

function FlowCanvas() {
  const reactFlowWrapper = useRef(null);
  const { fitView, zoomIn, zoomOut, project } = useReactFlow();
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [showGrid, setShowGrid] = useState(true);
  const [interactionMode, setInteractionMode] = useState("select"); // 'select' hoặc 'pan'
  const [showPropertyPanel, setShowPropertyPanel] = useState(false);

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);

  // Color picker menu
  const [colorMenuAnchor, setColorMenuAnchor] = useState(null);
  const colorMenuOpen = Boolean(colorMenuAnchor);

  // Alignment menu
  const [alignMenuAnchor, setAlignMenuAnchor] = useState(null);
  const alignMenuOpen = Boolean(alignMenuAnchor);

  // Sử dụng store
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteElements,
    undo,
    redo,
    applyColorToSelectedNodes,
    duplicateNodes,
    copySelection,
    pasteSelection,
    createGroup,
    alignNodes,
    distributeNodesHorizontally,
    distributeNodesVertically,
  } = useStore((state) => state);

  // Phím tắt cho undo, redo, delete, duplicate
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+Z hoặc Command+Z cho Undo
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "z" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        undo();
      }
      // Ctrl+Shift+Z hoặc Command+Shift+Z hoặc Ctrl+Y cho Redo
      if (
        ((event.ctrlKey || event.metaKey) &&
          event.key === "z" &&
          event.shiftKey) ||
        ((event.ctrlKey || event.metaKey) && event.key === "y")
      ) {
        event.preventDefault();
        redo();
      }
      // Delete hoặc Backspace để xóa các phần tử được chọn
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          event.preventDefault();
          deleteElements(selectedNodes, selectedEdges);
          setSelectedNodes([]);
          setSelectedEdges([]);
        }
      }
      // Ctrl+D hoặc Command+D để nhân bản node được chọn
      if ((event.ctrlKey || event.metaKey) && event.key === "d") {
        event.preventDefault();
        duplicateNodes(selectedNodes);
      }
      // Ctrl+C hoặc Command+C để copy
      if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        if (selectedNodes.length > 0) {
          event.preventDefault();
          copySelection(selectedNodes, selectedEdges);
        }
      }
      // Ctrl+V hoặc Command+V để paste
      if ((event.ctrlKey || event.metaKey) && event.key === "v") {
        event.preventDefault();
        if (contextMenu) {
          pasteSelection(contextMenu.flowPosition);
        } else {
          // Nếu không có context menu, paste vào giữa màn hình
          const {
            x = 0,
            y = 0,
            zoom = 1,
          } = fitView ? fitView() : { x: 0, y: 0, zoom: 1 };
          pasteSelection({ x: x / zoom, y: y / zoom });
        }
      }
      // V để chuyển sang chế độ Selection
      if (event.key === "v" && !event.ctrlKey && !event.metaKey) {
        setInteractionMode("select");
      }
      // H để chuyển sang chế độ Pan
      if (event.key === "h" && !event.ctrlKey && !event.metaKey) {
        setInteractionMode("pan");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedNodes,
    selectedEdges,
    undo,
    redo,
    deleteElements,
    duplicateNodes,
    copySelection,
    pasteSelection,
    contextMenu,
    fitView,
  ]);

  // Xử lý kéo thả node từ sidebar
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    // Thêm class để tạo hiệu ứng khi kéo qua
    if (reactFlowWrapper.current) {
      reactFlowWrapper.current
        .querySelector(".react-flow__pane")
        ?.classList.add("drag-over");
    }
  }, []);

  // Xử lý khi drop node
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      // Xóa class hiệu ứng kéo qua
      if (reactFlowWrapper.current) {
        reactFlowWrapper.current
          .querySelector(".react-flow__pane")
          ?.classList.remove("drag-over");
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      console.log("Drop detected, node type:", type);

      // Kiểm tra nếu type hợp lệ
      if (typeof type === "undefined" || !type) {
        console.log("No valid node type found in drop event");
        return;
      }

      // Tính toán vị trí drop
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      console.log("Dropping at position:", position);

      // Thêm node mới vào store
      addNode(type, position);

      // Hiệu ứng phản hồi khi drop thành công
      addDropFeedback();

      // Đảm bảo backdrop sẽ biến mất sau khi drop
      const dragEndEvent = new Event("dragend");
      window.dispatchEvent(dragEndEvent);
    },
    [addNode, project]
  );

  // Thêm hiệu ứng phản hồi khi node được thêm vào canvas
  const addDropFeedback = useCallback(() => {
    if (reactFlowWrapper.current) {
      const pane = reactFlowWrapper.current.querySelector(".react-flow__pane");
      if (pane) {
        // Thêm class để trigger animation
        pane.classList.add("tap-feedback");

        // Xóa class sau khi animation kết thúc
        setTimeout(() => {
          pane.classList.remove("tap-feedback");
        }, 500);
      }
    }
  }, []);

  // Hook lắng nghe sự kiện nodeAdd để thêm hiệu ứng phản hồi khi node được thêm qua click
  useEffect(() => {
    const handleNodeAdd = () => {
      // Thêm hiệu ứng phản hồi khi node được thêm
      addDropFeedback();
    };

    // Lắng nghe sự kiện custom 'nodeAdd'
    window.addEventListener("nodeAdd", handleNodeAdd);

    return () => {
      window.removeEventListener("nodeAdd", handleNodeAdd);
    };
  }, [addDropFeedback]);

  // Xử lý chọn các phần tử
  const onSelectionChange = ({ nodes, edges }) => {
    setSelectedNodes(nodes);
    setSelectedEdges(edges);
  };

  // Xử lý context menu (chuột phải)
  const handleNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();

    // Nếu node chưa được chọn, hãy chọn nó
    if (!node.selected) {
      setSelectedNodes([node]);
      setSelectedEdges([]);
    }

    // Hiển thị context menu tại vị trí chuột
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      flowPosition: node.position,
      isNodeMenu: true,
    });
  }, []);

  // Xử lý context menu cho pane (vùng trống)
  const handlePaneContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      const boundingRect = reactFlowWrapper.current.getBoundingClientRect();

      // Tính toán vị trí chuột trong ReactFlow
      const position = project({
        x: event.clientX - boundingRect.left,
        y: event.clientY - boundingRect.top,
      });

      setContextMenu({
        mouseX: event.clientX,
        mouseY: event.clientY,
        flowPosition: position,
        isNodeMenu: false,
      });
    },
    [project]
  );

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  // Xử lý xóa các phần tử được chọn
  const handleDelete = () => {
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      deleteElements(selectedNodes, selectedEdges);
      setSelectedNodes([]);
      setSelectedEdges([]);
    }
  };

  // Xử lý copy selection
  const handleCopy = () => {
    if (selectedNodes.length > 0) {
      copySelection(selectedNodes, selectedEdges);
    }
  };

  // Xử lý paste
  const handlePaste = () => {
    if (contextMenu) {
      pasteSelection(contextMenu.flowPosition);
      handleContextMenuClose();
    } else {
      // Paste ở giữa viewport
      const center = project({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      pasteSelection(center);
    }
  };

  // Xử lý chọn màu
  const handleColorMenuOpen = (event) => {
    setColorMenuAnchor(event.currentTarget);
  };

  const handleColorMenuClose = () => {
    setColorMenuAnchor(null);
  };

  const handleColorSelect = (color) => {
    applyColorToSelectedNodes(selectedNodes, color);
    handleColorMenuClose();
  };

  // Xử lý alignment menu
  const handleAlignMenuOpen = (event) => {
    setAlignMenuAnchor(event.currentTarget);
  };

  const handleAlignMenuClose = () => {
    setAlignMenuAnchor(null);
  };

  const handleAlignment = (alignType) => {
    alignNodes(selectedNodes, alignType);
    handleAlignMenuClose();
  };

  // Xử lý tạo group
  const handleCreateGroup = () => {
    if (selectedNodes.length > 1) {
      createGroup(selectedNodes);
    }
  };

  // Xử lý chuyển đổi chế độ tương tác
  const handleInteractionModeChange = (e, newMode) => {
    if (newMode !== null) {
      setInteractionMode(newMode);
    }
  };

  // Xử lý hiển thị/ẩn panel thuộc tính
  const togglePropertyPanel = () => {
    setShowPropertyPanel((prev) => !prev);
  };

  // Xử lý xuất hình ảnh
  const handleExportImage = () => {
    const dataUrl = document
      .querySelector(".react-flow__renderer")
      .toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `flow-diagram-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flow-container" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onSelectionChange={onSelectionChange}
        onPaneClick={handleContextMenuClose}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        selectionMode={
          interactionMode === "select"
            ? SelectionMode.Full
            : SelectionMode.Partial
        }
        panOnDrag={interactionMode === "pan"}
        zoomOnScroll={true}
        selectionOnDrag={interactionMode === "select"}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={["Delete", "Backspace"]}
        fitView
      >
        {/* Controls */}
        <Controls />

        {/* Background */}
        <Background
          variant={showGrid ? "dots" : "lines"}
          gap={showGrid ? 13 : 50}
          size={1}
          style={{ opacity: showGrid ? 0.6 : 0.25 }}
          color="#666"
        />

        {/* Mini map */}
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          nodeColor={(node) => {
            return node.data?.color || "#eee";
          }}
        />

        {/* Main toolbar */}
        <Panel position="top-center">
          <Paper
            elevation={3}
            sx={{
              p: 1,
              borderRadius: 2,
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              maxWidth: "100%",
              overflow: "auto",
            }}
          >
            {/* Toggle chế độ tương tác */}
            <ToggleButtonGroup
              value={interactionMode}
              exclusive
              onChange={handleInteractionModeChange}
              size="small"
              sx={{ mr: 1 }}
            >
              <ToggleButton value="select" aria-label="selection mode">
                <Tooltip title="Chế độ lựa chọn (V)">
                  <MouseIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="pan" aria-label="pan mode">
                <Tooltip title="Chế độ di chuyển màn hình (H)">
                  <PanToolIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <Divider orientation="vertical" flexItem />

            {/* Undo/Redo */}
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Hoàn tác (Ctrl+Z)">
                <IconButton size="small" onClick={undo}>
                  <UndoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Làm lại (Ctrl+Y)">
                <IconButton size="small" onClick={redo}>
                  <RedoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Xóa (Delete)">
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  disabled={
                    selectedNodes.length === 0 && selectedEdges.length === 0
                  }
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Sao chép (Ctrl+C)">
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  disabled={selectedNodes.length === 0}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Dán (Ctrl+V)">
                <IconButton size="small" onClick={handlePaste}>
                  <ContentPasteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <Divider orientation="vertical" flexItem />

            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Nhóm các node (Ctrl+G)">
                <IconButton
                  size="small"
                  onClick={handleCreateGroup}
                  disabled={selectedNodes.length < 2}
                >
                  <GroupWorkIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Thay đổi màu sắc">
                <IconButton
                  size="small"
                  onClick={handleColorMenuOpen}
                  disabled={selectedNodes.length === 0}
                >
                  <FormatColorFillIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Căn chỉnh">
                <IconButton
                  size="small"
                  onClick={handleAlignMenuOpen}
                  disabled={selectedNodes.length < 2}
                >
                  <FormatAlignLeftIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <Divider orientation="vertical" flexItem />

            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Thu nhỏ">
                <IconButton size="small" onClick={() => zoomOut()}>
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Phóng to">
                <IconButton size="small" onClick={() => zoomIn()}>
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Vừa màn hình">
                <IconButton size="small" onClick={() => fitView()}>
                  <FitScreenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={showGrid ? "Ẩn lưới" : "Hiện lưới"}>
                <IconButton size="small" onClick={() => setShowGrid(!showGrid)}>
                  {showGrid ? (
                    <GridOffIcon fontSize="small" />
                  ) : (
                    <GridOnIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <Divider orientation="vertical" flexItem />

            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Xuất PNG">
                <IconButton size="small" onClick={handleExportImage}>
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Thuộc tính">
                <IconButton
                  size="small"
                  onClick={togglePropertyPanel}
                  color={showPropertyPanel ? "primary" : "default"}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>
          </Paper>
        </Panel>

        {/* Property Panel */}
        {showPropertyPanel && (
          <Panel
            position="top-right"
            style={{
              maxWidth: 300,
              maxHeight: "80vh",
              overflow: "auto",
              right: 10,
              top: 10,
            }}
          >
            <Paper
              elevation={3}
              sx={{
                borderRadius: 2,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 16px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                  Thuộc tính
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setShowPropertyPanel(false)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              <PropertyPanel
                nodes={selectedNodes}
                edges={selectedEdges}
                colors={nodeColors}
                borderColors={borderColors}
              />
            </Paper>
          </Panel>
        )}

        {/* Color picker menu */}
        <Menu
          anchorEl={colorMenuAnchor}
          open={colorMenuOpen}
          onClose={handleColorMenuClose}
        >
          <Box
            sx={{
              p: 1,
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 0.5,
            }}
          >
            {nodeColors.map((color, index) => (
              <Box
                key={index}
                onClick={() => handleColorSelect(color)}
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: color,
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "scale(1.1)",
                    boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                  },
                }}
              />
            ))}
          </Box>
        </Menu>

        {/* Alignment menu */}
        <Menu
          anchorEl={alignMenuAnchor}
          open={alignMenuOpen}
          onClose={handleAlignMenuClose}
        >
          <MenuItem onClick={() => handleAlignment("left")}>Căn trái</MenuItem>
          <MenuItem onClick={() => handleAlignment("center")}>
            Căn giữa ngang
          </MenuItem>
          <MenuItem onClick={() => handleAlignment("right")}>Căn phải</MenuItem>
          <Divider />
          <MenuItem onClick={() => handleAlignment("top")}>Căn trên</MenuItem>
          <MenuItem onClick={() => handleAlignment("middle")}>
            Căn giữa dọc
          </MenuItem>
          <MenuItem onClick={() => handleAlignment("bottom")}>
            Căn dưới
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => distributeNodesHorizontally(selectedNodes)}>
            Phân bố đều ngang
          </MenuItem>
          <MenuItem onClick={() => distributeNodesVertically(selectedNodes)}>
            Phân bố đều dọc
          </MenuItem>
        </Menu>

        {/* Context menu */}
        {contextMenu && (
          <Menu
            open={Boolean(contextMenu)}
            onClose={handleContextMenuClose}
            anchorReference="anchorPosition"
            anchorPosition={
              contextMenu
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
          >
            {contextMenu.isNodeMenu && (
              <>
                <MenuItem
                  onClick={() => {
                    handleCopy();
                    handleContextMenuClose();
                  }}
                  disabled={selectedNodes.length === 0}
                >
                  Sao chép
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    duplicateNodes(selectedNodes);
                    handleContextMenuClose();
                  }}
                  disabled={selectedNodes.length === 0}
                >
                  Nhân bản
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleDelete();
                    handleContextMenuClose();
                  }}
                  disabled={selectedNodes.length === 0}
                >
                  Xóa
                </MenuItem>
              </>
            )}
            <MenuItem
              onClick={() => {
                handlePaste();
                handleContextMenuClose();
              }}
            >
              Dán
            </MenuItem>
            {!contextMenu.isNodeMenu && (
              <MenuItem
                onClick={() => {
                  addNode("rectangle", contextMenu.flowPosition);
                  handleContextMenuClose();
                }}
              >
                Thêm hình chữ nhật
              </MenuItem>
            )}
          </Menu>
        )}
      </ReactFlow>
    </div>
  );
}

export default FlowCanvas;

import {
  Typography,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RectangleIcon from "@mui/icons-material/Crop169";
import CircleIcon from "@mui/icons-material/CircleOutlined";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import DiamondIcon from "@mui/icons-material/Diamond";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import HexagonIcon from "@mui/icons-material/Hexagon";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import useStore from "../../store/useStore";
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";

function Sidebar({ setIsDragging }) {
  const { clearCanvas, loadFlowFromJSON, getFlowObject, addNode } = useStore(
    (state) => state
  );

  // Kiểm tra xem thiết bị có phải là thiết bị di động không
  const isMobile = useMediaQuery("(max-width:768px)");

  // Ref cho phần tử đang được kéo
  const dragImageRef = useRef(null);

  // Thêm class vào body khi đang kéo thả để vô hiệu hóa các tương tác không cần thiết
  useEffect(() => {
    const handleDragStart = () => {
      document.body.classList.add("dragging");
    };

    const handleDragEnd = () => {
      document.body.classList.remove("dragging");
    };

    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("dragend", handleDragEnd);
    window.addEventListener("drop", handleDragEnd);

    return () => {
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("dragend", handleDragEnd);
      window.removeEventListener("drop", handleDragEnd);
      document.body.classList.remove("dragging");
    };
  }, []);

  // Tạo hình ảnh kéo cho mobile
  useEffect(() => {
    if (!dragImageRef.current) {
      const img = new Image();
      img.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 1px transparent GIF
      img.style.opacity = "0";
      document.body.appendChild(img);
      dragImageRef.current = img;
    }

    return () => {
      if (dragImageRef.current) {
        document.body.removeChild(dragImageRef.current);
      }
    };
  }, []);

  const onDragStart = (event, nodeType) => {
    // Thiết lập dữ liệu kéo thả
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";

    // Đặt hình ảnh kéo thả không nhìn thấy để tránh bị nhấp nháy trên mobile
    if (dragImageRef.current) {
      event.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
    }

    if (setIsDragging) {
      setIsDragging(true);
    }

    // Thêm hiệu ứng khi bắt đầu kéo (chỉ trên mobile)
    if (isMobile && event.target) {
      event.target.style.transform = "scale(0.98)";
      event.target.style.opacity = "0.8";
    }

    // Ngăn chặn các sự kiện mặc định có thể gây trở ngại
    event.stopPropagation();
  };

  const onDragEnd = (event) => {
    if (setIsDragging) {
      setIsDragging(false);
    }

    // Khôi phục style khi kết thúc kéo
    if (isMobile && event.target) {
      event.target.style.transform = "";
      event.target.style.opacity = "";
    }

    // Ngăn chặn các sự kiện mặc định có thể gây trở ngại
    event.stopPropagation();
  };

  // Thêm node mới khi click trên thiết bị di động
  const handleNodeClick = (nodeType) => {
    if (isMobile) {
      // Tạo vị trí mặc định ở giữa màn hình
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Thêm node mới vào canvas
      addNode(nodeType, { x: centerX - 120, y: centerY - 50 });

      // Trigger sự kiện nodeAdd để thêm hiệu ứng phản hồi
      window.dispatchEvent(new CustomEvent("nodeAdd"));

      // Ẩn sidebar sau khi thêm node
      if (setIsDragging) {
        // Sử dụng lại cơ chế xử lý của dragend
        const dragEndEvent = new Event("dragend");
        window.dispatchEvent(dragEndEvent);
      }
    }
  };

  // Xử lý lưu flow hiện tại
  const handleSaveFlow = () => {
    const flowObject = getFlowObject();
    const dataStr = JSON.stringify(flowObject);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `flow-diagram-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Xử lý tải flow từ file
  const handleLoadFlow = (event) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      try {
        const flowData = JSON.parse(e.target.result);
        loadFlowFromJSON(flowData);
      } catch (error) {
        console.error("Error parsing flow file:", error);
        alert("Invalid flow file format");
      }
    };

    if (event.target.files[0]) {
      fileReader.readAsText(event.target.files[0]);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <AccountTreeIcon
          color="primary"
          className="sidebar-logo"
          fontSize={isMobile ? "medium" : "large"}
        />
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          color="primary"
          sx={{ fontWeight: 600 }}
        >
          Hong Thinh
        </Typography>
      </div>

      <Divider style={{ margin: isMobile ? "5px 0 10px" : "10px 0 15px" }} />

      <div className="file-actions">
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={isMobile ? null : <CloudDownloadIcon />}
          onClick={handleSaveFlow}
          fullWidth={!isMobile}
          style={{ marginBottom: isMobile ? "0" : "8px" }}
          sx={{
            color: "var(--text-dark)",
            borderColor: "var(--primary-color)",
            padding: isMobile ? "4px 8px" : "6px 16px",
            fontSize: isMobile ? "0.75rem" : "0.875rem",
          }}
        >
          {isMobile ? <CloudDownloadIcon fontSize="small" /> : "Save Diagram"}
        </Button>

        <Button
          variant="outlined"
          component="label"
          color="primary"
          size="small"
          startIcon={isMobile ? null : <CloudUploadIcon />}
          fullWidth={!isMobile}
          style={{ marginBottom: isMobile ? "0" : "15px" }}
          sx={{
            color: "var(--text-dark)",
            borderColor: "var(--primary-color)",
            padding: isMobile ? "4px 8px" : "6px 16px",
            fontSize: isMobile ? "0.75rem" : "0.875rem",
          }}
        >
          {isMobile ? <CloudUploadIcon fontSize="small" /> : "Load Diagram"}
          <input type="file" accept=".json" hidden onChange={handleLoadFlow} />
        </Button>

        <IconButton
          color="error"
          size="small"
          onClick={clearCanvas}
          sx={{
            display: isMobile ? "flex" : "none",
          }}
        >
          <DeleteSweepIcon fontSize="small" />
        </IconButton>
      </div>

      <Divider style={{ margin: isMobile ? "10px 0" : "0 0 15px" }} />

      <div className="node-categories">
        <Accordion defaultExpanded={!isMobile}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="basic-shapes-content"
            id="basic-shapes-header"
            sx={{ minHeight: isMobile ? "40px" : "48px" }}
          >
            <Typography
              variant={isMobile ? "body2" : "subtitle2"}
              sx={{ color: "var(--text-dark)", fontWeight: 600 }}
            >
              Basic Shapes
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{ padding: isMobile ? "4px 8px 8px" : "8px 16px 16px" }}
          >
            <div className="node-section">
              <Tooltip title="Rectangle">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "rectangle")}
                  onDragEnd={onDragEnd}
                  onClick={() => handleNodeClick("rectangle")}
                  draggable="true"
                >
                  <RectangleIcon className="dndnode-icon" color="primary" />
                  Rectangle
                </div>
              </Tooltip>

              <Tooltip title="Circle">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "circle")}
                  onDragEnd={onDragEnd}
                  onClick={() => handleNodeClick("circle")}
                  draggable="true"
                >
                  <CircleIcon className="dndnode-icon" color="primary" />
                  Circle
                </div>
              </Tooltip>

              <Tooltip title="Stadium">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "stadium")}
                  onDragEnd={onDragEnd}
                  onClick={() => handleNodeClick("stadium")}
                  draggable="true"
                >
                  <HorizontalRuleIcon
                    className="dndnode-icon"
                    color="primary"
                  />
                  Stadium
                </div>
              </Tooltip>

              <Tooltip title="Hexagon">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "hexagon")}
                  onDragEnd={onDragEnd}
                  onClick={() => handleNodeClick("hexagon")}
                  draggable="true"
                >
                  <HexagonIcon className="dndnode-icon" color="primary" />
                  Hexagon
                </div>
              </Tooltip>
            </div>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded={!isMobile}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="flowchart-shapes-content"
            id="flowchart-shapes-header"
            sx={{ minHeight: isMobile ? "40px" : "48px" }}
          >
            <Typography
              variant={isMobile ? "body2" : "subtitle2"}
              sx={{ color: "var(--text-dark)", fontWeight: 600 }}
            >
              Flowchart Elements
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{ padding: isMobile ? "4px 8px 8px" : "8px 16px 16px" }}
          >
            <div className="node-section">
              <Tooltip title="Start/End">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "terminator")}
                  onDragEnd={onDragEnd}
                  onClick={() => handleNodeClick("terminator")}
                  draggable="true"
                >
                  <StopIcon className="dndnode-icon" color="primary" />
                  Start/End
                </div>
              </Tooltip>

              <Tooltip title="Process">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "process")}
                  onDragEnd={onDragEnd}
                  onClick={() => handleNodeClick("process")}
                  draggable="true"
                >
                  <RectangleIcon className="dndnode-icon" color="primary" />
                  Process
                </div>
              </Tooltip>

              <Tooltip title="Decision">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "decision")}
                  onDragEnd={onDragEnd}
                  onClick={() => handleNodeClick("decision")}
                  draggable="true"
                >
                  <DiamondIcon className="dndnode-icon" color="primary" />
                  Decision
                </div>
              </Tooltip>

              <Tooltip title="I/O">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "io")}
                  onDragEnd={onDragEnd}
                  onClick={() => handleNodeClick("io")}
                  draggable="true"
                >
                  <PlayArrowIcon className="dndnode-icon" color="primary" />
                  Input/Output
                </div>
              </Tooltip>

              <Tooltip title="Document">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "document")}
                  onDragEnd={onDragEnd}
                  onClick={() => handleNodeClick("document")}
                  draggable="true"
                >
                  <DescriptionIcon className="dndnode-icon" color="primary" />
                  Document
                </div>
              </Tooltip>
            </div>
          </AccordionDetails>
        </Accordion>

        {!isMobile && (
          <>
            <Divider style={{ margin: "15px 0" }} />
            <Button
              variant="contained"
              color="error"
              size="small"
              fullWidth
              onClick={clearCanvas}
              startIcon={<DeleteSweepIcon />}
            >
              Clear Canvas
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  setIsDragging: PropTypes.func.isRequired,
};

export default Sidebar;

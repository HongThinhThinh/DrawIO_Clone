import {
  Typography,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
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
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import useStore from "../../store/useStore";

function Sidebar() {
  const { clearCanvas, loadFlowFromJSON, getFlowObject } = useStore(
    (state) => state
  );

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
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
          fontSize="large"
        />
        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
          Hong Thinh
        </Typography>
      </div>

      <Divider style={{ margin: "10px 0 15px" }} />

      <div className="file-actions">
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<CloudDownloadIcon />}
          onClick={handleSaveFlow}
          fullWidth
          style={{ marginBottom: "8px" }}
          sx={{
            color: "var(--text-dark)",
            borderColor: "var(--primary-color)",
          }}
        >
          Save Diagram
        </Button>

        <Button
          variant="outlined"
          component="label"
          color="primary"
          size="small"
          startIcon={<CloudUploadIcon />}
          fullWidth
          style={{ marginBottom: "15px" }}
          sx={{
            color: "var(--text-dark)",
            borderColor: "var(--primary-color)",
          }}
        >
          Load Diagram
          <input type="file" accept=".json" hidden onChange={handleLoadFlow} />
        </Button>
      </div>

      <Divider style={{ margin: "0 0 15px" }} />

      <div className="node-categories">
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="basic-shapes-content"
            id="basic-shapes-header"
          >
            <Typography
              variant="subtitle2"
              sx={{ color: "var(--text-dark)", fontWeight: 600 }}
            >
              Basic Shapes
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="node-section">
              <Tooltip title="Rectangle">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "rectangle")}
                  draggable
                >
                  <RectangleIcon className="dndnode-icon" color="primary" />
                  Rectangle
                </div>
              </Tooltip>

              <Tooltip title="Circle">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "circle")}
                  draggable
                >
                  <CircleIcon className="dndnode-icon" color="primary" />
                  Circle
                </div>
              </Tooltip>

              <Tooltip title="Stadium">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "stadium")}
                  draggable
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
                  draggable
                >
                  <HexagonIcon className="dndnode-icon" color="primary" />
                  Hexagon
                </div>
              </Tooltip>
            </div>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="flowchart-shapes-content"
            id="flowchart-shapes-header"
          >
            <Typography
              variant="subtitle2"
              sx={{ color: "var(--text-dark)", fontWeight: 600 }}
            >
              Flowchart Elements
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="node-section">
              <Tooltip title="Start/End">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "start")}
                  draggable
                >
                  <PlayArrowIcon className="dndnode-icon" color="primary" />
                  Start/End
                </div>
              </Tooltip>

              <Tooltip title="Process">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "process")}
                  draggable
                >
                  <DescriptionIcon className="dndnode-icon" color="primary" />
                  Process
                </div>
              </Tooltip>

              <Tooltip title="Decision">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "decision")}
                  draggable
                >
                  <HorizontalRuleIcon
                    className="dndnode-icon"
                    color="primary"
                  />
                  Decision
                </div>
              </Tooltip>

              <Tooltip title="Input/Output">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "io")}
                  draggable
                >
                  <AutoAwesomeIcon className="dndnode-icon" color="primary" />
                  Input/Output
                </div>
              </Tooltip>

              <Tooltip title="Terminator">
                <div
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, "terminator")}
                  draggable
                >
                  <StopIcon className="dndnode-icon" color="primary" />
                  Terminator
                </div>
              </Tooltip>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

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
    </aside>
  );
}

export default Sidebar;

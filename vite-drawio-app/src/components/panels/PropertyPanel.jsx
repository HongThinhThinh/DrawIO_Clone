import { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  Slider,
  Divider,
  Grid,
  Tooltip,
} from "@mui/material";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import useStore from "../../store/useStore";

const PropertyPanel = ({ nodes, edges, colors, borderColors }) => {
  const [properties, setProperties] = useState({
    label: "",
    backgroundColor: "",
    borderColor: "",
    borderWidth: 1,
    borderStyle: "solid",
    fontSize: 14,
  });

  // Store actions
  const updateNodeData = useStore((state) => state.updateNodeData);
  const applyColorToSelectedNodes = useStore(
    (state) => state.applyColorToSelectedNodes
  );
  const updateEdgeStyle = useStore((state) => state.updateEdgeStyle);

  // Kiểm tra selection
  const singleNodeSelected = nodes.length === 1;
  const singleEdgeSelected = edges.length === 1;
  const multipleSelected = nodes.length > 1 || edges.length > 1;

  // Cập nhật form khi selection thay đổi
  useEffect(() => {
    if (singleNodeSelected) {
      const node = nodes[0];
      setProperties({
        label: node.data?.label || "",
        backgroundColor: node.data?.color || node.style?.backgroundColor || "",
        borderColor: node.style?.borderColor || "",
        borderWidth: parseInt(node.style?.borderWidth) || 1,
        borderStyle: node.style?.borderStyle || "solid",
        fontSize: parseInt(node.style?.fontSize) || 14,
      });
    } else if (singleEdgeSelected) {
      const edge = edges[0];
      setProperties({
        label: edge.label || "",
        backgroundColor: "",
        borderColor: edge.style?.stroke || "#000",
        borderWidth: parseInt(edge.style?.strokeWidth) || 1,
        borderStyle: edge.style?.strokeDasharray ? "dashed" : "solid",
        fontSize: 0,
      });
    }
  }, [nodes, edges, singleNodeSelected, singleEdgeSelected]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProperties({
      ...properties,
      [name]: value,
    });
  };

  // Áp dụng thay đổi
  const applyChanges = () => {
    // Áp dụng cho nodes
    if (nodes.length > 0) {
      nodes.forEach((node) => {
        // Tạo object style hoàn chỉnh để cập nhật
        const newStyle = {
          backgroundColor: properties.backgroundColor,
          borderColor: properties.borderColor,
          borderWidth: `${properties.borderWidth}px`,
          borderStyle: properties.borderStyle,
          fontSize: `${properties.fontSize}px`,
        };

        // Cập nhật cả data và style trong một lần cập nhật
        updateNodeData(node.id, {
          ...node.data,
          label: properties.label,
          color: properties.backgroundColor,
          style: newStyle,
        });
      });
    }

    // Áp dụng cho edges
    if (edges.length > 0) {
      edges.forEach((edge) => {
        const edgeStyle = {
          stroke: properties.borderColor,
          strokeWidth: properties.borderWidth,
          strokeDasharray:
            properties.borderStyle === "dashed" ? "5,5" : undefined,
        };

        updateEdgeStyle(edge.id, edgeStyle);
      });
    }
  };

  // Áp dụng màu nền
  const handleBackgroundColorSelect = (color) => {
    setProperties({
      ...properties,
      backgroundColor: color,
    });

    // Áp dụng ngay
    if (nodes.length > 0) {
      applyColorToSelectedNodes(nodes, color);
    }
  };

  // Áp dụng màu viền
  const handleBorderColorSelect = (color) => {
    setProperties({
      ...properties,
      borderColor: color,
    });

    // Áp dụng ngay
    if (nodes.length > 0) {
      nodes.forEach((node) => {
        // Lấy style hiện tại hoặc tạo mới nếu không có
        const currentStyle = node.style || {};

        // Cập nhật style với borderColor mới
        updateNodeData(node.id, {
          ...node.data,
          style: {
            ...currentStyle,
            borderColor: color,
          },
        });
      });
    }

    if (edges.length > 0) {
      edges.forEach((edge) => {
        updateEdgeStyle(edge.id, {
          stroke: color,
        });
      });
    }
  };

  // Xử lý thay đổi fontSize
  const handleFontSizeChange = (e, newValue) => {
    setProperties({
      ...properties,
      fontSize: newValue,
    });
  };

  // Xử lý thay đổi borderWidth
  const handleBorderWidthChange = (e, newValue) => {
    setProperties({
      ...properties,
      borderWidth: newValue,
    });
  };

  // Nếu không có phần tử nào được chọn
  if (nodes.length === 0 && edges.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Chọn một node hoặc edge để chỉnh sửa thuộc tính
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      {multipleSelected && (
        <Typography variant="body2" gutterBottom>
          {nodes.length > 0 && edges.length > 0
            ? `${nodes.length} node(s) và ${edges.length} edge(s)`
            : nodes.length > 0
            ? `${nodes.length} node(s) được chọn`
            : `${edges.length} edge(s) được chọn`}
        </Typography>
      )}

      {/* Nội dung (Label) */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          <TextFieldsIcon
            fontSize="small"
            sx={{ verticalAlign: "middle", mr: 1 }}
          />
          Nội dung
        </Typography>
        <TextField
          name="label"
          value={properties.label}
          onChange={handleInputChange}
          onBlur={applyChanges}
          size="small"
          fullWidth
          placeholder="Nhập văn bản..."
          variant="outlined"
        />
      </Box>

      {/* Màu nền */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          <FormatColorFillIcon
            fontSize="small"
            sx={{ verticalAlign: "middle", mr: 1 }}
          />
          Màu nền
        </Typography>
        <Grid container spacing={1}>
          {colors &&
            colors.map((color, index) => (
              <Grid item key={index}>
                <Box
                  onClick={() => handleBackgroundColorSelect(color)}
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: color,
                    border:
                      color === properties.backgroundColor
                        ? "2px solid #000"
                        : "1px solid #ccc",
                    borderRadius: 1,
                    cursor: "pointer",
                    "&:hover": {
                      opacity: 0.8,
                    },
                  }}
                />
              </Grid>
            ))}
        </Grid>
      </Box>

      {/* Màu viền */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          <BorderColorIcon
            fontSize="small"
            sx={{ verticalAlign: "middle", mr: 1 }}
          />
          Màu viền
        </Typography>
        <Grid container spacing={1}>
          {borderColors &&
            borderColors.map((color, index) => (
              <Grid item key={index}>
                <Box
                  onClick={() => handleBorderColorSelect(color)}
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: color,
                    border:
                      color === properties.borderColor
                        ? "2px solid #000"
                        : "1px solid #ccc",
                    borderRadius: 1,
                    cursor: "pointer",
                    "&:hover": {
                      opacity: 0.8,
                    },
                  }}
                />
              </Grid>
            ))}
        </Grid>
      </Box>

      {/* Độ dày viền */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Độ dày viền
        </Typography>
        <Slider
          name="borderWidth"
          value={properties.borderWidth}
          onChange={handleBorderWidthChange}
          onChangeCommitted={applyChanges}
          min={1}
          max={10}
          step={1}
          valueLabelDisplay="auto"
          size="small"
        />
      </Box>

      {/* Kiểu viền */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Kiểu viền
        </Typography>
        <Select
          name="borderStyle"
          value={properties.borderStyle}
          onChange={handleInputChange}
          onBlur={applyChanges}
          size="small"
          fullWidth
        >
          <MenuItem value="solid">Liền</MenuItem>
          <MenuItem value="dashed">Đứt khúc</MenuItem>
          <MenuItem value="dotted">Chấm</MenuItem>
        </Select>
      </Box>

      {/* Cỡ chữ */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Cỡ chữ
        </Typography>
        <Slider
          name="fontSize"
          value={properties.fontSize}
          onChange={handleFontSizeChange}
          onChangeCommitted={applyChanges}
          min={10}
          max={24}
          step={1}
          valueLabelDisplay="auto"
          size="small"
        />
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Apply button */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={applyChanges}
        sx={{ mt: 1 }}
      >
        Áp dụng thay đổi
      </Button>
    </Box>
  );
};

export default PropertyPanel;

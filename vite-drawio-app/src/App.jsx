import { ReactFlowProvider } from "reactflow";
import { useState, useEffect, useRef } from "react";
import { useMediaQuery, IconButton, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Sidebar from "./components/sidebar/Sidebar";
import FlowCanvas from "./components/FlowCanvas";
import "./App.css";

function App() {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeoutRef = useRef(null);
  const preventClickRef = useRef(false);

  // Đặt trạng thái mặc định cho sidebar trên thiết bị di động
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isDragging || preventClickRef.current) return; // Không toggle sidebar khi đang kéo

    setShowSidebar(!showSidebar);
    if (isMobile) {
      // Ngăn cuộn trang khi sidebar hiển thị
      document.body.style.overflow = !showSidebar ? "hidden" : "";
    }
  };

  // Theo dõi và xử lý sự kiện kéo thả
  useEffect(() => {
    const handleDragStart = () => {
      setIsDragging(true);
      preventClickRef.current = true;

      // Nếu đang ở mobile, luôn hiển thị sidebar khi bắt đầu kéo
      if (isMobile) {
        setShowSidebar(true);
      }
    };

    const handleDragEnd = () => {
      // Thêm delay nhỏ để tránh click ngay sau khi thả
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }

      dragTimeoutRef.current = setTimeout(() => {
        setIsDragging(false);

        // Nếu đang ở mobile, ẩn sidebar sau khi đã thả
        if (isMobile) {
          setShowSidebar(false);
        }

        // Thêm delay để tránh click ngay sau khi thả
        setTimeout(() => {
          preventClickRef.current = false;
        }, 300);
      }, 100);
    };

    // Xử lý khi người dùng chạm vào màn hình (cho mobile)
    const handleTouchStart = () => {
      if (isDragging) {
        // Ngăn chặn các sự kiện touch khác khi đang kéo
        document.body.style.touchAction = "none";
      }
    };

    const handleTouchEnd = () => {
      // Khôi phục touchAction khi kết thúc
      document.body.style.touchAction = "";
    };

    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("dragend", handleDragEnd);
    window.addEventListener("drop", handleDragEnd);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("dragend", handleDragEnd);
      window.removeEventListener("drop", handleDragEnd);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      document.body.style.touchAction = "";
    };
  }, [isMobile, isDragging]);

  return (
    <div className="app-container">
      <div className={`mobile-toggle ${showSidebar ? "active" : ""}`}>
        <Tooltip title={showSidebar ? "Đóng menu" : "Mở menu"}>
          <IconButton
            onClick={toggleSidebar}
            color="primary"
            size="medium"
            sx={{ boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
          >
            {showSidebar ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Tooltip>
      </div>

      {isMobile && showSidebar && (
        <div
          className={`sidebar-backdrop ${isDragging ? "with-drag" : ""}`}
          onClick={isDragging ? null : toggleSidebar}
        ></div>
      )}

      <div
        className={`sidebar-container ${
          !showSidebar && isMobile ? "hidden" : ""
        }`}
      >
        <Sidebar setIsDragging={setIsDragging} />
      </div>

      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </div>
  );
}

export default App;

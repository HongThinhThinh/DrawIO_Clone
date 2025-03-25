import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Chạy ứng dụng với strict mode tắt để tránh một số vấn đề với ReactFlow
ReactDOM.createRoot(document.getElementById("root")).render(<App />);

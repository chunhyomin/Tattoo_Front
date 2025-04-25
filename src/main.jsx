import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Gender_Select from "./pages/Gender_Select.jsx";
import Picture_Select from "./pages/Picture_Select.jsx";
import Tatoo_Select from "./pages/Tatoo_Select.jsx";
import Picture from "./pages/Picture.jsx";
import Result from "./pages/Result.jsx";
import Loading from "./pages/Loading.jsx";
import Loading_h from "./pages/Loading_h.jsx";
import "./index.css";

// 미디어 디바이스 폴리필 추가
import { setupMediaDevicesPolyfill } from "./mediaDevices-polyfill.js";

// 폴리필 설정 실행 
if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
  try {
    setupMediaDevicesPolyfill();
    console.log("MediaDevices 폴리필 설정됨");
  } catch (error) {
    console.error("MediaDevices 폴리필 설정 오류:", error);
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/Gender_Select" element={<Gender_Select />} />
        <Route path="/Picture_Select" element={<Picture_Select />} />
        <Route path="/Tatoo_Select" element={<Tatoo_Select />} />
        <Route path="/Picture" element={<Picture />} />
        <Route path="/Result" element={<Result />} />
        <Route path="/Loading" element={<Loading />} />
        <Route path="/Loading_h" element={<Loading_h />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
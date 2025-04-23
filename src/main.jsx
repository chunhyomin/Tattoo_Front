import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Page2 from "./pages/page2.jsx";
import Page3 from "./pages/page3.jsx";
import Page4 from "./pages/page4.jsx";
import Page5 from "./pages/page5.jsx";
import Picture from "./Picture.jsx";
import Result from "./Result.jsx";
import Select from "./Select.jsx";
import Loading from "./Loading.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/page2" element={<Page2 />} />
        <Route path="/page3" element={<Page3 />} />
        <Route path="/page4" element={<Page4 />} />
        <Route path="/page5" element={<Page5 />} />
        <Route path="/Picture" element={<Picture />} />
        <Route path="/Result" element={<Result />} />
        <Route path="/Select" element={<Select />} />
        <Route path="/Loading" element={<Loading />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const preferredTheme = window.localStorage.getItem("aei-theme");
const useDarkTheme =
  preferredTheme === "dark" ||
  (!preferredTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.classList.toggle("dark", useDarkTheme);
document.documentElement.style.colorScheme = useDarkTheme ? "dark" : "light";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

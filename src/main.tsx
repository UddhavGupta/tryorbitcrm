import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);

// Dismiss splash once React has painted the first frame
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    (window as unknown as { __hideOrbitSplash?: () => void }).__hideOrbitSplash?.();
  });
});


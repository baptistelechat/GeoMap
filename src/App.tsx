import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import MainMap from "@/pages/MainMap";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useGeomarkStore } from "./store/geomarkStore";

export default function App() {
  const { isEditMode } = useGeomarkStore();

  useEffect(() => {
    // Umami Analytics - Production only
    if (!import.meta.env.DEV) {
      const script = document.createElement("script");
      script.defer = true;
      script.src = "https://cloud.umami.is/script.js";
      script.setAttribute(
        "data-website-id",
        "d6fd095e-84d2-4c4c-8dd8-cf508a9fc0ab"
      );
      document.head.appendChild(script);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMap />} />
      </Routes>
      <Toaster richColors position="top-right" expand={isEditMode} />
    </Router>
  );
}

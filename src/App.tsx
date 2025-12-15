import { Toaster } from "@/components/ui/sonner";
import MainMap from "@/pages/MainMap";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useGeomarkStore } from "./store/geomarkStore";

export default function App() {
  const { isEditMode } = useGeomarkStore();
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMap />} />
      </Routes>
      <Toaster richColors position="top-right" expand={isEditMode} />
    </Router>
  );
}


import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import MainMap from "@/pages/MainMap";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMap />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </Router>
  );
}
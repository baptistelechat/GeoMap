
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import MainMap from "@/pages/MainMap";
import Export from "@/pages/Export";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMap />} />
        <Route path="/export" element={<Export />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </Router>
  );
}
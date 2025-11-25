
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import MainMap from "@/pages/MainMap";
import Export from "@/pages/Export";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMap />} />
        <Route path="/export" element={<Export />} />
      </Routes>
    </Router>
  );
}
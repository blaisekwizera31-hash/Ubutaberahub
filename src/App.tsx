import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CitizenDashboard from "./pages/CitizenDashboard";
import FindLawyer from "./pages/FindLawyer";
import SubmitCase from "./pages/SubmitCase";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<CitizenDashboard />} />
      <Route path="/find-lawyer" element={<FindLawyer />} />
      <Route path="/submit-case" element={<SubmitCase />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;

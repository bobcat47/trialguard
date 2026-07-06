import { Routes, Route } from "react-router";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MyTrials from "./pages/MyTrials";
import EmailScan from "./pages/EmailScan";
import AutoCancel from "./pages/AutoCancel";
import MoneySaved from "./pages/MoneySaved";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trials" element={<MyTrials />} />
          <Route path="/email-scan" element={<EmailScan />} />
          <Route path="/auto-cancel" element={<AutoCancel />} />
          <Route path="/money-saved" element={<MoneySaved />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1E2230",
            border: "1px solid #2A3142",
            color: "#F0F2F5",
          },
        }}
      />
    </>
  );
}

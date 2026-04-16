import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import Contacts from "./pages/Contacts";

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <TopBar title="Dashboard" />
                  <Dashboard />
                </>
              }
            />
            <Route
              path="/cases"
              element={
                <>
                  <TopBar title="Cases" />
                  <Cases />
                </>
              }
            />
            <Route
              path="/cases/:id"
              element={
                <>
                  <TopBar title="Case Detail" />
                  <CaseDetail />
                </>
              }
            />
            <Route
              path="/contacts"
              element={
                <>
                  <TopBar title="Contacts" />
                  <Contacts />
                </>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

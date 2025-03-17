import "./assets/main.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProjectTable } from "./components/ProjectTable";
import { EntityView } from "./components/EntityView";
import { FallbackPage } from "./components/FallbackPage";
import { ProjectProvider } from "./contexts/Project/ProjectProvider";
import { CommandPalette } from "./components/CommandPalette";
import { useCommandPalette } from "./hooks/useCommandPalette";

function AppContent() {
  const { isOpen, closeCommandPalette } = useCommandPalette();

  return (
    <>
      <Routes>
        <Route path="/:workspaceId/projects/:projectId">
          {/* Table view (index route) */}
          <Route
            index
            element={
              <ProjectProvider>
                <ProjectTable />
                <CommandPalette isOpen={isOpen} onClose={closeCommandPalette} />
              </ProjectProvider>
            }
          />

          {/* Entity view */}
          <Route
            path="entities/:entityId"
            element={
              <ProjectProvider>
                <EntityView />
                <CommandPalette isOpen={isOpen} onClose={closeCommandPalette} />
              </ProjectProvider>
            }
          />
        </Route>
        {/* Fallback route */}
        <Route path="*" element={<FallbackPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

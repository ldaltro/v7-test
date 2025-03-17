import React, { useState, useEffect } from "react";
import {
  Entity,
  getEntities,
  getProject,
  Project,
} from "@v7-product-interview-task/api";
import { useParams } from "react-router";
import { ProjectContext } from "./useProjectContext";
import { addProperty } from "../../api/addProperty";

export const ProjectProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { workspaceId, projectId } = useParams() as {
    workspaceId: string;
    projectId: string;
  };

  useEffect(() => {
    const loadProjectData = async () => {
      const apiKey = import.meta.env.VITE_API_KEY;
      if (!apiKey) {
        throw new Error("VITE_API_KEY env variable is not set");
      }

      try {
        const [projectData, entityData] = await Promise.all([
          getProject({
            apiKey,
            projectId,
            workspaceId,
          }),
          getEntities({
            apiKey,
            projectId,
            workspaceId,
          }),
        ]);

        setProject(projectData);
        setEntities(entityData);
      } catch (error) {
        console.error("Error loading project data:", error);
        setEntities([]);
        setProject(null);
      }
    };

    loadProjectData();
  }, [projectId, workspaceId]);

  const addPropertyToProject = async (newProperty: {
    name: string;
    type: "text" | "file" | "json" | "url";
  }) => {
    if (!project) return;

    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_API_KEY;
      if (!apiKey) {
        throw new Error("VITE_API_KEY env variable is not set");
      }

      const property = await addProperty({
        apiKey,
        projectId,
        workspaceId,
        name: newProperty.name,
        type: newProperty.type,
        description: null,
        tool: "manual",
        is_grounded: false,
      });

      setProject({
        ...project,
        properties: [...project.properties, property],
      });

      return property;
    } catch (error) {
      console.error("Failed to add property:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    project,
    entities,
    workspaceId,
    projectId,
    addPropertyToProject,
    loading,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

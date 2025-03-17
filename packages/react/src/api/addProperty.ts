import { API_BASE_URL } from "@v7-product-interview-task/api";
import type { Property } from "@v7-product-interview-task/api";

type PropertyType = "text" | "file" | "json" | "url";

export const addProperty = async ({
  apiKey,
  projectId,
  workspaceId,
  name,
  description = null,
  type,
  tool = "manual",
  is_grounded = false,
}: {
  workspaceId: string;
  projectId: string;
  apiKey: string;
  name: string;
  description?: string | null;
  type: PropertyType;
  tool?: string;
  is_grounded?: boolean;
}): Promise<Property> => {
  const payload = {
    name,
    description,
    type,
    tool,
    is_grounded,
    inputs: [],
  };

  const res = await fetch(
    `${API_BASE_URL}/workspaces/${workspaceId}/projects/${projectId}/properties`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(payload),
    }
  );

  const responseText = await res.text();

  if (!res.ok) {
    throw new Error(
      `Failed to add property: ${res.status} ${res.statusText}\n${responseText}`
    );
  }

  let propertyResponse;
  try {
    propertyResponse = JSON.parse(responseText);
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    throw new Error("Failed to parse API response");
  }

  return propertyResponse as Property;
};

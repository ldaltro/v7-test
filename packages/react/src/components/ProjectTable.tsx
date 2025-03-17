import { Link, useParams } from "react-router-dom";
import { useProjectContext } from "@/contexts/Project/useProjectContext";
import tableStyles from "@v7-product-interview-task/styles/ProjectTable.module.css";
import styles from "./ProjectTable.module.css";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { useState } from "react";
import { SelectionControls } from "./SelectionControls";
import { FileIcon, ImageIcon, PdfIcon } from "@/assets/icons";

// Define types for file objects
type FileObject = {
  name?: string;
  fileName?: string;
  filename?: string;
  raw_text?: string;
  manual_value?: {
    original_filename: string;
  };
  path?: string;
  url?: string;
  id?: string | number;
  toString?: () => string;
};

const FileItem = ({ file }: { file: string | FileObject | unknown }) => {
  let fileName = "";
  if (file && typeof file === "object") {
    const fileObj = file as FileObject;
    // If we couldn't find a name property, we will fallback to Untitled File
    if (!fileName && fileObj.toString) {
      const originalFilename = fileObj.manual_value?.original_filename;
      fileName = originalFilename || "Untitled File";
    }
  }

  // Get file extension for icon selection
  const fileExt = fileName.split(".").pop()?.toLowerCase();

  return (
    <div className={styles.fileItem}>
      <span className={styles.fileIcon}>
        {fileExt === "pdf" ? (
          <PdfIcon />
        ) : fileExt === "png" || fileExt === "jpg" || fileExt === "jpeg" ? (
          <ImageIcon />
        ) : (
          <FileIcon />
        )}
      </span>
      <span className={styles.fileName}>{fileName}</span>
    </div>
  );
};

const FileList = ({
  files,
}: {
  files: Array<string | FileObject | unknown>;
}) => {
  return (
    <div className={styles.fileList}>
      {files.map((file, index) => (
        <FileItem key={index} file={file} />
      ))}
    </div>
  );
};

const JsonDisplay = ({ data }: { data: unknown }) => {
  return <span className={styles.jsonValue}>{JSON.stringify(data)}</span>;
};

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  ariaLabel?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  id,
  ariaLabel,
}) => {
  return (
    <div className={styles.checkboxWrapper}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        id={id}
        aria-label={ariaLabel}
      />
    </div>
  );
};

export const ProjectTable = () => {
  const { workspaceId, projectId } = useParams() as {
    workspaceId: string;
    projectId: string;
  };
  const { entities, project } = useProjectContext();
  const { openCommandPalette } = useCommandPalette();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleSelectAll = () => {
    // If all rows are already selected, deselect all
    if (selectedRows.length === entities.length && entities.length > 0) {
      setSelectedRows([]);
    }
    // Otherwise, select all rows
    else if (entities.length > 0) {
      setSelectedRows(entities.map((entity) => entity.id));
    }
  };

  const handleDelete = () => {
    console.log("Delete action would be implemented here");
    // For now, just clear the selection
    setSelectedRows([]);
  };

  const renderFieldValue = (
    field: unknown,
    propertyType: string,
    propertySlug: string
  ) => {
    if (!field) return null;

    // Special case for file fields - keep the existing file display
    if (propertyType === "file") {
      if (Array.isArray(field)) {
        return <FileList files={field} />;
      }

      return <FileItem file={field} />;
    }

    // Special case for "compliant" field - keep the Yes/No display
    if (propertySlug === "compliant") {
      const value =
        String(field) === "true" || String(field) === "Yes" ? "Yes" : "No";
      return (
        <span
          className={`${styles.statusCell} ${
            value === "Yes" ? styles.statusYes : styles.statusNo
          }`}
        >
          {value}
        </span>
      );
    }

    // For all other fields, let's display as JSON for now
    return <JsonDisplay data={field} />;
  };

  const getColumnWidth = (propertyType: string) => {
    switch (propertyType) {
      case "file":
        return "200px";
      case "boolean":
        return "100px";
      case "json":
        return "250px";
      default:
        return "1fr";
    }
  };

  return (
    <div className={tableStyles.container}>
      {project && (
        <>
          <div
            className={styles.shortcutIndicator}
            onClick={openCommandPalette}
          >
            Press <kbd>⌘</kbd> + <kbd>K</kbd> to add properties
          </div>
          <div className={styles.tableContainer}>
            <table
              className={`${tableStyles.grid} ${styles.customTable}`}
              role="grid"
            >
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={`${styles.tableCell} ${styles.checkboxCell}`}>
                    <Checkbox
                      checked={
                        selectedRows.length === entities.length &&
                        entities.length > 0
                      }
                      onChange={(checked) => {
                        if (checked) {
                          setSelectedRows(entities.map((entity) => entity.id));
                        } else {
                          setSelectedRows([]);
                        }
                      }}
                      ariaLabel="Select all rows"
                    />
                  </th>
                  <th className={`${styles.tableCell} ${styles.numberCell}`}>
                    #
                  </th>
                  {project.properties.map((property) => (
                    <th
                      key={property.id}
                      className={styles.tableCell}
                      style={{
                        width: getColumnWidth(property.type),
                        minWidth:
                          property.type === "file" ? "120px" : undefined,
                      }}
                    >
                      <div className={styles.propertyHeader}>
                        {property.name}
                        {property.type && (
                          <span className={styles.propertyType}>
                            ({property.type})
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entities.map((entity, entityIndex) => (
                  <tr
                    key={entity.id}
                    className={`${styles.tableRow} ${
                      selectedRows.includes(entity.id) ? styles.selected : ""
                    }`}
                  >
                    <td
                      className={`${styles.tableCell} ${styles.checkboxCell}`}
                    >
                      <Checkbox
                        checked={selectedRows.includes(entity.id)}
                        onChange={(checked) => {
                          if (checked) {
                            setSelectedRows((prev) => [...prev, entity.id]);
                          } else {
                            setSelectedRows((prev) =>
                              prev.filter((id) => id !== entity.id)
                            );
                          }
                        }}
                        id={`checkbox-${entity.id}`}
                        ariaLabel={`Select row ${entityIndex + 1}`}
                      />
                    </td>
                    <td
                      tabIndex={0}
                      className={`${styles.tableCell} ${styles.numberCell}`}
                    >
                      <Link
                        to={`/${workspaceId}/projects/${projectId}/entities/${entity.id}`}
                        className={styles.entityLink}
                      >
                        {entityIndex + 1}
                      </Link>
                    </td>
                    {project?.properties.map((property) => (
                      <td
                        key={property.id}
                        className={`${styles.tableCell} ${
                          property.type === "file" ? styles.fileCell : ""
                        }`}
                        style={{
                          width: getColumnWidth(property.type),
                          minWidth:
                            property.type === "file" ? "120px" : undefined,
                        }}
                      >
                        {renderFieldValue(
                          entity.fields[property.slug],
                          property.type,
                          property.slug
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selection Controls */}
          <SelectionControls
            selectedCount={selectedRows.length}
            totalCount={entities.length}
            onSelectAll={handleSelectAll}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
};

export default ProjectTable;

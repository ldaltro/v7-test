import {
  useEffect,
  useState,
  useRef,
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
} from "react";
import { useProjectContext } from "@/contexts/Project/useProjectContext";
import styles from "./CommandPalette.module.css";
import { fuzzySearch } from "@/utils/fuzzySearch";

type Command = {
  id: string;
  name: string;
  description: string;
  action: () => void;
};

type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const CommandPalette = ({ isOpen, onClose }: CommandPaletteProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [newPropertyName, setNewPropertyName] = useState("");
  const [newPropertyType, setNewPropertyType] = useState<
    "text" | "file" | "json" | "url"
  >("text");
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { addPropertyToProject, loading } = useProjectContext();

  // Prevent scroll on body when dialog is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  // Handle dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    try {
      if (isOpen) {
        if (!dialog.open) {
          dialog.showModal();
        }
      } else {
        if (dialog.open) {
          dialog.close();
        }
      }
    } catch (error) {
      console.error("Error handling dialog:", error);
      // Fallback for browsers without full dialog support
      if (isOpen) {
        dialog.setAttribute("open", "");
      } else {
        dialog.removeAttribute("open");
      }
    }
  }, [isOpen]);

  // Focus the input when the command palette opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedIndex(0);
      setIsCreatingProperty(false);
      setNewPropertyName("");
    }
  }, [isOpen]);

  const commands: Command[] = [
    {
      id: "add-property",
      name: "Add Property",
      description: "Add a new property to the table",
      action: () => {
        setIsCreatingProperty(true);
      },
    },
    {
      id: "ask-go",
      name: "Ask Go",
      description: "Ask Go AI assistant for help",
      action: () => {
        alert("Ask Go feature would be implemented here");
        onClose();
      },
    },
  ];

  const filteredCommands = searchTerm
    ? commands.filter(
        (command) =>
          fuzzySearch(searchTerm, command.name) ||
          fuzzySearch(searchTerm, command.description)
      )
    : commands;

  const handleKeyUp = useCallback(
    (e: ReactKeyboardEvent<HTMLDialogElement>) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
      }
    },
    []
  );

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDialogElement>) => {
    if (isCreatingProperty) {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsCreatingProperty(false);
      } else if (e.key === "Enter" && newPropertyName.trim()) {
        e.preventDefault();
        createProperty();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex < filteredCommands.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands.length > 0) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
      case "k":
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
        }
        break;
      default:
        break;
    }
  };

  const createProperty = async () => {
    if (!newPropertyName.trim()) return;

    try {
      await addPropertyToProject({
        name: newPropertyName,
        type: newPropertyType,
      });

      onClose();
    } catch (error) {
      console.error("Error creating property:", error);
      alert(
        `Failed to create property: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onClick={(e) => {
        // Only close when clicking on the dialog element itself, not its children
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div
        className={styles.commandPalette}
        onClick={(e) => e.stopPropagation()}
      >
        {!isCreatingProperty ? (
          <>
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon}>⌘</span>
              <input
                ref={inputRef}
                type="text"
                className={styles.searchInput}
                placeholder="Type a command..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedIndex(0);
                }}
              />
            </div>
            <div className={styles.commandList}>
              {filteredCommands.length > 0 ? (
                filteredCommands.map((command, index) => (
                  <div
                    key={command.id}
                    className={`${styles.commandItem} ${
                      index === selectedIndex ? styles.selected : ""
                    }`}
                    onClick={() => command.action()}
                    tabIndex={0}
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    <div className={styles.commandName}>{command.name}</div>
                    <div className={styles.commandDescription}>
                      {command.description}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>
                  <p>No commands found</p>
                  <button
                    className={styles.fallbackButton}
                    onClick={() => {
                      alert("Ask Go feature would be implemented here");
                      onClose();
                    }}
                  >
                    Ask Go about "{searchTerm}"
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.propertyForm}>
            <h3>Add New Property</h3>
            <div className={styles.formGroup}>
              <label htmlFor="propertyName">Property Name</label>
              <input
                id="propertyName"
                type="text"
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="propertyType">Property Type</label>
              <select
                id="propertyType"
                value={newPropertyType}
                onChange={(e) =>
                  setNewPropertyType(
                    e.target.value as "text" | "file" | "json" | "url"
                  )
                }
              >
                <option value="text">Text</option>
                <option value="file">File</option>
                <option value="json">JSON</option>
                <option value="url">URL</option>
              </select>
            </div>
            <div className={styles.formActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setIsCreatingProperty(false)}
              >
                Cancel
              </button>
              <button
                className={styles.createButton}
                onClick={createProperty}
                disabled={!newPropertyName.trim() || loading}
              >
                {loading ? "Creating..." : "Create Property"}
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
};

export default CommandPalette;

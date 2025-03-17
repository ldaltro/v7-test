import { useState, useEffect } from "react";
import styles from "./SelectionControls.module.css";
import { CheckIcon, TrashIcon } from "@/assets/icons";

interface SelectionControlsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDelete: () => void;
}

export const SelectionControls: React.FC<SelectionControlsProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDelete,
}) => {
  const [visible, setVisible] = useState(false);
  const allSelected = selectedCount === totalCount && totalCount > 0;

  // Show the controls when items are selected
  useEffect(() => {
    if (selectedCount > 0) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [selectedCount]);

  return (
    <div className={`${styles.container} ${visible ? styles.visible : ""}`}>
      <div className={styles.selectedCount}>{selectedCount} Selected</div>
      <div className={styles.divider}></div>
      <button className={styles.selectAllButton} onClick={onSelectAll}>
        <span className={styles.checkIcon}>
          <CheckIcon />
        </span>
        {allSelected ? "Deselect All" : "Select All"}
      </button>
      <div className={styles.divider}></div>
      <button
        className={styles.deleteButton}
        onClick={onDelete}
        aria-label="Delete selected items"
      >
        <span className={styles.trashIcon}>
          <TrashIcon />
        </span>
        Delete
      </button>
    </div>
  );
};

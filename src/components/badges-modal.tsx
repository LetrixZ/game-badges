import {
  DialogButton,
  Dropdown,
  DropdownOption,
  Field,
  gamepadDialogClasses,
  ModalRoot,
  TextField,
} from "@decky/ui";
import { ReactElement, useState } from "react";
import { FaChevronDown, FaChevronUp, FaPlus, FaTrash } from "react-icons/fa";
import {
  Badge,
  isSingularBadgeType,
  StatusBadge,
  useSettings,
} from "../hooks/useSettings";

const STATUS_OPTIONS: DropdownOption[] = [
  { label: "Pending", data: "status.pending" },
  { label: "In Progress", data: "status.in-progress" },
  { label: "Completed", data: "status.completed" },
  { label: "Abandoned", data: "status.abandoned" },
];

function getSelectedOption(badge: Badge) {
  switch (badge.type) {
    case "status":
      return `status.${badge.status}`;
    case "version":
      return "version";
    case "date":
      return "date";
    case "tag":
      return "tag";
  }
}

/**
 * Build the list of selectable badge types, omitting the singular types
 * (status, version, date) that are already used on this app.
 */
function getTypeOptions(used: Set<Badge["type"]>): DropdownOption[] {
  const options: DropdownOption[] = [{ label: "Tag", data: "tag" }];

  if (!used.has("status")) {
    options.push({ label: "Status", options: STATUS_OPTIONS });
  }
  if (!used.has("version")) {
    options.push({ label: "Version", data: "version" });
  }
  if (!used.has("date")) {
    options.push({ label: "Date", data: "date" });
  }

  return options;
}

/** Convert a badge to the type selected in the dropdown, preserving values. */
function applyType(badge: Badge, data: string): Badge {
  if (data.startsWith("status.")) {
    return {
      type: "status",
      status: data.replace("status.", "") as StatusBadge["status"],
    };
  }

  const value = "value" in badge ? badge.value : "";
  switch (data) {
    case "version":
      return { type: "version", value };
    case "date":
      return { type: "date", value };
    default:
      return { type: "tag", value };
  }
}

export default function BadgesModal({
  appId,
  closeModal,
}: {
  appId: number;
  closeModal: () => void;
}): ReactElement {
  const { settings, setAppBadges } = useSettings();

  const [badges, setBadges] = useState(settings[`badges-${appId}`] ?? []);
  const [newBadgeType, setNewBadgeType] = useState<string>("tag");

  const handleDismiss = (): void => {
    const validBadges = badges.filter(
      (badge) => !("value" in badge) || badge.value.trim() !== "",
    );
    setAppBadges(appId, validBadges);
    closeModal();
  };

  const updateBadges = (updated: Badge[]) => {
    setBadges(updated);
    setAppBadges(appId, updated);
  };

  const moveBadge = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= badges.length) {
      return;
    }

    const updated = [...badges];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    updateBadges(updated);
  };

  const usedSingularTypes = new Set<Badge["type"]>(
    badges.filter((badge) => isSingularBadgeType(badge.type)).map((b) => b.type),
  );

  const handleAdd = () => {
    updateBadges([...badges, applyType({ type: "tag", value: "" }, newBadgeType)]);
    setNewBadgeType("tag");
  };

  return (
    <ModalRoot closeModal={handleDismiss}>
      {badges.map((badge, i) => {
        const usedByOthers = new Set<Badge["type"]>(
          badges
            .filter(
              (other, j) => j !== i && isSingularBadgeType(other.type),
            )
            .map((other) => other.type),
        );

        return (
          <div
            key={i}
            className={`${gamepadDialogClasses.Field} ${gamepadDialogClasses.Background} ${gamepadDialogClasses.StandardPadding}`}
          >
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                height: "5.5rem",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={(ev) => {
                    ev.preventDefault();
                    moveBadge(i, -1);
                  }}
                  className={`${gamepadDialogClasses.Button} DialogButton`}
                  style={{
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.75rem",
                    opacity: i === 0 ? 0.4 : 1,
                    cursor: i === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  <FaChevronUp />
                </button>
                <button
                  type="button"
                  disabled={i === badges.length - 1}
                  onClick={(ev) => {
                    ev.preventDefault();
                    moveBadge(i, 1);
                  }}
                  className={`${gamepadDialogClasses.Button} DialogButton`}
                  style={{
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.75rem",
                    opacity: i === badges.length - 1 ? 0.4 : 1,
                    cursor:
                      i === badges.length - 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <FaChevronDown />
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: "1",
                  gap: "0.5rem",
                }}
              >
                <Dropdown
                  contextMenuPositionOptions={{ title: "Badge type" }}
                  menuLabel="Type"
                  rgOptions={getTypeOptions(usedByOthers)}
                  selectedOption={getSelectedOption(badge)}
                  onChange={(option) => {
                    const updated = badges.map((other, j) =>
                      j === i ? applyType(other, option.data) : other,
                    );
                    updateBadges(updated);
                  }}
                ></Dropdown>

                {"value" in badge ? (
                  <TextField
                    value={badge.value}
                    onChange={(ev) => {
                      const updated = badges.map((other, j) =>
                        j === i && "value" in other
                          ? { ...other, value: ev.currentTarget.value }
                          : other,
                      );
                      updateBadges(updated);
                    }}
                  />
                ) : null}
              </div>

              <button
                type="button"
                onClick={(ev) => {
                  ev.preventDefault();
                  const updated = badges.filter((_, j) => j !== i);
                  updateBadges(updated);
                }}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        );
      })}

      <Field
        childrenLayout="below"
        childrenContainerWidth="max"
        bottomSeparator="none"
      >
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <div style={{ flex: "1", minWidth: 0 }}>
            <Dropdown
              contextMenuPositionOptions={{ title: "Badge type" }}
              menuLabel="Type"
              rgOptions={getTypeOptions(usedSingularTypes)}
              selectedOption={newBadgeType}
              onChange={(option) => setNewBadgeType(option.data)}
            />
          </div>
          <DialogButton
            onClick={handleAdd}
            style={{
              display: "flex",
              alignItems: "center",
              width: "auto",
              flexShrink: 0,
            }}
          >
            <FaPlus style={{ marginInlineEnd: "0.25rem" }} />
            Add Badge
          </DialogButton>
        </div>
      </Field>
    </ModalRoot>
  );
}
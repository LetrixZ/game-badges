import {
  DialogButton,
  Dropdown,
  Field,
  gamepadDialogClasses,
  ModalRoot,
  TextField,
} from "@decky/ui";
import { ReactElement, useState } from "react";
import { FaChevronDown, FaChevronUp, FaPlus, FaTrash } from "react-icons/fa";
import {
  Badge,
  StatusBadge,
  TagBadge,
  useSettings,
} from "../hooks/useSettings";

function getSelectedOption(badge: Badge) {
  switch (badge.type) {
    case "status":
      return `status.${badge.status}`;
    case "tag":
      return "tag";
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

  const handleDismiss = (): void => {
    const validBadges = badges.filter((badge) =>
      badge.type === "tag" ? badge.value.trim() !== "" : true,
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

  return (
    <ModalRoot closeModal={handleDismiss}>
      {badges.map((badge, i) => (
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
                  cursor: i === badges.length - 1 ? "not-allowed" : "pointer",
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
                rgOptions={[
                  { label: "Tag", data: "tag" },
                  {
                    label: "Status",
                    options: [
                      { label: "Pending", data: "status.pending" },
                      { label: "In Progress", data: "status.in-progress" },
                      { label: "Completed", data: "status.completed" },
                      { label: "Abandoned", data: "status.abandoned" },
                    ],
                  },
                ]}
                selectedOption={getSelectedOption(badge)}
                onChange={(option) => {
                  if (option.data === "tag") {
                    const updated = badges.map((badge, j) =>
                      j === i
                        ? ({
                            ...badge,
                            type: "tag" as const,
                          } as TagBadge)
                        : badge,
                    );
                    updateBadges(updated);
                  } else if (option.data.startsWith("status.")) {
                    const status = option.data.replace("status.", "");
                    const updated = badges.map((badge, j) =>
                      j === i
                        ? ({
                            ...badge,
                            type: "status" as const,
                            status,
                          } as StatusBadge)
                        : badge,
                    );
                    updateBadges(updated);
                  }
                }}
              ></Dropdown>

              {badge.type === "tag" ? (
                <TextField
                  value={badge.value}
                  onChange={(ev) => {
                    const updated = badges.map((badge, j) =>
                      j === i
                        ? ({
                            ...badge,
                            value: ev.currentTarget.value,
                          } as TagBadge)
                        : badge,
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
      ))}

      <Field
        childrenLayout="below"
        childrenContainerWidth="max"
        bottomSeparator="none"
      >
        <DialogButton
          onClick={() => updateBadges([...badges, { type: "tag", value: "" }])}
          style={{ display: "flex", alignItems: "center" }}
        >
          <FaPlus style={{ marginInlineEnd: "0.25rem" }} />
          Add Badge
        </DialogButton>
      </Field>
    </ModalRoot>
  );
}

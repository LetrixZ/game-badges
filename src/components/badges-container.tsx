import { Button, gamepadTabbedPageClasses, showModal } from "@decky/ui";
import { ReactElement, useRef } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { Badge, useSettings } from "../hooks/useSettings";
import BadgesModal from "./badges-modal";

function getColor(badge: Badge) {
  switch (badge.type) {
    case "status": {
      switch (badge.status) {
        case "pending":
          return "rgba(0, 132, 209, 0.5)";
        case "completed":
          return "rgba(0, 166, 62, 0.5)";
        case "in-progress":
          return "rgba(239, 177, 0, 0.5)";
        case "abandoned":
          return "rgba(251, 44, 54, 0.5)";
      }
    }

    case "version":
      return "rgba(139, 92, 246, 0.5)";
    case "date":
      return "rgba(20, 184, 166, 0.5)";
    case "tag":
      return "rgba(21, 93, 252, 0.5)";
    default:
      return "rgba(14, 20, 27, 0.5)";
  }
}

function getLabel(badge: Badge) {
  switch (badge.type) {
    case "status": {
      switch (badge.status) {
        case "pending":
          return "Pending";
        case "completed":
          return "Completed";
        case "in-progress":
          return "In-Progress";
        case "abandoned":
          return "Abandoned";
      }
    }
    case "version":
      return `v${badge.value}`;
    case "date":
      return badge.value;
    case "tag":
      return badge.value;
  }
}

export default function BadgesContainer({
  appId,
}: {
  appId: number;
}): ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);

  const { settings } = useSettings();
  const badges = settings[`badges-${appId}`] ?? [];

  return (
    <div
      ref={ref}
      id="game-badges"
      style={{
        display: "flex",
        padding: "16px 2.8vw 0",
        backgroundColor: "rgba(14, 20, 27, 0.25)",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      {badges.map((badge) => (
        <div
          className={gamepadTabbedPageClasses.Tab}
          style={{
            backgroundColor: getColor(badge),
            flexShrink: 0,
            borderRadius: "2px",
            pointerEvents: "none",
          }}
        >
          <span className={gamepadTabbedPageClasses.TabTitle}>
            {getLabel(badge)}
          </span>
        </div>
      ))}

      <Button
        className={gamepadTabbedPageClasses.Tab}
        style={{
          backgroundColor: "rgba(14, 20, 27, 0.5)",
          flexShrink: 0,
          height: "2.125rem",
          borderRadius: "2px",
          border: "none",
        }}
        onClick={() =>
          showModal(<BadgesModal appId={appId} closeModal={() => {}} />)
        }
      >
        <span className={gamepadTabbedPageClasses.TabTitle}>
          <FaPencilAlt style={{ color: "white" }} />
        </span>
      </Button>
    </div>
  );
}

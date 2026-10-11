import { definePlugin, routerHook } from "@decky/api";
import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  staticClasses,
} from "@decky/ui";
import { FaShip } from "react-icons/fa";
import patchGame from "./patches/gamePatch";
import { loadSettings, reloadSettings } from "./hooks/useSettings";

function Content() {
  return (
    <PanelSection title="Panel Section">
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => reloadSettings()}>
          Refresh Badges
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}

export default definePlugin(() => {
  const gamePatch = patchGame();
  loadSettings();

  return {
    // The name shown in various decky menus
    name: "Game Badges",
    // The element displayed at the top of your plugin's menu
    titleView: <div className={staticClasses.Title}>Game Badges</div>,
    // The content of your plugin's menu
    content: <Content />,
    // The icon displayed in the plugin list
    icon: <FaShip />,
    // The function triggered when your plugin unloads
    onDismount() {
      routerHook.removePatch("/library/app/:appid", gamePatch);
    },
  };
});

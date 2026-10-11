import os
import json
from settings import SettingsManager
import decky_plugin

class Plugin:
    async def _main(self):
         self.settings = SettingsManager(name="gamebadges", settings_directory=decky_plugin.DECKY_PLUGIN_SETTINGS_DIR)

    async def _unload(self):
        pass

    async def set_setting(self, key, value):
        self.settings.setSetting(key, value)

    async def get_setting(self, key, default):
        return self.settings.getSetting(key, default)

    async def reload_settings(self):
        path = os.path.join(decky_plugin.DECKY_PLUGIN_SETTINGS_DIR, "gamebadges.json")
        try:
            with open(path, "r") as f:
                data = json.load(f)
            inner = data.get("settings", data)
            self.settings.setSetting("settings", inner)
            return inner
        except Exception:
            return None
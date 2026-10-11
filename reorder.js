import fs from "node:fs";

const settings = JSON.parse(fs.readFileSync("gamebadges.json"));

for (const [key, badges] of Object.entries(settings.settings)) {
  for (const badge of badges) {
  }
}

fs.writeFileSync("gamebadges.json", JSON.stringify(settings, null, 4));

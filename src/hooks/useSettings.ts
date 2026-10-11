import { call } from "@decky/api";
import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";

export type Badge = StatusBadge | TagBadge;

export type TagBadge = {
  type: "tag";
  value: string;
};

export type StatusBadge = {
  type: "status";
  status: "pending" | "completed" | "in-progress" | "abandoned";
};

export type Settings = {
  [key: `badges-${number}`]: Badge[];
};

const SettingsContext = new BehaviorSubject<Settings>({});
const LoadingContext = new BehaviorSubject(true);

function updateSettings(key: keyof Settings, value: Settings[keyof Settings]) {
  const newSettings = { ...SettingsContext.value, [key]: value };
  call<[string, Settings], Settings>(
    "set_setting",
    "settings",
    newSettings,
  ).catch(console.error);
  SettingsContext.next(newSettings);
}

export function loadSettings() {
  LoadingContext.next(true);
  call<[string, Settings], Settings>(
    "get_setting",
    "settings",
    SettingsContext.value,
  )
    .then((settings) => SettingsContext.next(settings))
    .catch(console.error)
    .finally(() => LoadingContext.next(false));
}

export function reloadSettings() {
  LoadingContext.next(true);
  call<[], Settings | null>("reload_settings")
    .then((settings) => {
      if (settings) SettingsContext.next(settings);
    })
    .catch(console.error)
    .finally(() => LoadingContext.next(false));
}

export const useSettings = () => {
  const [settings, setSettings] = useState(SettingsContext.value);
  const [loading, setLoading] = useState(LoadingContext.value);

  useEffect(() => {
    const settingsSub = SettingsContext.asObservable().subscribe((value) =>
      setSettings(value),
    );
    const loadingSub = LoadingContext.asObservable().subscribe((value) =>
      setLoading(value),
    );
    return () => {
      loadingSub.unsubscribe();
      settingsSub.unsubscribe();
    };
  }, []);

  function setAppBadges(key: number, value: Badge[]) {
    updateSettings(`badges-${key}`, value);
  }

  return { settings, setAppBadges, loading };
};

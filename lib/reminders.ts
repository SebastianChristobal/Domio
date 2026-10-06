import { readJson, writeJson } from "@/lib/jsonStorage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
export type Reminder = { enabled: boolean; hour: number; minute: number };
const identifier = "domio-evening-reminder";
function validateReminder(data: Reminder) {
  if (
    typeof data.enabled !== "boolean" ||
    !Number.isInteger(data.hour) ||
    data.hour < 0 ||
    data.hour > 23 ||
    !Number.isInteger(data.minute) ||
    data.minute < 0 ||
    data.minute > 59
  )
    throw Error("Ogiltiga påminnelseinställningar");
}
export async function loadReminder(): Promise<Reminder> {
  const data = await readJson<Reminder>("reminder", {
    enabled: false,
    hour: 20,
    minute: 0,
  });
  validateReminder(data);
  return data;
}
async function schedule(data: Reminder) {
  if (!data.enabled) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    return;
  }
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: "Vad har du gjort hemma idag?",
      body: "Ta en stund i soffan och registrera dagens sysslor i Domio.",
      data: { screen: "chores" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: data.hour,
      minute: data.minute,
      channelId: "household",
    },
  });
}
export async function saveReminder(data: Reminder) {
  validateReminder(data);
  if (Platform.OS === "web")
    throw Error("Kvällspåminnelser finns i mobilappen.");
  const previous = await loadReminder();
  if (data.enabled) {
    if (Platform.OS === "android")
      await Notifications.setNotificationChannelAsync("household", {
        name: "Hushållspåminnelser",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted)
      permission = await Notifications.requestPermissionsAsync();
    if (
      !permission.granted &&
      permission.ios?.status !==
        Notifications.IosAuthorizationStatus.PROVISIONAL
    )
      throw Error(
        "Tillåt notiser i telefonens inställningar för att aktivera påminnelsen.",
      );
  }
  await schedule(data);
  try {
    await writeJson("reminder", data);
  } catch (error) {
    await schedule(previous);
    throw error;
  }
}

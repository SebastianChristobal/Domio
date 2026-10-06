import { settingsStyles as s } from "@/components/settings-styles";
import {
  appendActivity,
  deleteActivity,
  loadActivities,
} from "@/lib/activityStorage";
import {
  Activity,
  choresForHome,
  completionTime,
  localDate,
} from "@/lib/chores";
import { Household, loadHousehold } from "@/lib/householdStorage";
import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  AppState,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function TodayScreen() {
  const [home, setHome] = useState<Household | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [memberId, setMemberId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [day, setDay] = useState("today");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const now = new Date();
  const today = localDate(now);
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const selectedDate = day === "today" ? today : localDate(yesterdayDate);
  const members = home?.members.filter((m) => m.kind === "local-profile") ?? [];
  const chores = home ? choresForHome(home.home, home.pets) : [];
  const task = chores.find((t) => t.id === taskId);
  const selectedRoom = task?.rooms.find((r) => r.id === roomId);
  const todayActivities = activities.filter(
    (a) => localDate(new Date(a.completedAt)) === today,
  );
  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function read() {
        setLoading(true);
        try {
          const [h, log] = await Promise.all([
            loadHousehold(),
            loadActivities(),
          ]);
          if (active) {
            setHome(h);
            setActivities(log);
            setError("");
          }
        } catch {
          if (active)
            setError(
              "Kunde inte läsa hushållet och historiken. Öppna sidan igen för att försöka på nytt.",
            );
        } finally {
          if (active) setLoading(false);
        }
      }
      void read();
      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") void read();
      });
      return () => {
        active = false;
        subscription.remove();
      };
    }, []),
  );
  async function register() {
    if (lock.current || !home || !task || !selectedRoom) return;
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const completedAt = time.trim()
        ? completionTime(selectedDate, time.trim())
        : day === "today"
          ? new Date().toISOString()
          : completionTime(selectedDate, "20:00");
      const fresh = await loadHousehold();
      if (
        !fresh.members.some(
          (m) => m.id === member.id && m.kind === "local-profile",
        ) ||
        !choresForHome(fresh.home, fresh.pets)
          .find((t) => t.id === task.id)
          ?.rooms.some((r) => r.id === selectedRoom.id)
      )
        throw Error(
          "Hushållet har ändrats. Öppna sidan igen innan du registrerar.",
        );
      const activity: Activity = {
        id: `activity-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        memberId: member.id,
        memberName: member.name,
        taskId: task.id,
        taskName: task.name,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        points: task.points,
        completedAt,
        recordedAt: new Date().toISOString(),
      };
      await appendActivity(activity);
      setActivities((previous) => [...previous, activity]);
      setTaskId("");
      setRoomId("");
      setTime("");
      setMessage(`${task.name} har registrerats för ${member.name}.`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Kunde inte spara aktiviteten. Försök igen.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await deleteActivity(id);
      setActivities((previous) => previous.filter((item) => item.id !== id));
      setMessage("Registreringen har tagits bort.");
    } catch {
      setError("Kunde inte ta bort registreringen.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function confirmRemove(item: Activity) {
    if (Platform.OS === "web") {
      if (window.confirm("Ta bort denna registrering?")) void remove(item.id);
    } else
      Alert.alert(
        "Ta bort registrering?",
        `${item.memberName}: ${item.taskName}`,
        [
          { text: "Avbryt", style: "cancel" },
          {
            text: "Ta bort",
            style: "destructive",
            onPress: () => {
              void remove(item.id);
            },
          },
        ],
      );
  }
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.title}>Vad har du gjort?</Text>
        <Text style={s.subtitle}>
          Registrera direkt eller samla dagens insatser på kvällen.
        </Text>
        {loading && <Text>Läser dagens uppgifter…</Text>}
        {home && !loading && (
          <>
            <View style={s.card}>
              <Text style={s.label}>
                Idag · {todayActivities.length} insatser
              </Text>
              {members.map((m) => (
                <Text key={m.id} style={s.subtitle}>
                  {m.name}:{" "}
                  {todayActivities.filter((a) => a.memberId === m.id).length}{" "}
                  insatser
                </Text>
              ))}
            </View>
            {!members.length ? (
              <View style={s.card}>
                <Text>
                  Lägg till din egen profil eller en barnprofil för att börja
                  registrera.
                </Text>
                <Pressable
                  style={s.button}
                  onPress={() => router.push("/members" as Href)}
                >
                  <Text style={s.buttonText}>Öppna familjen</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={s.label}>Vem gjorde det?</Text>
                <View style={s.row}>
                  {members.map((m) => (
                    <Pressable
                      key={m.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: memberId === m.id }}
                      disabled={busy}
                      style={[s.choice, memberId === m.id && s.selected]}
                      onPress={() => {
                        setMemberId(m.id);
                        setMessage("");
                      }}
                    >
                      <Text>{m.name}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={s.label}>Vad blev gjort?</Text>
                <View style={s.row}>
                  {chores.map((t) => (
                    <Pressable
                      key={t.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: taskId === t.id }}
                      disabled={busy}
                      style={[s.choice, taskId === t.id && s.selected]}
                      onPress={() => {
                        setTaskId(t.id);
                        setRoomId(t.rooms.length === 1 ? t.rooms[0].id : "");
                        setMessage("");
                      }}
                    >
                      <Text>{t.name}</Text>
                    </Pressable>
                  ))}
                </View>
                {task && (
                  <>
                    <Text style={s.label}>{task.targetLabel ?? "Var?"}</Text>
                    <View style={s.row}>
                      {task.rooms.map((r) => (
                        <Pressable
                          key={r.id}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: roomId === r.id }}
                          disabled={busy}
                          style={[s.choice, roomId === r.id && s.selected]}
                          onPress={() => setRoomId(r.id)}
                        >
                          <Text>{r.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}
                <Text style={s.label}>När?</Text>
                <View style={s.row}>
                  {["today", "yesterday"].map((d) => (
                    <Pressable
                      key={d}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: day === d }}
                      disabled={busy}
                      style={[s.choice, day === d && s.selected]}
                      onPress={() => setDay(d)}
                    >
                      <Text>{d === "today" ? "Idag" : "Igår"}</Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  accessibilityLabel="Tid då sysslan gjordes, HH:MM"
                  editable={!busy}
                  style={s.input}
                  placeholder="Tid, t.ex. 18:30 (valfritt)"
                  maxLength={5}
                  value={time}
                  onChangeText={setTime}
                />
                <Text style={s.subtitle}>
                  Tom tid betyder nu för idag, eller 20:00 för igår. Samma
                  syssla kan registreras flera gånger.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  disabled={
                    busy ||
                    !members.some((m) => m.id === memberId) ||
                    !task ||
                    !selectedRoom
                  }
                  style={[
                    s.button,
                    (busy || !memberId || !task || !selectedRoom) && s.disabled,
                  ]}
                  onPress={register}
                >
                  <Text style={s.buttonText}>
                    {busy ? "Sparar…" : "Registrera insats"}
                  </Text>
                </Pressable>
              </>
            )}
            <Pressable
              style={s.choice}
              onPress={() => router.push("/notifications")}
            >
              <Text>Ställ in kvällspåminnelse</Text>
            </Pressable>
            <Text style={s.label}>Senaste registreringarna</Text>
            {!activities.length && (
              <Text style={s.subtitle}>
                Här visas vem som gjort vad, i vilket rum och när.
              </Text>
            )}
            {[...activities]
              .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
              .slice(0, 50)
              .map((item) => (
                <View key={item.id} style={s.card}>
                  <Text style={s.label}>
                    {item.taskName} · {item.roomName}
                  </Text>
                  <Text style={s.subtitle}>
                    {item.memberName} ·{" "}
                    {new Date(item.completedAt).toLocaleString("sv-SE", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Ta bort ${item.taskName} för ${item.memberName}`}
                    disabled={busy}
                    onPress={() => confirmRemove(item)}
                  >
                    <Text style={s.error}>Ta bort felregistrering</Text>
                  </Pressable>
                </View>
              ))}
          </>
        )}
        {error ? (
          <Text accessibilityLiveRegion="polite" style={s.error}>
            {error}
          </Text>
        ) : null}
        {message ? (
          <Text accessibilityLiveRegion="polite" style={s.success}>
            {message}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

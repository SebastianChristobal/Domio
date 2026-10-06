const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const stores = new Map();
const files = new Map();
const Platform = { OS: "ios" };
const scheduled = new Map();
let permission = true;
let failWrite = false;
const read = (path) =>
  JSON.parse(fs.readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
global.localStorage = {
  getItem: (key) => stores.get(key) ?? null,
  setItem: (key, value) => {
    if (failWrite) throw Error("disk");
    stores.set(key, value);
  },
};
const mocks = {
  "react-native": { Platform },
  "expo-file-system/legacy": {
    documentDirectory: "local/",
    getInfoAsync: async (p) => ({ exists: files.has(p) }),
    readAsStringAsync: async (p) => files.get(p),
    writeAsStringAsync: async (p, v) => {
      if (failWrite) throw Error("disk");
      files.set(p, v);
    },
  },
  "expo-notifications": {
    SchedulableTriggerInputTypes: { DAILY: "daily" },
    AndroidImportance: { DEFAULT: 3 },
    IosAuthorizationStatus: { PROVISIONAL: 3 },
    getPermissionsAsync: async () => ({ granted: permission }),
    requestPermissionsAsync: async () => ({ granted: permission }),
    setNotificationChannelAsync: async () => {},
    cancelScheduledNotificationAsync: async (id) => scheduled.delete(id),
    scheduleNotificationAsync: async (data) => {
      scheduled.set(data.identifier, data);
      return data.identifier;
    },
  },
};
const cache = {};
function load(name) {
  if (mocks[name]) return mocks[name];
  if (cache[name]) return cache[name];
  const path = name.replace(/^@\//, "");
  if (path.endsWith(".json")) return { default: read(path) };
  const code = ts.transpileModule(fs.readFileSync(path + ".ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const mod = { exports: {} };
  cache[name] = mod.exports;
  new Function("require", "module", "exports", code)(load, mod, mod.exports);
  return mod.exports;
}
(async () => {
  const chores = load("@/lib/chores");
  const home = { type: "apartment", area: 60, bedrooms: 1, bathrooms: 1 };
  const vacuum = (h) =>
    chores.choresForHome(h).find((t) => t.name === "Dammsuga").rooms;
  assert.equal(
    vacuum(home).filter((r) => r.id.startsWith("bedroom")).length,
    1,
  );
  assert.equal(
    vacuum({ ...home, bedrooms: 2 }).filter((r) => r.id.startsWith("bedroom"))
      .length,
    2,
  );
  assert.equal(
    vacuum({ ...home, area: 140 }).filter((r) => r.id.startsWith("bedroom"))
      .length,
    1,
  );
  assert.equal(
    vacuum({ ...home, bedrooms: 0 }).filter((r) => r.id.startsWith("bedroom"))
      .length,
    0,
  );
  assert.equal(
    chores.choresForHome({ ...home, bathrooms: 2 }).find((t) => t.id === "1-0")
      .rooms.length,
    2,
  );
  assert.ok(chores.choresForHome(home).some((t) => t.name === "Lagat mat"));
  assert.throws(() => chores.completionTime("2026-10-06", "25:00"));
  assert.throws(() =>
    chores.completionTime(
      "2026-10-06",
      "20:00",
      new Date("2026-10-06T18:00:00"),
    ),
  );
  assert.equal(
    chores.localDate(
      new Date(
        chores.completionTime(
          "2026-10-05",
          "18:30",
          new Date("2026-10-06T18:00:00"),
        ),
      ),
    ),
    "2026-10-05",
  );
  const pets = [
    { id: "dog1", name: "Luna", type: "dog" },
    { id: "cat1", name: "Milo", type: "cat" },
  ];
  assert.equal(
    chores.choresForHome(home).some((t) => t.id === "pet-walk"),
    false,
  );
  assert.equal(
    chores.choresForHome(home, [pets[1]]).some((t) => t.id === "pet-walk"),
    false,
  );
  assert.equal(
    chores.choresForHome(home, [pets[0]]).some((t) => t.id === "pet-litter"),
    false,
  );
  assert.deepEqual(
    chores.choresForHome(home, pets).find((t) => t.id === "pet-walk").rooms,
    [{ id: "pet-dog1", name: "Luna" }],
  );
  assert.equal(
    chores.choresForHome(home, pets).find((t) => t.id === "pet-feed").rooms
      .length,
    2,
  );
  assert.ok(chores.choresForHome(home).some((t) => t.name === "Källsorterat"));
  const household = load("@/lib/householdStorage");
  for (const os of ["ios", "web"]) {
    Platform.OS = os;
    const store = os === "web" ? stores : files;
    const key = os === "web" ? "domio-household-v1" : "local/household.json";
    const members = [
      {
        id: "person1",
        name: "Sam",
        role: "adult",
        avatarId: 1,
        kind: "local-profile",
      },
    ];
    store.set(key, JSON.stringify({ version: 2, home, members }));
    const data = await household.loadHousehold();
    assert.equal(data.version, 3);
    assert.deepEqual(data.members, members);
    assert.deepEqual(data.pets, []);
    data.pets = pets;
    await household.saveHousehold(data);
    assert.deepEqual((await household.loadHousehold()).pets, pets);
    await assert.rejects(() =>
      household.saveHousehold({ ...data, pets: [{ ...pets[0], name: "" }] }),
    );
    await assert.rejects(() =>
      household.saveHousehold({ ...data, pets: [pets[0], pets[0]] }),
    );
    store.set(
      key,
      JSON.stringify({
        version: 1,
        home,
        members: [{ id: "old", name: "Existing", role: "adult", avatarId: 1 }],
      }),
    );
    const old = await household.loadHousehold();
    assert.equal(old.version, 3);
    assert.equal(old.members[0].kind, "local-profile");
  }
  const log = load("@/lib/activityStorage");
  for (const os of ["ios", "web"]) {
    Platform.OS = os;
    assert.deepEqual(await log.loadActivities(), []);
    const item = {
      id: "a",
      memberId: "m",
      memberName: "Sam",
      taskId: "3-0",
      taskName: "Dammsuga",
      roomId: "bedroom-1",
      roomName: "Sovrum 1",
      points: 40,
      completedAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
    };
    await log.appendActivity(item);
    await log.appendActivity({ ...item, id: "b" });
    assert.equal((await log.loadActivities()).length, 2);
    await log.deleteActivity("a");
    assert.equal((await log.loadActivities())[0].id, "b");
    assert.equal((await log.loadActivities())[0].roomName, "Sovrum 1");
  }
  Platform.OS = "ios";
  const reminders = load("@/lib/reminders");
  await reminders.saveReminder({ enabled: true, hour: 20, minute: 0 });
  await reminders.saveReminder({ enabled: true, hour: 21, minute: 15 });
  assert.equal(scheduled.size, 1);
  assert.equal([...scheduled.values()][0].trigger.hour, 21);
  failWrite = true;
  await assert.rejects(() =>
    reminders.saveReminder({ enabled: true, hour: 19, minute: 0 }),
  );
  failWrite = false;
  assert.equal([...scheduled.values()][0].trigger.hour, 21);
  permission = false;
  await assert.rejects(() =>
    reminders.saveReminder({ enabled: true, hour: 18, minute: 0 }),
  );
  assert.equal((await reminders.loadReminder()).hour, 21);
  await reminders.saveReminder({ enabled: false, hour: 21, minute: 15 });
  assert.equal(scheduled.size, 0);
  Platform.OS = "web";
  await assert.rejects(() =>
    reminders.saveReminder({ enabled: true, hour: 20, minute: 0 }),
  );
  console.log(
    "PASS: pets, household migration, room selection, dates, JSON history, repeat chores, deletion, reminder replacement, permission denial, rollback and web support.",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

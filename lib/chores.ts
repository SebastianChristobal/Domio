import catalog from "@/constants/data/tasks.json";
import { Household, Pet } from "@/lib/householdStorage";
export type Room = { id: string; name: string };
export type Chore = {
  id: string;
  name: string;
  points: number;
  rooms: Room[];
  targetLabel?: string;
};
export type Activity = {
  id: string;
  memberId: string;
  memberName: string;
  taskId: string;
  taskName: string;
  roomId: string;
  roomName: string;
  points: number;
  completedAt: string;
  recordedAt: string;
};
export function roomsForHome(home: Household["home"]): Room[] {
  return [
    { id: "kitchen", name: "Kök" },
    {
      id: "living",
      name: home.bedrooms === 0 ? "Vardagsrum / sovplats" : "Vardagsrum",
    },
    { id: "hall", name: "Hall" },
    ...Array.from({ length: home.bedrooms }, (_, i) => ({
      id: `bedroom-${i + 1}`,
      name: `Sovrum ${i + 1}`,
    })),
    ...Array.from({ length: home.bathrooms }, (_, i) => ({
      id: `bathroom-${i + 1}`,
      name: home.bathrooms === 1 ? "Badrum" : `Badrum ${i + 1}`,
    })),
  ];
}
export function choresForHome(
  home: Household["home"],
  pets: Pet[] = [],
): Chore[] {
  const rooms = roomsForHome(home);
  const chores: Chore[] = catalog.categories.flatMap((category) =>
    category.tasks.map((task) => ({
      id: `${category.id}-${task.id}`,
      name: task.name,
      points: task.points,
      rooms:
        category.id === 0
          ? rooms.filter((r) => r.id === "kitchen")
          : category.id === 1
            ? rooms.filter((r) => r.id.startsWith("bathroom-"))
            : category.id === 2
              ? [{ id: "laundry", name: "Tvätt" }]
              : category.id === 4
                ? [{ id: "household", name: "Hushållet" }]
                : rooms,
    })),
  );
  const dogs = pets
    .filter((pet) => pet.type === "dog")
    .map((pet) => ({ id: `pet-${pet.id}`, name: pet.name }));
  const cats = pets
    .filter((pet) => pet.type === "cat")
    .map((pet) => ({ id: `pet-${pet.id}`, name: pet.name }));
  if (dogs.length)
    chores.push({
      id: "pet-walk",
      name: "Rastat hund",
      points: 20,
      rooms: dogs,
      targetLabel: "Vilken hund?",
    });
  if (cats.length)
    chores.push({
      id: "pet-litter",
      name: "Rengjort kattlådan",
      points: 15,
      rooms: cats,
      targetLabel: "För vilken katt?",
    });
  if (pets.length)
    chores.push({
      id: "pet-feed",
      name: "Gett mat och vatten",
      points: 10,
      rooms: pets.map((pet) => ({ id: `pet-${pet.id}`, name: pet.name })),
      targetLabel: "Vilket husdjur?",
    });
  return chores;
}
export function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function completionTime(
  date: string,
  time: string,
  now = new Date(),
): string {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  )
    throw Error("Ange tiden som HH:MM, till exempel 18:30.");
  const result = new Date(`${date}T${time}:00`);
  if (
    !Number.isFinite(result.getTime()) ||
    localDate(result) !== date ||
    result > now
  )
    throw Error("Välj en tid som redan har passerat.");
  return result.toISOString();
}

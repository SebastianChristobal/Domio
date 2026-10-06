import defaults from '@/constants/data/household.json';
import avatars from '@/constants/data/avatar.json';
import * as FS from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export type Member = {
  id: string;
  name: string;
  role: 'adult' | 'child';
  avatarId: number;
  kind: 'local-profile' | 'invitation';
  email?: string;
  invitationStatus?: 'draft';
};
export type Pet = { id: string; name: string; type: 'dog' | 'cat' | 'other' };
export type Household = {
  version: number;
  home: { type: string; area: number; bedrooms: number; bathrooms: number };
  members: Member[];
  pets: Pet[];
};
const key = 'domio-household-v1';
function path() {
  if (!FS.documentDirectory) throw Error('Lagring saknas');
  return FS.documentDirectory + 'household.json';
}
export function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
export function validEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
export function memberError(members: Member[]): string {
  const emails = new Set<string>();
  for (const member of members) {
    if (!member.name.trim()) return 'Fyll i ett namn för varje familjemedlem.';
    if (member.kind === 'invitation') {
      if (!member.email || !validEmail(member.email)) return 'Ange en giltig mejladress för varje inbjudan.';
      const email = normalizeEmail(member.email);
      if (emails.has(email)) return 'Samma mejladress kan bara bjudas in en gång.';
      emails.add(email);
    }
  }
  return '';
}
export function validate(data: Household) {
  if (!data || data.version !== 3 || !data.home || !Array.isArray(data.members) || !Array.isArray(data.pets)) throw Error('Ogiltig JSON');
  const h = data.home;
  if (!['apartment', 'house'].includes(h.type) || !Number.isFinite(h.area) || h.area <= 0 || !Number.isInteger(h.bedrooms) || h.bedrooms < 0 || !Number.isInteger(h.bathrooms) || h.bathrooms < 1) throw Error('Ogiltigt hem');
  const ids = new Set<string>();
  for (const m of data.members) {
    if (!m || typeof m.id !== 'string' || !m.id || ids.has(m.id) || typeof m.name !== 'string' || !['adult', 'child'].includes(m.role) || !avatars.some(a => a.id === m.avatarId) || !['local-profile', 'invitation'].includes(m.kind)) throw Error('Ogiltig medlem');
    if (m.kind === 'invitation' && (typeof m.email !== 'string' || m.invitationStatus !== 'draft')) throw Error('Ogiltig inbjudan');
    if (m.kind === 'local-profile' && (m.email !== undefined || m.invitationStatus !== undefined)) throw Error('Ogiltig lokal profil');
    ids.add(m.id);
  }
  const petIds = new Set<string>();
  for (const pet of data.pets) {
    if (!pet || typeof pet.id !== 'string' || !pet.id || petIds.has(pet.id) || typeof pet.name !== 'string' || !pet.name.trim() || !['dog', 'cat', 'other'].includes(pet.type)) throw Error('Kontrollera husdjurens namn och typ.');
    petIds.add(pet.id);
  }
  const issue = memberError(data.members);
  if (issue) throw Error(issue);
}
function migrate(data: Household): Household {
  if (data?.version === 1 && Array.isArray(data.members)) {
    return { ...data, version: 3, pets: [], members: data.members.map(member => ({ ...member, kind: 'local-profile' })) };
  }
  if (data?.version === 2) return { ...data, version: 3, pets: [] };
  return data;
}
export async function loadHousehold(): Promise<Household> {
  let raw: string | null = null;
  if (Platform.OS === 'web') raw = localStorage.getItem(key);
  else if ((await FS.getInfoAsync(path())).exists) raw = await FS.readAsStringAsync(path());
  const data = migrate(raw === null ? JSON.parse(JSON.stringify(defaults)) : JSON.parse(raw));
  validate(data);
  return data;
}
export async function saveHousehold(data: Household) {
  validate(data);
  const normalized = { ...data, pets: data.pets.map(pet => ({ ...pet, name: pet.name.trim() })), members: data.members.map(m => m.kind === 'invitation' ? { ...m, name: m.name.trim(), email: normalizeEmail(m.email!) } : { ...m, name: m.name.trim() }) };
  const raw = JSON.stringify(normalized, null, 2);
  if (Platform.OS === 'web') localStorage.setItem(key, raw);
  else await FS.writeAsStringAsync(path(), raw);
}


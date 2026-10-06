import * as FS from 'expo-file-system/legacy';
import { Platform } from 'react-native';
export async function readJson<T>(name: string, fallback: T): Promise<T> {
  let raw: string | null = null;
  if (Platform.OS === 'web') raw = localStorage.getItem(`domio-${name}`);
  else {
    if (!FS.documentDirectory) throw Error('Lagring saknas');
    const path = `${FS.documentDirectory}${name}.json`;
    if ((await FS.getInfoAsync(path)).exists) raw = await FS.readAsStringAsync(path);
  }
  return raw === null ? JSON.parse(JSON.stringify(fallback)) : JSON.parse(raw);
}
export async function writeJson<T>(name: string, data: T) {
  const raw = JSON.stringify(data, null, 2);
  if (Platform.OS === 'web') localStorage.setItem(`domio-${name}`, raw);
  else {
    if (!FS.documentDirectory) throw Error('Lagring saknas');
    await FS.writeAsStringAsync(`${FS.documentDirectory}${name}.json`, raw);
  }
}

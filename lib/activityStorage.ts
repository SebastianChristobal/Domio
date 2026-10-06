import { Activity } from '@/lib/chores';
import { readJson, writeJson } from '@/lib/jsonStorage';
type Log = { version: number; activities: Activity[] };
export async function loadActivities(): Promise<Activity[]> {
  const data = await readJson<Log>('activities', { version: 1, activities: [] });
  if (data.version !== 1 || !Array.isArray(data.activities)) throw Error('Ogiltig historik');
  for (const item of data.activities) {
    if (!item || ['id','memberId','memberName','taskId','taskName','roomId','roomName','completedAt','recordedAt'].some(key => typeof item[key as keyof Activity] !== 'string') || !Number.isFinite(item.points) || !Number.isFinite(Date.parse(item.completedAt))) throw Error('Ogiltig aktivitet');
  }
  return data.activities;
}
export async function appendActivity(activity: Activity) {
  const previous = await loadActivities();
  await writeJson('activities', { version: 1, activities: [...previous, activity] });
}
export async function deleteActivity(id: string) {
  const previous = await loadActivities();
  await writeJson('activities', { version: 1, activities: previous.filter(item => item.id !== id) });
}

import { useEffect, useState } from 'react';
import { Household, loadHousehold, saveHousehold } from '@/lib/householdStorage';
export function useHousehold() {
 const [data,setData] = useState<Household | null>(null);
 const [error,setError] = useState(''); const [saving,setSaving] = useState(false); const [saved,setSaved] = useState(false); const [loading,setLoading] = useState(true);
 async function reload() { setLoading(true); setError(''); try { setData(await loadHousehold()); } catch { setError('Kunde inte läsa hushållet. Försök igen.'); } finally { setLoading(false); } }
 useEffect(() => { void reload(); }, []);
 function update(next: Household) { setData(next); setSaved(false); setError(''); }
 async function save() { if (!data || saving) return; setSaving(true); setError(''); setSaved(false); try { await saveHousehold(data); setSaved(true); } catch { setError('Kunde inte spara. Kontrollera uppgifterna och försök igen.'); } finally { setSaving(false); } }
 return {data,update,error,saving,saved,loading,save,reload};
}

import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { loadReminder, saveReminder } from '@/lib/reminders';
import { settingsStyles as s } from '@/components/settings-styles';
export default function NotificationsScreen() {
  const [enabled,setEnabled] = useState(false);
  const [time,setTime] = useState('20:00');
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  async function load() {
    setLoading(true); setError('');
    try { const data = await loadReminder(); setEnabled(data.enabled); setTime(`${String(data.hour).padStart(2,'0')}:${String(data.minute).padStart(2,'0')}`); }
    catch { setError('Kunde inte läsa påminnelsen. Försök igen.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function save() {
    if (busy) return;
    setBusy(true); setMessage(''); setError('');
    try {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw Error('Ange tiden som HH:MM, till exempel 20:00.');
      const [hour,minute] = time.split(':').map(Number);
      await saveReminder({ enabled,hour,minute });
      setMessage(enabled ? `Daglig kvällspåminnelse är aktiverad kl. ${time}.` : 'Kvällspåminnelsen är avstängd.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Kunde inte spara påminnelsen.'); }
    finally { setBusy(false); }
  }
  const mobile = Platform.OS !== 'web';
  return <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
    <Text style={s.title}>Kvällspåminnelse</Text><Text style={s.subtitle}>En daglig påminnelse att registrera vad du har gjort hemma. Du kan alltid registrera sysslor under dagen.</Text>
    {loading ? <Text>Läser inställningarna…</Text> : <>
      <View style={s.card}><View style={s.row}><Text style={[s.label,{flex:1}]}>Påminn mig varje kväll</Text><Switch accessibilityLabel="Daglig kvällspåminnelse" disabled={busy || !mobile} value={enabled} onValueChange={value => { setEnabled(value); setMessage(''); }} /></View>
      <Text style={s.label}>Tid (HH:MM)</Text><TextInput accessibilityLabel="Tid för kvällspåminnelse" editable={!busy && mobile} style={s.input} maxLength={5} value={time} onChangeText={value => {setTime(value);setMessage('');}} /><Text style={s.subtitle}>Tiden gäller telefonens lokala tid. Påminnelsen är personlig för den här enheten.</Text></View>
      {mobile ? <><Pressable accessibilityRole="button" disabled={busy || !!error && error.startsWith('Kunde inte läsa')} style={[s.button,busy && s.disabled]} onPress={save}><Text style={s.buttonText}>{busy ? 'Sparar…' : 'Spara påminnelsen'}</Text></Pressable><Pressable style={s.choice} onPress={() => Linking.openSettings()}><Text>Öppna telefonens notisinställningar</Text></Pressable></> : <Text style={s.subtitle}>Kvällspåminnelser finns i mobilappen. På webben kan du registrera sysslor manuellt.</Text>}
    </>}
    {error ? <><Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>{error.startsWith('Kunde inte läsa') && <Pressable style={s.choice} onPress={load}><Text>Försök igen</Text></Pressable>}</> : null}
    {message ? <Text accessibilityLiveRegion="polite" style={s.success}>{message}</Text> : null}
  </ScrollView>;
}

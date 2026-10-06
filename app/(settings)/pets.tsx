import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Pet } from '@/lib/householdStorage';
import { useHousehold } from '@/hooks/use-household';
import { settingsStyles as s } from '@/components/settings-styles';
const labels = { dog: 'Hund', cat: 'Katt', other: 'Annat husdjur' };
export default function PetsScreen() {
  const { data, update, error, loading, saving, saved, save, reload } = useHousehold();
  function edit(id: string, patch: Partial<Pet>) {
    if (data) update({ ...data, pets: data.pets.map(pet => pet.id === id ? { ...pet, ...patch } : pet) });
  }
  function remove(pet: Pet) {
    if (!data) return;
    const action = () => update({ ...data, pets: data.pets.filter(item => item.id !== pet.id) });
    if (Platform.OS === 'web') { if (window.confirm(`Ta bort ${pet.name || 'husdjuret'}? Tidigare registreringar behålls.`)) action(); }
    else Alert.alert('Ta bort husdjur?', 'Tidigare registreringar behålls. Ändringen sparas med Spara husdjuren.', [{ text: 'Avbryt', style: 'cancel' }, { text: 'Ta bort', style: 'destructive', onPress: action }]);
  }
  return <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
    <Text style={s.title}>Husdjur</Text>
    <Text style={s.subtitle}>Lägg till familjens husdjur. Hundar får uppgiften Rastat hund, katter Rengjort kattlådan. Alla får mat och vatten som registrerbar syssla.</Text>
    {loading && <Text>Läser husdjuren…</Text>}
    {data && <>
      {!data.pets.length && <View style={s.card}><Text>Inga husdjur ännu. Lägg till ett om ni har djur hemma.</Text></View>}
      {data.pets.map((pet, index) => <View key={pet.id} style={s.card}>
        <Text style={s.label}>{pet.name || `Husdjur ${index + 1}`}</Text>
        <TextInput accessibilityLabel={`Namn på husdjur ${index + 1}`} editable={!saving} style={s.input} maxLength={60} placeholder="Husdjurets namn" value={pet.name} onChangeText={name => edit(pet.id, { name })} />
        <View style={s.row}>{(['dog','cat','other'] as const).map(type => <Pressable key={type} accessibilityRole="radio" accessibilityLabel={`${labels[type]} för ${pet.name || `husdjur ${index + 1}`}`} accessibilityState={{ selected: pet.type === type }} disabled={saving} style={[s.choice, pet.type === type && s.selected]} onPress={() => edit(pet.id, { type })}><Text>{labels[type]}</Text></Pressable>)}</View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Ta bort ${pet.name || 'husdjur'}`} style={s.choice} disabled={saving} onPress={() => remove(pet)}><Text style={s.error}>Ta bort husdjur</Text></Pressable>
      </View>)}
      <Pressable accessibilityRole="button" disabled={saving} style={s.choice} onPress={() => update({ ...data, pets: [...data.pets, { id: `pet-${Date.now()}-${Math.random().toString(36).slice(2)}`, name: '', type: 'dog' }] })}><Text style={s.label}>+ Lägg till husdjur</Text></Pressable>
      {data.pets.some(pet => !pet.name.trim()) && <Text style={s.error}>Fyll i ett namn för varje husdjur innan du sparar.</Text>}
      <Pressable accessibilityRole="button" disabled={saving || data.pets.some(pet => !pet.name.trim())} style={[s.button, (saving || data.pets.some(pet => !pet.name.trim())) && s.disabled]} onPress={save}><Text style={s.buttonText}>{saving ? 'Sparar…' : 'Spara husdjuren'}</Text></Pressable>
    </>}
    {error ? <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text> : null}
    {!data && !loading && <Pressable style={s.choice} onPress={reload}><Text>Försök igen</Text></Pressable>}
    {saved && <Text accessibilityLiveRegion="polite" style={s.success}>Husdjuren har sparats.</Text>}
  </ScrollView>;
}

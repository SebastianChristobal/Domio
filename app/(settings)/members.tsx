import { Alert, Image, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import avatars from '@/constants/data/avatar.json';
import { avatarImages } from '@/lib/avatarImages';
import { Member, memberError } from '@/lib/householdStorage';
import { useHousehold } from '@/hooks/use-household';
import { settingsStyles as s } from '@/components/settings-styles';

export default function MembersScreen() {
  const { data, update, error, loading, saving, saved, save, reload } = useHousehold();
  const issue = data ? memberError(data.members) : '';
  function edit(id: string, patch: Partial<Member>) {
    if (data) update({ ...data, members: data.members.map(m => m.id === id ? { ...m, ...patch } : m) });
  }
  function add(kind: Member['kind'], role: Member['role'] = kind === 'invitation' ? 'adult' : 'child') {
    if (!data) return;
    const member: Member = {
      id: `member-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: '', role, avatarId: avatars[0].id, kind,
      ...(kind === 'invitation' ? { email: '', invitationStatus: 'draft' as const } : {}),
    };
    update({ ...data, members: [...data.members, member] });
  }
  function remove(id: string) {
    if (!data) return;
    const action = () => update({ ...data, members: data.members.filter(m => m.id !== id) });
    if (Platform.OS === 'web') { if (window.confirm('Ta bort familjemedlemmen?')) action(); }
    else Alert.alert('Ta bort familjemedlem?', 'Ändringen sparas när du trycker på Spara familjen.', [
      { text: 'Avbryt', style: 'cancel' }, { text: 'Ta bort', style: 'destructive', onPress: action },
    ]);
  }
  return <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
    <Text style={s.title}>Familjemedlemmar</Text>
    <Text style={s.subtitle}>Förbered en mejlinbjudan till en vuxen eller ett barn med egen mejl. Yngre barn kan få en lokal profil.</Text>
    {loading && <Text>Läser familjen…</Text>}
    {data && <>
      <View style={s.card}>
        <Text style={s.label}>Lägg till i hushållet</Text>
<Pressable accessibilityRole="button" disabled={saving} style={s.choice} onPress={() => add('local-profile', 'adult')}><Text style={s.label}>+ Lägg till min egen profil</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={saving} style={s.button} onPress={() => add('invitation')}><Text style={s.buttonText}>Bjud in med mejl</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={saving} style={s.choice} onPress={() => add('local-profile')}><Text style={s.label}>+ Lägg till barnprofil</Text></Pressable>
        <Text style={s.subtitle}>Mejlinbjudningar sparas som utkast på den här enheten. Inga mejl skickas ännu.</Text>
      </View>
      <Text style={s.label}>{data.members.filter(m => m.kind === 'local-profile').length} lokala profiler · {data.members.filter(m => m.kind === 'invitation').length} inbjudningsutkast</Text>
      {!data.members.length && <Text style={s.subtitle}>Ingen är tillagd ännu. Välj ett av alternativen ovan.</Text>}
      {data.members.map((member, index) => <View key={member.id} style={s.card}>
        <Text style={s.label}>{member.kind === 'invitation' ? 'Mejlinbjudan' : 'Lokal profil'} · {member.name || `Person ${index + 1}`}</Text>
        <Text style={s.subtitle}>{member.kind === 'invitation' ? 'Utkast · inte skickad' : member.role === 'child' ? 'Hanteras av en vuxen · inget eget konto' : 'Lokal vuxenprofil · inget eget konto'}</Text>
        <Text style={s.label}>Namn eller smeknamn</Text>
        <TextInput accessibilityLabel={`Namn på person ${index + 1}`} editable={!saving} style={s.input} maxLength={60} placeholder="Namn eller smeknamn" value={member.name} onChangeText={name => edit(member.id, { name })} />
        {member.kind === 'invitation' && <>
          <Text style={s.label}>Mejladress</Text>
          <TextInput accessibilityLabel={`Mejladress för ${member.name || `person ${index + 1}`}`} editable={!saving} style={s.input} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" maxLength={254} placeholder="namn@exempel.se" value={member.email ?? ''} onChangeText={email => edit(member.id, { email })} />
          <Text style={s.label}>Roll i hushållet</Text>
          <View style={s.row}>{(['adult', 'child'] as const).map(role => <Pressable key={role} accessibilityRole="radio" accessibilityLabel={`${role === 'adult' ? 'Vuxen' : 'Barn'} för ${member.name || `person ${index + 1}`}`} accessibilityState={{ selected: member.role === role }} disabled={saving} style={[s.choice, member.role === role && s.selected]} onPress={() => edit(member.id, { role })}><Text>{role === 'adult' ? 'Vuxen' : 'Barn'}</Text></Pressable>)}</View>
        </>}
        <Text style={s.label}>Avatar</Text>
        <View style={s.row}>{avatars.map((avatar, i) => <Pressable key={avatar.id} accessibilityRole="radio" accessibilityLabel={`Avatar ${i + 1} för ${member.name || `person ${index + 1}`}`} accessibilityState={{ selected: member.avatarId === avatar.id }} disabled={saving} style={[s.choice, member.avatarId === avatar.id && s.selected]} onPress={() => edit(member.id, { avatarId: avatar.id })}><Image source={avatarImages[avatar.img]} style={{ width: 44, height: 44, borderRadius: 22 }} /></Pressable>)}</View>
        {member.kind === 'local-profile' && member.role === 'adult' && <Pressable accessibilityRole="button" disabled={saving} style={s.choice} onPress={() => edit(member.id, { kind: 'invitation', email: '', invitationStatus: 'draft' })}><Text>Förbered mejlinbjudan för denna vuxen</Text></Pressable>}
        <Pressable accessibilityRole="button" accessibilityLabel={`Ta bort ${member.name || `person ${index + 1}`}`} disabled={saving} style={s.choice} onPress={() => remove(member.id)}><Text style={s.error}>{member.kind === 'invitation' ? 'Ta bort utkast' : 'Ta bort profil'}</Text></Pressable>
      </View>)}
      {issue ? <Text accessibilityLiveRegion="polite" style={s.error}>{issue}</Text> : null}
      <Pressable accessibilityRole="button" disabled={saving || !!issue} style={[s.button, (saving || !!issue) && s.disabled]} onPress={save}><Text style={s.buttonText}>{saving ? 'Sparar…' : 'Spara familjen'}</Text></Pressable>
    </>}
    {error ? <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text> : null}
    {!data && !loading && <Pressable accessibilityRole="button" style={s.choice} onPress={reload}><Text>Försök igen</Text></Pressable>}
    {saved && <Text accessibilityLiveRegion="polite" style={s.success}>Familjen och inbjudningsutkasten har sparats lokalt.</Text>}
  </ScrollView>;
}



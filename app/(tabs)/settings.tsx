import { useCallback, useState } from 'react';
import { Href, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Household, loadHousehold } from '@/lib/householdStorage';
import { settingsStyles as s } from '@/components/settings-styles';
export default function SettingsScreen() {
 const [data,setData]=useState<Household|null>(null);
 const [error,setError]=useState('');
 useFocusEffect(useCallback(()=>{let active=true;loadHousehold().then(value=>{if(active){setData(value);setError('');}}).catch(()=>{if(active){setData(null);setError('Kunde inte läsa hushållets översikt.');}});return()=>{active=false;};},[]));
 function card(title:string,subtitle:string,icon: keyof typeof Ionicons.glyphMap,route:'/pets'|'/household'|'/members'|'/profile'|'/notifications'|'/app-settings') {
  return <Pressable accessibilityRole="button" style={[s.card,s.row]} onPress={()=>router.push(route as Href)}><Ionicons name={icon} size={24} color="#4A90E2"/><View style={{flex:1,gap:4}}><Text style={s.label}>{title}</Text><Text style={s.subtitle}>{subtitle}</Text></View><Ionicons name="chevron-forward" size={20} color="#666"/></Pressable>;
 }
 return <SafeAreaView style={{flex:1,backgroundColor:'#fff'}} edges={['top','left','right']}><ScrollView contentContainerStyle={s.container}>
 <Text style={s.title}>Inställningar</Text>
 <Text style={s.label}>Hushåll</Text>
 {card('Mitt hem',data?`${data.home.type==='house'?'Hus':'Lägenhet'} · ${data.home.area} m² · ${data.home.bedrooms} sovrum`:'Bostadstyp, boyta och rum','home-outline','/household')}
 {card('Familjemedlemmar',data?.members.length?`${data.members.filter(m=>m.kind==='local-profile').length} profiler · ${data.members.filter(m=>m.kind==='invitation').length} inbjudningsutkast`:'Lägg till familjen med namn och avatarer','people-outline','/members')}
 {card('Husdjur',data?.pets.length ? data.pets.map(pet=>pet.name).join(' · ') : 'Lägg till hund, katt eller annat husdjur','paw-outline','/pets')}
 {error?<Text style={s.error}>{error}</Text>:null}
 <Text style={s.label}>Personligt</Text>
 {card('Min profil','Ändra namn och personliga uppgifter','person-outline','/profile')}
 {card('Påminnelser','Hantera påminnelser och aviseringar','notifications-outline','/notifications')}
 <Text style={s.label}>App</Text>
 {card('Appinställningar','Inställningar för appen','settings-outline','/app-settings')}
 </ScrollView></SafeAreaView>;
}




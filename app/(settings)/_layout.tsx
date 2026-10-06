import { Stack } from 'expo-router';
export default function SettingsLayout() {
 return <Stack screenOptions={{headerBackTitle:'Tillbaka',headerTintColor:'#111',headerStyle:{backgroundColor:'#fff'}}}>
 <Stack.Screen name="household" options={{title:'Mitt hem'}}/>
 <Stack.Screen name="members" options={{title:'Familjemedlemmar'}}/>
<Stack.Screen name="pets" options={{title:'Husdjur'}}/>
 <Stack.Screen name="notifications" options={{title:'Påminnelser'}}/>
 <Stack.Screen name="app-settings" options={{title:'App'}}/>
 <Stack.Screen name="profile" options={{title:'Min profil',headerShown:false}}/>
 <Stack.Screen name="editProfile" options={{title:'Ändra profil'}}/>
 </Stack>;
}


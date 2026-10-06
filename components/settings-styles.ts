import { StyleSheet } from 'react-native';
export const settingsStyles = StyleSheet.create({
 container:{flexGrow:1,padding:20,paddingBottom:40,backgroundColor:'#fff',gap:16},
 title:{fontSize:28,fontWeight:'700',color:'#111'}, subtitle:{fontSize:15,color:'#666',lineHeight:22},
 card:{backgroundColor:'#F7F9FC',borderRadius:18,padding:18,borderWidth:1,borderColor:'#E6ECF2',gap:12},
 label:{fontSize:16,fontWeight:'600',color:'#111'},
 input:{borderWidth:1,borderColor:'#DCE6F2',backgroundColor:'#fff',borderRadius:12,padding:12,fontSize:17,color:'#111',minHeight:48},
 row:{flexDirection:'row',alignItems:'center',gap:12,flexWrap:'wrap'},
 choice:{minHeight:48,padding:12,borderRadius:12,backgroundColor:'#fff',borderWidth:1,borderColor:'#DCE6F2'},
 selected:{backgroundColor:'#EEF5FF',borderColor:'#4A90E2',borderWidth:2},
 button:{minHeight:52,padding:14,borderRadius:14,backgroundColor:'#4A90E2',alignItems:'center',justifyContent:'center'},
 buttonText:{color:'#fff',fontSize:17,fontWeight:'600'},disabled:{opacity:0.45},error:{color:'#B42318'},success:{color:'#217A40'},
});

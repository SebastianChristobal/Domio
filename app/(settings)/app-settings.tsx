import { StyleSheet, Text, View } from "react-native";

export default function AppSettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>App</Text>
      <Text style={styles.subtitle}>Här hanterar du appinställningar.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
  },
});

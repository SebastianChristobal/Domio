import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { router } from "expo-router";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function HomeScreen() {
  const handleStart = () => {
    router.push("/explore");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* BAKGRUNDSBILD SOM LIGGER BAKOM ALLT */}
        <ImageBackground
          source={require("../../assets/images/Domio-start-screen.png")}
          style={styles.heroBackground}
          imageStyle={styles.heroImage}
          resizeMode="cover"
        >
          <Image
            source={require("../../assets/images/title.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </ImageBackground>

        {/* SCROLLBART INNEHÅLL OVANPÅ */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Spacer så att man ser bilden först */}
          <View style={styles.heroSpacer} />

          {/* Vitt innehållskort */}
          <View style={styles.contentCard}>
            <Text style={styles.statusText}>Vem gör vad idag?</Text>

            <Pressable style={styles.mainButton} onPress={handleStart}>
              <Text style={styles.mainButtonText}>Registrera dagens sysslor</Text>
            </Pressable>

            {/* Extra innehåll så att scroll känns naturlig */}
            <View style={styles.section}>
              <Ionicons name="apps-outline" size={24} color="#000" />
              <Text style={styles.sectionTitle}>Dagens översikt</Text>
              <Text style={styles.sectionText}>
                På fliken Registrera ser du vem som har gjort vad,
                i vilket rum och när.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Snabbstatus</Text>
              <Text style={styles.sectionText}>
                Registrera direkt eller samla dagens insatser på kvällen.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Motivation</Text>
              <Text style={styles.sectionText}>
                Varje insats hjälper hushållet. Ställ in en kvällspåminnelse
                om du vill ha hjälp att komma ihåg.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  heroBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 420,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  heroImage: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  logo: {
    position: "absolute",
    bottom: -8,
    width: 220,
    height: 72,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  heroSpacer: {
    height: 430,
  },

  contentCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 34,
    paddingHorizontal: 16,
    minHeight: 500,
  },

  statusText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
    marginBottom: 24,
  },

  mainButton: {
    height: 65,
    borderRadius: 18,
    backgroundColor: "#E6C9A8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  mainButtonText: {
    color: "#4B382A",
    fontSize: 18,
    fontWeight: "700",
  },

  section: {
    backgroundColor: "#F8F5F1",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },

  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666666",
  },
});


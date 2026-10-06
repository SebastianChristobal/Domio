import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import avatarsData from "@/constants/data/avatar.json";
import { avatarImages } from "@/lib/avatarImages";

type Avatar = {
  id: number;
  img: string;
  label: string;
  type: string;
};

const avatars = avatarsData as Avatar[];

export default function ProfileScreen() {
  const router = useRouter();

  const selectedAvatarId = 1;
  const selectedAvatar =
    avatars.find((a) => a.id === selectedAvatarId) ?? avatars[0];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#000" />
          </Pressable>

          <ThemedText style={styles.headerTitle}>Min profil</ThemedText>

          <Ionicons name="settings-outline" size={22} color="#000" />
        </View>

        {/* PROFILE CARD */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            {/* AVATAR */}
            <View>
              <Image
                source={avatarImages[selectedAvatar.img]}
                style={styles.avatar}
              />

              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </View>

            {/* INFO */}
            <View style={styles.info}>
              <ThemedText style={styles.name}>Alias / Namn</ThemedText>
              <ThemedText style={styles.email}>email@email.com</ThemedText>

              <Pressable
                style={styles.editButton}
                onPress={() => router.push("/editProfile")}
              >
                <ThemedText style={styles.editButtonText}>
                  Ändra profil
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>

        {/* AVATAR GRID */}
        <View style={styles.avatarSection}>
          <ThemedText style={styles.sectionTitle}>Välj avatar</ThemedText>

          <View style={styles.avatarGrid}>
            {avatars.map((avatar) => {
              const isSelected = avatar.id === selectedAvatarId;

              return (
                <Pressable
                  key={avatar.id}
                  style={[
                    styles.avatarItem,
                    isSelected && styles.avatarSelected,
                  ]}
                >
                  <Image
                    source={avatarImages[avatar.img]}
                    style={styles.avatarSmall}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    paddingTop: 60,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 26,
    padding: 20,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 4,
  },

  info: {
    marginLeft: 16,
    flex: 1,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },

  email: {
    fontSize: 14,
    color: "#777",
    marginBottom: 12,
  },

  editButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    width: 140,
  },

  editButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  avatarSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },

  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  avatarItem: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarSelected: {
    borderWidth: 2,
    borderColor: "#4A90E2",
  },

  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

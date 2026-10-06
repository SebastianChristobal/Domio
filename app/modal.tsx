import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import taskData from "../constants/data/tasks.json"; // Importerar sysslorna

export default function ModalScreen() {
  const router = useRouter();

  // STATES
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [taskIndex, setTaskIndex] = useState(-1); // -1 = Rumsfrågan
  const [totalSessionPoints, setTotalSessionPoints] = useState(0);
  const [showStepper, setShowStepper] = useState(false);
  const [amountCompleted, setAmountCompleted] = useState(1);

  // DATA-REDSKAP
  const currentCategory = taskData.categories[categoryIndex];
  const currentTask = taskIndex >= 0 ? currentCategory.tasks[taskIndex] : null;

  // FUNKTIONER
  const goToNextCategory = () => {
    if (categoryIndex < taskData.categories.length - 1) {
      setCategoryIndex((prev) => prev + 1);
      setTaskIndex(-1);
    } else {
      alert(`Session klar! Totalpoäng: ${totalSessionPoints}`);
      router.back();
    }
  };
  const handleAnswer = (answeredYes: boolean) => {
    if (taskIndex === -1) {
      if (answeredYes) {
        setTaskIndex(0);
      } else {
        goToNextCategory();
      }
    } else {
      // Om användaren svarar JA och sysslan har en stepper, men vi inte visar den än:
      if (answeredYes && currentTask?.allowStepper && !showStepper) {
        setShowStepper(true); // Visa plus/minus-knapparna
        return; // Stoppa här så vi inte går till nästa fråga än
      }

      // Om vi svarar JA (eller bekräftar efter stepper)
      if (answeredYes && currentTask) {
        const pointsToAdd = currentTask.allowStepper
          ? currentTask.points * amountCompleted
          : currentTask.points;
        setTotalSessionPoints((prev) => prev + pointsToAdd);
      }

      // Gå vidare och nollställ
      if (taskIndex < currentCategory.tasks.length - 1) {
        setTaskIndex((prev) => prev + 1);
        setShowStepper(false);
        setAmountCompleted(1);
      } else {
        setShowStepper(false);
        setAmountCompleted(1);
        goToNextCategory();
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* STEGRÄKNARE (1/3) */}
      {taskIndex !== -1 && (
        <ThemedText style={styles.stepText}>
          {currentCategory.title}: {taskIndex + 1} /{" "}
          {currentCategory.tasks.length}
        </ThemedText>
      )}

      <View style={styles.questionCard}>
        {taskIndex === -1 ? (
          <>
            <Ionicons
              name={currentCategory.icon as any}
              size={80}
              color="#4A90E2"
            />
            <ThemedText type="title" style={styles.roomTitle}>
              Har du gjort något i {currentCategory.title} idag?
            </ThemedText>
          </>
        ) : (
          currentTask && (
            <>
              <ThemedText style={styles.roomSubline}>
                {currentCategory.title}
              </ThemedText>
              <ThemedText type="title" style={styles.taskTitle}>
                {currentTask.name}
              </ThemedText>
              <ThemedText style={styles.pointsBadge}>
                +{currentTask.points}p
              </ThemedText>
            </>
          )
        )}
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.buttonBase, styles.yesButton]}
          onPress={() => handleAnswer(true)}
        >
          <ThemedText style={styles.buttonText}>Ja</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonBase, styles.noButton]}
          onPress={() => handleAnswer(false)}
        >
          <ThemedText style={styles.buttonTextNo}>
            {taskIndex === -1 || taskIndex === currentCategory.tasks.length - 1
              ? "Nej / Nästa rum"
              : "Nej / Nästa fråga"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.cancelButton}
      >
        <ThemedText style={{ color: "#999" }}>Avbryt</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#fff",
  },
  stepText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "700",
    position: "absolute",
    top: 60,
    textTransform: "uppercase",
  },
  questionCard: {
    alignItems: "center",
    marginVertical: 40,
    width: "100%",
  },
  roomTitle: {
    fontSize: 26,
    textAlign: "center",
    fontWeight: "800",
    color: "#1A1A1A",
    marginTop: 20,
  },
  roomSubline: {
    fontSize: 16,
    color: "#4A90E2",
    fontWeight: "bold",
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 30,
    textAlign: "center",
    fontWeight: "800",
    color: "#1A1A1A",
  },
  pointsBadge: {
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: "bold",
    marginTop: 15,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: "hidden",
  },
  buttonGroup: {
    width: "100%",
    gap: 15,
  },
  buttonBase: {
    height: 65,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  yesButton: {
    backgroundColor: "#4CAF50",
  },
  noButton: {
    backgroundColor: "#F5F5F5",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonTextNo: {
    color: "#666",
    fontSize: 17,
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 40,
  },
});

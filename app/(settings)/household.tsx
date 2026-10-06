import { settingsStyles as s } from "@/components/settings-styles";
import { useHousehold } from "@/hooks/use-household";
import { roomsForHome } from "@/lib/chores";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
export default function HouseholdScreen() {
  const { data, update, error, loading, saving, saved, save, reload } =
    useHousehold();
  const [areaText, setAreaText] = useState<string | null>(null);
  const validArea =
    data && Number.isFinite(data.home.area) && data.home.area > 0;
  return (
    <ScrollView
      contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={s.title}>Mitt hem</Text>
      <Text style={s.subtitle}>
        Beskriv ert hem som grund för era städrutiner.
      </Text>
      {loading && <Text>Läser hushållet…</Text>}
      {data && (
        <>
          <View style={s.card}>
            <Text style={s.label}>Bostadstyp</Text>
            <View style={s.row}>
              {["apartment", "house"].map((type) => (
                <Pressable
                  key={type}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: data.home.type === type }}
                  disabled={saving}
                  style={[s.choice, data.home.type === type && s.selected]}
                  onPress={() =>
                    update({ ...data, home: { ...data.home, type } })
                  }
                >
                  <Text>{type === "house" ? "Hus" : "Lägenhet"}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={s.card}>
            <Text style={s.label}>Boyta (m²)</Text>
            <TextInput
              accessibilityLabel="Boyta i kvadratmeter"
              editable={!saving}
              style={s.input}
              keyboardType="decimal-pad"
              value={areaText ?? String(data.home.area)}
              onChangeText={(text) => {
                setAreaText(text);
                update({
                  ...data,
                  home: { ...data.home, area: Number(text.replace(",", ".")) },
                });
              }}
            />
            {!validArea && (
              <Text style={s.error}>Ange en boyta större än 0.</Text>
            )}
          </View>
          <View style={s.card}>
            <Text style={s.label}>Antal rum (kök räknas inte)</Text>
            <View style={s.row}>
              {[1, 2, 3, 4, 5].map((count) => (
                <Pressable
                  key={count}
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected: data.home.bedrooms + 1 === count,
                  }}
                  disabled={saving}
                  style={[
                    s.choice,
                    data.home.bedrooms + 1 === count && s.selected,
                  ]}
                  onPress={() =>
                    update({
                      ...data,
                      home: { ...data.home, bedrooms: count - 1 },
                    })
                  }
                >
                  <Text>{count} rum</Text>
                </Pressable>
              ))}
            </View>
            <Text style={s.subtitle}>
              En tvåa har 1 sovrum och 1 vardagsrum. En trea har 2 sovrum och 1
              vardagsrum. Ändra sovrum nedan om ert hem ser annorlunda ut.
            </Text>
          </View>
          {(["bedrooms", "bathrooms"] as const).map((field) => {
            const label = field === "bedrooms" ? "Sovrum" : "Badrum";
            const min = field === "bedrooms" ? 0 : 1;
            return (
              <View key={field} style={s.card}>
                <Text style={s.label}>{label}</Text>
                <View style={s.row}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Minska ${label}`}
                    disabled={saving || data.home[field] <= min}
                    style={[s.choice, data.home[field] <= min && s.disabled]}
                    onPress={() =>
                      update({
                        ...data,
                        home: { ...data.home, [field]: data.home[field] - 1 },
                      })
                    }
                  >
                    <Text>−</Text>
                  </Pressable>
                  <Text style={s.label}>{data.home[field]}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Öka ${label}`}
                    disabled={saving}
                    style={s.choice}
                    onPress={() =>
                      update({
                        ...data,
                        home: { ...data.home, [field]: data.home[field] + 1 },
                      })
                    }
                  >
                    <Text>+</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
          <View style={s.card}>
            <Text style={s.label}>Rum att städa</Text>
            <Text style={s.subtitle}>
              {roomsForHome(data.home)
                .map((room) => room.name)
                .join(" · ")}
            </Text>
            <Text style={s.subtitle}>
              Boytan avgör inte antalet rum. En etta kan ha 0 separata sovrum.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={saving || !validArea}
            style={[s.button, (saving || !validArea) && s.disabled]}
            onPress={save}
          >
            <Text style={s.buttonText}>
              {saving ? "Sparar…" : "Spara hemmet"}
            </Text>
          </Pressable>
        </>
      )}
      {error ? (
        <Text accessibilityLiveRegion="polite" style={s.error}>
          {error}
        </Text>
      ) : null}
      {!data && !loading && (
        <Pressable style={s.choice} onPress={reload}>
          <Text>Försök igen</Text>
        </Pressable>
      )}
      {saved && (
        <Text accessibilityLiveRegion="polite" style={s.success}>
          Hemmet har sparats.
        </Text>
      )}
    </ScrollView>
  );
}

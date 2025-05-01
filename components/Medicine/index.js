import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  Linking
} from "react-native";
import axios from "axios";
import config from "../../config/apiConfig";

export default function MedicineList() {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDisease, setSelectedDisease] = useState("");
  const [diseases, setDiseases] = useState([]);

  // Fetch medicine data on component mount
  useEffect(() => {
    fetchMedicines();
    fetchDiseases();
  }, []);

  // Function to fetch medicines from the API
  const fetchMedicines = async () => {
    try {
      const url = `${config.getUrl("database")}/getMedicine`;
      const response = await axios.get(url);
      setMedicines(response.data);
      setFilteredMedicines(response.data);
    } catch (error) {
      alert("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch disease categories for filtering
  const fetchDiseases = async () => {
    try {
      const url = `${config.getUrl("database")}/getDiseases`;
      const response = await axios.get(url);
      setDiseases(response.data);
    } catch (error) {
      alert("Failed to load diseases");
    }
  };

  // Function to handle search input change
  const handleSearch = (query) => {
    setSearchQuery(query);
    filterMedicines(query, selectedDisease);
  };

  // Function to handle disease filter change
  const handleDiseaseChange = (disease) => {
    setSelectedDisease(disease);
    filterMedicines(searchQuery, disease);
  };

  // Function to filter medicines based on search query and disease filter
  const filterMedicines = (query, disease) => {
    const filtered = medicines.filter((medicine) => {
      const matchesQuery = medicine.name
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesDisease = disease
        ? medicine.disease.toLowerCase() === disease.toLowerCase()
        : true;
      return matchesQuery && matchesDisease;
    });
    setFilteredMedicines(filtered);
  };

  // Function to handle medicine click, redirecting to the purchase link
  const handleMedicineClick = (link) => {
    // Open the medicine purchase website (this opens the link in the browser)
    Linking.openURL(link);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#e76f51" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/background.png")}
        style={styles.backgroundImage}
      >
        <Text style={styles.title}>Medicine List</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by medicine name"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Disease:</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="Select Disease"
            value={selectedDisease}
            onChangeText={handleDiseaseChange}
          />
        </View>

        {filteredMedicines.length === 0 ? (
          <Text style={styles.noResultsText}>No medicines found</Text>
        ) : (
          <FlatList
            data={filteredMedicines}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString()
              : item.name ? item.name
              : index.toString()
            }
            
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.medicineCard}
                onPress={() => handleMedicineClick(item.link)}
              >
                <Text style={styles.medicineName}>{item.name}</Text>
                <Text style={styles.medicineDisease}>{item.disease}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%"
  },
  backgroundImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 50,
    width: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "black",
    marginBottom: 20,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: "80%",
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  filterInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    width: "100%",
  },
  noResultsText: {
    fontSize: 18,
    color: "#666",
  },
  medicineCard: {
    backgroundColor: "#e76f51",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  medicineName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  medicineDisease: {
    fontSize: 14,
    color: "#fff",
  },
});

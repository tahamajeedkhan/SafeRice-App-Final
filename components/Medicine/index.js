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
import { AntDesign } from "@expo/vector-icons";

export default function MedicineList() {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDisease, setSelectedDisease] = useState("");

  // Fetch medicine data on component mount
  useEffect(() => {
    fetchMedicines();
  }, []);

  // Function to fetch medicines from the API
  const fetchMedicines = async () => {
    try {
      const url = `${config.getUrl("database")}/getMedicine`;
      const response = await axios.get(url);
      setMedicines(response.data);
      setFilteredMedicines(response.data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      alert("Failed to load medicines. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle search input change
  const handleSearch = (query) => {
    setSearchQuery(query);
    filterMedicines(query, selectedDisease);
  };

  // Function to handle disease selection
  const handleDiseaseChange = (disease) => {
    setSelectedDisease(disease);
    filterMedicines(searchQuery, disease);
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDisease("");
    setFilteredMedicines(medicines);
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

  // Get unique diseases for the filter options
  const uniqueDiseases = [...new Set(medicines.map(medicine => medicine.disease))];

  // Function to handle medicine click, redirecting to the purchase link
  const handleMedicineClick = (medicine) => {
    Linking.openURL(medicine.link).catch((err) => {
      console.error("Failed to open URL:", err);
      alert("Couldn't open the medicine link. Please try again.");
    });
  };

  // Render medicine card
  const renderMedicineCard = ({ item }) => (
    <TouchableOpacity
      style={styles.medicineCard}
      activeOpacity={0.7}
      onPress={() => handleMedicineClick(item)}
    >
      <View style={styles.medicineCardContent}>
        <Text style={styles.medicineName}>{item.name}</Text>
        <View style={styles.diseaseTag}>
          <Text style={styles.medicineDisease}>{item.disease}</Text>
        </View>
      </View>
      <View style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>View Details</Text>
        <AntDesign name="arrowright" size={16} color="white" />
      </View>
    </TouchableOpacity>
  );

  // Loading screen
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3B7A57" />
        <Text style={styles.loadingText}>Loading medicines...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/background.png")}
        style={styles.backgroundImage}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Medicine List</Text>
        </View>

        <View style={styles.contentContainer}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <AntDesign name="search1" size={20} color="black" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search medicines..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => handleSearch("")}>
                  <AntDesign name="close" size={20} color="black" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Disease Filter */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter by Disease:</Text>
            <View style={styles.diseaseButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.diseaseButton,
                  selectedDisease === "" && styles.selectedDiseaseButton,
                ]}
                onPress={() => handleDiseaseChange("")}
              >
                <Text 
                  style={[
                    styles.diseaseButtonText,
                    selectedDisease === "" && styles.selectedDiseaseButtonText,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              
              <FlatList
                data={uniqueDiseases}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.diseaseButton,
                      selectedDisease === item && styles.selectedDiseaseButton,
                    ]}
                    onPress={() => handleDiseaseChange(item)}
                  >
                    <Text 
                      style={[
                        styles.diseaseButtonText,
                        selectedDisease === item && styles.selectedDiseaseButtonText,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>

          {/* Clear Filters Button */}
          {(searchQuery || selectedDisease) && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          )}

          {/* Results Counter */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsCounter}>
              {filteredMedicines.length} {filteredMedicines.length === 1 ? "medicine" : "medicines"} found
            </Text>
          </View>

          {/* Medicine List */}
          {filteredMedicines.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <AntDesign name="exclamationcircleo" size={60} color="#999" />
              <Text style={styles.noResultsText}>No medicines found</Text>
              <Text style={styles.noResultsSubtext}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredMedicines}
              keyExtractor={(item, index) =>
                item.id ? item.id.toString()
                : item.name ? item.name
                : index.toString()
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.medicineList}
              renderItem={renderMedicineCard}
            />
          )}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  searchContainer: {
    width: '100%',
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#3B7A57',
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "black",
  },
  filterContainer: {
    width: "100%",
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginBottom: 8,
  },
  diseaseButtonsContainer: {
    flexDirection: "row",
  },
  diseaseButton: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#3B7A57',
  },
  selectedDiseaseButton: {
    backgroundColor: "yellowgreen",
  },
  diseaseButtonText: {
    color: "black",
    fontWeight: "500",
  },
  selectedDiseaseButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  clearButton: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 16,
  },
  clearButtonText: {
    color: "#3B7A57",
    fontWeight: "600",
  },
  resultsContainer: {
    width: '100%',
    marginBottom: 10,
  },
  resultsCounter: {
    fontSize: 14,
    color: "black",
  },
  medicineList: {
    paddingBottom: 20,
    width: "100%",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 15,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  medicineCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#3B7A57',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  medicineCardContent: {
    backgroundColor: "yellowgreen",
    padding: 15,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginBottom: 8,
  },
  diseaseTag: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  medicineDisease: {
    fontSize: 13,
    color: "black",
    fontWeight: "500",
  },
  viewDetailsButton: {
    backgroundColor: '#3B7A57',
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  viewDetailsText: {
    color: "white",
    fontWeight: "600",
    marginRight: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#3B7A57",
  },
});
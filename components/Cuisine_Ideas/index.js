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
  Linking,
  SafeAreaView,
  Modal,
  ScrollView,
  Dimensions
} from "react-native";
import axios from "axios";
import config from "../../config/apiConfig";
import { AntDesign } from "@expo/vector-icons";

// Get screen dimensions for responsive sizing
const { width } = Dimensions.get("window");
const cardWidth = width * 0.9; // 90% of screen width

export default function Cuisine_Ideas() {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRiceType, setSelectedRiceType] = useState("");
  const [selectedNutritionalValue, setSelectedNutritionalValue] = useState("");
  const [riceTypes, setRiceTypes] = useState([]);
  const [nutritionalValues, setNutritionalValues] = useState(["Calories", "Protein", "Carbohydrates", "Fat"]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentModal, setCurrentModal] = useState(""); // "rice" or "nutrition"
  const [selectedDish, setSelectedDish] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Fetch dish data on component mount
  useEffect(() => {
    fetchDishes();
  }, []);

  // Function to fetch dishes from the API
  const fetchDishes = async () => {
    try {
      const url = `${config.getUrl("database")}/getCuisine`; // Replace with actual API
      const response = await axios.get(url);
      setDishes(response.data);
      setFilteredDishes(response.data);
      // Extract unique rice types
      setRiceTypes([...new Set(response.data.map(dish => dish.rice_type))]);
    } catch (error) {
      alert("Failed to load dishes");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle search input change
  const handleSearch = (query) => {
    setSearchQuery(query);
    filterDishes(query, selectedRiceType, selectedNutritionalValue);
  };

  // Function to handle rice type filter change
  const handleRiceTypeChange = (riceType) => {
    setSelectedRiceType(riceType);
    setModalVisible(false);
    filterDishes(searchQuery, riceType, selectedNutritionalValue);
  };

  // Function to handle nutritional value filter change
  const handleNutritionalValueChange = (value) => {
    setSelectedNutritionalValue(value);
    setModalVisible(false);
    filterDishes(searchQuery, selectedRiceType, value);
  };

  // Function to filter dishes based on search query, rice type, and nutritional values
  const filterDishes = (query, riceType, nutritionalValue) => {
    const filtered = dishes.filter((dish) => {
      const matchesQuery = dish.dish_name.toLowerCase().includes(query.toLowerCase());
      const matchesRiceType = riceType ? dish.rice_type.toLowerCase() === riceType.toLowerCase() : true;
      const matchesNutritionalValue =
        nutritionalValue && dish[nutritionalValue.toLowerCase()] !== undefined
          ? dish[nutritionalValue.toLowerCase()] > 0
          : true;

      return matchesQuery && matchesRiceType && matchesNutritionalValue;
    });
    setFilteredDishes(filtered);
  };

  // Function to handle dish click, showing detailed view
  const handleDishClick = (dish) => {
    setSelectedDish(dish);
    setDetailsModalVisible(true);
  };

  // Open the reference link
  const openReferenceLink = (link) => {
    if (link) {
      Linking.openURL(link);
    }
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRiceType("");
    setSelectedNutritionalValue("");
    setFilteredDishes(dishes);
  };

  // Function to show modal for selection
  const showModal = (type) => {
    setCurrentModal(type);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="yellowgreen" />
        <Text style={styles.loadingText}>Loading dishes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../assets/background.png")}
        style={styles.backgroundImage}
      >
        <Text style={styles.title}>Rice Cuisines</Text>

        <View style={styles.searchInputContainer}>
          <AntDesign name="search1" size={20} color="black" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dishes..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <AntDesign name="close" size={20} color="black" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Rice Type:</Text>
          <View style={styles.filterButtonsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedRiceType === "" && styles.selectedFilterButton,
                ]}
                onPress={() => handleRiceTypeChange("")}
              >
                <Text 
                  style={[
                    styles.filterButtonText,
                    selectedRiceType === "" && styles.selectedFilterButtonText,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              
              {riceTypes.map((riceType, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.filterButton,
                    selectedRiceType === riceType && styles.selectedFilterButton,
                  ]}
                  onPress={() => handleRiceTypeChange(riceType)}
                >
                  <Text 
                    style={[
                      styles.filterButtonText,
                      selectedRiceType === riceType && styles.selectedFilterButtonText,
                    ]}
                  >
                    {riceType}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Nutritional Value:</Text>
          <View style={styles.filterButtonsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedNutritionalValue === "" && styles.selectedFilterButton,
                ]}
                onPress={() => handleNutritionalValueChange("")}
              >
                <Text 
                  style={[
                    styles.filterButtonText,
                    selectedNutritionalValue === "" && styles.selectedFilterButtonText,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              
              {nutritionalValues.map((value, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.filterButton,
                    selectedNutritionalValue === value && styles.selectedFilterButton,
                  ]}
                  onPress={() => handleNutritionalValueChange(value)}
                >
                  <Text 
                    style={[
                      styles.filterButtonText,
                      selectedNutritionalValue === value && styles.selectedFilterButtonText,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {(searchQuery || selectedRiceType || selectedNutritionalValue) && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.resultsCounter}>
          {filteredDishes.length} {filteredDishes.length === 1 ? "dish" : "dishes"} found
        </Text>
          
        {filteredDishes.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <AntDesign name="exclamationcircleo" size={60} color="#999" />
            <Text style={styles.noResultsText}>No dishes match your criteria</Text>
            <Text style={styles.noResultsSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredDishes}
            keyExtractor={(item, index) => 
              item.id ? item.id.toString() : item.dish_name ? item.dish_name : index.toString()
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dishCard}
                activeOpacity={0.7}
                onPress={() => handleDishClick(item)}
              >
                <View style={styles.dishCardContent}>
                  <Text style={styles.dishName} numberOfLines={1} ellipsizeMode="tail">
                    {item.dish_name}
                  </Text>
                  <View style={styles.riceTypeTag}>
                    <Text style={styles.riceTypeText} numberOfLines={1}>
                      {item.rice_type}
                    </Text>
                  </View>
                  <View style={styles.nutritionRow}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                      <Text style={styles.nutritionValue}>{item.calories}</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                      <Text style={styles.nutritionValue}>{item.protein}g</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                      <Text style={styles.nutritionValue}>{item.carbohydrates}g</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Fat</Text>
                      <Text style={styles.nutritionValue}>{item.fat}g</Text>
                    </View>
                  </View>
                  <View style={styles.viewDetailsButton}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <AntDesign name="arrowright" size={16} color="white" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            numColumns={1}
          />
        )}

        {/* Dish Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={detailsModalVisible}
          onRequestClose={() => setDetailsModalVisible(false)}
        >
          {selectedDish && (
            <View style={styles.modalOverlay}>
              <View style={styles.detailsModalContent}>
                <Text style={styles.detailsModalTitle}>{selectedDish.dish_name}</Text>
                
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Rice Type</Text>
                  <Text style={styles.detailsText}>{selectedDish.rice_type}</Text>
                </View>
                
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Nutritional Information</Text>
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionGridItem}>
                      <Text style={styles.nutritionGridLabel}>Calories</Text>
                      <Text style={styles.nutritionGridValue}>{selectedDish.calories}</Text>
                    </View>
                    <View style={styles.nutritionGridItem}>
                      <Text style={styles.nutritionGridLabel}>Protein</Text>
                      <Text style={styles.nutritionGridValue}>{selectedDish.protein}g</Text>
                    </View>
                    <View style={styles.nutritionGridItem}>
                      <Text style={styles.nutritionGridLabel}>Carbohydrates</Text>
                      <Text style={styles.nutritionGridValue}>{selectedDish.carbohydrates}g</Text>
                    </View>
                    <View style={styles.nutritionGridItem}>
                      <Text style={styles.nutritionGridLabel}>Fat</Text>
                      <Text style={styles.nutritionGridValue}>{selectedDish.fat}g</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.buttonRow}>
                  {selectedDish.reference_link && (
                    <TouchableOpacity 
                      style={styles.referenceButton} 
                      onPress={() => openReferenceLink(selectedDish.reference_link)}
                    >
                      <Text style={styles.referenceButtonText}>View Recipe</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.closeDetailsButton} 
                    onPress={() => setDetailsModalVisible(false)}
                  >
                    <Text style={styles.closeDetailsButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "yellowgreen",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
    //paddingup: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    bottom: 10,
    backgroundColor: "white",
    width: "90%",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
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
    width: "90%",
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginBottom: 8,
  },
  filterButtonsRow: {
    flexDirection: "row",
  },
  filterButton: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#3B7A57',
  },
  selectedFilterButton: {
    backgroundColor: "yellowgreen",
  },
  filterButtonText: {
    color: "black",
    fontWeight: "500",
  },
  selectedFilterButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  clearButton: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 15,
  },
  clearButtonText: {
    color: "#3B7A57",
    fontWeight: "600",
  },
  resultsCounter: {
    fontSize: 14,
    color: "black",
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: "5%",
  },
  flatListContent: {
    paddingBottom: 20,
    width: "100%",
    paddingHorizontal: "5%",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
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
  dishCard: {
    width: cardWidth,
    height: 200, // Fixed height for all cards
    backgroundColor: "yellowgreen",
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#3B7A57',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden', // Ensures content doesn't overflow
  },
  dishCardContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  dishName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginBottom: 8,
  },
  riceTypeTag: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
    maxWidth: '80%', // Prevent long rice type names from breaking layout
  },
  riceTypeText: {
    fontSize: 13,
    color: "black",
    fontWeight: "500",
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  nutritionItem: {
    alignItems: 'center',
    width: '22%', // Ensure equal width for all nutrition items
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
    textAlign: 'center',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
  },
  viewDetailsButton: {
    backgroundColor: "#3B7A57",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 'auto', // Push button to bottom of card
  },
  viewDetailsText: {
    color: "white",
    fontWeight: "600",
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  detailsModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  detailsModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  detailsText: {
    fontSize: 16,
    color: '#666',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionGridItem: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  nutritionGridLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  nutritionGridValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  referenceButton: {
    flex: 1,
    backgroundColor: '#3B7A57',
    paddingVertical: 15,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },
  referenceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeDetailsButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 15,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: 'center',
  },
  closeDetailsButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
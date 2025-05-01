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

export default function Cuisine_Ideas() {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRiceType, setSelectedRiceType] = useState("");
  const [selectedNutritionalValue, setSelectedNutritionalValue] = useState("");
  const [riceTypes, setRiceTypes] = useState([]);
  const [nutritionalValues, setNutritionalValues] = useState(["Calories", "Protein", "Carbohydrates", "Fat"]);

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
      // Assuming we have rice types in the response, otherwise hard-code them
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
    filterDishes(searchQuery, riceType, selectedNutritionalValue);
  };

  // Function to handle nutritional value filter change
  const handleNutritionalValueChange = (value) => {
    setSelectedNutritionalValue(value);
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

  // Function to handle dish click, redirecting to the reference link
  const handleDishClick = (link) => {
    // Open the dish reference link (this opens the link in the browser)
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
        <Text style={styles.title}>Cuisine List</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by dish name"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Rice Type:</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="Select Rice Type"
            value={selectedRiceType}
            onChangeText={handleRiceTypeChange}
          />
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Nutritional Value:</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="Select Nutritional Value"
            value={selectedNutritionalValue}
            onChangeText={handleNutritionalValueChange}
          />
        </View>

        {filteredDishes.length === 0 ? (
          <Text style={styles.noResultsText}>No dishes found</Text>
        ) : (
          <FlatList
            data={filteredDishes}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : item.dish_name ? item.dish_name : index.toString()
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dishCard}
                onPress={() => handleDishClick(item.reference_link)}
              >
                <Text style={styles.dishName}>{item.dish_name}</Text>
                <Text style={styles.dishRiceType}>{item.rice_type}</Text>
                <Text style={styles.dishNutritionalValues}>
                  Calories: {item.calories} | Protein: {item.protein}g | Carbs: {item.carbohydrates}g | Fat: {item.fat}g
                </Text>
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
    width: "100%",
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
  dishCard: {
    backgroundColor: "#e76f51",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  dishName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  dishRiceType: {
    fontSize: 14,
    color: "#fff",
  },
  dishNutritionalValues: {
    fontSize: 12,
    color: "#fff",
  },
});

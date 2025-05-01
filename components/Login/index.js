import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../../config/apiConfig"; // ✅ Import config

const Login = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Username and Password are required");
      return;
    }

    setLoading(true); // Start loading indicator

    try {
      // Using the getUrl to get the correct backend URL
      const url = `${config.getUrl("database")}/login`; 
      console.log(url);
      const response = await axios.post(url, {
        username,
        password,
      });

      // Check if login is successful
      if (response.data.success) {
        await AsyncStorage.setItem("authToken", response.data.token);
        await AsyncStorage.setItem("use_id", response.data.use_id.toString());

        Alert.alert("Login Successful", "You are now logged in");
        navigation.navigate("MainApp", {
          screen: "Home",
          params: { screen: "MainMenu" },
        });
      } else {
        Alert.alert("Login Failed", response.data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "There was an error logging in");
    } finally {
      setLoading(false); // End loading indicator
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#ddd"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#ddd"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Logging In..." : "Login"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "black",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    width: "80%",
    paddingVertical: 12,
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "black",
    fontSize: 16,
    color: "black",
    backgroundColor: "transparent",
    textAlign: "center",
  },
  button: {
    backgroundColor: "yellowgreen",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  signupButton: {
    backgroundColor: "yellowgreen",
    marginTop: 10,
  },
  buttonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default Login;

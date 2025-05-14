import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Image,
} from "react-native";

const About = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/background.png")}
        style={styles.backgroundImage}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>About SafeRice</Text>
            <View style={styles.underline} />
          </View>

          <View style={styles.contentCard}>
            <Text style={styles.description}>
              SafeRice is an all-in-one solution for rice health monitoring and
              classification. Our application combines advanced disease
              diagnosis with rice variety classification to provide farmers with
              valuable insights for better crop management.
            </Text>

            <View style={styles.featureSection}>
              <Text style={styles.sectionTitle}>Key Features</Text>
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureTitle}>• Rice Classification</Text>
                  <Text style={styles.featureDesc}>
                    Identify different varieties of rice plants
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureTitle}>• Disease Diagnosis</Text>
                  <Text style={styles.featureDesc}>
                    Early detection of common rice plant diseases
                  </Text>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureTitle}>• Health Diagnosis</Text>
                  <Text style={styles.featureDesc}>
                    Early detection of common rice plant diseases
                  </Text>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureTitle}>• Treatment Solutions</Text>
                  <Text style={styles.featureDesc}>
                    Get recommended treatments for identified issues
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureTitle}>• Nutrition Extraction</Text>
                <Text style={styles.featureDesc}>
                  Analyze nutritional content of rice varieties
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureTitle}>• Medicine</Text>
                <Text style={styles.featureDesc}>
                  Treatment solutions for rice plant diseases
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureTitle}>• Cuisine Ideas</Text>
                <Text style={styles.featureDesc}>
                  Recipes and cooking recommendations
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureTitle}>• Rice Grain Outlines</Text>
                <Text style={styles.featureDesc}>
                  Detailed grain pattern and structure analysis
                </Text>
              </View>
            </View>

            <View style={styles.teamSection}>
              <Text style={styles.sectionTitle}>Development Team</Text>
              <View style={styles.teamMember}>
                <Text style={styles.memberName}>Bilal Shakeel</Text>
                <Text style={styles.memberID}>21K-4874</Text>
              </View>
              <View style={styles.teamMember}>
                <Text style={styles.memberName}>Muhammad Taha Majeed</Text>
                <Text style={styles.memberID}>21K-3316</Text>
              </View>
              <View style={styles.teamMember}>
                <Text style={styles.memberName}>Muhammad Samamah</Text>
                <Text style={styles.memberID}>21K-3205</Text>
              </View>
            </View>

            <View style={styles.versionSection}>
              <Text style={styles.versionText}>Version 1.0.0</Text>
              <Text style={styles.copyrightText}>© 2025 SafeRice Team</Text>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  underline: {
    height: 3,
    width: 100,
    backgroundColor: "yellowgreen",
    borderRadius: 10,
  },
  contentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  featureSection: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  featuresContainer: {
    marginTop: 10,
  },
  featureItem: {
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },
  featureDesc: {
    fontSize: 14,
    color: "#666",
    marginLeft: 15,
  },
  teamSection: {
    marginVertical: 20,
    backgroundColor: "rgba(173, 255, 47, 0.1)",
    borderRadius: 10,
    padding: 15,
  },
  teamMember: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  memberID: {
    fontSize: 16,
    color: "#666",
  },
  versionSection: {
    marginTop: 20,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
    color: "#888",
  },
  copyrightText: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
});

export default About;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { CameraView, Camera } from 'expo-camera';

const { width } = Dimensions.get('window');

const FoodScreen = () => {
  const [activeTab, setActiveTab] = useState('nutrition');
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dailyCalories, setDailyCalories] = useState(1847);
  const [targetCalories] = useState(2200);
  const [meals, setMeals] = useState([
    {
      id: 1,
      name: 'Breakfast',
      calories: 420,
      items: ['Oatmeal with berries', 'Greek yogurt'],
      time: '8:30 AM'
    },
    {
      id: 2,
      name: 'Lunch',
      calories: 650,
      items: ['Grilled chicken salad', 'Whole grain bread'],
      time: '12:45 PM'
    },
    {
      id: 3,
      name: 'Dinner',
      calories: 777,
      items: ['Salmon with quinoa', 'Steamed vegetables'],
      time: '7:20 PM'
    }
  ]);

  const [foodItems] = useState([
    {
      id: 1,
      name: 'Grilled Chicken Bowl',
      calories: 450,
      protein: 35,
      carbs: 25,
      fat: 18,
      price: 12.99,
      image: '🍗',
      category: 'Healthy'
    },
    {
      id: 2,
      name: 'Quinoa Salad',
      calories: 320,
      protein: 12,
      carbs: 45,
      fat: 8,
      price: 9.99,
      image: '🥗',
      category: 'Vegetarian'
    },
    {
      id: 3,
      name: 'Protein Smoothie',
      calories: 280,
      protein: 25,
      carbs: 30,
      fat: 5,
      price: 7.99,
      image: '🥤',
      category: 'Drinks'
    },
    {
      id: 4,
      name: 'Avocado Toast',
      calories: 350,
      protein: 8,
      carbs: 35,
      fat: 20,
      price: 8.99,
      image: '🥑',
      category: 'Breakfast'
    }
  ]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setShowScanner(false);
    Alert.alert(
      'Food Scanned!',
      `Barcode: ${data}\nLooking up nutritional information...`,
      [
        {
          text: 'Add to Meal',
          onPress: () => {
            Alert.alert('Success', 'Food item added to your meal log!');
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openScanner = () => {
    if (hasPermission === null) {
      Alert.alert('Permission Required', 'Camera permission is required to scan barcodes.');
      return;
    }
    if (hasPermission === false) {
      Alert.alert('No Access', 'No access to camera. Please enable camera permissions.');
      return;
    }
    setShowScanner(true);
  };

  const addToCart = (item) => {
    Alert.alert(
      'Added to Cart',
      `${item.name} has been added to your cart for $${item.price}`,
      [{ text: 'OK' }]
    );
  };

  const renderNutritionTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Daily Progress */}
      <View style={styles.progressCard}>
        <Text style={styles.cardTitle}>Daily Progress</Text>
        <View style={styles.calorieProgress}>
          <View style={styles.calorieCircleContainer}>
            <View style={styles.calorieCircle}>
              <Text style={styles.calorieNumber}>{dailyCalories}</Text>
              <Text style={styles.calorieLabel}>calories</Text>
            </View>
            <View style={styles.progressRing} />
          </View>
          <View style={styles.calorieInfo}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Target</Text>
              <Text style={styles.statValue}>{targetCalories} cal</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={styles.remainingValue}>{targetCalories - dailyCalories} cal</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Progress</Text>
              <Text style={styles.progressValue}>{Math.round((dailyCalories / targetCalories) * 100)}%</Text>
            </View>
          </View>
        </View>
        
        {/* Macros */}
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <View style={styles.macroHeader}>
              <View style={[styles.macroDot, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.macroValue}>125g</Text>
            </View>
            <Text style={styles.macroLabel}>Protein</Text>
            <View style={styles.macroBarContainer}>
              <View style={[styles.macroBar, { backgroundColor: '#FF6B6B', width: '75%' }]} />
            </View>
          </View>
          <View style={styles.macroItem}>
            <View style={styles.macroHeader}>
              <View style={[styles.macroDot, { backgroundColor: '#4ECDC4' }]} />
              <Text style={styles.macroValue}>180g</Text>
            </View>
            <Text style={styles.macroLabel}>Carbs</Text>
            <View style={styles.macroBarContainer}>
              <View style={[styles.macroBar, { backgroundColor: '#4ECDC4', width: '60%' }]} />
            </View>
          </View>
          <View style={styles.macroItem}>
            <View style={styles.macroHeader}>
              <View style={[styles.macroDot, { backgroundColor: '#FFD93D' }]} />
              <Text style={styles.macroValue}>65g</Text>
            </View>
            <Text style={styles.macroLabel}>Fat</Text>
            <View style={styles.macroBarContainer}>
              <View style={[styles.macroBar, { backgroundColor: '#FFD93D', width: '45%' }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={openScanner}>
          <View style={styles.actionIconContainer}>
            <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Scan Food</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Add Meal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <MaterialCommunityIcons name="water" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Log Water</Text>
        </TouchableOpacity>
      </View>

      {/* Meals */}
      <View style={styles.mealsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {meals.map((meal, index) => (
          <View key={meal.id} style={[styles.mealCard, index === meals.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.mealLeft}>
              <View style={styles.mealIconContainer}>
                <MaterialCommunityIcons 
                  name={meal.name === 'Breakfast' ? 'coffee' : meal.name === 'Lunch' ? 'food-apple' : 'food-variant'} 
                  size={20} 
                  color="#000" 
                />
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
                <View style={styles.mealItems}>
                  {meal.items.map((item, index) => (
                    <Text key={index} style={styles.mealItem}>• {item}</Text>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.mealRight}>
              <Text style={styles.mealCalories}>{meal.calories}</Text>
              <Text style={styles.caloriesUnit}>cal</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderShoppingTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search healthy meals..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons name="tune" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {['All', 'Healthy', 'Vegetarian', 'Breakfast', 'Drinks'].map((category, index) => (
          <TouchableOpacity key={category} style={[styles.categoryChip, index === 0 && styles.activeCategoryChip]}>
            <Text style={[styles.categoryText, index === 0 && styles.activeCategoryText]}>{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Food Items */}
      <View style={styles.foodGrid}>
        {foodItems.map((item) => (
          <View key={item.id} style={styles.foodCard}>
            <View style={styles.foodImageContainer}>
              <Text style={styles.foodEmoji}>{item.image}</Text>
              <TouchableOpacity style={styles.favoriteButton}>
                <MaterialCommunityIcons name="heart-outline" size={16} color="#999" />
              </TouchableOpacity>
            </View>
            <View style={styles.foodContent}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodCalories}>{item.calories} cal</Text>
              <View style={styles.nutritionInfo}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>P</Text>
                  <Text style={styles.nutritionValue}>{item.protein}g</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>C</Text>
                  <Text style={styles.nutritionValue}>{item.carbs}g</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>F</Text>
                  <Text style={styles.nutritionValue}>{item.fat}g</Text>
                </View>
              </View>
              <View style={styles.foodFooter}>
                <Text style={styles.foodPrice}>${item.price}</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addToCart(item)}
                >
                  <MaterialCommunityIcons name="plus" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialCommunityIcons name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Food & Nutrition</Text>
          <Text style={styles.subtitle}>Track your daily intake</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <View style={styles.cartBadge}>
            <MaterialCommunityIcons name="shopping-outline" size={24} color="#000" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nutrition' && styles.activeTab]}
          onPress={() => setActiveTab('nutrition')}
        >
          <MaterialCommunityIcons
            name="nutrition"
            size={20}
            color={activeTab === 'nutrition' ? '#fff' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'nutrition' && styles.activeTabText]}>
            Nutrition
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shopping' && styles.activeTab]}
          onPress={() => setActiveTab('shopping')}
        >
          <MaterialCommunityIcons
            name="storefront-outline"
            size={20}
            color={activeTab === 'shopping' ? '#fff' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'shopping' && styles.activeTabText]}>
            Order Food
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'nutrition' ? renderNutritionTab() : renderShoppingTab()}

      {/* QR Scanner Modal */}
      <Modal visible={showScanner} animationType="slide">
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity onPress={() => setShowScanner(false)} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Scan Food Barcode</Text>
            <View style={{ width: 40 }} />
          </View>
          <CameraView
            style={styles.scanner}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417", "ean13", "ean8", "code128", "code39"],
            }}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerText}>
              Point your camera at a food barcode
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cartBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#000',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 6,
    backgroundColor: '#f8f9fa',
  },
  activeTab: {
    backgroundColor: '#000',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  calorieProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  calorieCircleContainer: {
    position: 'relative',
    marginRight: 24,
  },
  calorieCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  progressRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#f0f0f0',
    top: -5,
    left: -5,
    zIndex: 1,
  },
  calorieNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  calorieLabel: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.8,
    fontWeight: '500',
  },
  calorieInfo: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  remainingValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '700',
  },
  progressValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '700',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    flex: 1,
    marginHorizontal: 8,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  macroBarContainer: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroBar: {
    height: '100%',
    borderRadius: 3,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  mealsContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  mealLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  mealTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  mealItems: {
    marginTop: 4,
  },
  mealItem: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },
  mealRight: {
    alignItems: 'flex-end',
  },
  mealCalories: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  caloriesUnit: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
  },
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryChip: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  activeCategoryChip: {
    backgroundColor: '#000',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeCategoryText: {
    color: '#fff',
  },
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  foodImageContainer: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
  },
  foodEmoji: {
    fontSize: 48,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodContent: {
    padding: 16,
    paddingTop: 0,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    lineHeight: 20,
  },
  foodCalories: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
  foodFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  addButton: {
    backgroundColor: '#000',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 40,
    fontWeight: '500',
  },
});

export default FoodScreen; 
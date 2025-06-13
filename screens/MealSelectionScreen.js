import React, { useState, useEffect, useRef } from 'react';
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
  StatusBar,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { CameraView, Camera } from 'expo-camera';

const { width } = Dimensions.get('window');

const MealSelectionScreen = ({ navigation, route }) => {
  const { mealType, mealName, mealTime, selectedDate } = route.params;
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState('1');
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchBarWidth = useRef(new Animated.Value(1)).current;
  const isCompactMode = useRef(false);

  const tabs = ['All', 'My Meals', 'Recipes', 'Recent'];

  const suggestions = [
    {
      id: 1,
      name: 'Kvarg Vanilj',
      description: 'Arla Kvarg Vanilj',
      calories: 60,
      protein: 10.2,
      carbs: 4.1,
      fat: 0.2,
      weight: '100g',
      brand: 'Arla',
      verified: true,
      category: 'dairy',
    },
    {
      id: 2,
      name: 'Kaffe Med Mjölk',
      description: 'Kaffe med 1 cl mjölk',
      calories: 6,
      protein: 0.3,
      carbs: 0.5,
      fat: 0.1,
      weight: '1 cup',
      brand: '',
      verified: false,
      category: 'beverages',
    },
    {
      id: 3,
      name: 'Fullkornsbröd',
      description: 'Fullkornsbröd mörkt',
      calories: 245,
      protein: 8.5,
      carbs: 45.2,
      fat: 3.8,
      weight: '100g',
      brand: 'Pågen',
      verified: true,
      category: 'grains',
    },
    {
      id: 4,
      name: 'Ägg Kokt',
      description: 'Kokt ägg, helt',
      calories: 155,
      protein: 13.0,
      carbs: 1.1,
      fat: 10.6,
      weight: '100g',
      brand: '',
      verified: true,
      category: 'protein',
    },
    {
      id: 5,
      name: 'Banan',
      description: 'Färsk banan',
      calories: 89,
      protein: 1.1,
      carbs: 22.8,
      fat: 0.3,
      weight: '100g',
      brand: '',
      verified: false,
      category: 'fruits',
    },
    {
      id: 6,
      name: 'Lax Grillad',
      description: 'Grillad lax, utan skinn',
      calories: 231,
      protein: 25.4,
      carbs: 0,
      fat: 13.4,
      weight: '100g',
      brand: '',
      verified: true,
      category: 'protein',
    },
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Handle scroll animation
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const threshold = 30;
        
        if (offsetY > threshold && !isCompactMode.current) {
          isCompactMode.current = true;
          // Animate to compact mode
          Animated.parallel([
            Animated.timing(searchBarWidth, {
              toValue: 0.6, // Match the search bar width
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        } else if (offsetY <= threshold && isCompactMode.current) {
          isCompactMode.current = false;
          // Animate back to normal mode
          Animated.parallel([
            Animated.timing(searchBarWidth, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        }
      }
    }
  );

  const handleBarCodeScanned = ({ type, data }) => {
    setShowScanner(false);
    Alert.alert(
      'Mat Scannad! 📱',
      `Streckkod: ${data}\nSöker näringsinnehåll...`,
      [
        {
          text: 'Lägg till måltid',
          onPress: () => {
            Alert.alert('Framgång! ✅', 'Matvara tillagd i din måltidslogg!');
            navigation.goBack();
          }
        },
        { text: 'Avbryt', style: 'cancel' }
      ]
    );
  };

  const openScanner = () => {
    if (hasPermission === null) {
      Alert.alert('Behörighet krävs', 'Kamerabehörighet krävs för att scanna streckkoder.');
      return;
    }
    if (hasPermission === false) {
      Alert.alert('Ingen åtkomst', 'Ingen åtkomst till kamera. Aktivera kamerabehörigheter.');
      return;
    }
    setShowScanner(true);
  };

  const addFoodItem = (item) => {
    setSelectedFood(item);
    setShowNutritionModal(true);
  };

  const confirmAddFood = () => {
    const totalCalories = Math.round(selectedFood.calories * parseFloat(quantity));
    setSelectedItems(prev => [...prev, { ...selectedFood, quantity: parseFloat(quantity), totalCalories }]);
    setShowNutritionModal(false);
    setSelectedFood(null);
    setQuantity('1');
    
    Alert.alert(
      'Tillagd! ✅', 
      `${selectedFood.name} har lagts till i din ${mealName.toLowerCase()}.`,
      [
        { text: 'Lägg till fler', style: 'default' },
        { 
          text: 'Klar', 
          onPress: () => navigation.goBack(),
          style: 'default'
        }
      ]
    );
  };

  const getTotalCalories = () => {
    return selectedItems.reduce((sum, item) => sum + item.totalCalories, 0);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      dairy: 'cow',
      beverages: 'coffee',
      grains: 'barley',
      protein: 'fish',
      fruits: 'fruit-cherries',
      vegetables: 'carrot',
    };
    return icons[category] || 'food';
  };

  const filteredSuggestions = suggestions.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{mealName}</Text>
          <Text style={styles.headerSubtitle}>{mealTime} • {selectedDate}</Text>
        </View>
        <TouchableOpacity style={styles.cartButton}>
          <MaterialCommunityIcons name="cart" size={24} color="#000" />
          {selectedItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{selectedItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Calories Summary */}
      {selectedItems.length > 0 && (
        <View style={styles.caloriesSummary}>
          <View style={styles.caloriesInfo}>
            <Text style={styles.caloriesText}>{getTotalCalories()} kcal</Text>
            <Text style={styles.caloriesLabel}>Total tillagd</Text>
          </View>
          <TouchableOpacity style={styles.finishButton} onPress={() => navigation.goBack()}>
            <Text style={styles.finishButtonText}>Slutför Måltid</Text>
            <MaterialCommunityIcons name="check" size={16} color="#000" />
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Animated.View style={[styles.searchBar, { 
          width: searchBarWidth.interpolate({
            inputRange: [0.7, 1],
            outputRange: ['60%', '100%'],
            extrapolate: 'clamp',
          })
        }]}>
          <MaterialCommunityIcons name="magnify" size={20} color="#666" />
          <Animated.View style={{ 
            flex: 1, 
            opacity: searchBarWidth.interpolate({
              inputRange: [0.6, 0.8],
              outputRange: [0.3, 1],
              extrapolate: 'clamp',
            })
          }}>
            <TextInput
              style={styles.searchInput}
              placeholder="Sök mat, märke eller streckkod..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666"
            />
          </Animated.View>
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </Animated.View>
        
        {/* Compact Quick Actions - appear beside search when scrolling */}
        <Animated.View style={[
          styles.compactQuickActions,
          {
            opacity: searchBarWidth.interpolate({
              inputRange: [0.6, 1],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
            transform: [{
              scale: searchBarWidth.interpolate({
                inputRange: [0.6, 1],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              })
            }]
          }
        ]}>
          <TouchableOpacity style={styles.compactAction} onPress={() => {}}>
            <MaterialCommunityIcons name="microphone" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.compactAction} onPress={openScanner}>
            <MaterialCommunityIcons name="barcode-scan" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.compactAction} onPress={() => {}}>
            <MaterialCommunityIcons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.compactAction} onPress={() => {}}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <Animated.View style={[
        styles.quickActions,
        {
          opacity: searchBarWidth.interpolate({
            inputRange: [0.6, 1],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          }),
          height: searchBarWidth.interpolate({
            inputRange: [0.6, 1],
            outputRange: [0, 100],
            extrapolate: 'clamp',
          }),
          paddingVertical: searchBarWidth.interpolate({
            inputRange: [0.6, 1],
            outputRange: [0, 8],
            extrapolate: 'clamp',
          }),
          marginBottom: searchBarWidth.interpolate({
            inputRange: [0.6, 1],
            outputRange: [0, 8],
            extrapolate: 'clamp',
          }),
          overflow: 'hidden',
        }
      ]}>
        <TouchableOpacity style={styles.quickAction} onPress={() => {}}>
          <View style={styles.quickActionIcon}>
            <MaterialCommunityIcons name="microphone" size={20} color="#fff" />
          </View>
          <Text style={styles.quickActionText}>Voice</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={openScanner}>
          <View style={styles.quickActionIcon}>
            <MaterialCommunityIcons name="barcode-scan" size={20} color="#fff" />
          </View>
          <Text style={styles.quickActionText}>Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={() => {}}>
          <View style={styles.quickActionIcon}>
            <MaterialCommunityIcons name="camera" size={20} color="#fff" />
          </View>
          <Text style={styles.quickActionText}>Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={() => {}}>
          <View style={styles.quickActionIcon}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#fff" />
          </View>
          <Text style={styles.quickActionText}>Recipe</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Food List */}
      <ScrollView 
        style={styles.foodList} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={8}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? `Resultat för "${searchQuery}"` : 'Populära val'}
          </Text>
          <Text style={styles.sectionCount}>{filteredSuggestions.length} objekt</Text>
        </View>

        {filteredSuggestions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.foodItem}
            onPress={() => addFoodItem(item)}
            activeOpacity={0.8}
          >
            <View style={styles.foodContent}>
              <View style={styles.foodIcon}>
                <MaterialCommunityIcons 
                  name={getCategoryIcon(item.category)} 
                  size={24} 
                  color="#fff" 
                />
              </View>
              
              <View style={styles.foodInfo}>
                <View style={styles.foodHeader}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  {item.verified && (
                    <MaterialCommunityIcons name="check-decagram" size={16} color="#4CAF50" />
                  )}
                </View>
                <Text style={styles.foodDescription}>{item.description}</Text>
                <View style={styles.nutritionPreview}>
                  <Text style={styles.nutritionText}>{item.calories} kcal</Text>
                  <Text style={styles.nutritionDivider}>•</Text>
                  <Text style={styles.nutritionText}>P: {item.protein}g</Text>
                  <Text style={styles.nutritionDivider}>•</Text>
                  <Text style={styles.nutritionText}>C: {item.carbs}g</Text>
                  <Text style={styles.nutritionDivider}>•</Text>
                  <Text style={styles.nutritionText}>F: {item.fat}g</Text>
                </View>
              </View>
              
              <View style={styles.foodActions}>
                <Text style={styles.foodWeight}>{item.weight}</Text>
                <TouchableOpacity style={styles.addFoodButton}>
                  <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Nutrition Modal */}
      <Modal
        visible={showNutritionModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNutritionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.nutritionModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedFood?.name}</Text>
              <TouchableOpacity onPress={() => setShowNutritionModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Mängd</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(0.1, parseFloat(quantity) - 0.1).toFixed(1))}
                >
                  <MaterialCommunityIcons name="minus" size={20} color="#000" />
                </TouchableOpacity>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => setQuantity((parseFloat(quantity) + 0.1).toFixed(1))}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#000" />
                </TouchableOpacity>
              </View>
              <Text style={styles.quantityUnit}>× {selectedFood?.weight}</Text>
            </View>

            <View style={styles.nutritionBreakdown}>
              <Text style={styles.nutritionTitle}>Näringsinnehåll</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {Math.round((selectedFood?.calories || 0) * parseFloat(quantity))}
                  </Text>
                  <Text style={styles.nutritionLabel}>Kalorier</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {((selectedFood?.protein || 0) * parseFloat(quantity)).toFixed(1)}g
                  </Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {((selectedFood?.carbs || 0) * parseFloat(quantity)).toFixed(1)}g
                  </Text>
                  <Text style={styles.nutritionLabel}>Kolhydrater</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {((selectedFood?.fat || 0) * parseFloat(quantity)).toFixed(1)}g
                  </Text>
                  <Text style={styles.nutritionLabel}>Fett</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={confirmAddFood}>
              <Text style={styles.confirmButtonText}>Lägg till i måltid</Text>
              <MaterialCommunityIcons name="check" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'pdf417', 'ean13', 'ean8', 'code128'],
            }}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowScanner(false)}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.scannerTitle}>Scanna Streckkod</Text>
                <View style={styles.placeholder} />
              </View>
              
              <View style={styles.scannerFrame}>
                <View style={styles.scannerCorner} />
                <View style={[styles.scannerCorner, styles.topRight]} />
                <View style={[styles.scannerCorner, styles.bottomLeft]} />
                <View style={[styles.scannerCorner, styles.bottomRight]} />
                <View style={styles.scannerLine} />
              </View>
              
              <Text style={styles.scannerInstructions}>
                Rikta kameran mot streckkoden på förpackningen
              </Text>
            </View>
          </CameraView>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  caloriesSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#000',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  caloriesInfo: {
    flex: 1,
  },
  caloriesText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  caloriesLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    fontWeight: '500',
  },
  finishButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  finishButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  tabsContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
  },
  tabsContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeTab: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 6,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 72,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 14,
  },
  foodList: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  foodItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  foodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  foodIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
    gap: 4,
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.2,
  },
  foodDescription: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  nutritionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  nutritionText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  nutritionDivider: {
    fontSize: 12,
    color: '#999',
  },
  foodActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  foodWeight: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addFoodButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  nutritionModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.3,
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quantityInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    minWidth: 60,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quantityUnit: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  nutritionBreakdown: {
    marginBottom: 24,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  nutritionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  nutritionItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  scannerContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 44,
  },
  scannerFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  scannerCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    top: 'auto',
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scannerLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#2196F3',
    top: '50%',
    left: 0,
    borderRadius: 1,
  },
  scannerInstructions: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 40,
    fontWeight: '500',
    lineHeight: 24,
  },
  compactQuickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '40%',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  compactAction: {
    width: 36,
    height: 36,
    borderRadius: 5,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default MealSelectionScreen; 
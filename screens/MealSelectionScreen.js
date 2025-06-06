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

  const tabs = ['All', 'My Meals', 'My Recipes', 'My Foods'];

  const suggestions = [
    {
      id: 1,
      name: 'Kvarg',
      description: '60 cal, 100 g, Kvarg Arla Vanilj',
      calories: 60,
      weight: '100 g',
      brand: 'Arla',
      verified: true,
    },
    {
      id: 2,
      name: 'Kaffe Med Mjölk',
      description: '6 cal, 1 cl mjölk, Kaffe',
      calories: 6,
      weight: '1 cl',
      brand: '',
      verified: false,
    },
    {
      id: 3,
      name: 'Mjölk',
      description: '45 cal, 1 dl, Mjölk',
      calories: 45,
      weight: '1 dl',
      brand: '',
      verified: true,
    },
    {
      id: 4,
      name: 'Ägg',
      description: '70 cal, 60 g, Ett Helt ägg',
      calories: 70,
      weight: '60 g',
      brand: '',
      verified: false,
    },
    {
      id: 5,
      name: 'Banan',
      description: '107 cal, 150 g, Banan-',
      calories: 107,
      weight: '150 g',
      brand: '',
      verified: false,
    },
    {
      id: 6,
      name: 'Tomat',
      description: '26 cal, 100 gram, Tomat',
      calories: 26,
      weight: '100 g',
      brand: '',
      verified: true,
    },
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setShowScanner(false);
    Alert.alert(
      'Mat scannad!',
      `Streckkod: ${data}\nSöker näringsinnehåll...`,
      [
        {
          text: 'Lägg till måltid',
          onPress: () => {
            Alert.alert('Framgång', 'Matvara tillagd i din måltidslogg!');
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
    Alert.alert(
      'Lägg till mat',
      `Vill du lägga till ${item.name} till din ${mealName.toLowerCase()}?`,
      [
        {
          text: 'Lägg till',
          onPress: () => {
            Alert.alert('Tillagd!', `${item.name} har lagts till i din ${mealName.toLowerCase()}.`);
            navigation.goBack();
          }
        },
        { text: 'Avbryt', style: 'cancel' }
      ]
    );
  };

  const filteredSuggestions = suggestions.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{mealName}</Text>
          <Text style={styles.headerSubtitle}>{mealTime}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a food"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
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

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
          <View style={styles.actionButtonContent}>
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="microphone" size={24} color="#2196F3" />
            </View>
            <Text style={styles.actionText}>Voice Log</Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={openScanner}>
          <View style={styles.actionButtonContent}>
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E8' }]}>
              <MaterialCommunityIcons name="barcode-scan" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.actionText}>Scan a Barcode</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
          <View style={styles.actionButtonContent}>
            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
              <MaterialCommunityIcons name="camera" size={24} color="#FF9800" />
            </View>
            <Text style={styles.actionText}>Scan</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Suggestions */}
      <View style={styles.suggestionsHeader}>
        <Text style={styles.suggestionsTitle}>Suggestions</Text>
      </View>

      <ScrollView style={styles.suggestionsList} showsVerticalScrollIndicator={false}>
        {filteredSuggestions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.suggestionItem}
            onPress={() => addFoodItem(item)}
          >
            <View style={styles.suggestionContent}>
              <View style={styles.suggestionInfo}>
                <View style={styles.suggestionHeader}>
                  <Text style={styles.suggestionName}>{item.name}</Text>
                  {item.verified && (
                    <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                  )}
                </View>
                <Text style={styles.suggestionDescription}>{item.description}</Text>
              </View>
              <TouchableOpacity style={styles.addButton}>
                <MaterialCommunityIcons name="plus" size={20} color="#2196F3" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
                <Text style={styles.scannerTitle}>Scanna streckkod</Text>
                <View style={styles.placeholder} />
              </View>
              
              <View style={styles.scannerFrame}>
                <View style={styles.scannerCorner} />
                <View style={[styles.scannerCorner, styles.topRight]} />
                <View style={[styles.scannerCorner, styles.bottomLeft]} />
                <View style={[styles.scannerCorner, styles.bottomRight]} />
              </View>
              
              <Text style={styles.scannerInstructions}>
                Rikta kameran mot streckkoden
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
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  activeTab: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  actionButtonContent: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  newBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    position: 'absolute',
    top: -8,
    right: -8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  suggestionsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  suggestionsList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 8,
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  scannerCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    top: 'auto',
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scannerInstructions: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default MealSelectionScreen; 
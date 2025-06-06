import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ColorTest from '../components/3dModels/ColorTest';
import WebView3D from '../components/3dModels/WebView3D';
import WebViewGLTF from '../components/3dModels/WebViewGLTF';

const { width, height } = Dimensions.get('window');

// Temporary fallback avatar component
const FallbackAvatar = () => (
  <View style={styles.fallbackAvatarContainer}>
    <View style={styles.fallbackAvatar}>
      <MaterialCommunityIcons name="account" size={80} color="#fff" />
    </View>
    <Text style={styles.fallbackText}>2D Avatar</Text>
    <Text style={styles.fallbackSubtext}>Klassisk avatar-vy</Text>
  </View>
);

const AvatarScreen = () => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [use3D, setUse3D] = useState(false);
  const [useColorTest, setUseColorTest] = useState(false);
  const [useWebView3D, setUseWebView3D] = useState(false);
  const [useWebViewGLTF, setUseWebViewGLTF] = useState(false);

  const render3DComponent = () => {
    if (useColorTest) {
      return <ColorTest />;
    }
    if (useWebViewGLTF) {
      return <WebViewGLTF />;
    }
    if (useWebView3D) {
      return <WebView3D />;
    }
    // Default fallback when no specific 3D component is selected
    return (
      <View style={styles.fallbackAvatarContainer}>
        <View style={styles.fallbackAvatar}>
          <MaterialCommunityIcons name="cube-outline" size={80} color="#4ecdc4" />
        </View>
        <Text style={styles.fallbackText}>3D Avatar</Text>
        <Text style={styles.fallbackSubtext}>Välj en 3D-komponent nedan</Text>
      </View>
    );
  };

  const get3DDescription = () => {
    if (useColorTest) return 'Grundläggande färgtest • Ingen 3D';
    if (useWebViewGLTF) return 'Snabb Fallback Avatar • WebView 3D';
    if (useWebView3D) return 'WebView 3D Avatar • Fungerar i Expo Go';
    return '3D Avatar • Välj en komponent';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Avatar Display */}
      <View style={styles.avatarContainer}>
        {use3D ? render3DComponent() : <FallbackAvatar />}
        <View style={styles.avatarOverlay}>
          <Text style={styles.avatarTitle}>Din Avatar</Text>
          <Text style={styles.avatarSubtitle}>
            {use3D ? get3DDescription() : 'Anpassa ditt utseende'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Avatar Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avatar Kontroller</Text>
          
          <View style={styles.menuItem}>
            <MaterialCommunityIcons name="cube-outline" size={24} color="#666" />
            <Text style={styles.menuText}>Aktivera 3D Avatar</Text>
            <Switch
              value={use3D}
              onValueChange={setUse3D}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={use3D ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          {use3D && (
            <>
              <View style={styles.menuItem}>
                <MaterialCommunityIcons name="palette" size={24} color="#4CAF50" />
                <Text style={styles.menuText}>Färgtest (ingen 3D)</Text>
                <Switch
                  value={useColorTest}
                  onValueChange={(value) => {
                    setUseColorTest(value);
                    if (value) {
                      setUseWebViewGLTF(false);
                      setUseWebView3D(false);
                    }
                  }}
                  trackColor={{ false: '#767577', true: '#4CAF50' }}
                  thumbColor={useColorTest ? '#fff' : '#f4f3f4'}
                />
              </View>

              {!useColorTest && (
                <View style={styles.menuItem}>
                  <MaterialCommunityIcons name="account-box" size={24} color="#E91E63" />
                  <Text style={styles.menuText}>Snabb Fallback Avatar ⚡</Text>
                  <Switch
                    value={useWebViewGLTF}
                    onValueChange={(value) => {
                      setUseWebViewGLTF(value);
                      if (value) {
                        setUseWebView3D(false);
                      }
                    }}
                    trackColor={{ false: '#767577', true: '#E91E63' }}
                    thumbColor={useWebViewGLTF ? '#fff' : '#f4f3f4'}
                  />
                </View>
              )}

              {!useColorTest && !useWebViewGLTF && (
                <View style={styles.menuItem}>
                  <MaterialCommunityIcons name="web" size={24} color="#FF9800" />
                  <Text style={styles.menuText}>WebView 3D Avatar ⭐</Text>
                  <Switch
                    value={useWebView3D}
                    onValueChange={setUseWebView3D}
                    trackColor={{ false: '#767577', true: '#FF9800' }}
                    thumbColor={useWebView3D ? '#fff' : '#f4f3f4'}
                  />
                </View>
              )}

              {!useColorTest && !useWebViewGLTF && !useWebView3D && (
                <>
                  <View style={styles.menuItem}>
                    <MaterialCommunityIcons name="rotate-3d-variant" size={24} color="#666" />
                    <Text style={styles.menuText}>Auto-rotation</Text>
                    <Switch
                      value={autoRotate}
                      onValueChange={setAutoRotate}
                      trackColor={{ false: '#767577', true: '#81b0ff' }}
                      thumbColor={autoRotate ? '#f5dd4b' : '#f4f3f4'}
                    />
                  </View>

                  <View style={styles.menuItem}>
                    <MaterialCommunityIcons name="gesture-swipe" size={24} color="#666" />
                    <Text style={styles.menuText}>Orbit kontroller</Text>
                    <Switch
                      value={showControls}
                      onValueChange={setShowControls}
                      trackColor={{ false: '#767577', true: '#81b0ff' }}
                      thumbColor={showControls ? '#f5dd4b' : '#f4f3f4'}
                    />
                  </View>
                </>
              )}
            </>
          )}
        </View>

        {/* Avatar Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avatar Inställningar</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="palette" size={24} color="#666" />
            <Text style={styles.menuText}>Ändra färg</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="tshirt-crew" size={24} color="#666" />
            <Text style={styles.menuText}>Kläder & Accessoarer</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="face-man-profile" size={24} color="#666" />
            <Text style={styles.menuText}>Ansiktsegenskaper</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="human-handsup" size={24} color="#666" />
            <Text style={styles.menuText}>Kroppstyp</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visning</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="eye" size={24} color="#666" />
            <Text style={styles.menuText}>Synlighet</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="badge-account" size={24} color="#666" />
            <Text style={styles.menuText}>Märken & Prestationer</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="camera" size={24} color="#666" />
            <Text style={styles.menuText}>Ta skärmbild</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information" size={24} color="#4ecdc4" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Debug Info</Text>
              <Text style={styles.infoText}>
                {useColorTest 
                  ? '🎨 FÄRGTEST: Testar grundläggande rendering utan 3D. Du bör se röda, blå och gröna boxar.'
                  : useWebViewGLTF
                    ? '⚡ SNABB FALLBACK: Visar fallback-avatar direkt efter 1 sekund. Ingen väntan på externa modeller.'
                    : useWebView3D
                      ? '🌐 WEBVIEW 3D: Använder WebView med Three.js. Du bör se en 3D-avatar med gradient-bakgrund som roterar och svajar.'
                      : '🎮 FULLSTÄNDIG: Äkta 3D-kub med alla funktioner aktiverade.'
                }
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  avatarContainer: {
    height: height * 0.5,
    backgroundColor: '#fff',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  avatarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  avatarSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  fallbackAvatarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  fallbackAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  fallbackSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4ecdc4',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default AvatarScreen; 
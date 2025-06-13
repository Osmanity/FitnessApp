import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert,
  Dimensions,
  Modal,
  TextInput,
  PanResponder,
  Animated,
  Vibration,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const CustomCameraModal = ({ visible, onClose, onPhotoTaken, cameraSettings, onUpdateCameraSettings, muscleGroup, onMuscleGroupChange, allMuscleGroups }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [flashMode, setFlashMode] = useState('off');
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showHeaderControls, setShowHeaderControls] = useState(false);

  // Animation values
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const headerControlsAnimation = useRef(new Animated.Value(0)).current;

  // Safety check for camera settings
  const safeCameraSettings = cameraSettings || { cameraType: 'front', timer: 0 };

  // Get previous and next muscle groups for navigation
  const allMuscleGroupsArray = allMuscleGroups ? Object.values(allMuscleGroups) : [];
  const currentIndex = allMuscleGroupsArray.findIndex(group => group.id === muscleGroup?.id);
  const prevGroup = currentIndex > 0 ? allMuscleGroupsArray[currentIndex - 1] : allMuscleGroupsArray[allMuscleGroupsArray.length - 1];
  const nextGroup = currentIndex < allMuscleGroupsArray.length - 1 ? allMuscleGroupsArray[currentIndex + 1] : allMuscleGroupsArray[0];

  // Volume button listener for photo capture
  useEffect(() => {
    if (!visible) return;

    const handleVolumePress = (event) => {
      if (event.type === 'keydown' && (event.key === 'VolumeUp' || event.key === 'VolumeDown')) {
        event.preventDefault();
        if (!isCountingDown) {
          startCountdown();
        }
      }
    };

    // Add event listener for volume buttons (Android)
    if (Platform.OS === 'android') {
      const { DeviceEventEmitter } = require('react-native');
      const volumeListener = DeviceEventEmitter.addListener('onVolumePressed', () => {
        if (!isCountingDown) {
          startCountdown();
        }
      });

      return () => {
        volumeListener.remove();
      };
    }

    // For iOS, we'll use a different approach with hardware button detection
    const handleHardwareBackPress = () => {
      if (!isCountingDown) {
        startCountdown();
      }
      return true;
    };

    if (Platform.OS === 'ios') {
      // iOS volume button handling would require native module
      // For now, we'll just handle the camera button press
    }

    return () => {
      // Cleanup
    };
  }, [visible, isCountingDown]);

  // PanResponder for swipe-to-dismiss
  const dismissPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to vertical swipes down that start from the top area
      const isVerticalSwipe = gestureState.dy > 20 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      const isFromTopArea = evt.nativeEvent.pageY < 150; // Only from top 150px
      return isVerticalSwipe && isFromTopArea;
    },
    onPanResponderGrant: () => {
      // Start tracking the gesture
    },
    onPanResponderMove: (evt, gestureState) => {
      // Only allow downward swipes from top area
      if (gestureState.dy > 0 && evt.nativeEvent.pageY < 200) {
        // translateY.setValue(gestureState.dy); // COMMENTED OUT - translateY not defined
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 150 || (gestureState.dy > 50 && gestureState.vy > 0.8)) {
        // Swipe down far enough or fast enough - dismiss modal
        onClose(); // Direct close instead of animation
      } else {
        // Snap back to original position
        // Animated.spring(translateY, {
        //   toValue: 0,
        //   useNativeDriver: true,
        //   tension: 120,
        //   friction: 8,
        // }).start();
      }
    },
  });

  const handleSwipeLeft = async () => {
    try {
      if (nextGroup && onMuscleGroupChange) {
        // Haptic feedback
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          // Fallback to vibration if haptics not available
          Vibration.vibrate(50);
        }
        
        // Animation
        Animated.sequence([
          Animated.timing(scaleAnimation, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          })
        ]).start();
        
        onMuscleGroupChange(nextGroup.id);
      }
    } catch (error) {
      console.error('Error in handleSwipeLeft:', error);
    }
  };

  const handleSwipeRight = async () => {
    try {
      if (prevGroup && onMuscleGroupChange) {
        // Haptic feedback
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          // Fallback to vibration if haptics not available
          Vibration.vibrate(50);
        }
        
        // Animation
        Animated.sequence([
          Animated.timing(scaleAnimation, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          })
        ]).start();
        
        onMuscleGroupChange(prevGroup.id);
      }
    } catch (error) {
      console.error('Error in handleSwipeRight:', error);
    }
  };

  // Enhanced pan responder for swipe gestures (only for muscle group switching)
  // REMOVED: PanResponder functionality to fix pageSheet background issues
  // Now using simple button navigation instead
  
  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission().catch(error => {
        console.error('Error requesting camera permission:', error);
      });
    }
  }, [visible, permission]);

  const startCountdown = async () => {
    if (safeCameraSettings.timer === 0) {
      takePicture();
      return;
    }

    setIsCountingDown(true);
    setCountdown(safeCameraSettings.timer);

    for (let i = safeCameraSettings.timer; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsCountingDown(false);
    takePicture();
  };

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({
          quality: 0.8,
          base64: false,
          skipProcessing: true, // Skip automatic processing that might mirror the image
          exif: false, // Don't include EXIF data
        });
        
        // Save to device gallery
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        
        if (onPhotoTaken) {
          onPhotoTaken(photo.uri);
        }
        
        // Don't close the modal - allow multiple photos
        // Show brief success feedback
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          Vibration.vibrate(100);
        }
        
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      }
    }
  };

  const toggleFlash = () => {
    setFlashMode(current => 
      current === 'off' ? 'on' : 'off'
    );
  };

  const toggleCamera = () => {
    const newCameraType = safeCameraSettings.cameraType === 'front' ? 'back' : 'front';
    if (onUpdateCameraSettings) {
      onUpdateCameraSettings({
        ...safeCameraSettings,
        cameraType: newCameraType
      });
    }
  };

  const toggleTimer = () => {
    const timerOptions = [0, 3, 10];
    const currentIndex = timerOptions.indexOf(safeCameraSettings.timer);
    const nextIndex = (currentIndex + 1) % timerOptions.length;
    const newTimer = timerOptions[nextIndex];
    
    if (onUpdateCameraSettings) {
      onUpdateCameraSettings({
        ...safeCameraSettings,
        timer: newTimer
      });
    }
  };

  const toggleHeaderControls = () => {
    setShowHeaderControls(!showHeaderControls);
  };

  // Start pulse animation when component mounts
  useEffect(() => {
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (visible && !isCountingDown) {
      startPulse();
    }

    return () => {
      pulseAnimation.stopAnimation();
    };
  }, [visible, isCountingDown]);

  // Animate header controls
  useEffect(() => {
    Animated.timing(headerControlsAnimation, {
      toValue: showHeaderControls ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [showHeaderControls]);

  if (!visible) {
    return null;
  }

  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.cameraPermissionContainer}>
          <MaterialCommunityIcons name="camera-off" size={64} color="#666" />
          <Text style={styles.permissionText}>Loading camera...</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={onClose}>
            <Text style={styles.permissionButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.cameraPermissionContainer}>
          <MaterialCommunityIcons name="camera-off" size={64} color="#666" />
          <Text style={styles.permissionText}>Camera permission is required</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={onClose}>
            <Text style={styles.permissionButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {/* Stable container - no animations applied here to prevent pageSheet background issues */}
      <View style={styles.cameraContainer}>
        {/* Swipe Indicator - Static, no gestures */}
        <View style={styles.cameraSwipeIndicator}>
          <View style={styles.cameraSwipeHandle} />
        </View>

        {/* Camera View - Stable, no animations */}
        <CameraView
          style={[
            styles.camera,
            // Prevent mirroring for front camera preview
            safeCameraSettings.cameraType === 'front' && { transform: [{ scaleX: 1 }] }
          ]}
          facing={safeCameraSettings.cameraType}
          flash={flashMode}
          ref={ref => setCameraRef(ref)}
        />
        
        {/* Header Controls - Absolute positioned, stable */}
        <View style={styles.cameraHeader}>
          <TouchableOpacity style={styles.cameraHeaderButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.cameraHeaderCenter}>
            {muscleGroup ? (
              <View style={styles.muscleGroupHeaderInfo}>
                <View style={styles.muscleGroupTitleRow}>
                  <MaterialCommunityIcons 
                    name={muscleGroup.icon} 
                    size={24} 
                    color="#fff" 
                  />
                  <Text style={styles.cameraTitle}>{muscleGroup.name}</Text>
                </View>
                <Text style={styles.cameraSubtitle}>Position yourself for the best angle</Text>
              </View>
            ) : (
              <Text style={styles.cameraTitle}>Progress Photo</Text>
            )}
          </View>
          
          <View style={styles.cameraHeaderRight}>
            <TouchableOpacity 
              style={styles.cameraHeaderButton} 
              onPress={() => setShowHeaderControls(!showHeaderControls)}
            >
              <MaterialCommunityIcons 
                name={showHeaderControls ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
            
            {/* Compact Dropdown Options */}
            {showHeaderControls && (
              <Animated.View 
                style={[
                  styles.compactDropdown,
                  {
                    opacity: headerControlsAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                    transform: [{
                      translateY: headerControlsAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0],
                      })
                    }, {
                      scale: headerControlsAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.compactOption}>
                  <Text style={styles.compactOptionText}>
                    Timer {safeCameraSettings.timer > 0 ? `${safeCameraSettings.timer}s` : 'Off'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.cameraHeaderButton} 
                    onPress={toggleTimer}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons 
                      name={safeCameraSettings.timer === 0 ? "timer-off" : "timer"} 
                      size={24} 
                      color="#fff" 
                    />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.compactOption}>
                  <Text style={styles.compactOptionText}>
                    Flash {flashMode === 'off' ? 'Off' : 'On'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.cameraHeaderButton} 
                    onPress={toggleFlash}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons 
                      name={flashMode === 'off' ? "flash-off" : "flash"} 
                      size={24} 
                      color="#fff" 
                    />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.compactOption}>
                  <Text style={styles.compactOptionText}>
                    Camera {safeCameraSettings.cameraType === 'front' ? 'Front' : 'Back'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.cameraHeaderButton} 
                    onPress={toggleCamera}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons 
                      name={safeCameraSettings.cameraType === 'front' ? "camera-front" : "camera-rear"} 
                      size={24} 
                      color="#fff" 
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </View>
        </View>

        {/* Countdown Overlay - Absolute positioned, stable */}
        {isCountingDown && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdown}</Text>
            <Text style={styles.countdownSubtext}>Get ready!</Text>
          </View>
        )}

        {/* Swipe Direction Indicator - Isolated animation */}
        {/* COMMENTED OUT - references undefined variables
        {isSwipeActive && swipeDirection && (
          <Animated.View 
            style={[
              styles.swipeIndicator,
              {
                // Remove opacity animation to prevent background interference
                // opacity: fadeAnimation.interpolate({
                //   inputRange: [0.9, 1],
                //   outputRange: [1, 0],
                // }),
                transform: [{
                  translateX: swipeAnimation.interpolate({
                    inputRange: [-0.5, 0, 0.5],
                    outputRange: [-25, 0, 25],
                  })
                }]
              }
            ]}
          >
            <MaterialCommunityIcons 
              name={swipeDirection === 'right' ? "chevron-right" : "chevron-left"} 
              size={40} 
              color="rgba(255, 255, 255, 0.8)" 
            />
            <Text style={styles.swipeDirectionText}>
              {swipeDirection === 'right' ? prevGroup?.name : nextGroup?.name}
            </Text>
          </Animated.View>
        )}
        */}

        {/* Bottom Controls - Stable container */}
        <View style={styles.cameraFooter}>
          <View style={styles.cameraControls}>
            {/* Empty spacer to balance layout */}
            <View style={styles.leftSpacer} />

            {/* Simple Button Navigation - No animations */}
            <View style={styles.captureArea}>
              {/* Previous Muscle Group Button */}
              {allMuscleGroupsArray && muscleGroup && (
                <TouchableOpacity 
                  style={styles.muscleGroupLeft} 
                  onPress={handleSwipeRight}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons 
                    name={prevGroup?.icon} 
                    size={16} 
                    color="rgba(255, 255, 255, 0.8)" 
                  />
                  <Text style={styles.muscleGroupSideLabel}>{prevGroup?.name}</Text>
                </TouchableOpacity>
              )}

              {/* Main Capture Button */}
              <View style={styles.captureButtonContainer}>
                <TouchableOpacity 
                  style={[styles.captureButton, isCountingDown && styles.captureButtonDisabled]}
                  onPress={startCountdown}
                  disabled={isCountingDown}
                >
                  <Animated.View 
                    style={[
                      styles.captureButtonInner,
                      {
                        transform: [{ scale: pulseAnimation }]
                      }
                    ]} 
                  >
                    <MaterialCommunityIcons 
                      name="camera" 
                      size={24} 
                      color="#000" 
                    />
                    {muscleGroup && (
                      <Text style={styles.captureButtonText}>{muscleGroup.name}</Text>
                    )}
                  </Animated.View>
                </TouchableOpacity>
              </View>

              {/* Next Muscle Group Button */}
              {allMuscleGroupsArray && muscleGroup && (
                <TouchableOpacity 
                  style={styles.muscleGroupRight} 
                  onPress={handleSwipeLeft}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons 
                    name={nextGroup?.icon} 
                    size={16} 
                    color="rgba(255, 255, 255, 0.8)" 
                  />
                  <Text style={styles.muscleGroupSideLabel}>{nextGroup?.name}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Camera Switch */}
            <TouchableOpacity style={styles.cameraSwitchButton} onPress={toggleCamera}>
              <MaterialCommunityIcons 
                name={safeCameraSettings.cameraType === 'front' ? "camera-front" : "camera-rear"} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const FullScreenImageModal = ({ visible, onClose, imageUri, muscleGroupName }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.fullScreenContainer}>
        <TouchableOpacity 
          style={styles.fullScreenOverlay} 
          onPress={onClose}
          activeOpacity={1}
        >
          <View style={styles.fullScreenHeader}>
            <TouchableOpacity onPress={onClose} style={styles.fullScreenCloseButton}>
              <MaterialCommunityIcons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.fullScreenTitle}>{muscleGroupName}</Text>
            <View style={styles.fullScreenPlaceholder} />
          </View>
          
          <View style={styles.fullScreenImageContainer}>
            <Image 
              source={{ uri: imageUri }} 
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.fullScreenFooter}>
            <Text style={styles.fullScreenHint}>Tap anywhere to close</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const PhotoDetailModal = ({ visible, onClose, muscleGroup, photos, measurements, onSaveMeasurements, onRetakePhoto, onDeletePhoto }) => {
  const [measurementValues, setMeasurementValues] = useState({});
  const [notes, setNotes] = useState('');
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const scrollViewRef = useRef(null);
  
  // Animation for swipe-to-dismiss
  const translateY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // PanResponder for swipe-to-dismiss
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return gestureState.dy > 10 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
    },
    onPanResponderGrant: () => {
      // Start tracking the gesture
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 100 && gestureState.vy > 0.5) {
        Animated.timing(translateY, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onClose();
          translateY.setValue(0);
        });
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  // Safely reverse photos array to show latest first
  const reversedPhotos = React.useMemo(() => {
    try {
      if (!photos || !Array.isArray(photos) || photos.length === 0) {
        return [];
      }
      return [...photos].reverse();
    } catch (error) {
      console.error('Error reversing photos:', error);
      return [];
    }
  }, [photos]);

  // Safety check for selected photo index
  const safeSelectedIndex = React.useMemo(() => {
    if (!reversedPhotos || reversedPhotos.length === 0) return 0;
    return Math.max(0, Math.min(selectedPhotoIndex, reversedPhotos.length - 1));
  }, [selectedPhotoIndex, reversedPhotos]);

  // Get current photo safely
  const currentPhoto = React.useMemo(() => {
    if (!reversedPhotos || reversedPhotos.length === 0) return null;
    return reversedPhotos[safeSelectedIndex] || null;
  }, [reversedPhotos, safeSelectedIndex]);

  // Enhanced measurement fields with better organization
  const getMeasurementFields = (muscleGroupId) => {
    const fieldSets = {
      chest: {
        title: 'Chest Measurements',
        icon: 'human-male',
        fields: [
          { key: 'chestCircumference', label: 'Chest Circumference', unit: 'cm', placeholder: '95', category: 'primary' },
          { key: 'upperChest', label: 'Upper Chest', unit: 'cm', placeholder: '92', category: 'secondary' },
          { key: 'underChest', label: 'Under Chest', unit: 'cm', placeholder: '88', category: 'secondary' },
          { key: 'chestWidth', label: 'Chest Width', unit: 'cm', placeholder: '35', category: 'secondary' }
        ]
      },
      back: {
        title: 'Back Measurements',
        icon: 'human-male-height',
        fields: [
          { key: 'backWidth', label: 'Back Width', unit: 'cm', placeholder: '45', category: 'primary' },
          { key: 'latSpread', label: 'Lat Spread', unit: 'cm', placeholder: '48', category: 'primary' },
          { key: 'upperBack', label: 'Upper Back', unit: 'cm', placeholder: '42', category: 'secondary' },
          { key: 'lowerBack', label: 'Lower Back', unit: 'cm', placeholder: '40', category: 'secondary' }
        ]
      },
      shoulders: {
        title: 'Shoulder Measurements',
        icon: 'human-male-height',
        fields: [
          { key: 'shoulderWidth', label: 'Shoulder Width', unit: 'cm', placeholder: '48', category: 'primary' },
          { key: 'deltoidSize', label: 'Deltoid Size', unit: 'cm', placeholder: '38', category: 'primary' },
          { key: 'shoulderCircumference', label: 'Shoulder Circumference', unit: 'cm', placeholder: '115', category: 'secondary' },
          { key: 'trapSize', label: 'Trap Size', unit: 'cm', placeholder: '45', category: 'secondary' }
        ]
      },
      arms: {
        title: 'Arm Measurements',
        icon: 'arm-flex',
        fields: [
          { key: 'bicepFlexed', label: 'Bicep (Flexed)', unit: 'cm', placeholder: '35', category: 'primary' },
          { key: 'bicepRelaxed', label: 'Bicep (Relaxed)', unit: 'cm', placeholder: '32', category: 'primary' },
          { key: 'forearm', label: 'Forearm', unit: 'cm', placeholder: '28', category: 'primary' },
          { key: 'tricep', label: 'Tricep', unit: 'cm', placeholder: '30', category: 'secondary' },
          { key: 'wrist', label: 'Wrist', unit: 'cm', placeholder: '17', category: 'secondary' }
        ]
      },
      legs: {
        title: 'Leg Measurements',
        icon: 'human-male-height-variant',
        fields: [
          { key: 'thighUpper', label: 'Upper Thigh', unit: 'cm', placeholder: '58', category: 'primary' },
          { key: 'thighMid', label: 'Mid Thigh', unit: 'cm', placeholder: '55', category: 'primary' },
          { key: 'calf', label: 'Calf', unit: 'cm', placeholder: '38', category: 'primary' },
          { key: 'glutes', label: 'Glutes', unit: 'cm', placeholder: '95', category: 'primary' },
          { key: 'ankle', label: 'Ankle', unit: 'cm', placeholder: '23', category: 'secondary' }
        ]
      },
      abs: {
        title: 'Core Measurements',
        icon: 'human-male-board',
        fields: [
          { key: 'waistNatural', label: 'Natural Waist', unit: 'cm', placeholder: '80', category: 'primary' },
          { key: 'waistNavel', label: 'Waist at Navel', unit: 'cm', placeholder: '82', category: 'primary' },
          { key: 'lowerAbs', label: 'Lower Abs', unit: 'cm', placeholder: '85', category: 'secondary' },
          { key: 'hipBones', label: 'Hip Bones', unit: 'cm', placeholder: '90', category: 'secondary' }
        ]
      },
      'full-body': {
        title: 'Full Body Stats',
        icon: 'human-male',
        fields: [
          { key: 'height', label: 'Height', unit: 'cm', placeholder: '175', category: 'primary' },
          { key: 'weight', label: 'Weight', unit: 'kg', placeholder: '75', category: 'primary' },
          { key: 'bodyFat', label: 'Body Fat', unit: '%', placeholder: '15', category: 'primary' },
          { key: 'muscleMass', label: 'Muscle Mass', unit: 'kg', placeholder: '35', category: 'secondary' },
          { key: 'bmi', label: 'BMI', unit: '', placeholder: '24.5', category: 'secondary' }
        ]
      },
      'side-profile': {
        title: 'Profile Measurements',
        icon: 'human-male-child',
        fields: [
          { key: 'chestProjection', label: 'Chest Projection', unit: 'cm', placeholder: '25', category: 'primary' },
          { key: 'backCurve', label: 'Back Curve', unit: 'cm', placeholder: '8', category: 'secondary' },
          { key: 'gluteProjection', label: 'Glute Projection', unit: 'cm', placeholder: '22', category: 'primary' },
          { key: 'posture', label: 'Posture Score', unit: '/10', placeholder: '8', category: 'secondary' }
        ]
      }
    };

    return fieldSets[muscleGroupId] || {
      title: 'General Measurements',
      icon: 'ruler',
      fields: [
        { key: 'measurement1', label: 'Measurement 1', unit: 'cm', placeholder: '0', category: 'primary' },
        { key: 'measurement2', label: 'Measurement 2', unit: 'cm', placeholder: '0', category: 'primary' }
      ]
    };
  };

  // Animation effects
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && measurements) {
      setMeasurementValues(measurements.values || {});
      setNotes(measurements.notes || '');
    } else if (visible) {
      setMeasurementValues({});
      setNotes('');
    }
    
    if (visible) {
      setSelectedPhotoIndex(0);
      setIsEditing(false);
    }
    
    if (!visible) {
      setShowFullScreenImage(false);
    }
  }, [visible, measurements]);

  useEffect(() => {
    if (showFullScreenImage && (!reversedPhotos || reversedPhotos.length === 0 || !currentPhoto)) {
      setShowFullScreenImage(false);
    }
  }, [reversedPhotos, currentPhoto, showFullScreenImage]);

  useEffect(() => {
    if (reversedPhotos && reversedPhotos.length > 0 && selectedPhotoIndex >= reversedPhotos.length) {
      setSelectedPhotoIndex(0);
    }
  }, [reversedPhotos, selectedPhotoIndex]);

  const handleMeasurementChange = (key, value) => {
    setMeasurementValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      const measurementData = {
        values: measurementValues,
        notes: notes.trim(),
        muscleGroup: muscleGroup?.id,
        lastUpdated: new Date().toISOString()
      };
      
      await onSaveMeasurements(measurementData);
      setIsEditing(false);
      
      // Show success feedback
      Alert.alert('Success', 'Measurements saved successfully!', [
        { text: 'OK', style: 'default' }
      ]);
    } catch (error) {
      console.error('Error saving measurements:', error);
      Alert.alert('Error', 'Failed to save measurements. Please try again.');
    }
  };

  const handleRetake = () => {
    try {
      onRetakePhoto();
    } catch (error) {
      console.error('Error in handleRetake:', error);
      Alert.alert('Error', 'Failed to retake photo. Please try again.');
    }
  };

  const handleDeletePhoto = () => {
    if (!currentPhoto || !onDeletePhoto) return;
    
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              const originalIndex = photos.length - 1 - safeSelectedIndex;
              onDeletePhoto(originalIndex);
              
              if (reversedPhotos.length <= 1) {
                setSelectedPhotoIndex(0);
              } else if (safeSelectedIndex >= reversedPhotos.length - 1) {
                setSelectedPhotoIndex(Math.max(0, reversedPhotos.length - 2));
              }
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'Failed to delete photo. Please try again.');
            }
          },
        },
      ]
    );
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  if (!muscleGroup) return null;

  const measurementConfig = getMeasurementFields(muscleGroup.id);
  const primaryFields = measurementConfig.fields.filter(f => f.category === 'primary');
  const secondaryFields = measurementConfig.fields.filter(f => f.category === 'secondary');

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateY }]
            }
          ]}
          {...panResponder.panHandlers}
        >
          {/* Enhanced Header */}
          <View style={styles.enhancedModalHeader}>
            <View style={styles.dragHandle} />
            
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <View style={styles.muscleGroupInfo}>
                  <View style={[styles.muscleIconContainer, { backgroundColor: muscleGroup.color + '20' }]}>
                    <MaterialCommunityIcons 
                      name={muscleGroup.icon} 
                      size={24} 
                      color={muscleGroup.color} 
                    />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>{muscleGroup.name}</Text>
                    <Text style={styles.modalSubtitle}>
                      {reversedPhotos.length > 0 
                        ? `${reversedPhotos.length} photo${reversedPhotos.length > 1 ? 's' : ''} • ${new Date().toLocaleDateString()}`
                        : 'No photos yet'
                      }
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.headerActions}>
                {reversedPhotos.length > 0 && (
                  <TouchableOpacity onPress={handleDeletePhoto} style={styles.deleteButton}>
                    <MaterialCommunityIcons name="delete-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* Photo Section */}
            <View style={styles.photoSection}>
              {reversedPhotos.length > 0 ? (
                <View style={styles.photoContainer}>
                  {/* Photo Navigation */}
                  {reversedPhotos.length > 1 && (
                    <View style={styles.photoNavigation}>
                      <TouchableOpacity 
                        style={[styles.navButton, safeSelectedIndex === 0 && styles.navButtonDisabled]}
                        onPress={() => setSelectedPhotoIndex(Math.max(0, safeSelectedIndex - 1))}
                        disabled={safeSelectedIndex === 0}
                      >
                        <MaterialCommunityIcons 
                          name="chevron-left" 
                          size={20} 
                          color={safeSelectedIndex === 0 ? "#ccc" : "#666"} 
                        />
                      </TouchableOpacity>
                      
                      <View style={styles.photoIndicators}>
                        {reversedPhotos.map((_, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.photoIndicator,
                              index === safeSelectedIndex && styles.photoIndicatorActive
                            ]}
                            onPress={() => setSelectedPhotoIndex(index)}
                          />
                        ))}
                      </View>
                      
                      <TouchableOpacity 
                        style={[styles.navButton, safeSelectedIndex >= reversedPhotos.length - 1 && styles.navButtonDisabled]}
                        onPress={() => setSelectedPhotoIndex(Math.min(reversedPhotos.length - 1, safeSelectedIndex + 1))}
                        disabled={safeSelectedIndex >= reversedPhotos.length - 1}
                      >
                        <MaterialCommunityIcons 
                          name="chevron-right" 
                          size={20} 
                          color={safeSelectedIndex >= reversedPhotos.length - 1 ? "#ccc" : "#666"} 
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Photo Display */}
                  <TouchableOpacity 
                    style={styles.photoDisplay}
                    onPress={() => setShowFullScreenImage(true)}
                    activeOpacity={0.9}
                  >
                    {currentPhoto && currentPhoto.uri ? (
                      <Image 
                        source={{ uri: currentPhoto.uri }} 
                        style={styles.modalPhoto}
                        resizeMode="cover"
                        onError={(error) => {
                          console.error('Error loading photo:', error);
                        }}
                      />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <MaterialCommunityIcons name="image-broken-variant" size={48} color="#ccc" />
                        <Text style={styles.photoPlaceholderText}>Photo not available</Text>
                      </View>
                    )}
                    
                    <View style={styles.photoOverlay}>
                      <MaterialCommunityIcons name="fullscreen" size={20} color="#fff" />
                    </View>
                  </TouchableOpacity>

                  {/* Photo Info */}
                  {currentPhoto && (
                    <View style={styles.photoInfo}>
                      <Text style={styles.photoDate}>
                        📅 {new Date(currentPhoto.timestamp || currentPhoto.date).toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noPhotoContainer}>
                  <View style={[styles.noPhotoIcon, { backgroundColor: muscleGroup.color + '20' }]}>
                    <MaterialCommunityIcons 
                      name={muscleGroup.icon} 
                      size={48} 
                      color={muscleGroup.color} 
                    />
                  </View>
                  <Text style={styles.noPhotoTitle}>No photos yet</Text>
                  <Text style={styles.noPhotoSubtitle}>Take your first progress photo to get started</Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.primaryActionButton}
                onPress={handleRetake}
              >
                <MaterialCommunityIcons name="camera" size={20} color="#fff" />
                <Text style={styles.primaryActionButtonText}>
                  {reversedPhotos.length > 0 ? 'Take New Photo' : 'Take Photo'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Enhanced Measurements Section */}
            <View style={styles.measurementsSection}>
              <View style={styles.measurementHeader}>
                <View style={styles.sectionTitleContainer}>
                  <MaterialCommunityIcons name="ruler" size={24} color={muscleGroup.color} />
                  <Text style={styles.sectionTitle}>{measurementConfig.title}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.editToggleButton}
                  onPress={() => setIsEditing(!isEditing)}
                >
                  <MaterialCommunityIcons 
                    name={isEditing ? "check" : "pencil"} 
                    size={18} 
                    color={isEditing ? "#4CAF50" : "#666"} 
                  />
                  <Text style={[styles.editToggleText, isEditing && { color: '#4CAF50' }]}>
                    {isEditing ? 'Done' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Primary Measurements */}
              {primaryFields.length > 0 && (
                <View style={styles.measurementGroup}>
                  <Text style={styles.measurementGroupTitle}>Primary Measurements</Text>
                  <View style={styles.measurementGrid}>
                    {primaryFields.map((field) => (
                      <View key={field.key} style={styles.measurementFieldContainer}>
                        <Text style={styles.measurementLabel}>{field.label}</Text>
                        <View style={styles.measurementInputContainer}>
                          <TextInput
                            style={[
                              styles.measurementInput,
                              !isEditing && styles.measurementInputReadonly
                            ]}
                            value={measurementValues[field.key] || ''}
                            onChangeText={(value) => handleMeasurementChange(field.key, value)}
                            placeholder={field.placeholder}
                            keyboardType="numeric"
                            returnKeyType="next"
                            editable={isEditing}
                            selectTextOnFocus={isEditing}
                          />
                          <Text style={styles.measurementUnit}>{field.unit}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Secondary Measurements */}
              {secondaryFields.length > 0 && (
                <View style={styles.measurementGroup}>
                  <Text style={styles.measurementGroupTitle}>Additional Measurements</Text>
                  <View style={styles.measurementGrid}>
                    {secondaryFields.map((field) => (
                      <View key={field.key} style={styles.measurementFieldContainer}>
                        <Text style={styles.measurementLabel}>{field.label}</Text>
                        <View style={styles.measurementInputContainer}>
                          <TextInput
                            style={[
                              styles.measurementInput,
                              !isEditing && styles.measurementInputReadonly
                            ]}
                            value={measurementValues[field.key] || ''}
                            onChangeText={(value) => handleMeasurementChange(field.key, value)}
                            placeholder={field.placeholder}
                            keyboardType="numeric"
                            returnKeyType="next"
                            editable={isEditing}
                            selectTextOnFocus={isEditing}
                          />
                          <Text style={styles.measurementUnit}>{field.unit}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Notes Section */}
              <View style={styles.notesSection}>
                <Text style={styles.measurementGroupTitle}>📝 Notes & Progress</Text>
                <TextInput
                  style={[
                    styles.notesInput,
                    !isEditing && styles.measurementInputReadonly
                  ]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add notes about your progress, workout, or how you're feeling..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={isEditing}
                  selectTextOnFocus={isEditing}
                />
              </View>

              {/* Save Button */}
              {isEditing && (
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Measurements</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </Animated.View>

        {/* Full Screen Image Modal */}
        {showFullScreenImage && currentPhoto && (
          <FullScreenImageModal
            visible={showFullScreenImage}
            onClose={() => setShowFullScreenImage(false)}
            imageUri={currentPhoto.uri}
            muscleGroupName={muscleGroup.name}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const CameraSettingsModal = ({ visible, onClose, settings, onSaveSettings }) => {
  const [tempSettings, setTempSettings] = useState(settings);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSaveSettings(tempSettings);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.modalHeaderContent}>
            <Text style={styles.modalTitle}>Camera Settings</Text>
            <Text style={styles.modalSubtitle}>Customize your photo experience</Text>
          </View>
          <TouchableOpacity onPress={handleSave} style={styles.saveSettingsButton}>
            <Text style={styles.saveSettingsText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.settingsContainer}>
            {/* Camera Type */}
            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>📷 Camera Type</Text>
              <View style={styles.optionGroup}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    tempSettings.cameraType === 'front' && styles.optionButtonActive
                  ]}
                  onPress={() => setTempSettings(prev => ({ ...prev, cameraType: 'front' }))}
                >
                  <MaterialCommunityIcons 
                    name="camera-front" 
                    size={20} 
                    color={tempSettings.cameraType === 'front' ? "#fff" : "#000"} 
                  />
                  <Text style={[
                    styles.optionText,
                    tempSettings.cameraType === 'front' && styles.optionTextActive
                  ]}>
                    Front Camera
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    tempSettings.cameraType === 'back' && styles.optionButtonActive
                  ]}
                  onPress={() => setTempSettings(prev => ({ ...prev, cameraType: 'back' }))}
                >
                  <MaterialCommunityIcons 
                    name="camera-rear" 
                    size={20} 
                    color={tempSettings.cameraType === 'back' ? "#fff" : "#000"} 
                  />
                  <Text style={[
                    styles.optionText,
                    tempSettings.cameraType === 'back' && styles.optionTextActive
                  ]}>
                    Back Camera
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Timer */}
            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>⏱️ Timer</Text>
              <View style={styles.optionGroup}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    tempSettings.timer === 0 && styles.optionButtonActive
                  ]}
                  onPress={() => setTempSettings(prev => ({ ...prev, timer: 0 }))}
                >
                  <MaterialCommunityIcons 
                    name="timer-off" 
                    size={20} 
                    color={tempSettings.timer === 0 ? "#fff" : "#000"} 
                  />
                  <Text style={[
                    styles.optionText,
                    tempSettings.timer === 0 && styles.optionTextActive
                  ]}>
                    No Timer
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    tempSettings.timer === 3 && styles.optionButtonActive
                  ]}
                  onPress={() => setTempSettings(prev => ({ ...prev, timer: 3 }))}
                >
                  <MaterialCommunityIcons 
                    name="timer-3" 
                    size={20} 
                    color={tempSettings.timer === 3 ? "#fff" : "#000"} 
                  />
                  <Text style={[
                    styles.optionText,
                    tempSettings.timer === 3 && styles.optionTextActive
                  ]}>
                    3 Seconds
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    tempSettings.timer === 10 && styles.optionButtonActive
                  ]}
                  onPress={() => setTempSettings(prev => ({ ...prev, timer: 10 }))}
                >
                  <MaterialCommunityIcons 
                    name="timer-10" 
                    size={20} 
                    color={tempSettings.timer === 10 ? "#fff" : "#000"} 
                  />
                  <Text style={[
                    styles.optionText,
                    tempSettings.timer === 10 && styles.optionTextActive
                  ]}>
                    10 Seconds
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Mirror Image */}
            {/*
            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>🪞 Mirror Image</Text>
              <View style={styles.optionGroup}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    !tempSettings.mirrorImage && styles.optionButtonActive
                  ]}
                  onPress={() => setTempSettings(prev => ({ ...prev, mirrorImage: false }))}
                >
                  <MaterialCommunityIcons 
                    name="camera" 
                    size={20} 
                    color={!tempSettings.mirrorImage ? "#fff" : "#000"} 
                  />
                  <Text style={[
                    styles.optionText,
                    !tempSettings.mirrorImage && styles.optionTextActive
                  ]}>
                    Normal (No Mirror)
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    tempSettings.mirrorImage && styles.optionButtonActive
                  ]}
                  onPress={() => setTempSettings(prev => ({ ...prev, mirrorImage: true }))}
                >
                  <MaterialCommunityIcons 
                    name="flip-horizontal" 
                    size={20} 
                    color={tempSettings.mirrorImage ? "#fff" : "#000"} 
                  />
                  <Text style={[
                    styles.optionText,
                    tempSettings.mirrorImage && styles.optionTextActive
                  ]}>
                    Mirrored
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            */}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const PhotoProgressScreen = ({ navigation }) => {
  const [photos, setPhotos] = useState({});
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [measurements, setMeasurements] = useState({});
  const [showCameraSettings, setShowCameraSettings] = useState(false);
  const [cameraSettings, setCameraSettings] = useState({
    cameraType: 'front', // 'front' or 'back'
    timer: 0, // 0 = no timer, 3 = 3 seconds, 10 = 10 seconds
  });
  const [showCustomCamera, setShowCustomCamera] = useState(false);
  const [currentMuscleGroup, setCurrentMuscleGroup] = useState(null);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const [fullScreenImageData, setFullScreenImageData] = useState(null);
  const [lastTap, setLastTap] = useState(null);
  const [tapTimeout, setTapTimeout] = useState(null);

  const muscleGroups = [
    { id: 'chest', name: 'Chest', icon: 'human-male', color: '#FF6B35' },
    { id: 'back', name: 'Back', icon: 'human-male-height', color: '#4CAF50' },
    { id: 'shoulders', name: 'Shoulders', icon: 'human-male-height', color: '#2196F3' },
    { id: 'arms', name: 'Arms', icon: 'arm-flex', color: '#9C27B0' },
    { id: 'legs', name: 'Legs', icon: 'human-male-height-variant', color: '#FF9800' },
    { id: 'abs', name: 'Abs', icon: 'human-male-board', color: '#E91E63' },
    { id: 'full-body', name: 'Full Body', icon: 'human-male', color: '#607D8B' },
    { id: 'side-profile', name: 'Side Profile', icon: 'human-male-child', color: '#795548' }
  ];

  // Improved tap detection for double tap
  const handleTap = async (muscleGroupId) => {
    try {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      
      // Light haptic feedback on tap
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Fallback to vibration if haptics not available
        Vibration.vibrate(25);
      }
      
      if (lastTap && (now - lastTap.time) < DOUBLE_TAP_DELAY && lastTap.muscleGroupId === muscleGroupId) {
        // Double tap detected
        if (tapTimeout) {
          clearTimeout(tapTimeout);
          setTapTimeout(null);
        }
        setLastTap(null);
        
        // Stronger haptic feedback for double tap
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
          Vibration.vibrate(50);
        }
        
        try {
          handleDoublePress(muscleGroupId);
        } catch (error) {
          console.error('Error in handleDoublePress:', error);
          Alert.alert('Error', 'Failed to open photo. Please try again.');
        }
      } else {
        // First tap or different muscle group
        setLastTap({ time: now, muscleGroupId });
        
        // Clear any existing timeout
        if (tapTimeout) {
          clearTimeout(tapTimeout);
        }
        
        // Set timeout for single tap
        const timeout = setTimeout(() => {
          try {
            handleCardPress(muscleGroupId);
          } catch (error) {
            console.error('Error in handleCardPress:', error);
            Alert.alert('Error', 'Failed to open photo. Please try again.');
          }
          setLastTap(null);
          setTapTimeout(null);
        }, DOUBLE_TAP_DELAY);
        
        setTapTimeout(timeout);
      }
    } catch (error) {
      console.error('Error in handleTap:', error);
      Alert.alert('Error', 'Failed to handle tap. Please try again.');
    }
  };

  const handleSwipeLeft = async () => {
    try {
      if (nextGroup && onMuscleGroupChange) {
        // Haptic feedback
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          // Fallback to vibration if haptics not available
          Vibration.vibrate(50);
        }
        
        // Animation
        Animated.sequence([
          Animated.timing(scaleAnimation, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          })
        ]).start();
        
        onMuscleGroupChange(nextGroup.id);
      }
    } catch (error) {
      console.error('Error in handleSwipeLeft:', error);
    }
  };

  const handleSwipeRight = async () => {
    try {
      if (prevGroup && onMuscleGroupChange) {
        // Haptic feedback
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          // Fallback to vibration if haptics not available
          Vibration.vibrate(50);
        }
        
        // Animation
        Animated.sequence([
          Animated.timing(scaleAnimation, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          })
        ]).start();
        
        onMuscleGroupChange(prevGroup.id);
      }
    } catch (error) {
      console.error('Error in handleSwipeRight:', error);
    }
  };

  const handleLongPress = async (muscleGroupId) => {
    // Long press always opens camera directly
    
    // Strong haptic feedback for long press
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      Vibration.vibrate(100);
    }
    
    setCurrentMuscleGroup(muscleGroupId);
    setShowCustomCamera(true);
  };

  const handleDoublePress = (muscleGroupId) => {
    try {
      const hasPhotos = photos[muscleGroupId] && Array.isArray(photos[muscleGroupId]) && photos[muscleGroupId].length > 0;
      
      if (hasPhotos) {
        // Double tap shows photo in full screen
        const muscleGroup = muscleGroups.find(g => g.id === muscleGroupId);
        const latestPhoto = photos[muscleGroupId][photos[muscleGroupId].length - 1];
        
        if (latestPhoto && latestPhoto.uri) {
          setFullScreenImageData({
            uri: latestPhoto.uri,
            muscleGroupName: muscleGroup?.name
          });
          setShowFullScreenImage(true);
        } else {
          // If photo data is corrupted, open camera instead
          setCurrentMuscleGroup(muscleGroupId);
          setShowCustomCamera(true);
        }
      } else {
        // If no photo, open camera
        setCurrentMuscleGroup(muscleGroupId);
        setShowCustomCamera(true);
      }
    } catch (error) {
      console.error('Error in handleDoublePress:', error);
      // Fallback to opening camera
      setCurrentMuscleGroup(muscleGroupId);
      setShowCustomCamera(true);
    }
  };

  useEffect(() => {
    loadPhotos();
    requestPermissions();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeout) {
        clearTimeout(tapTimeout);
      }
    };
  }, [tapTimeout]);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and media library permissions are needed to take and save photos.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadPhotos = async () => {
    try {
      const today = new Date().toDateString();
      const savedPhotos = await AsyncStorage.getItem(`progress_photos_${today}`);
      const savedMeasurements = await AsyncStorage.getItem(`progress_measurements_${today}`);
      
      if (savedPhotos) {
        const parsedPhotos = JSON.parse(savedPhotos);
        console.log('Loaded photos from storage:', parsedPhotos);
        
        // Convert legacy single photo format to array format
        const convertedPhotos = {};
        Object.keys(parsedPhotos).forEach(muscleGroupId => {
          const photoData = parsedPhotos[muscleGroupId];
          if (Array.isArray(photoData)) {
            // Already in array format
            convertedPhotos[muscleGroupId] = photoData;
          } else if (photoData && typeof photoData === 'object' && photoData.uri) {
            // Legacy single photo format - convert to array
            console.log(`Converting legacy photo for ${muscleGroupId} to array format`);
            convertedPhotos[muscleGroupId] = [photoData];
          }
        });
        
        console.log('Converted photos:', convertedPhotos);
        setPhotos(convertedPhotos);
      }
      
      if (savedMeasurements) {
        setMeasurements(JSON.parse(savedMeasurements));
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      // Don't throw error here, just log it and continue with empty state
      setPhotos({});
      setMeasurements({});
    }
  };

  const savePhotos = async (newPhotos) => {
    try {
      console.log('savePhotos called with:', newPhotos);
      const today = new Date().toDateString();
      const key = `progress_photos_${today}`;
      const jsonString = JSON.stringify(newPhotos);
      console.log('Saving to AsyncStorage with key:', key);
      console.log('JSON string length:', jsonString.length);
      await AsyncStorage.setItem(key, jsonString);
      console.log('Successfully saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving photos to AsyncStorage:', error);
      throw new Error(`Failed to save photos: ${error.message}`);
    }
  };

  const saveMeasurements = async (newMeasurements) => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(`progress_measurements_${today}`, JSON.stringify(newMeasurements));
    } catch (error) {
      console.error('Error saving measurements:', error);
    }
  };

  const takePhoto = async (muscleGroupId) => {
    setCurrentMuscleGroup(muscleGroupId);
    setShowCustomCamera(true);
  };

  const retakePhoto = async (muscleGroupId) => {
    try {
      console.log('Retaking photo for muscle group:', muscleGroupId);
      
      // Close the photo detail modal first
      setShowPhotoModal(false);
      
      // Small delay to ensure modal is closed
      setTimeout(() => {
        console.log('Opening camera for retake');
        setCurrentMuscleGroup(muscleGroupId);
        setShowCustomCamera(true);
      }, 300);
    } catch (error) {
      console.error('Error in retakePhoto:', error);
      Alert.alert('Error', 'Failed to open camera for retake. Please try again.');
    }
  };

  const handlePhotoTaken = async (photoUri) => {
    try {
      console.log('handlePhotoTaken called with:', photoUri);
      console.log('currentMuscleGroup:', currentMuscleGroup);
      console.log('current photos state:', photos);
      
      // Ensure we have a valid muscle group and photo URI
      if (!currentMuscleGroup) {
        throw new Error('No muscle group selected');
      }
      
      if (!photoUri) {
        throw new Error('No photo URI provided');
      }
      
      // Get current photos for this muscle group and ensure it's an array
      const currentPhotos = photos[currentMuscleGroup];
      console.log('currentPhotos for', currentMuscleGroup, ':', currentPhotos);
      
      let photoArray = [];
      if (currentPhotos) {
        if (Array.isArray(currentPhotos)) {
          photoArray = [...currentPhotos]; // Create a copy to avoid mutations
        } else if (currentPhotos && typeof currentPhotos === 'object' && currentPhotos.uri) {
          // Handle legacy single photo format - convert to array
          console.log('Converting legacy photo to array format');
          photoArray = [currentPhotos];
        }
      }
      
      console.log('photoArray before adding new photo:', photoArray);
      
      // Create new photo object
      const newPhoto = {
        uri: photoUri,
        timestamp: new Date().toISOString(),
        date: new Date().toDateString(),
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      console.log('newPhoto:', newPhoto);
      
      // Create new photos object with the added photo
      const updatedPhotoArray = [...photoArray, newPhoto];
      console.log('updatedPhotoArray:', updatedPhotoArray);
      
      const newPhotos = {
        ...photos,
        [currentMuscleGroup]: updatedPhotoArray
      };
      
      console.log('newPhotos state:', newPhotos);
      
      // Update state first
      setPhotos(newPhotos);
      
      // Then save to storage
      await savePhotos(newPhotos);
      
      console.log('Photo saved successfully');
      
      // Don't close the camera modal or open photo modal
      // Just show success feedback and allow user to take more photos
      
    } catch (error) {
      console.error('Error handling photo:', error);
      console.error('Error stack:', error.stack);
      Alert.alert('Error', `Failed to save photo: ${error.message}. Please try again.`);
    }
  };

  const handleCardPress = (muscleGroupId) => {
    try {
      const hasPhotos = photos[muscleGroupId] && Array.isArray(photos[muscleGroupId]) && photos[muscleGroupId].length > 0;
      
      if (hasPhotos) {
        // Show photo in modal
        setSelectedMuscleGroup(muscleGroupId);
        setShowPhotoModal(true);
      } else {
        // Take new photo
        takePhoto(muscleGroupId);
      }
    } catch (error) {
      console.error('Error in handleCardPress:', error);
      Alert.alert('Error', 'Failed to open photo. Please try again.');
    }
  };

  const handleSaveMeasurements = async (muscleGroupId, measurementData) => {
    const newMeasurements = {
      ...measurements,
      [muscleGroupId]: {
        ...measurementData,
        timestamp: new Date().toISOString(),
        date: new Date().toDateString()
      }
    };
    
    setMeasurements(newMeasurements);
    await saveMeasurements(newMeasurements);
    setShowPhotoModal(false);
  };

  const handleDeletePhoto = () => {
    if (!currentPhoto || !onDeletePhoto) return;
    
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              const originalIndex = photos.length - 1 - safeSelectedIndex;
              onDeletePhoto(originalIndex);
              
              if (reversedPhotos.length <= 1) {
                setSelectedPhotoIndex(0);
              } else if (safeSelectedIndex >= reversedPhotos.length - 1) {
                setSelectedPhotoIndex(Math.max(0, reversedPhotos.length - 2));
              }
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'Failed to delete photo. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeletePhotoFromModal = async (photoIndex) => {
    try {
      if (!selectedMuscleGroup) return;
      
      const currentPhotos = photos[selectedMuscleGroup];
      if (!currentPhotos || !Array.isArray(currentPhotos) || photoIndex < 0 || photoIndex >= currentPhotos.length) {
        throw new Error('Invalid photo index');
      }

      // Create new photos array without the deleted photo
      const updatedPhotos = [...currentPhotos];
      updatedPhotos.splice(photoIndex, 1);

      // Update the photos state
      const newPhotos = {
        ...photos,
        [selectedMuscleGroup]: updatedPhotos.length > 0 ? updatedPhotos : undefined
      };

      // Remove the muscle group entirely if no photos left
      if (updatedPhotos.length === 0) {
        delete newPhotos[selectedMuscleGroup];
      }

      setPhotos(newPhotos);
      await savePhotos(newPhotos);

      // Close modal if no photos left
      if (updatedPhotos.length === 0) {
        setShowPhotoModal(false);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      Alert.alert('Error', 'Failed to delete photo. Please try again.');
    }
  };

  const getTodayProgress = () => {
    const totalGroups = muscleGroups.length;
    const completedGroups = Object.keys(photos).filter(key => 
      photos[key] && Array.isArray(photos[key]) && photos[key].length > 0
    ).length;
    const totalPhotos = Object.values(photos).reduce((sum, photoArray) => 
      sum + (photoArray && Array.isArray(photoArray) ? photoArray.length : 0), 0
    );
    return { completed: completedGroups, total: totalGroups, totalPhotos };
  };

  const progress = getTodayProgress();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Progress Photos</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{progress.completed}/{progress.total}</Text>
        </View>
        {progress.totalPhotos > 0 && (
          <View style={styles.photoBadge}>
            <MaterialCommunityIcons name="camera" size={12} color="#666" />
            <Text style={styles.photoBadgeText}>{progress.totalPhotos}</Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowCameraSettings(true)}
        >
          <MaterialCommunityIcons name="cog" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(progress.completed / progress.total) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressLabel}>
          {progress.completed === progress.total 
            ? `All muscle groups completed! 🎉 (${progress.totalPhotos} photos total)` 
            : `${progress.total - progress.completed} muscle groups remaining • ${progress.totalPhotos} photos taken`
          }
        </Text>
      </View>

      {/* Muscle Groups Grid */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <View style={styles.gridContainer}>
          {muscleGroups.map((group) => {
            const groupPhotos = photos[group.id];
            let hasPhotos = false;
            let latestPhoto = null;
            
            try {
              // Safely check if photos exist and are valid
              if (groupPhotos) {
                if (Array.isArray(groupPhotos) && groupPhotos.length > 0) {
                  hasPhotos = true;
                  latestPhoto = groupPhotos[groupPhotos.length - 1];
                } else if (groupPhotos && typeof groupPhotos === 'object' && groupPhotos.uri) {
                  // Handle legacy single photo format
                  hasPhotos = true;
                  latestPhoto = groupPhotos;
                }
              }
            } catch (error) {
              console.error(`Error processing photos for ${group.id}:`, error);
              hasPhotos = false;
              latestPhoto = null;
            }

            return (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.muscleCard,
                  hasPhotos && styles.muscleCardWithPhoto
                ]}
                onPress={() => handleTap(group.id)}
                onLongPress={() => handleLongPress(group.id)}
                activeOpacity={0.8}
              >
                {hasPhotos && latestPhoto ? (
                  // Card with photo
                  <View style={styles.cardWithPhoto}>
                    <Image 
                      source={{ uri: latestPhoto.uri }} 
                      style={styles.musclePhoto}
                      onError={(error) => {
                        console.error(`Error loading photo for ${group.id}:`, error);
                      }}
                    />
                    <View style={styles.photoCardOverlay}>
                      <View style={styles.photoCardHeader}>
                        <MaterialCommunityIcons 
                          name="check-circle" 
                          size={24} 
                          color="#fff" 
                        />
                        <MaterialCommunityIcons 
                          name={group.icon} 
                          size={20} 
                          color="#fff" 
                        />
                      </View>
                      <View style={styles.photoCardFooter}>
                        <Text style={styles.photoCardTitle}>{group.name}</Text>
                        <Text style={styles.photoCardSubtitle}>
                          {Array.isArray(groupPhotos) ? groupPhotos.length : 1} photo{Array.isArray(groupPhotos) && groupPhotos.length !== 1 ? 's' : ''}
                        </Text>
                        <MaterialCommunityIcons 
                          name="eye" 
                          size={16} 
                          color="rgba(255, 255, 255, 0.8)" 
                        />
                      </View>
                    </View>
                  </View>
                ) : (
                  // Card without photo
                  <View style={styles.cardWithoutPhoto}>
                    <View style={styles.iconContainer}>
                      <MaterialCommunityIcons 
                        name={group.icon} 
                        size={48} 
                        color="#e0e0e0" 
                      />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.muscleTitle}>{group.name}</Text>
                      <Text style={styles.muscleSubtitle}>Tap to add photo</Text>
                    </View>
                    <View style={styles.cardActions}>
                      <MaterialCommunityIcons 
                        name="camera-plus" 
                        size={20} 
                        color="#000" 
                      />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>📸 Photo Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Use consistent lighting and background</Text>
            <Text style={styles.tipItem}>• Take photos at the same time of day</Text>
            <Text style={styles.tipItem}>• Maintain similar poses and angles</Text>
            <Text style={styles.tipItem}>• Wear similar clothing for comparison</Text>
            <Text style={styles.tipItem}>• Take photos weekly for best results</Text>
          </View>
        </View>
      </ScrollView>

      {/* Photo Detail Modal */}
      <PhotoDetailModal
        visible={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        muscleGroup={selectedMuscleGroup ? muscleGroups.find(g => g.id === selectedMuscleGroup) : null}
        photos={selectedMuscleGroup && photos[selectedMuscleGroup] && Array.isArray(photos[selectedMuscleGroup]) ? photos[selectedMuscleGroup] : []}
        measurements={selectedMuscleGroup ? measurements[selectedMuscleGroup] : null}
        onSaveMeasurements={(measurementData) => handleSaveMeasurements(selectedMuscleGroup, measurementData)}
        onRetakePhoto={() => {
          console.log('onRetakePhoto called with selectedMuscleGroup:', selectedMuscleGroup);
          if (selectedMuscleGroup) {
            retakePhoto(selectedMuscleGroup);
          } else {
            console.error('selectedMuscleGroup is null or undefined');
            Alert.alert('Error', 'Unable to retake photo. Please try again.');
          }
        }}
        onDeletePhoto={handleDeletePhotoFromModal}
      />

      {/* Camera Settings Modal */}
      <CameraSettingsModal
        visible={showCameraSettings}
        onClose={() => setShowCameraSettings(false)}
        settings={cameraSettings}
        onSaveSettings={setCameraSettings}
      />

      {/* Custom Camera Modal */}
      <CustomCameraModal
        visible={showCustomCamera}
        onClose={() => setShowCustomCamera(false)}
        onPhotoTaken={handlePhotoTaken}
        cameraSettings={cameraSettings}
        onUpdateCameraSettings={setCameraSettings}
        muscleGroup={currentMuscleGroup ? muscleGroups.find(g => g.id === currentMuscleGroup) : null}
        onMuscleGroupChange={(newMuscleGroupId) => setCurrentMuscleGroup(newMuscleGroupId)}
        allMuscleGroups={muscleGroups}
      />

      {/* Full Screen Image Modal */}
      <FullScreenImageModal
        visible={showFullScreenImage}
        onClose={() => setShowFullScreenImage(false)}
        imageUri={fullScreenImageData?.uri || null}
        muscleGroupName={fullScreenImageData?.muscleGroupName || 'Photo'}
      />
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  progressBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 4,
  },
  progressLabel: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    backgroundColor: '#f8f9fa',
    minHeight: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
  },
  muscleCard: {
    width: (width - 60) / 2,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  muscleCardCompleted: {
    borderWidth: 2,
    borderColor: '#000',
  },
  cardTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
  },
  cardOverlayCompleted: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
    textAlign: 'center',
  },
  cardTitleCompleted: {
    color: '#fff',
  },
  completedInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  completedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedTime: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.8,
    marginTop: 2,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  swipeHints: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    textAlign: 'center',
  },
  tipsContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalContainerInner: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 8,
    marginRight: 10,
  },
  modalHeaderContent: {
    flex: 1,
  },
  muscleGroupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffebee',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  photoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoContainer: {
    backgroundColor: '#fff',
  },
  photoNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  navButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  photoCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  photoDisplay: {
    position: 'relative',
    aspectRatio: 3/4,
    backgroundColor: '#f8f9fa',
  },
  modalPhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  photoPlaceholderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  photoOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  photoInfo: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  photoDate: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  noPhotoContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  noPhotoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
  },
  noPhotoSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  measurementsSection: {
    flex: 1,
  },
  measurementsContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  measurementField: {
    marginBottom: 15,
  },
  measurementLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  measurementInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#000',
  },
  notesField: {
    marginBottom: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#000',
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoContainer: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fullPhoto: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  measurementRow: {
    marginBottom: 15,
  },
  fullWidthInput: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#000',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 50, // Increased from 20 to 50 (30px more) to move buttons up when keyboard is shown
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 15,
  },

  // Full Screen Image Modal Styles
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  fullScreenOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  fullScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  fullScreenCloseButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
  fullScreenTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fullScreenPlaceholder: {
    width: 45,
  },
  fullScreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  fullScreenFooter: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  fullScreenHint: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },

  // Settings Button Styles
  settingsButton: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },

  // Camera Settings Modal Styles
  saveSettingsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  saveSettingsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingsContainer: {
    padding: 20,
  },
  settingSection: {
    marginBottom: 30,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  optionGroup: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#fff',
  },

  // Custom Camera Modal Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraSwipeIndicator: {
    position: 'absolute',
    top: 8, // Moved down slightly from top edge
    left: 0,
    right: 0,
    height: 20, // Reduced height from 40 to 20
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    // backgroundColor: 'rgba(0, 0, 0, 0.3)', // REMOVED: Extra overlay background
  },
  cameraSwipeHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Increased opacity from 0.6 to 0.8
    borderRadius: 2,
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cameraHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 35, // Reduced from 40 to 35 since drag handle is smaller now
    paddingHorizontal: 15, // Reduced from 20 to 15
    paddingBottom: 10, // Reduced from 15 to 10
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  cameraHeaderButton: {
    padding: 8, // Reduced from 10 to 8
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20, // Reduced from 25 to 20
    minWidth: 40, // Added minimum width for consistency
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10, // Added horizontal padding for tighter spacing
  },
  muscleGroupHeaderInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2, // Reduced spacing between elements
  },
  muscleGroupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Reduced from 8 to 6
  },
  cameraTitle: {
    fontSize: 16, // Reduced from 18 to 16
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraSubtitle: {
    fontSize: 12, // Reduced from 13 to 12
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  cameraHint: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  cameraHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  headerControlsDropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
    zIndex: 100,
  },
  dropdownButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownButtonText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 1,
    textAlign: 'center',
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Keep space-between for camera switch button
    paddingVertical: 10,
    paddingHorizontal: 5, // Added horizontal padding for better spacing
  },
  timerIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    width: 70, // Fixed width instead of minWidth
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  swipeTouchZone: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: -20,
    marginVertical: -15,
    minHeight: 120,
    justifyContent: 'center',
  },
  captureArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Changed back to center for tighter grouping
    paddingHorizontal: 5,
    paddingVertical: 5,
    flex: 1, // Added to take available space
    maxWidth: 260, // Increased from 220 to accommodate wider buttons
    gap: 6, // Reduced gap slightly for tighter fit
  },
  muscleGroupLeft: {
    alignItems: 'center',
    paddingHorizontal: 3, // Reduced horizontal padding
    paddingVertical: 2, // Reduced vertical padding
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    width: 65, // Increased from 50 to accommodate longer text
    height: 35,
    justifyContent: 'center', // Added for better centering
  },
  muscleGroupRight: {
    alignItems: 'center',
    paddingHorizontal: 3, // Reduced horizontal padding
    paddingVertical: 2, // Reduced vertical padding
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    width: 65, // Increased from 50 to accommodate longer text
    height: 35,
    justifyContent: 'center', // Added for better centering
  },
  muscleGroupSideLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 7, // Reduced from 8 to fit longer text better
    fontWeight: '500',
    marginTop: 1,
    textAlign: 'center',
  },
  captureButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0, // Don't flex to maintain fixed size
    minWidth: 80, // Reduced from 100 for tighter grouping
  },
  muscleGroupIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    marginBottom: 6,
    gap: 4,
  },
  muscleGroupLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center',
  },
  swipeHint: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  swipeHintText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 7,
    fontWeight: '500',
    textAlign: 'center',
  },
  cameraSwitchButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    width: 70, // Fixed width instead of minWidth
    alignItems: 'center',
    justifyContent: 'center', // Added for better centering
  },
  cameraPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
  permissionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 2,
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#fff',
  },
  countdownSubtext: {
    fontSize: 18,
    color: '#fff',
    marginTop: 20,
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
    marginLeft: -40,
    marginTop: -40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 40,
    zIndex: 2,
  },
  swipeDirectionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  snapchatStylePanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 180,
    background: 'linear-gradient(to left, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.3), transparent)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingTop: 140,
    paddingRight: 15,
    paddingLeft: 30,
    paddingBottom: 120,
    zIndex: 100,
    justifyContent: 'flex-start',
  },
  snapchatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: 18,
    backgroundColor: 'transparent',
  },
  snapchatOptionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'right',
    marginRight: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  snapchatOptionIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  snapchatOptionBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: '#FF3040',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    textAlign: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  compactDropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
    zIndex: 100,
  },
  compactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 2,
  },
  compactOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'right',
    marginRight: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  compactOptionButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 10,
  },
  photoBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 5,
  },
  photoCountBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: '#FF3040',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    textAlign: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  photoCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  photoGallery: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  photoNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  photoNavLeft: {
    left: 10,
  },
  photoNavRight: {
    right: 10,
  },
  photoImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 15,
    gap: 8,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  photoIndicatorActive: {
    backgroundColor: '#000',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  photoInfo: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 15,
  },
  photoInfoText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  modernPhotoContainer: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  photoHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  photoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  photoCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  photoHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  photoDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  photoTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  swipeablePhotoGallery: {
    position: 'relative',
    height: 300,
    backgroundColor: '#000',
  },
  mainPhotoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  modernNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  modernNavLeft: {
    left: 15,
  },
  modernNavRight: {
    right: 15,
  },
  modernPhotoIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  modernPhotoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modernPhotoIndicatorActive: {
    backgroundColor: '#000',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  thumbnailContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  thumbnailContent: {
    gap: 10,
  },
  thumbnailButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailButtonActive: {
    borderColor: '#000',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailActiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  noPhotoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noPhotoText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  muscleCardWithPhoto: {
    borderWidth: 2,
    borderColor: '#000',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musclePhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#000',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#333',
  },
  muscleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  muscleSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  cardInfo: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cardActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWithPhoto: {
    flex: 1,
    position: 'relative',
  },
  photoCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Increased from 0.4 to 0.7 for better visibility
    justifyContent: 'space-between',
    padding: 20,
  },
  photoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoCardFooter: {
    alignItems: 'flex-start',
  },
  photoCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  photoCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardWithoutPhoto: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#000',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#333',
  },
  muscleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  muscleSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 12,
  },
  cardActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  swipeHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
  },
  swipeIndicator: {
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  navigationHint: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  navigationHintText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 7,
    fontWeight: '500',
    textAlign: 'center',
  },
  leftSpacer: {
    width: 70, // Same width as cameraSwitchButton to balance layout
  },
  // Enhanced Modal Styles
  enhancedModalHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 15,
  },
  muscleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  photoSection: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  photoNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  photoIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  photoIndicatorActive: {
    backgroundColor: '#007AFF',
    width: 20,
  },
  photoDisplay: {
    position: 'relative',
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalPhoto: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
  },
  photoPlaceholder: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  photoPlaceholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  photoOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  photoInfo: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  photoDate: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  noPhotoContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noPhotoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noPhotoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  noPhotoSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  primaryActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  measurementsSection: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  measurementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  editToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  measurementGroup: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  measurementGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  measurementGrid: {
    gap: 15,
  },
  measurementFieldContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
  },
  measurementLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  measurementInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
  },
  measurementInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  measurementInputReadonly: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  measurementUnit: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 8,
  },
  notesSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notesInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 30,
  },
});

export default PhotoProgressScreen; 
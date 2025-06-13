import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  Vibration,
  Platform,
  Alert,
  StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const SmartAICamera = ({ 
  visible, 
  onClose, 
  exercise, 
  targetSets, 
  targetReps, 
  onWorkoutComplete,
  onSetComplete 
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentReps, setCurrentReps] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [flashMode, setFlashMode] = useState('off');
  const [cameraType, setCameraType] = useState('front');
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Animation values
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const feedbackAnimation = useRef(new Animated.Value(0)).current;
  const restTimerAnimation = useRef(new Animated.Value(0)).current;

  // AI Detection simulation (in real app, this would use ML/CV)
  const [lastMovementTime, setLastMovementTime] = useState(0);
  const [movementBuffer, setMovementBuffer] = useState([]);
  const [isInPosition, setIsInPosition] = useState(false);

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission().catch(error => {
        console.error('Error requesting camera permission:', error);
      });
    }
  }, [visible, permission]);

  // Workout timer
  useEffect(() => {
    let interval;
    if (visible && isRecording) {
      interval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, isRecording]);

  // Rest timer
  useEffect(() => {
    let interval;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            playRestCompleteAnimation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isResting, restTimer]);

  // PanResponder for swipe-to-dismiss
  const dismissPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const isVerticalSwipe = gestureState.dy > 20 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      const isFromTopArea = evt.nativeEvent.pageY < 150;
      return isVerticalSwipe && isFromTopArea;
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 150 || (gestureState.dy > 50 && gestureState.vy > 0.8)) {
        handleClose();
      }
    },
  });

  const handleClose = () => {
    setIsRecording(false);
    setIsAnalyzing(false);
    setCurrentSet(1);
    setCurrentReps(0);
    setWorkoutTimer(0);
    setIsResting(false);
    setRestTimer(0);
    onClose();
  };

  const startAnalysis = async () => {
    if (!isRecording) {
      setIsRecording(true);
      setIsAnalyzing(true);
      setShowInstructions(false);
      
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        Vibration.vibrate(100);
      }

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  };

  const stopAnalysis = () => {
    setIsRecording(false);
    setIsAnalyzing(false);
    pulseAnimation.stopAnimation();
    pulseAnimation.setValue(1);
  };

  // Simulated rep detection (in real app, this would use computer vision)
  const detectRep = () => {
    if (!isRecording) return;

    setCurrentReps(prev => {
      const newReps = prev + 1;
      
      // Rep complete feedback
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        Vibration.vibrate(50);
      }

      // Check if set is complete
      if (newReps >= targetReps) {
        completeSet();
        return 0; // Reset reps for next set
      }

      return newReps;
    });

    // Visual feedback animation
    Animated.sequence([
      Animated.timing(feedbackAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(feedbackAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const completeSet = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Vibration.vibrate([100, 50, 100]);
    }

    if (onSetComplete) {
      onSetComplete(currentSet, targetReps);
    }

    // Check if workout is complete
    if (currentSet >= targetSets) {
      completeWorkout();
      return;
    }

    // Start rest timer
    setIsResting(true);
    setRestTimer(90); // 90 seconds rest
    setCurrentSet(prev => prev + 1);
    stopAnalysis();

    // Rest timer animation
    Animated.timing(restTimerAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const completeWorkout = () => {
    stopAnalysis();
    
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Vibration.vibrate([200, 100, 200, 100, 200]);
    }

    if (onWorkoutComplete) {
      onWorkoutComplete({
        exercise: exercise.name,
        sets: targetSets,
        reps: targetReps,
        duration: workoutTimer
      });
    }

    Alert.alert(
      '🎉 Set Klar!',
      `Du har slutfört ${targetSets} set av ${exercise.name}!\n\nTid: ${formatTime(workoutTimer)}`,
      [
        { text: 'Fortsätt', onPress: () => {} },
        { text: 'Avsluta', onPress: handleClose }
      ]
    );
  };

  const playRestCompleteAnimation = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      Vibration.vibrate([100, 50, 100, 50, 100]);
    }

    Animated.timing(restTimerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimer(0);
    playRestCompleteAnimation();
  };

  const toggleFlash = () => {
    setFlashMode(current => current === 'off' ? 'on' : 'off');
  };

  const toggleCamera = () => {
    setCameraType(current => current === 'front' ? 'back' : 'front');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Kamera behörighet krävs</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Tillåt Kamera</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />
      <View style={styles.container} {...dismissPanResponder.panHandlers}>
        
        {/* Camera View */}
        <CameraView
          style={styles.camera}
          facing={cameraType}
          flash={flashMode}
          ref={ref => setCameraRef(ref)}
        >
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseTitle}>{exercise?.name}</Text>
              <Text style={styles.exerciseSubtitle}>
                {currentSet}/{targetSets} set • {targetReps} reps
              </Text>
            </View>

            <TouchableOpacity onPress={() => setShowStats(!showStats)} style={styles.statsButton}>
              <MaterialCommunityIcons name="chart-line" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Instructions Overlay */}
          {showInstructions && (
            <View style={styles.instructionsOverlay}>
              <View style={styles.instructionsCard}>
                <MaterialCommunityIcons name="dumbbell" size={32} color="#4CAF50" />
                <Text style={styles.instructionsTitle}>Smart AI Träning</Text>
                <Text style={styles.instructionsText}>
                  Positionera dig framför kameran och tryck på start för att börja räkna dina reps automatiskt.
                </Text>
                <View style={styles.instructionSteps}>
                  <Text style={styles.stepText}>1. Ställ dig så kameran ser hela rörelsen</Text>
                  <Text style={styles.stepText}>2. Tryck på start-knappen</Text>
                  <Text style={styles.stepText}>3. Utför övningen med kontrollerade rörelser</Text>
                </View>
              </View>
            </View>
          )}

          {/* AI Analysis Indicator */}
          {isAnalyzing && (
            <View style={styles.analysisIndicator}>
              <Animated.View style={[
                styles.analysisIcon,
                { transform: [{ scale: pulseAnimation }] }
              ]}>
                <MaterialCommunityIcons name="eye" size={24} color="#4CAF50" />
              </Animated.View>
              <Text style={styles.analysisText}>AI Analyserar...</Text>
            </View>
          )}

          {/* Rep Counter */}
          {isRecording && (
            <View style={styles.repCounter}>
              <Animated.View style={[
                styles.repDisplay,
                {
                  transform: [{
                    scale: feedbackAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.3]
                    })
                  }]
                }
              ]}>
                <Text style={styles.repNumber}>{currentReps}</Text>
                <Text style={styles.repLabel}>/{targetReps} reps</Text>
              </Animated.View>
              
              <View style={styles.setInfo}>
                <Text style={styles.setNumber}>Set {currentSet}/{targetSets}</Text>
                <Text style={styles.workoutTime}>{formatTime(workoutTimer)}</Text>
              </View>
            </View>
          )}

          {/* Rest Timer */}
          {isResting && (
            <Animated.View style={[
              styles.restOverlay,
              {
                opacity: restTimerAnimation,
                transform: [{
                  scale: restTimerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })
                }]
              }
            ]}>
              <View style={styles.restCard}>
                <MaterialCommunityIcons name="timer" size={48} color="#FF9800" />
                <Text style={styles.restTitle}>Vila</Text>
                <Text style={styles.restTimer}>{formatTime(restTimer)}</Text>
                <Text style={styles.restMessage}>
                  Nästa set: {currentSet}/{targetSets}
                </Text>
                <TouchableOpacity onPress={skipRest} style={styles.skipRestButton}>
                  <Text style={styles.skipRestText}>Hoppa över vila</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Stats Panel */}
          {showStats && (
            <View style={styles.statsPanel}>
              <Text style={styles.statsTitle}>Träningsstatistik</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{currentSet - 1}</Text>
                  <Text style={styles.statLabel}>Färdiga set</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{(currentSet - 1) * targetReps + currentReps}</Text>
                  <Text style={styles.statLabel}>Totala reps</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatTime(workoutTimer)}</Text>
                  <Text style={styles.statLabel}>Tid</Text>
                </View>
              </View>
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            
            {/* Camera Controls */}
            <View style={styles.cameraControls}>
              <TouchableOpacity onPress={toggleFlash} style={styles.controlButton}>
                <MaterialCommunityIcons 
                  name={flashMode === 'off' ? 'flash-off' : 'flash'} 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={toggleCamera} style={styles.controlButton}>
                <MaterialCommunityIcons name="camera-flip" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Main Action Button */}
            <View style={styles.actionContainer}>
              {!isRecording && !isResting ? (
                <TouchableOpacity onPress={startAnalysis} style={styles.startButton}>
                  <Animated.View style={[
                    styles.startButtonInner,
                    { transform: [{ scale: scaleAnimation }] }
                  ]}>
                    <MaterialCommunityIcons name="play" size={32} color="#fff" />
                  </Animated.View>
                  <Text style={styles.startButtonText}>Starta AI Räkning</Text>
                </TouchableOpacity>
              ) : isRecording ? (
                <TouchableOpacity onPress={stopAnalysis} style={styles.stopButton}>
                  <View style={styles.stopButtonInner}>
                    <MaterialCommunityIcons name="pause" size={32} color="#fff" />
                  </View>
                  <Text style={styles.stopButtonText}>Pausa</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Manual Rep Button (for testing/backup) */}
            {isRecording && (
              <View style={styles.manualControls}>
                <TouchableOpacity onPress={detectRep} style={styles.manualRepButton}>
                  <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                  <Text style={styles.manualRepText}>Manuell Rep</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </CameraView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  exerciseTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  exerciseSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },
  statsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 16,
  },
  instructionsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  instructionSteps: {
    alignSelf: 'stretch',
  },
  stepText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    paddingLeft: 8,
  },
  analysisIndicator: {
    position: 'absolute',
    top: 140,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    padding: 12,
  },
  analysisIcon: {
    marginBottom: 4,
  },
  analysisText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  repCounter: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  repDisplay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  repNumber: {
    color: '#4CAF50',
    fontSize: 48,
    fontWeight: 'bold',
  },
  repLabel: {
    color: '#fff',
    fontSize: 18,
    marginTop: 4,
  },
  setInfo: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  setNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutTime: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  restOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 280,
  },
  restTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  restTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF9800',
    marginVertical: 16,
  },
  restMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  skipRestButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  skipRestText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsPanel: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 15,
    padding: 16,
  },
  statsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  startButton: {
    alignItems: 'center',
  },
  startButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    alignItems: 'center',
  },
  stopButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF5722',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  manualControls: {
    alignItems: 'center',
  },
  manualRepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  manualRepText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default SmartAICamera; 
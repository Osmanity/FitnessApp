import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  Modal,
  Alert,
  Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Exercise database with detailed information
const exerciseDatabase = {
  'Bench Press': {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'Chest',
    primaryMuscles: ['Chest', 'Triceps', 'Front Deltoids'],
    secondaryMuscles: ['Core'],
    equipment: 'Barbell, Bench',
    difficulty: 'Intermediate',
    description: 'The bench press is a compound exercise that primarily targets the chest muscles. It\'s one of the most popular exercises for building upper body strength and mass.',
    instructions: [
      'Lie flat on the bench with your eyes under the barbell',
      'Grip the bar with hands slightly wider than shoulder-width',
      'Plant your feet firmly on the ground',
      'Unrack the bar and position it over your chest',
      'Lower the bar to your chest in a controlled manner',
      'Press the bar back up to the starting position',
      'Keep your core tight throughout the movement'
    ],
    tips: [
      'Keep your shoulder blades retracted',
      'Don\'t bounce the bar off your chest',
      'Maintain a slight arch in your back',
      'Use a spotter for heavy weights'
    ],
    commonMistakes: [
      'Flaring elbows too wide',
      'Not touching the chest',
      'Pressing the bar forward instead of up',
      'Lifting feet off the ground'
    ],
    videoUrl: 'https://example.com/bench-press-video.mp4',
    imageUrl: 'https://example.com/bench-press.jpg'
  },
  'Squats': {
    id: 'squats',
    name: 'Squats',
    category: 'Legs',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
    equipment: 'Barbell, Squat Rack',
    difficulty: 'Intermediate',
    description: 'The squat is a fundamental compound movement that targets the entire lower body. It\'s essential for building leg strength and overall functional fitness.',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Position the bar on your upper back (not your neck)',
      'Keep your chest up and core engaged',
      'Lower your body by bending at the hips and knees',
      'Descend until your thighs are parallel to the floor',
      'Drive through your heels to return to starting position',
      'Keep your knees tracking over your toes'
    ],
    tips: [
      'Keep your weight on your heels',
      'Don\'t let your knees cave inward',
      'Maintain a neutral spine',
      'Start with bodyweight before adding load'
    ],
    commonMistakes: [
      'Knees caving inward',
      'Not going deep enough',
      'Leaning too far forward',
      'Rising on toes'
    ],
    videoUrl: 'https://example.com/squats-video.mp4',
    imageUrl: 'https://example.com/squats.jpg'
  },
  'Pull-Ups': {
    id: 'pull-ups',
    name: 'Pull-Ups',
    category: 'Back',
    primaryMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Middle Trapezius'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids'],
    equipment: 'Pull-up Bar',
    difficulty: 'Advanced',
    description: 'Pull-ups are one of the best bodyweight exercises for building back strength and width. They require significant upper body strength and are excellent for developing a V-taper.',
    instructions: [
      'Hang from a pull-up bar with palms facing away',
      'Use an overhand grip slightly wider than shoulders',
      'Start from a dead hang with arms fully extended',
      'Pull your body up until your chin clears the bar',
      'Lower yourself back down with control',
      'Keep your core engaged throughout'
    ],
    tips: [
      'Focus on pulling with your back muscles',
      'Don\'t swing or use momentum',
      'Control the negative portion',
      'Use assisted pull-ups if needed'
    ],
    commonMistakes: [
      'Not achieving full range of motion',
      'Using momentum to swing up',
      'Dropping down too quickly',
      'Shrugging shoulders at the top'
    ],
    videoUrl: 'https://example.com/pull-ups-video.mp4',
    imageUrl: 'https://example.com/pull-ups.jpg'
  },
  'Military Press': {
    id: 'military-press',
    name: 'Military Press',
    category: 'Shoulders',
    primaryMuscles: ['Anterior Deltoids', 'Medial Deltoids'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'The military press is a standing overhead pressing movement that builds shoulder strength and stability. It\'s excellent for developing overall upper body power.',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold the barbell at shoulder height with overhand grip',
      'Keep your core tight and chest up',
      'Press the bar straight up overhead',
      'Lock out your arms at the top',
      'Lower the bar back to shoulder height with control'
    ],
    tips: [
      'Keep the bar path straight up and down',
      'Don\'t arch your back excessively',
      'Engage your glutes for stability',
      'Start with lighter weight to master form'
    ],
    commonMistakes: [
      'Pressing the bar forward instead of straight up',
      'Excessive back arch',
      'Not engaging the core',
      'Partial range of motion'
    ],
    videoUrl: 'https://example.com/military-press-video.mp4',
    imageUrl: 'https://example.com/military-press.jpg'
  }
};

// Default exercise data for exercises not in database
const getDefaultExerciseData = (exerciseName) => ({
  id: exerciseName.toLowerCase().replace(/\s+/g, '-'),
  name: exerciseName,
  category: 'General',
  primaryMuscles: ['Target Muscle'],
  secondaryMuscles: ['Support Muscles'],
  equipment: 'Various',
  difficulty: 'Beginner',
  description: `${exerciseName} is an effective exercise for building strength and muscle. Focus on proper form and controlled movements for best results.`,
  instructions: [
    'Set up in the proper starting position',
    'Perform the movement with control',
    'Focus on the target muscle group',
    'Return to starting position',
    'Repeat for prescribed reps'
  ],
  tips: [
    'Start with lighter weight',
    'Focus on form over weight',
    'Control the movement',
    'Breathe properly'
  ],
  commonMistakes: [
    'Using too much weight',
    'Poor form',
    'Moving too fast',
    'Not engaging core'
  ],
  videoUrl: null,
  imageUrl: null
});

const ExerciseDetailScreen = ({ route, navigation }) => {
  const { exercise, workoutInfo } = route.params;
  const [currentTab, setCurrentTab] = useState('info');
  const [showVideo, setShowVideo] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Get exercise data from database or use default
  const exerciseData = exerciseDatabase[exercise.name] || getDefaultExerciseData(exercise.name);

  const tabs = [
    { id: 'info', name: 'Info', icon: 'information' },
    { id: 'instructions', name: 'Instructions', icon: 'clipboard-list' },
    { id: 'tips', name: 'Tips', icon: 'lightbulb' }
  ];

  // Parallax animation values - simplified and optimized
  const HEADER_MAX_HEIGHT = 250;
  const HEADER_MIN_HEIGHT = 100;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.7, 0.3],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#666';
    }
  };

  const handleStartExercise = () => {
    Alert.alert(
      'Start Exercise',
      `Ready to start ${exercise.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => {
            navigation.goBack();
          }
        }
      ]
    );
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'info':
        return (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Primary Muscles</Text>
              <View style={styles.muscleContainer}>
                {exerciseData.primaryMuscles.map((muscle, index) => (
                  <View key={index} style={styles.muscleChip}>
                    <Text style={styles.muscleText}>{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>

            {exerciseData.secondaryMuscles.length > 0 && (
              <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Secondary Muscles</Text>
                <View style={styles.muscleContainer}>
                  {exerciseData.secondaryMuscles.map((muscle, index) => (
                    <View key={index} style={[styles.muscleChip, styles.secondaryMuscle]}>
                      <Text style={[styles.muscleText, styles.secondaryMuscleText]}>{muscle}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Equipment</Text>
              <Text style={styles.infoText}>{exerciseData.equipment}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{exerciseData.description}</Text>
            </View>
          </>
        );
      
      case 'instructions':
        return (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Step-by-Step Instructions</Text>
              {exerciseData.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Common Mistakes</Text>
              {exerciseData.commonMistakes.map((mistake, index) => (
                <View key={index} style={styles.mistakeItem}>
                  <MaterialCommunityIcons name="alert-circle" size={16} color="#F44336" />
                  <Text style={styles.mistakeText}>{mistake}</Text>
                </View>
              ))}
            </View>
          </>
        );
      
      case 'tips':
        return (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Pro Tips</Text>
              {exerciseData.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <MaterialCommunityIcons name="lightbulb" size={16} color="#4CAF50" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Workout Details</Text>
              <View style={styles.workoutDetailsRow}>
                <Text style={styles.workoutDetailLabel}>Sets:</Text>
                <Text style={styles.workoutDetailValue}>{exercise.sets}</Text>
              </View>
              <View style={styles.workoutDetailsRow}>
                <Text style={styles.workoutDetailLabel}>Reps:</Text>
                <Text style={styles.workoutDetailValue}>{exercise.reps}</Text>
              </View>
              <View style={styles.workoutDetailsRow}>
                <Text style={styles.workoutDetailLabel}>Rest Time:</Text>
                <Text style={styles.workoutDetailValue}>90 seconds</Text>
              </View>
            </View>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Animated Header - Fixed Position */}
      <Animated.View style={[styles.animatedHeader, { height: headerHeight }]}>
        {/* Header Controls */}
        <View style={styles.headerControls}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Animated.View style={[styles.headerTitleContainer, { opacity: titleOpacity }]}>
            <Text style={styles.headerTitle}>{exerciseData.name}</Text>
            <Text style={styles.headerSubtitle}>{exerciseData.category}</Text>
          </Animated.View>
          <View style={styles.headerActions}>
            {exerciseData.videoUrl && (
              <TouchableOpacity onPress={() => setShowVideo(true)} style={styles.videoButton}>
                <MaterialCommunityIcons name="play-circle" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Animated Exercise Image */}
        <Animated.View 
          style={[
            styles.imageContainer,
            {
              opacity: imageOpacity,
              transform: [{ scale: imageScale }]
            }
          ]}
        >
          {exerciseData.imageUrl ? (
            <Image source={{ uri: exerciseData.imageUrl }} style={styles.exerciseImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="dumbbell" size={60} color="#fff" />
              <Text style={styles.placeholderText}>Exercise Demonstration</Text>
            </View>
          )}
          <View style={styles.difficultyBadge}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(exerciseData.difficulty) }]}>
              {exerciseData.difficulty}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Main Scrollable Content */}
      <Animated.ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Spacer for header */}
        <View style={styles.headerSpacer} />

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, currentTab === tab.id && styles.activeTab]}
              onPress={() => setCurrentTab(tab.id)}
            >
              <MaterialCommunityIcons 
                name={tab.icon} 
                size={20} 
                color={currentTab === tab.id ? '#000' : '#666'} 
              />
              <Text style={[styles.tabText, currentTab === tab.id && styles.activeTabText]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>

        {/* Bottom spacing for button */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Start Exercise Button - Fixed at bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartExercise}>
          <MaterialCommunityIcons name="play" size={20} color="#fff" />
          <Text style={styles.startButtonText}>Start Exercise</Text>
        </TouchableOpacity>
      </View>

      {/* Video Modal */}
      <Modal visible={showVideo} animationType="fade" transparent>
        <View style={styles.videoModalOverlay}>
          <View style={styles.videoModalContent}>
            <View style={styles.videoModalHeader}>
              <Text style={styles.videoModalTitle}>Exercise Video</Text>
              <TouchableOpacity onPress={() => setShowVideo(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.videoPlaceholder}>
              <MaterialCommunityIcons name="play-circle" size={80} color="#666" />
              <Text style={styles.videoPlaceholderText}>Video Player</Text>
              <Text style={styles.videoNote}>
                In a real app, this would show an exercise demonstration video
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    overflow: 'hidden',
    zIndex: 1000,
  },
  headerControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    textAlign: 'center',
  },
  headerActions: {
    width: 40,
    alignItems: 'flex-end',
  },
  videoButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 90,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSpacer: {
    height: 250,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#f8f9fa',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  muscleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleChip: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  secondaryMuscle: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  muscleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryMuscleText: {
    color: '#666',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  mistakeText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  workoutDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutDetailLabel: {
    fontSize: 16,
    color: '#666',
  },
  workoutDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  bottomSpacer: {
    height: 120,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    zIndex: 100,
  },
  startButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Video Modal Styles
  videoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  videoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  videoModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  videoPlaceholder: {
    height: 250,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  videoPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  videoNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});

export default ExerciseDetailScreen; 
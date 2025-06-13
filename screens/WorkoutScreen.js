import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';
import SmartAICamera from '../components/SmartAICamera';

const RestTimer = ({ isActive, duration, onComplete, onStop }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            onComplete();
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    } else if (!isActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <View style={styles.restTimer}>
      <MaterialCommunityIcons name="timer" size={20} color="#FF6B35" />
      <Text style={styles.restTimerText}>Vila: {formatTime(timeLeft)}</Text>
      <TouchableOpacity onPress={onStop} style={styles.stopTimerButton}>
        <MaterialCommunityIcons name="stop" size={16} color="#FF6B35" />
      </TouchableOpacity>
    </View>
  );
};

const WorkoutTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.workoutTimer}>
      <MaterialCommunityIcons name="clock-outline" size={20} color="#4CAF50" />
      <Text style={styles.workoutTimerText}>Träning: {formatTime(elapsed)}</Text>
    </View>
  );
};

const ExerciseNotes = ({ visible, onClose, exercise, onSave, initialNotes = '', initialWeight = '' }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [weight, setWeight] = useState(initialWeight);

  const handleSave = () => {
    onSave(exercise.id, { notes, weight });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{exercise?.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Vikt (kg)</Text>
            <TextInput
              style={styles.weightInput}
              value={weight}
              onChangeText={setWeight}
              placeholder="Ange vikt"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Anteckningar</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Lägg till anteckningar om form, svårighet, etc."
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Avbryt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Spara</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ExerciseCard = ({ exercise, isCompleted, onComplete, onLongPress, exerciseData = {}, navigation, workoutInfo, onShowQuickTips, onOpenAICamera }) => {
  const { weight, notes } = exerciseData;
  
  const handleExerciseDetailPress = () => {
    navigation.navigate('ExerciseDetail', {
      exercise: exercise,
      workoutInfo: workoutInfo
    });
  };
  
  const handleInfoLongPress = () => {
    onShowQuickTips(exercise);
  };

  const handleAICameraPress = () => {
    if (onOpenAICamera) {
      onOpenAICamera(exercise);
    }
  };
  
  return (
    <View style={[styles.exerciseCard, isCompleted && styles.exerciseCardCompleted]}>
      <View style={styles.exerciseHeader}>
        <TouchableOpacity
          style={styles.exerciseInfo}
          onPress={handleExerciseDetailPress}
          activeOpacity={0.7}
        >
          <View style={styles.exerciseNameRow}>
            <Text style={[styles.exerciseName, isCompleted && styles.exerciseNameCompleted]}>
              {exercise.name}
            </Text>
          </View>
          <Text style={[styles.exerciseDetails, isCompleted && styles.exerciseDetailsCompleted]}>
            {exercise.sets} set × {exercise.reps} reps
          </Text>
          <Text style={[styles.restSuggestion, isCompleted && styles.restSuggestionCompleted]}>
            Suggested rest: 90s
          </Text>
          {weight && (
            <Text style={styles.exerciseWeight}>{weight}kg</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.exerciseActions}>
          {/* AI Camera Button */}
          <TouchableOpacity 
            onPress={handleAICameraPress}
            style={[styles.aiCameraButton, isCompleted && styles.aiCameraButtonCompleted]}
          >
            <MaterialCommunityIcons 
              name="eye" 
              size={16} 
              color={isCompleted ? '#fff' : '#4CAF50'} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleExerciseDetailPress}
            onLongPress={handleInfoLongPress}
            style={styles.infoButton}
          >
            <MaterialCommunityIcons 
              name="information-outline" 
              size={18} 
              color={isCompleted ? '#fff' : '#666'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => onLongPress(exercise)}
            style={styles.notesButton}
          >
            <MaterialCommunityIcons 
              name="note-edit" 
              size={20} 
              color={isCompleted ? '#fff' : '#666'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.checkBox, isCompleted && styles.checkBoxCompleted]}
            onPress={() => onComplete(exercise.id)}
            activeOpacity={0.7}
          >
          {isCompleted && (
            <MaterialCommunityIcons name="check" size={20} color="#fff" />
          )}
          </TouchableOpacity>
        </View>
      </View>
      {notes && (
        <TouchableOpacity onPress={handleExerciseDetailPress} activeOpacity={0.7}>
        <Text style={styles.exerciseNotes} numberOfLines={2}>
          📝 {notes}
        </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const QuickTips = ({ visible, onClose, exercise, navigation, workoutInfo }) => {
  // Basic tips for common exercises
  const getQuickTips = (exerciseName) => {
    const commonTips = {
      'Bench Press': [
        'Keep shoulder blades retracted',
        'Don\'t bounce off chest',
        'Maintain tight core'
      ],
      'Squats': [
        'Keep weight on heels',
        'Track knees over toes',
        'Maintain neutral spine'
      ],
      'Pull-Ups': [
        'Control the negative',
        'Pull with back muscles',
        'Full range of motion'
      ],
      'Military Press': [
        'Keep bar path straight',
        'Engage glutes for stability',
        'Don\'t arch back excessively'
      ]
    };
    
    return commonTips[exerciseName] || [
      'Focus on proper form',
      'Control the movement',
      'Breathe consistently'
    ];
  };

  const tips = exercise ? getQuickTips(exercise.name) : [];

  const handleViewFullDetails = () => {
    onClose();
    navigation.navigate('ExerciseDetail', {
      exercise: exercise,
      workoutInfo: workoutInfo
    });
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.quickTipsOverlay}>
        <View style={styles.quickTipsContent}>
          <View style={styles.quickTipsHeader}>
            <Text style={styles.quickTipsTitle}>
              Quick Tips - {exercise?.name}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.tipsList}>
            {tips.map((tip, index) => (
              <View key={index} style={styles.quickTipItem}>
                <MaterialCommunityIcons name="lightbulb" size={16} color="#4CAF50" />
                <Text style={styles.quickTipText}>{tip}</Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.viewMoreButton}
            onPress={handleViewFullDetails}
          >
            <Text style={styles.viewMoreText}>View Full Details</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color="#000" />
    </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const WorkoutScreen = ({ route, navigation }) => {
  const { workout, selectedDate } = route.params;
  const [workoutProgress, setWorkoutProgress] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [quickTipsVisible, setQuickTipsVisible] = useState(false);
  const [quickTipsExercise, setQuickTipsExercise] = useState(null);
  const [workoutStartTime] = useState(Date.now());
  const [aiCameraVisible, setAiCameraVisible] = useState(false);
  const [aiCameraExercise, setAiCameraExercise] = useState(null);
  
  // Custom Alert Hook
  const {
    alertVisible,
    alertConfig,
    hideAlert,
    showCelebration,
    showRest,
    showWarning
  } = useCustomAlert();

  const completedExercises = workout.exercises.filter(ex => workoutProgress[ex.id]).length;
  const totalExercises = workout.exercises.length;
  const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  const handleExerciseComplete = (exerciseId) => {
    if (!workoutProgress[exerciseId]) {
      setWorkoutProgress(prev => ({
        ...prev,
        [exerciseId]: true
      }));
      
      // Start rest timer after completing an exercise (except the last one)
      const newCompletedCount = completedExercises + 1;
      if (newCompletedCount < totalExercises) {
        setRestTimerActive(true);
      }
      
      // Check if workout is complete
      if (newCompletedCount === totalExercises) {
        setTimeout(() => {
          showCelebration(
            'Träning Klar! 🎉',
            'Bra jobbat! Du har slutfört hela träningen.',
            [
              {
                text: 'Tillbaka',
                style: 'default',
                onPress: () => navigation.goBack()
              }
            ]
          );
        }, 500);
      }
    }
  };

  const handleExerciseLongPress = (exercise) => {
    setSelectedExercise(exercise);
    setNotesModalVisible(true);
  };

  const handleShowQuickTips = (exercise) => {
    setQuickTipsExercise(exercise);
    setQuickTipsVisible(true);
  };

  const handleOpenAICamera = (exercise) => {
    setAiCameraExercise(exercise);
    setAiCameraVisible(true);
  };

  const handleAIWorkoutComplete = (workoutData) => {
    // Handle completion of AI workout
    showCelebration(
      '🎉 AI Träning Klar!',
      `Du har slutfört ${workoutData.sets} set av ${workoutData.exercise}!\n\nTid: ${workoutData.duration}s`,
      [
        {
          text: 'Bra!',
          style: 'default',
          onPress: () => {}
        }
      ]
    );
  };

  const handleAISetComplete = (setNumber, reps) => {
    // Handle completion of individual set
    console.log(`Set ${setNumber} complete with ${reps} reps`);
  };

  const handleExerciseDataSave = (exerciseId, data) => {
    setExerciseData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        ...data
      }
    }));
  };

  const handleRestComplete = () => {
    setRestTimerActive(false);
    showRest(
      'Vila Klar! 💪',
      'Dags för nästa övning!',
      [
        {
          text: 'Fortsätt',
          style: 'default',
          onPress: () => {}
        }
      ]
    );
  };

  const handleFinishWorkout = () => {
    showWarning(
      'Avsluta Träning?',
      'Är du säker på att du vill avsluta träningen?',
      [
        { 
          text: 'Fortsätt', 
          style: 'cancel',
          onPress: () => {}
        },
        { 
          text: 'Avsluta', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.workoutTitle}>{workout.group}</Text>
          <View style={styles.headerProgress}>
          <Text style={styles.workoutDate}>{selectedDate}</Text>
            <View style={styles.headerProgressDot}>
              <Text style={styles.headerProgressText}>{completedExercises}/{totalExercises}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleFinishWorkout} style={styles.finishButton}>
          <MaterialCommunityIcons name="stop" size={16} color="#fff" />
          <Text style={styles.finishButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>

      {/* Workout Timer */}
      <WorkoutTimer startTime={workoutStartTime} />

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {completedExercises}/{totalExercises} övningar
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
      </View>

      {/* Rest Timer */}
      <RestTimer 
        isActive={restTimerActive}
        duration={90}
        onComplete={handleRestComplete}
        onStop={() => setRestTimerActive(false)}
      />

      {/* Exercises */}
      <ScrollView 
        style={styles.exercisesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.exercisesContent}
      >
        {workout.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            isCompleted={workoutProgress[exercise.id]}
            onComplete={handleExerciseComplete}
            onLongPress={handleExerciseLongPress}
            exerciseData={exerciseData[exercise.id] || {}}
            navigation={navigation}
            workoutInfo={workout}
            onShowQuickTips={handleShowQuickTips}
            onOpenAICamera={handleOpenAICamera}
          />
        ))}
      </ScrollView>

      {/* Completion Badge */}
      {completedExercises === totalExercises && totalExercises > 0 && (
        <View style={styles.completedBadge}>
          <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
          <Text style={styles.completedText}>Träning Slutförd!</Text>
          <MaterialCommunityIcons name="fire" size={24} color="#FF6B35" />
        </View>
      )}

      {/* Exercise Notes Modal */}
      <ExerciseNotes
        visible={notesModalVisible}
        onClose={() => setNotesModalVisible(false)}
        exercise={selectedExercise}
        onSave={handleExerciseDataSave}
        initialNotes={selectedExercise ? (exerciseData[selectedExercise.id]?.notes || '') : ''}
        initialWeight={selectedExercise ? (exerciseData[selectedExercise.id]?.weight || '') : ''}
      />

      {/* Quick Tips Modal */}
      <QuickTips
        visible={quickTipsVisible}
        onClose={() => setQuickTipsVisible(false)}
        exercise={quickTipsExercise}
        navigation={navigation}
        workoutInfo={workout}
      />

      {/* Smart AI Camera Modal */}
      <SmartAICamera
        visible={aiCameraVisible}
        onClose={() => setAiCameraVisible(false)}
        exercise={aiCameraExercise}
        targetSets={aiCameraExercise?.sets || 3}
        targetReps={aiCameraExercise?.reps || 10}
        onWorkoutComplete={handleAIWorkoutComplete}
        onSetComplete={handleAISetComplete}
      />

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        onClose={hideAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        type={alertConfig.type}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.3,
  },
  workoutDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  finishButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  workoutTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  workoutTimerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  progressSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 4,
  },
  restTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  restTimerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  stopTimerButton: {
    padding: 4,
  },
  exercisesList: {
    flex: 1,
    marginTop: 16,
  },
  exercisesContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f8f9fa',
  },
  exerciseCardCompleted: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.3,
    flex: 1,
  },
  exerciseNameCompleted: {
    color: '#fff',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  exerciseDetailsCompleted: {
    color: '#fff',
  },
  restSuggestion: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  restSuggestionCompleted: {
    color: '#fff',
  },
  exerciseWeight: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notesButton: {
    padding: 8,
    borderRadius: 8,
  },
  exerciseNotes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 12,
  },
  checkBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkBoxCompleted: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.3,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  weightInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#f8f9fa',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  infoButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTipsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickTipsContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  quickTipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  quickTipsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.3,
  },
  tipsList: {
    marginBottom: 20,
  },
  quickTipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickTipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  viewMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  headerProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerProgressDot: {
    backgroundColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  headerProgressText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  aiCameraButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  aiCameraButtonCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default WorkoutScreen; 
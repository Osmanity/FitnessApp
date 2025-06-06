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

const ExerciseCard = ({ exercise, isCompleted, onComplete, onLongPress, exerciseData = {} }) => {
  const { weight, notes } = exerciseData;
  
  return (
    <TouchableOpacity 
      style={[styles.exerciseCard, isCompleted && styles.exerciseCardCompleted]}
      onPress={() => onComplete(exercise.id)}
      onLongPress={() => onLongPress(exercise)}
      activeOpacity={0.7}
    >
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseName, isCompleted && styles.exerciseNameCompleted]}>
            {exercise.name}
          </Text>
          <Text style={[styles.exerciseDetails, isCompleted && styles.exerciseDetailsCompleted]}>
            {exercise.sets} set × {exercise.reps} reps
          </Text>
          {weight && (
            <Text style={styles.exerciseWeight}>{weight}kg</Text>
          )}
        </View>
        <View style={[styles.checkBox, isCompleted && styles.checkBoxCompleted]}>
          {isCompleted && (
            <MaterialCommunityIcons name="check" size={20} color="#fff" />
          )}
        </View>
      </View>
      {notes && (
        <Text style={styles.exerciseNotes} numberOfLines={2}>
          📝 {notes}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const WorkoutScreen = ({ route, navigation }) => {
  const { workout, selectedDate } = route.params;
  const [workoutProgress, setWorkoutProgress] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [workoutStartTime] = useState(Date.now());

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
          Alert.alert(
            'Träning Klar! 🎉',
            'Bra jobbat! Du har slutfört hela träningen.',
            [
              {
                text: 'Tillbaka',
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
    Alert.alert('Vila Klar!', 'Dags för nästa övning! 💪');
  };

  const handleFinishWorkout = () => {
    Alert.alert(
      'Avsluta Träning?',
      'Är du säker på att du vill avsluta träningen?',
      [
        { text: 'Fortsätt', style: 'cancel' },
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
          <Text style={styles.workoutDate}>{selectedDate}</Text>
        </View>
        <TouchableOpacity onPress={handleFinishWorkout} style={styles.finishButton}>
          <Text style={styles.finishButtonText}>Avsluta</Text>
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
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    letterSpacing: -0.3,
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
    backgroundColor: '#fff',
    borderColor: '#fff',
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
});

export default WorkoutScreen; 
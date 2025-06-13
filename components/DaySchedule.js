import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Modal, ScrollView, Dimensions } from 'react-native';
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
      <Text style={styles.restTimerText}>Rest: {formatTime(timeLeft)}</Text>
      <TouchableOpacity onPress={onStop} style={styles.stopTimerButton}>
        <MaterialCommunityIcons name="stop" size={16} color="#FF6B35" />
      </TouchableOpacity>
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
            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.weightInput}
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter weight"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about form, difficulty, etc."
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ExerciseItem = ({ exercise, onComplete, isCompleted, onLongPress, exerciseData = {}, onShowHistory }) => {
  const { weight, notes, lastWeight } = exerciseData;
  const hasImprovement = weight && lastWeight && parseFloat(weight) > parseFloat(lastWeight);
  
  return (
    <TouchableOpacity 
      style={[styles.exerciseItem, isCompleted && styles.exerciseItemCompleted]}
      onPress={() => onComplete(exercise.id)}
      onLongPress={() => onLongPress(exercise)}
      activeOpacity={0.7}
    >
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseNameContainer}>
          <View style={styles.exerciseNameRow}>
            <Text style={[styles.exerciseName, isCompleted && styles.exerciseNameCompleted]}>
              {exercise.name}
            </Text>
            {hasImprovement && (
              <MaterialCommunityIcons name="trending-up" size={16} color="#4CAF50" />
            )}
          </View>
          {weight && (
            <View style={styles.weightRow}>
              <Text style={styles.exerciseWeight}>{weight}kg</Text>
              {lastWeight && (
                <Text style={styles.lastWeight}>prev: {lastWeight}kg</Text>
              )}
            </View>
          )}
        </View>
        <View style={styles.exerciseActions}>
          <TouchableOpacity 
            onPress={() => onShowHistory(exercise.id)}
            style={styles.historyButton}
          >
            <MaterialCommunityIcons name="history" size={16} color="#666" />
          </TouchableOpacity>
          <View style={[styles.checkBox, isCompleted && styles.checkBoxCompleted]}>
            {isCompleted && (
              <MaterialCommunityIcons name="check" size={16} color="#fff" />
            )}
          </View>
        </View>
      </View>
      <Text style={[styles.exerciseDetails, isCompleted && styles.exerciseDetailsCompleted]}>
        {exercise.sets} sets of {exercise.reps} reps
      </Text>
      {notes && (
        <Text style={styles.exerciseNotes} numberOfLines={2}>
          📝 {notes}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const WorkoutTimer = ({ isActive, onStop, startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <View style={styles.workoutTimer}>
      <MaterialCommunityIcons name="clock-outline" size={20} color="#4CAF50" />
      <Text style={styles.workoutTimerText}>Workout: {formatTime(elapsed)}</Text>
      <TouchableOpacity onPress={onStop} style={styles.stopWorkoutButton}>
        <Text style={styles.stopWorkoutText}>Stop</Text>
      </TouchableOpacity>
    </View>
  );
};

const WorkoutHistory = ({ visible, onClose, exerciseId, exerciseData }) => {
  const history = exerciseData?.history || [];
  
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.historyModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Workout History</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.historyList}>
            {history.length === 0 ? (
              <View style={styles.emptyHistory}>
                <MaterialCommunityIcons name="history" size={48} color="#ddd" />
                <Text style={styles.emptyHistoryText}>No workout history yet</Text>
                <Text style={styles.emptyHistorySubtext}>Complete some workouts to see your progress!</Text>
              </View>
            ) : (
              history.map((entry, index) => (
                <View key={index} style={styles.historyEntry}>
                  <View style={styles.historyDate}>
                    <Text style={styles.historyDateText}>{entry.date}</Text>
                    <Text style={styles.historyTimeText}>{entry.time}</Text>
                  </View>
                  <View style={styles.historyData}>
                    <Text style={styles.historyWeight}>{entry.weight}kg</Text>
                    <Text style={styles.historyReps}>{entry.sets}x{entry.reps}</Text>
                  </View>
                  <View style={styles.historyRPE}>
                    <Text style={styles.historyRPEText}>RPE {entry.rpe || 'N/A'}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const AdvancedStats = ({ visible, onClose, dayStats, weeklyProgress }) => {
  const screenWidth = Dimensions.get('window').width;
  
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.statsModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Advanced Analytics</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.statsContent}>
            {/* Performance Metrics */}
            <View style={styles.statsSection}>
              <Text style={styles.statsSectionTitle}>📊 Performance Metrics</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <MaterialCommunityIcons name="timer" size={24} color="#4CAF50" />
                  <Text style={styles.metricValue}>{dayStats.totalWorkoutTime}</Text>
                  <Text style={styles.metricLabel}>Minutes</Text>
                </View>
                <View style={styles.metricCard}>
                  <MaterialCommunityIcons name="fire" size={24} color="#FF6B35" />
                  <Text style={styles.metricValue}>{dayStats.caloriesBurned}</Text>
                  <Text style={styles.metricLabel}>Calories</Text>
                </View>
                <View style={styles.metricCard}>
                  <MaterialCommunityIcons name="weight-lifter" size={24} color="#2196F3" />
                  <Text style={styles.metricValue}>{dayStats.setsCompleted}</Text>
                  <Text style={styles.metricLabel}>Sets</Text>
                </View>
                <View style={styles.metricCard}>
                  <MaterialCommunityIcons name="chart-line" size={24} color="#9C27B0" />
                  <Text style={styles.metricValue}>{Math.round(dayStats.setsCompleted * 2.5)}kg</Text>
                  <Text style={styles.metricLabel}>Volume</Text>
                </View>
              </View>
            </View>

            {/* Weekly Progress */}
            <View style={styles.statsSection}>
              <Text style={styles.statsSectionTitle}>📈 Weekly Progress</Text>
              <View style={styles.progressChart}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <View key={day} style={styles.chartBar}>
                    <View 
                      style={[
                        styles.chartBarFill, 
                        { height: `${Math.random() * 80 + 20}%` }
                      ]} 
                    />
                    <Text style={styles.chartBarLabel}>{day}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Achievements */}
            <View style={styles.statsSection}>
              <Text style={styles.statsSectionTitle}>🏆 Recent Achievements</Text>
              <View style={styles.achievementsList}>
                <View style={styles.achievementItem}>
                  <MaterialCommunityIcons name="trophy" size={20} color="#FFD700" />
                  <Text style={styles.achievementText}>First Workout Complete!</Text>
                </View>
                <View style={styles.achievementItem}>
                  <MaterialCommunityIcons name="fire" size={20} color="#FF6B35" />
                  <Text style={styles.achievementText}>3 Day Streak</Text>
                </View>
                <View style={styles.achievementItem}>
                  <MaterialCommunityIcons name="target" size={20} color="#4CAF50" />
                  <Text style={styles.achievementText}>50 Exercises Completed</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const ExerciseGroup = ({ workout, workoutProgress, onExerciseComplete, onWorkoutComplete, exerciseData, onExerciseDataUpdate, navigation, selectedDate }) => {
  const completedExercises = workout.exercises.filter(ex => workoutProgress[ex.id]).length;
  const totalExercises = workout.exercises.length;
  const isWorkoutCompleted = completedExercises === totalExercises && totalExercises > 0;
  const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  // Calculate estimated volume
  const estimatedVolume = workout.exercises.reduce((total, exercise) => {
    const data = exerciseData[exercise.id];
    const weight = data?.weight ? parseFloat(data.weight) : 20; // Default weight
    return total + (weight * exercise.sets * exercise.reps);
  }, 0);

  const handleStartWorkout = () => {
    if (navigation) {
      navigation.navigate('Workout', {
        workout: workout,
        selectedDate: selectedDate
      });
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.exerciseGroup, isWorkoutCompleted && styles.exerciseGroupCompleted]}
      onPress={handleStartWorkout}
      activeOpacity={0.8}
    >
      <View style={styles.groupHeader}>
        <View style={styles.groupTitleContainer}>
          <Text style={styles.groupTitle}>{workout.group}</Text>
          <View style={styles.groupMetrics}>
            <Text style={styles.groupDuration}>{workout.duration} min</Text>
            <Text style={styles.exerciseCount}>{totalExercises} övningar</Text>
            <Text style={styles.volumeText}>{Math.round(estimatedVolume)}kg volym</Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {completedExercises}/{totalExercises}
          </Text>
        </View>
      </View>

      <View style={styles.exercisePreview}>
        <Text style={styles.exercisePreviewTitle}>Övningar:</Text>
        {workout.exercises.slice(0, 3).map((exercise, index) => (
          <Text key={exercise.id} style={styles.exercisePreviewItem}>
            • {exercise.name} ({exercise.sets}×{exercise.reps})
          </Text>
        ))}
        {workout.exercises.length > 3 && (
          <Text style={styles.exercisePreviewMore}>
            +{workout.exercises.length - 3} fler övningar
          </Text>
        )}
      </View>

      <View style={styles.startWorkoutButton}>
        <MaterialCommunityIcons name="play" size={20} color="#fff" />
        <Text style={styles.startWorkoutText}>
          {isWorkoutCompleted ? 'Visa Träning' : 'Starta Träning'}
        </Text>
        <MaterialCommunityIcons name="arrow-right" size={16} color="#fff" />
      </View>
      
      {isWorkoutCompleted && (
        <View style={styles.completedBadge}>
          <MaterialCommunityIcons name="trophy" size={20} color="#FFD700" />
          <Text style={styles.completedText}>Träning Slutförd!</Text>
          <MaterialCommunityIcons name="fire" size={20} color="#FF6B35" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// New MealItem component for timeline integration
const MealItem = ({ meal, onMealPress, mealProgress, onToggleMealComplete }) => {
  const isCompleted = mealProgress[meal.id];
  
  return (
    <TouchableOpacity 
      style={[styles.mealItem, isCompleted && styles.mealItemCompleted]}
      onPress={() => onMealPress(meal)}
      activeOpacity={0.8}
    >
      <View style={styles.mealContent}>
        <View style={styles.mealHeader}>
          <View style={[styles.mealIconContainer, { backgroundColor: isCompleted ? '#000' : meal.color }]}>
            <MaterialCommunityIcons 
              name={meal.icon} 
              size={24} 
              color="#fff" 
            />
          </View>
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealTime}>{meal.time}</Text>
          </View>
          <View style={styles.mealStats}>
            <Text style={styles.mealCalories}>{meal.calories}</Text>
            <Text style={styles.mealCaloriesLabel}>kcal</Text>
          </View>
        </View>
        
        <View style={styles.mealDetails}>
          <View style={styles.mealProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: isCompleted ? '100%' : '0%',
                    backgroundColor: isCompleted ? '#000' : meal.color 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {isCompleted ? 'Completed' : 'Not logged'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.completeButton, isCompleted && styles.completeButtonActive]}
            onPress={() => onToggleMealComplete(meal.id)}
          >
            <MaterialCommunityIcons 
              name={isCompleted ? "check" : "plus"} 
              size={16} 
              color={isCompleted ? "#fff" : "#000"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// New SleepItem component for sleep logging
const SleepItem = ({ sleep, onSleepPress, sleepProgress, onToggleSleepComplete }) => {
  const isCompleted = sleepProgress[sleep.id];
  
  return (
    <TouchableOpacity 
      style={[styles.sleepItem, isCompleted && styles.sleepItemCompleted]}
      onPress={() => onSleepPress(sleep)}
      activeOpacity={0.8}
    >
      <View style={styles.sleepContent}>
        <View style={styles.sleepHeader}>
          <View style={[styles.sleepIconContainer, { backgroundColor: isCompleted ? '#000' : sleep.color }]}>
            <MaterialCommunityIcons 
              name={sleep.icon} 
              size={24} 
              color="#fff" 
            />
          </View>
          <View style={styles.sleepInfo}>
            <Text style={styles.sleepName}>{sleep.name}</Text>
            <Text style={styles.sleepTime}>{sleep.time}</Text>
          </View>
          <View style={styles.sleepStats}>
            <Text style={styles.sleepDuration}>{sleep.duration}</Text>
            <Text style={styles.sleepDurationLabel}>timmar</Text>
          </View>
        </View>
        
        <View style={styles.sleepDetails}>
          <View style={styles.sleepProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: isCompleted ? '100%' : '0%',
                    backgroundColor: isCompleted ? '#000' : sleep.color 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {isCompleted ? 'Loggad' : 'Inte loggad'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.completeButton, isCompleted && styles.completeButtonActive]}
            onPress={() => onToggleSleepComplete(sleep.id)}
          >
            <MaterialCommunityIcons 
              name={isCompleted ? "check" : "plus"} 
              size={16} 
              color={isCompleted ? "#fff" : "#000"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// New PhotoItem component for progress photos
const PhotoItem = ({ photo, onPhotoPress }) => {
  return (
    <TouchableOpacity 
      style={styles.photoItem}
      onPress={() => onPhotoPress(photo)}
      activeOpacity={0.8}
    >
      <View style={styles.photoContent}>
        <View style={styles.photoHeader}>
          <View style={[styles.photoIconContainer, { backgroundColor: '#333' }]}>
            <MaterialCommunityIcons 
              name={photo.icon} 
              size={24} 
              color="#fff" 
            />
          </View>
          <View style={styles.photoInfo}>
            <Text style={styles.photoName}>{photo.name}</Text>
            <Text style={styles.photoTime}>{photo.time}</Text>
          </View>
          <View style={styles.photoStats}>
            <Text style={styles.photoCount}>{photo.count}</Text>
            <Text style={styles.photoCountLabel}>foton</Text>
          </View>
        </View>
        
        <View style={styles.photoDetails}>
          <View style={styles.photoProgress}>
            <Text style={styles.progressText}>
              Tryck för att ta progress foton
            </Text>
          </View>
          
          <View style={styles.photoButton}>
            <MaterialCommunityIcons 
              name="camera" 
              size={16} 
              color="#000" 
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const DaySchedule = ({ selectedDay, workoutProgress = {}, onWorkoutComplete, onExerciseComplete, exerciseData = {}, onExerciseDataUpdate, navigation }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [restTimer, setRestTimer] = useState({ isActive: false, duration: 0 });
  const [mealProgress, setMealProgress] = useState({});
  const [sleepProgress, setSleepProgress] = useState({});

  // Meal data with modern colors
  const meals = [
    {
      id: 'breakfast',
      name: 'Frukost',
      time: '08:00',
      calories: 450,
      icon: 'coffee',
      color: '#333',
    },
    {
      id: 'morning-snack',
      name: 'Mellanmål',
      time: '10:30',
      calories: 150,
      icon: 'apple',
      color: '#333',
    },
    {
      id: 'lunch',
      name: 'Lunch',
      time: '12:30',
      calories: 650,
      icon: 'food',
      color: '#333',
    },
    {
      id: 'afternoon-snack',
      name: 'Mellanmål',
      time: '15:00',
      calories: 200,
      icon: 'food-apple',
      color: '#333',
    },
    {
      id: 'dinner',
      name: 'Middag',
      time: '18:00',
      calories: 750,
      icon: 'silverware-fork-knife',
      color: '#333',
    },
    {
      id: 'evening-snack',
      name: 'Kvällsmål',
      time: '21:00',
      calories: 250,
      icon: 'cookie',
      color: '#333',
    }
  ];

  // Sleep data
  const sleepData = {
    id: 'sleep',
    name: 'Sömn',
    time: '22:30',
    duration: '8',
    icon: 'sleep',
    color: '#333',
  };

  const handleMealPress = (meal) => {
    if (navigation) {
      navigation.navigate('MealSelection', {
        mealName: meal.name,
        mealTime: meal.time,
        selectedDate: selectedDay?.fullDate?.toDateString()
      });
    }
  };

  const handleSleepPress = (sleep) => {
    // For now, just toggle completion - could navigate to sleep logging screen later
    toggleSleepComplete(sleep.id);
  };

  const handlePhotoPress = (photo) => {
    if (navigation) {
      navigation.navigate('PhotoProgress', {
        selectedDate: selectedDay?.fullDate?.toDateString()
      });
    }
  };

  const toggleMealComplete = (mealId) => {
    setMealProgress(prev => ({
      ...prev,
      [mealId]: !prev[mealId]
    }));
  };

  const toggleSleepComplete = (sleepId) => {
    setSleepProgress(prev => ({
      ...prev,
      [sleepId]: !prev[sleepId]
    }));
  };

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const createCombinedTimeline = () => {
    const timeline = [];
    
    // Add meals
    meals.forEach(meal => {
      timeline.push({
        type: 'meal',
        time: meal.time,
        timeInMinutes: timeToMinutes(meal.time),
        data: meal
      });
    });
    
    // Add workouts
    if (selectedDay?.workouts) {
      selectedDay.workouts.forEach((workout, index) => {
        timeline.push({
          type: 'workout',
          time: workout.time,
          timeInMinutes: timeToMinutes(workout.time),
          data: workout
        });
      });
    }
    
    // Add one photo card per day (before sleep)
    timeline.push({
      type: 'photo',
      time: '21:30',
      timeInMinutes: timeToMinutes('21:30'),
      data: {
        id: 'daily-photo',
        name: 'Progress Foton',
        time: '21:30',
        count: '8',
        icon: 'camera',
        color: '#333'
      }
    });
    
    // Add sleep at the end
    timeline.push({
      type: 'sleep',
      time: sleepData.time,
      timeInMinutes: timeToMinutes(sleepData.time),
      data: sleepData
    });
    
    // Sort by time
    return timeline.sort((a, b) => a.timeInMinutes - b.timeInMinutes);
  };

  const combinedTimeline = createCombinedTimeline();
  
  // Calculate meal statistics
  const totalMealCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const completedMeals = Object.values(mealProgress).filter(Boolean).length;
  const completedMealCalories = meals
    .filter(meal => mealProgress[meal.id])
    .reduce((sum, meal) => sum + meal.calories, 0);

  // Calculate workout statistics
  const totalWorkouts = selectedDay?.workouts?.length || 0;
  const completedWorkouts = selectedDay?.workouts?.filter(workout => 
    workoutProgress[workout.id]
  ).length || 0;

  // Calculate sleep statistics
  const isSleepLogged = sleepProgress[sleepData.id] || false;

  if (!selectedDay) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="calendar-blank" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No day selected</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Statistics Dashboard */}
      <View style={styles.modernStatsContainer}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="dumbbell" size={20} color="#000" />
              <Text style={styles.statTitle}>Workouts</Text>
            </View>
            <Text style={styles.statValue}>{completedWorkouts}/{totalWorkouts}</Text>
            <View style={styles.statProgressBar}>
              <View 
                style={[
                  styles.statProgressFill, 
                  { 
                    width: totalWorkouts > 0 ? `${(completedWorkouts / totalWorkouts) * 100}%` : '0%',
                    backgroundColor: '#000'
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="food" size={20} color="#000" />
              <Text style={styles.statTitle}>Meals</Text>
            </View>
            <Text style={styles.statValue}>{completedMeals}/{meals.length}</Text>
            <View style={styles.statProgressBar}>
              <View 
                style={[
                  styles.statProgressFill, 
                  { 
                    width: `${(completedMeals / meals.length) * 100}%`,
                    backgroundColor: '#000'
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="sleep" size={20} color="#000" />
              <Text style={styles.statTitle}>Sömn</Text>
            </View>
            <Text style={styles.statValue}>{isSleepLogged ? '1/1' : '0/1'}</Text>
            <View style={styles.statProgressBar}>
              <View 
                style={[
                  styles.statProgressFill, 
                  { 
                    width: isSleepLogged ? '100%' : '0%',
                    backgroundColor: '#000'
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedDay.isRest && (!selectedDay.workouts || selectedDay.workouts.length === 0) ? (
          <View style={styles.restDayContainer}>
            <View style={styles.restDayHeader}>
              <MaterialCommunityIcons name="sleep" size={48} color="#000" />
              <Text style={styles.restDayTitle}>Rest Day</Text>
              <Text style={styles.restDaySubtitle}>Focus on recovery and nutrition</Text>
            </View>
            
            {/* Show meals timeline for rest days */}
            <View style={styles.timelineContainer}>
              <View style={styles.compactTimeline}>
                {combinedTimeline.map((item, index) => (
                  <View key={`${item.type}-${item.data.id || item.data.name}`} style={styles.timelineItem}>
                    <View style={styles.compactTimeContainer}>
                      <Text style={styles.compactTimeText}>{item.time}</Text>
                    </View>
                    
                    <View style={styles.compactTimelineLine}>
                      <View style={[styles.compactTimelineDot, { backgroundColor: item.data.color || '#000' }]} />
                      {index < combinedTimeline.length - 1 && <View style={styles.compactTimelineConnector} />}
                    </View>
                    
                    <View style={styles.compactItemContainer}>
                      {item.type === 'meal' ? (
                        <MealItem 
                          meal={item.data}
                          onMealPress={handleMealPress}
                          mealProgress={mealProgress}
                          onToggleMealComplete={toggleMealComplete}
                        />
                      ) : item.type === 'sleep' ? (
                        <SleepItem 
                          sleep={item.data}
                          onSleepPress={handleSleepPress}
                          sleepProgress={sleepProgress}
                          onToggleSleepComplete={toggleSleepComplete}
                        />
                      ) : item.type === 'photo' ? (
                        <PhotoItem 
                          photo={item.data}
                          onPhotoPress={handlePhotoPress}
                        />
                      ) : (
                        <ExerciseGroup
                          workout={item.data}
                          workoutProgress={workoutProgress}
                          onExerciseComplete={onExerciseComplete}
                          onWorkoutComplete={onWorkoutComplete}
                          exerciseData={exerciseData}
                          onExerciseDataUpdate={onExerciseDataUpdate}
                          navigation={navigation}
                          selectedDate={selectedDay?.fullDate?.toDateString()}
                        />
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            <View style={styles.compactTimeline}>
              {combinedTimeline.map((item, index) => (
                <View key={`${item.type}-${item.data.id || item.data.name}`} style={styles.timelineItem}>
                  <View style={styles.compactTimeContainer}>
                    <Text style={styles.compactTimeText}>{item.time}</Text>
                  </View>
                  
                  <View style={styles.compactTimelineLine}>
                    <View style={[styles.compactTimelineDot, { backgroundColor: item.data.color || '#000' }]} />
                    {index < combinedTimeline.length - 1 && <View style={styles.compactTimelineConnector} />}
                  </View>
                  
                  <View style={styles.compactItemContainer}>
                    {item.type === 'meal' ? (
                      <MealItem 
                        meal={item.data}
                        onMealPress={handleMealPress}
                        mealProgress={mealProgress}
                        onToggleMealComplete={toggleMealComplete}
                      />
                    ) : item.type === 'sleep' ? (
                      <SleepItem 
                        sleep={item.data}
                        onSleepPress={handleSleepPress}
                        sleepProgress={sleepProgress}
                        onToggleSleepComplete={toggleSleepComplete}
                      />
                    ) : item.type === 'photo' ? (
                      <PhotoItem 
                        photo={item.data}
                        onPhotoPress={handlePhotoPress}
                      />
                    ) : (
                      <ExerciseGroup
                        workout={item.data}
                        workoutProgress={workoutProgress}
                        onExerciseComplete={onExerciseComplete}
                        onWorkoutComplete={onWorkoutComplete}
                        exerciseData={exerciseData}
                        onExerciseDataUpdate={onExerciseDataUpdate}
                        navigation={navigation}
                        selectedDate={selectedDay?.fullDate?.toDateString()}
                      />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <ExerciseNotes
        visible={showNotes}
        onClose={() => setShowNotes(false)}
        exercise={selectedExercise}
        onSave={(notes, weight) => {
          if (selectedExercise) {
            onExerciseDataUpdate(selectedExercise.id, { notes, weight });
          }
        }}
        initialNotes={selectedExercise ? exerciseData[selectedExercise.id]?.notes || '' : ''}
        initialWeight={selectedExercise ? exerciseData[selectedExercise.id]?.weight || '' : ''}
      />

      <WorkoutHistory
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        exerciseId={selectedExerciseId}
        exerciseData={exerciseData}
      />

      <AdvancedStats
        visible={showAdvancedStats}
        onClose={() => setShowAdvancedStats(false)}
        dayStats={{
          totalWorkouts,
          completedWorkouts,
          totalExercises: selectedDay?.workouts?.reduce((sum, w) => sum + w.exercises.length, 0) || 0,
          completedExercises: Object.keys(workoutProgress).filter(key => 
            !key.includes('-') && workoutProgress[key]
          ).length
        }}
        weeklyProgress={[65, 80, 45, 90, 75, 60, 85]}
      />

      <RestTimer
        isActive={restTimer.isActive}
        duration={restTimer.duration}
        onComplete={() => setRestTimer({ isActive: false, duration: 0 })}
        onStop={() => setRestTimer({ isActive: false, duration: 0 })}
      />

      <WorkoutTimer
        isActive={activeWorkout !== null}
        onStop={() => {
          setActiveWorkout(null);
          setWorkoutStartTime(null);
        }}
        startTime={workoutStartTime}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Modern Statistics Dashboard
  modernStatsContainer: {
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 16,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  statTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    letterSpacing: -0.1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  statProgressBar: {
    width: '100%',
    height: 3,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  statProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 12,
  },

  // Compact Timeline
  timelineContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  compactTimeline: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  compactTimeContainer: {
    width: 35,
    alignItems: 'center',
    paddingTop: 20,
  },
  compactTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.3,
  },
  compactTimelineLine: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 20,
  },
  compactTimelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  compactTimelineConnector: {
    width: 1,
    height: 60,
    backgroundColor: '#e9ecef',
    marginTop: 8,
  },
  compactItemContainer: {
    flex: 1,
  },

  // Modern Meal Items
  mealItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f8f9fa',
  },
  mealItemCompleted: {
    borderColor: '#000',
    borderWidth: 2,
  },
  mealContent: {
    gap: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  mealIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  mealTime: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  mealStats: {
    alignItems: 'flex-end',
  },
  mealCalories: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
  },
  mealCaloriesLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
  },
  mealDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealProgress: {
    flex: 1,
    marginRight: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  completeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  completeButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },

  // Rest Day Styling
  restDayContainer: {
    flex: 1,
    paddingTop: 20,
  },
  restDayHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  restDayTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  restDaySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Exercise Group Styles
  exerciseGroup: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f8f9fa',
  },
  exerciseGroupCompleted: {
    borderColor: '#000',
    borderWidth: 2,
  },
  groupHeader: {
    marginBottom: 16,
  },
  groupTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.3,
  },
  groupMetrics: {
    alignItems: 'flex-end',
  },
  groupDuration: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  exerciseCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  volumeText: {
    fontSize: 10,
    color: '#999',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    minWidth: 30,
  },

  // Exercise Item Styles
  exerciseList: {
    gap: 12,
  },
  exerciseItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  exerciseItemCompleted: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseNameContainer: {
    flex: 1,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  exerciseNameCompleted: {
    color: '#fff',
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  exerciseWeight: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lastWeight: {
    fontSize: 10,
    color: '#666',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  exerciseDetailsCompleted: {
    color: '#fff',
  },
  exerciseNotes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
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

  // Timer Styles
  workoutTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  workoutTimerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  stopWorkoutButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stopWorkoutText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  restTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  restTimerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  stopTimerButton: {
    padding: 4,
  },

  // Completed Badge
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#000',
    borderRadius: 12,
    gap: 8,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
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

  // History Modal Styles
  historyModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '95%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  historyList: {
    maxHeight: 400,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  historyEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyDate: {
    flex: 1,
  },
  historyDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  historyTimeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  historyData: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  historyWeight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  historyReps: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  historyRPE: {
    alignItems: 'center',
  },
  historyRPEText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  // Stats Modal Styles
  statsModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '95%',
    maxWidth: 500,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  statsContent: {
    maxHeight: 500,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
    letterSpacing: -0.3,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginTop: 8,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  progressChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: 20,
    backgroundColor: '#000',
    borderRadius: 4,
    marginBottom: 8,
  },
  chartBarLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  achievementText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  exercisePreview: {
    marginBottom: 16,
  },
  exercisePreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  exercisePreviewItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  exercisePreviewMore: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  startWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: 8,
  },
  startWorkoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  sleepItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f8f9fa',
  },
  sleepItemCompleted: {
    borderColor: '#000',
    borderWidth: 2,
  },
  sleepContent: {
    gap: 16,
  },
  sleepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sleepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepInfo: {
    flex: 1,
  },
  sleepName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  sleepTime: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sleepStats: {
    alignItems: 'flex-end',
  },
  sleepDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  sleepDurationLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
  },
  sleepDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sleepProgress: {
    flex: 1,
    marginRight: 16,
  },
  photoItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f8f9fa',
  },
  photoContent: {
    gap: 16,
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  photoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInfo: {
    flex: 1,
  },
  photoName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  photoTime: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  photoStats: {
    alignItems: 'flex-end',
  },
  photoCount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
  },
  photoCountLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  photoDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoProgress: {
    flex: 1,
    marginRight: 16,
  },
  photoButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
});

export default DaySchedule; 
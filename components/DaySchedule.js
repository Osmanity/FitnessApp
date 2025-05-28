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

const ExerciseGroup = ({ workout, workoutProgress, onExerciseComplete, onWorkoutComplete, exerciseData, onExerciseDataUpdate }) => {
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [workoutTimerActive, setWorkoutTimerActive] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);

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

  const handleExerciseComplete = (exerciseId) => {
    if (!workoutProgress[exerciseId]) {
      onExerciseComplete(exerciseId);
      
      // Start workout timer on first exercise
      if (completedExercises === 0) {
        setWorkoutTimerActive(true);
        setWorkoutStartTime(Date.now());
      }
      
      // Start rest timer after completing an exercise (except the last one)
      const newCompletedCount = completedExercises + 1;
      if (newCompletedCount < totalExercises) {
        setRestTimerActive(true);
      }
      
      // Check if this completes the workout
      if (newCompletedCount === totalExercises) {
        setWorkoutTimerActive(false);
        setTimeout(() => {
          onWorkoutComplete(workout.id);
        }, 500);
      }
    }
  };

  const handleExerciseLongPress = (exercise) => {
    setSelectedExercise(exercise);
    setNotesModalVisible(true);
  };

  const handleShowHistory = (exerciseId) => {
    setSelectedExerciseId(exerciseId);
    setHistoryModalVisible(true);
  };

  const handleExerciseDataSave = (exerciseId, data) => {
    // Add to history
    const currentData = exerciseData[exerciseId] || {};
    const history = currentData.history || [];
    
    const newEntry = {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      weight: data.weight,
      sets: workout.exercises.find(ex => ex.id === exerciseId)?.sets || 0,
      reps: workout.exercises.find(ex => ex.id === exerciseId)?.reps || 0,
      notes: data.notes,
      rpe: data.rpe || null
    };

    const updatedData = {
      ...data,
      lastWeight: currentData.weight,
      history: [newEntry, ...history.slice(0, 9)] // Keep last 10 entries
    };

    onExerciseDataUpdate(exerciseId, updatedData);
  };

  const handleRestComplete = () => {
    setRestTimerActive(false);
    Alert.alert('Rest Complete!', 'Time for your next set! 💪');
  };

  const handleWorkoutStop = () => {
    Alert.alert(
      'Stop Workout?',
      'Are you sure you want to stop the current workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Stop', 
          style: 'destructive',
          onPress: () => {
            setWorkoutTimerActive(false);
            setRestTimerActive(false);
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.exerciseGroup, isWorkoutCompleted && styles.exerciseGroupCompleted]}>
      <View style={styles.groupHeader}>
        <View style={styles.groupTitleContainer}>
          <Text style={styles.groupTitle}>{workout.group}</Text>
          <View style={styles.groupMetrics}>
            <Text style={styles.groupDuration}>{workout.duration} min</Text>
            <Text style={styles.exerciseCount}>{totalExercises} exercises</Text>
            <Text style={styles.volumeText}>{Math.round(estimatedVolume)}kg volume</Text>
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

      {/* Timers */}
      <WorkoutTimer 
        isActive={workoutTimerActive}
        onStop={handleWorkoutStop}
        startTime={workoutStartTime}
      />
      <RestTimer 
        isActive={restTimerActive}
        duration={90}
        onComplete={handleRestComplete}
        onStop={() => setRestTimerActive(false)}
      />
      
      <View style={styles.exerciseList}>
        {workout.exercises.map((exercise, index) => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            onComplete={handleExerciseComplete}
            onLongPress={handleExerciseLongPress}
            onShowHistory={handleShowHistory}
            isCompleted={workoutProgress[exercise.id]}
            exerciseData={exerciseData[exercise.id] || {}}
          />
        ))}
      </View>
      
      {isWorkoutCompleted && (
        <View style={styles.completedBadge}>
          <MaterialCommunityIcons name="trophy" size={20} color="#FFD700" />
          <Text style={styles.completedText}>Workout Complete!</Text>
          <MaterialCommunityIcons name="fire" size={20} color="#FF6B35" />
        </View>
      )}

      <ExerciseNotes
        visible={notesModalVisible}
        onClose={() => setNotesModalVisible(false)}
        exercise={selectedExercise}
        onSave={handleExerciseDataSave}
        initialNotes={selectedExercise ? (exerciseData[selectedExercise.id]?.notes || '') : ''}
        initialWeight={selectedExercise ? (exerciseData[selectedExercise.id]?.weight || '') : ''}
      />

      <WorkoutHistory
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        exerciseId={selectedExerciseId}
        exerciseData={exerciseData[selectedExerciseId] || {}}
      />
    </View>
  );
};

const DaySchedule = ({ selectedDay, workoutProgress = {}, onWorkoutComplete, onExerciseComplete, exerciseData = {}, onExerciseDataUpdate }) => {
  const [timerActive, setTimerActive] = useState(false);
  const [currentTimer, setCurrentTimer] = useState(0);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [dayStats, setDayStats] = useState({
    totalWorkoutTime: 0,
    caloriesBurned: 0,
    setsCompleted: 0
  });

  // Calculate day statistics
  useEffect(() => {
    if (selectedDay?.workouts) {
      const totalSets = selectedDay.workouts.reduce((sum, workout) => 
        sum + workout.exercises.reduce((exerciseSum, exercise) => 
          exerciseSum + (workoutProgress[exercise.id] ? exercise.sets : 0), 0
        ), 0
      );
      
      const estimatedCalories = totalSets * 8; // Rough estimate: 8 calories per set
      
      setDayStats({
        totalWorkoutTime: selectedDay.workouts.reduce((sum, w) => sum + w.duration, 0),
        caloriesBurned: estimatedCalories,
        setsCompleted: totalSets
      });
    }
  }, [workoutProgress, selectedDay]);

  if (!selectedDay) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>The Current</Text>
        <Text style={styles.title}>Day Schedule</Text>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="calendar-clock" size={64} color="#ddd" />
          <Text style={styles.emptyStateText}>Select a day to view schedule</Text>
          <Text style={styles.emptyStateSubtext}>Choose any day from the week above</Text>
        </View>
        
        {/* Enhanced workout tips */}
        <View style={styles.additionalContent}>
          <Text style={styles.sectionHeader}>Advanced Training Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💪 Mind-Muscle Connection</Text>
            <Text style={styles.tipText}>Focus on feeling the target muscle working during each rep. Quality over quantity always wins.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🔥 Time Under Tension</Text>
            <Text style={styles.tipText}>Control the eccentric (lowering) phase for 2-3 seconds to maximize muscle growth.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>⏰ Rest Periods</Text>
            <Text style={styles.tipText}>Compound movements: 2-3 min rest. Isolation exercises: 60-90 seconds rest.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>📈 Progressive Overload</Text>
            <Text style={styles.tipText}>Increase weight by 2.5-5% when you can complete all sets with perfect form.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🎯 RPE Scale</Text>
            <Text style={styles.tipText}>Rate of Perceived Exertion: Aim for RPE 7-8 (2-3 reps in reserve) for optimal gains.</Text>
          </View>
        </View>
      </View>
    );
  }

  const { workouts } = selectedDay;

  if (selectedDay.isRest) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>The Current</Text>
        <Text style={styles.title}>Day Schedule</Text>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="sleep" size={64} color="#4CAF50" />
          <Text style={styles.emptyStateText}>Active Recovery Day</Text>
          <Text style={styles.emptyStateSubtext}>Your muscles grow during rest!</Text>
        </View>
        
        {/* Enhanced recovery activities */}
        <View style={styles.additionalContent}>
          <Text style={styles.sectionHeader}>Recovery Protocol</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🧘‍♂️ Mobility Work (20-30 min)</Text>
            <Text style={styles.tipText}>Dynamic stretching, foam rolling, and yoga to improve flexibility and reduce muscle tension.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🚶‍♂️ Active Recovery (30-45 min)</Text>
            <Text style={styles.tipText}>Light walking, swimming, or cycling at 50-60% max heart rate to promote blood flow.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💤 Sleep Optimization</Text>
            <Text style={styles.tipText}>7-9 hours of quality sleep. Keep room cool (65-68°F) and dark for optimal recovery.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🥗 Recovery Nutrition</Text>
            <Text style={styles.tipText}>Focus on anti-inflammatory foods: berries, fatty fish, leafy greens, and adequate protein (1g per lb bodyweight).</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💧 Hydration & Supplements</Text>
            <Text style={styles.tipText}>Drink 3-4L water daily. Consider magnesium, vitamin D, and omega-3s for recovery support.</Text>
          </View>
        </View>
      </View>
    );
  }

  // Calculate overall progress for the day
  const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
  const completedExercises = workouts.reduce((sum, workout) => 
    sum + workout.exercises.filter(ex => workoutProgress[ex.id]).length, 0
  );
  const dayProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.dayHeader}>
        <View>
      <Text style={styles.sectionTitle}>The Current</Text>
      <Text style={styles.title}>Day Schedule</Text>
        </View>
        <View style={styles.dayHeaderActions}>
          <TouchableOpacity 
            style={styles.analyticsButton}
            onPress={() => setStatsModalVisible(true)}
          >
            <MaterialCommunityIcons name="chart-line" size={20} color="#4CAF50" />
            <Text style={styles.analyticsButtonText}>Analytics</Text>
          </TouchableOpacity>
          <View style={styles.dayProgressContainer}>
            <Text style={styles.dayProgressText}>{Math.round(dayProgress)}%</Text>
            <Text style={styles.dayProgressLabel}>Complete</Text>
          </View>
        </View>
      </View>

      {/* Enhanced Statistics Dashboard */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#4CAF50" />
          <Text style={styles.statValue}>{dayStats.totalWorkoutTime}</Text>
          <Text style={styles.statLabel}>min</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="fire" size={20} color="#FF6B35" />
          <Text style={styles.statValue}>{dayStats.caloriesBurned}</Text>
          <Text style={styles.statLabel}>cal</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="weight-lifter" size={20} color="#2196F3" />
          <Text style={styles.statValue}>{dayStats.setsCompleted}</Text>
          <Text style={styles.statLabel}>sets</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="target" size={20} color="#9C27B0" />
          <Text style={styles.statValue}>{completedExercises}</Text>
          <Text style={styles.statLabel}>exercises</Text>
        </View>
      </View>
      
      <View style={styles.timeline}>
        {workouts.map((workout, index) => (
          <View key={workout.id} style={styles.timeBlock}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{workout.time}</Text>
              <View style={styles.timeLine} />
            </View>
            <View style={styles.workoutContainer}>
            <ExerciseGroup
                workout={workout}
                workoutProgress={workoutProgress}
                onExerciseComplete={onExerciseComplete}
                onWorkoutComplete={onWorkoutComplete}
                exerciseData={exerciseData}
                onExerciseDataUpdate={onExerciseDataUpdate}
              />
            </View>
          </View>
        ))}
      </View>
      
      {/* Enhanced workout notes and tips */}
      <View style={styles.additionalContent}>
        <Text style={styles.sectionHeader}>Advanced Training Notes</Text>
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>🎯 Technique Focus</Text>
          <Text style={styles.noteText}>• Maintain neutral spine throughout all movements</Text>
          <Text style={styles.noteText}>• Engage core before initiating each rep</Text>
          <Text style={styles.noteText}>• Full range of motion unless contraindicated</Text>
          <Text style={styles.noteText}>• Control tempo: 2-1-2-1 (eccentric-pause-concentric-pause)</Text>
        </View>
        
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>📊 Performance Tracking</Text>
          <Text style={styles.noteText}>• Log weight, reps, and RPE for each set</Text>
          <Text style={styles.noteText}>• Note any form breakdowns or compensations</Text>
          <Text style={styles.noteText}>• Track energy levels and motivation (1-10 scale)</Text>
          <Text style={styles.noteText}>• Record any pain or discomfort immediately</Text>
        </View>
        
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>🔄 Progression Strategy</Text>
          <Text style={styles.noteText}>• Week 1-2: Focus on form and movement patterns</Text>
          <Text style={styles.noteText}>• Week 3-4: Increase load by 5-10% if form is perfect</Text>
          <Text style={styles.noteText}>• Week 5-6: Add volume (extra set) or intensity techniques</Text>
          <Text style={styles.noteText}>• Week 7: Deload week (reduce volume by 40-50%)</Text>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>⚡ Intensity Techniques</Text>
          <Text style={styles.noteText}>• Drop sets: Reduce weight by 20-30% and continue</Text>
          <Text style={styles.noteText}>• Rest-pause: Rest 10-15 seconds, then continue set</Text>
          <Text style={styles.noteText}>• Tempo manipulation: Slow eccentrics (3-5 seconds)</Text>
          <Text style={styles.noteText}>• Cluster sets: Break one set into mini-sets with short rest</Text>
        </View>
      </View>

      <AdvancedStats
        visible={statsModalVisible}
        onClose={() => setStatsModalVisible(false)}
        dayStats={dayStats}
        weeklyProgress={[]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dayHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  analyticsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  dayProgressContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
  },
  dayProgressText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  dayProgressLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  // Enhanced Statistics Dashboard
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  timeline: {
    paddingTop: 16,
  },
  timeBlock: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timeContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  timeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
  },
  workoutContainer: {
    flex: 1,
  },
  exerciseGroup: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  exerciseGroupCompleted: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
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
    fontWeight: 'bold',
  },
  groupMetrics: {
    alignItems: 'flex-end',
  },
  groupDuration: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  exerciseCount: {
    fontSize: 12,
    color: '#999',
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
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    minWidth: 30,
  },
  // Timer Styles
  workoutTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    gap: 8,
  },
  workoutTimerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    flex: 1,
  },
  stopWorkoutButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stopWorkoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  restTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    gap: 8,
  },
  restTimerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    flex: 1,
  },
  stopTimerButton: {
    padding: 4,
  },
  exerciseList: {
    gap: 8,
  },
  exerciseItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  exerciseItemCompleted: {
    backgroundColor: '#f0f8f0',
    borderColor: '#4CAF50',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
    fontWeight: '500',
  },
  exerciseNameCompleted: {
    color: '#4CAF50',
    textDecorationLine: 'line-through',
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  exerciseWeight: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  lastWeight: {
    fontSize: 10,
    color: '#999',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
  },
  exerciseDetailsCompleted: {
    color: '#4CAF50',
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
    padding: 4,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkBoxCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    gap: 8,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
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
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  weightInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // History Modal Styles
  historyModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '95%',
    maxWidth: 500,
    maxHeight: '80%',
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
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
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
  },
  historyData: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  historyWeight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  historyReps: {
    fontSize: 12,
    color: '#666',
  },
  historyRPE: {
    alignItems: 'center',
  },
  historyRPEText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  // Stats Modal Styles
  statsModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '95%',
    maxWidth: 500,
    maxHeight: '85%',
  },
  statsContent: {
    maxHeight: 500,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
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
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  progressChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    marginBottom: 8,
  },
  chartBarLabel: {
    fontSize: 10,
    color: '#666',
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  achievementText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
  additionalContent: {
    marginTop: 32,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  tipCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default DaySchedule; 
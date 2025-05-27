import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ExerciseItem = ({ exercise, onComplete, isCompleted }) => (
  <TouchableOpacity 
    style={[styles.exerciseItem, isCompleted && styles.exerciseItemCompleted]}
    onPress={() => onComplete(exercise.id)}
    activeOpacity={0.7}
  >
    <View style={styles.exerciseHeader}>
      <Text style={[styles.exerciseName, isCompleted && styles.exerciseNameCompleted]}>
        {exercise.name}
      </Text>
      <View style={[styles.checkBox, isCompleted && styles.checkBoxCompleted]}>
        {isCompleted && (
          <MaterialCommunityIcons name="check" size={16} color="#fff" />
        )}
      </View>
    </View>
    <Text style={[styles.exerciseDetails, isCompleted && styles.exerciseDetailsCompleted]}>
      {exercise.sets} sets of {exercise.reps} reps
    </Text>
  </TouchableOpacity>
);

const ExerciseGroup = ({ workout, workoutProgress, onExerciseComplete, onWorkoutComplete }) => {
  const completedExercises = workout.exercises.filter(ex => workoutProgress[ex.id]).length;
  const totalExercises = workout.exercises.length;
  const isWorkoutCompleted = completedExercises === totalExercises && totalExercises > 0;
  const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  const handleExerciseComplete = (exerciseId) => {
    if (!workoutProgress[exerciseId]) {
      onExerciseComplete(exerciseId);
      
      // Check if this completes the workout
      const newCompletedCount = completedExercises + 1;
      if (newCompletedCount === totalExercises) {
        setTimeout(() => {
          onWorkoutComplete(workout.id);
        }, 500);
      }
    }
  };

  return (
    <View style={[styles.exerciseGroup, isWorkoutCompleted && styles.exerciseGroupCompleted]}>
      <View style={styles.groupHeader}>
        <View style={styles.groupTitleContainer}>
          <Text style={styles.groupTitle}>{workout.group}</Text>
          <Text style={styles.groupDuration}>{workout.duration} min</Text>
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
      
      <View style={styles.exerciseList}>
        {workout.exercises.map((exercise, index) => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            onComplete={handleExerciseComplete}
            isCompleted={workoutProgress[exercise.id]}
          />
        ))}
      </View>
      
      {isWorkoutCompleted && (
        <View style={styles.completedBadge}>
          <MaterialCommunityIcons name="trophy" size={20} color="#FFD700" />
          <Text style={styles.completedText}>Workout Complete!</Text>
        </View>
      )}
    </View>
  );
};

const DaySchedule = ({ selectedDay, workoutProgress = {}, onWorkoutComplete, onExerciseComplete }) => {
  const [timerActive, setTimerActive] = useState(false);
  const [currentTimer, setCurrentTimer] = useState(0);

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
        
        {/* Additional content for scrolling demo */}
        <View style={styles.additionalContent}>
          <Text style={styles.sectionHeader}>Workout Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💪 Stay Hydrated</Text>
            <Text style={styles.tipText}>Drink water before, during, and after your workout to maintain optimal performance.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🔥 Warm Up Properly</Text>
            <Text style={styles.tipText}>Always start with 5-10 minutes of light cardio and dynamic stretching.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>⏰ Rest Between Sets</Text>
            <Text style={styles.tipText}>Take 30-90 seconds rest between sets for optimal muscle recovery.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>📈 Progressive Overload</Text>
            <Text style={styles.tipText}>Gradually increase weight, reps, or sets to continue making progress.</Text>
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
          <Text style={styles.emptyStateText}>Rest Day</Text>
          <Text style={styles.emptyStateSubtext}>Take time to recover and recharge!</Text>
        </View>
        
        {/* Rest day activities */}
        <View style={styles.additionalContent}>
          <Text style={styles.sectionHeader}>Recovery Activities</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🧘‍♂️ Light Stretching</Text>
            <Text style={styles.tipText}>Gentle yoga or stretching to maintain flexibility and reduce muscle tension.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🚶‍♂️ Light Walk</Text>
            <Text style={styles.tipText}>A 20-30 minute walk to promote blood flow and active recovery.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💤 Quality Sleep</Text>
            <Text style={styles.tipText}>Aim for 7-9 hours of quality sleep for optimal muscle recovery.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🥗 Nutrition Focus</Text>
            <Text style={styles.tipText}>Focus on protein-rich meals to support muscle repair and growth.</Text>
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
        <View style={styles.dayProgressContainer}>
          <Text style={styles.dayProgressText}>{Math.round(dayProgress)}%</Text>
          <Text style={styles.dayProgressLabel}>Complete</Text>
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
              />
            </View>
          </View>
        ))}
      </View>
      
      {/* Workout notes and tips */}
      <View style={styles.additionalContent}>
        <Text style={styles.sectionHeader}>Workout Notes</Text>
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>🎯 Focus Points</Text>
          <Text style={styles.noteText}>• Maintain proper form throughout each exercise</Text>
          <Text style={styles.noteText}>• Control the weight on both concentric and eccentric phases</Text>
          <Text style={styles.noteText}>• Breathe properly - exhale on exertion, inhale on release</Text>
        </View>
        
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>📊 Tracking</Text>
          <Text style={styles.noteText}>• Record weights used for each exercise</Text>
          <Text style={styles.noteText}>• Note any form improvements or challenges</Text>
          <Text style={styles.noteText}>• Track overall energy levels and performance</Text>
        </View>
        
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>🔄 Next Session</Text>
          <Text style={styles.noteText}>• Aim to increase weight by 2.5-5lbs if all reps completed</Text>
          <Text style={styles.noteText}>• Focus on any weak points identified today</Text>
          <Text style={styles.noteText}>• Consider adding drop sets for extra intensity</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100, // Extra padding for scrolling
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
  groupDuration: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  exerciseNameCompleted: {
    color: '#4CAF50',
    textDecorationLine: 'line-through',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
  },
  exerciseDetailsCompleted: {
    color: '#4CAF50',
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
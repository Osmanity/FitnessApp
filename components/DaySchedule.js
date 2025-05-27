import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ExerciseGroup = ({ title, exercises, time }) => (
  <View style={styles.exerciseGroup}>
    <View style={styles.groupHeader}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.exerciseCount}>
        <Text style={styles.exerciseCountText}>{exercises.length} Exercises</Text>
      </View>
    </View>
    <View style={styles.exerciseList}>
      {exercises.map((exercise, index) => (
        <View key={index} style={styles.exerciseItem}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseDetails}>
            {exercise.sets} sets of {exercise.reps} reps
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const DaySchedule = ({ selectedDay }) => {
  if (!selectedDay) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>The Current</Text>
        <Text style={styles.title}>Day Schedule</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Select a day to view schedule</Text>
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

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>The Current</Text>
      <Text style={styles.title}>Day Schedule</Text>
      <View style={styles.timeline}>
        {workouts.map((block, index) => (
          <View key={index} style={styles.timeBlock}>
            <Text style={styles.timeText}>{block.time}</Text>
            <ExerciseGroup
              title={block.group}
              exercises={block.exercises}
              time={block.time}
            />
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
  sectionTitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  timeline: {
    paddingTop: 16,
  },
  timeBlock: {
    marginBottom: 24,
  },
  timeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  exerciseGroup: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exerciseCount: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  exerciseCountText: {
    color: '#fff',
    fontSize: 14,
  },
  exerciseList: {
    gap: 12,
  },
  exerciseItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
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
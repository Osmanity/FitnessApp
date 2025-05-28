import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const WorkoutHistoryScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, completed, missed

  const workoutHistory = [
    {
      id: 1,
      date: '2024-01-15',
      day: 'Monday',
      workouts: [
        { name: 'Chest Workout', duration: 45, exercises: 6, completed: true },
        { name: 'Triceps', duration: 30, exercises: 4, completed: true }
      ],
      totalDuration: 75,
      totalExercises: 10,
      completed: true
    },
    {
      id: 2,
      date: '2024-01-14',
      day: 'Sunday',
      workouts: [
        { name: 'Core Workout', duration: 30, exercises: 4, completed: true },
        { name: 'Arms', duration: 25, exercises: 3, completed: false }
      ],
      totalDuration: 30,
      totalExercises: 4,
      completed: false
    },
    {
      id: 3,
      date: '2024-01-12',
      day: 'Friday',
      workouts: [
        { name: 'Legs Workout', duration: 60, exercises: 6, completed: true },
        { name: 'Calves', duration: 15, exercises: 3, completed: true }
      ],
      totalDuration: 75,
      totalExercises: 9,
      completed: true
    },
    {
      id: 4,
      date: '2024-01-11',
      day: 'Thursday',
      workouts: [
        { name: 'Shoulders', duration: 40, exercises: 5, completed: true },
        { name: 'Traps', duration: 20, exercises: 3, completed: true }
      ],
      totalDuration: 60,
      totalExercises: 8,
      completed: true
    },
    {
      id: 5,
      date: '2024-01-09',
      day: 'Tuesday',
      workouts: [
        { name: 'Back Workout', duration: 50, exercises: 5, completed: true },
        { name: 'Biceps', duration: 25, exercises: 4, completed: true }
      ],
      totalDuration: 75,
      totalExercises: 9,
      completed: true
    },
    {
      id: 6,
      date: '2024-01-08',
      day: 'Monday',
      workouts: [
        { name: 'Chest Workout', duration: 0, exercises: 0, completed: false },
        { name: 'Triceps', duration: 0, exercises: 0, completed: false }
      ],
      totalDuration: 0,
      totalExercises: 0,
      completed: false
    }
  ];

  const filteredHistory = workoutHistory.filter(day => {
    const matchesSearch = day.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         day.workouts.some(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterType === 'completed') return day.completed && matchesSearch;
    if (filterType === 'missed') return !day.completed && matchesSearch;
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const getCompletionRate = () => {
    const completed = workoutHistory.filter(day => day.completed).length;
    return Math.round((completed / workoutHistory.length) * 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Workout History</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="calendar-export" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{workoutHistory.length}</Text>
          <Text style={styles.summaryLabel}>Total Days</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{workoutHistory.filter(d => d.completed).length}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{getCompletionRate()}%</Text>
          <Text style={styles.summaryLabel}>Success Rate</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {Math.round(workoutHistory.reduce((sum, day) => sum + day.totalDuration, 0) / 60)}h
          </Text>
          <Text style={styles.summaryLabel}>Total Time</Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workouts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filterType === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilterType('completed')}
        >
          <Text style={[styles.filterText, filterType === 'completed' && styles.filterTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filterType === 'missed' && styles.filterButtonActive]}
          onPress={() => setFilterType('missed')}
        >
          <Text style={[styles.filterText, filterType === 'missed' && styles.filterTextActive]}>
            Missed
          </Text>
        </TouchableOpacity>
      </View>

      {/* History List */}
      <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
        {filteredHistory.map((day) => (
          <View key={day.id} style={[
            styles.historyCard,
            day.completed ? styles.historyCardCompleted : styles.historyCardMissed
          ]}>
            <View style={styles.historyHeader}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{formatDate(day.date)}</Text>
                <Text style={styles.dayText}>{day.day}</Text>
              </View>
              <View style={styles.statusContainer}>
                {day.completed ? (
                  <View style={styles.completedBadge}>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                ) : (
                  <View style={styles.missedBadge}>
                    <MaterialCommunityIcons name="close-circle" size={16} color="#FF5722" />
                    <Text style={styles.missedText}>Missed</Text>
                  </View>
                )}
              </View>
            </View>

            {day.completed && (
              <View style={styles.workoutSummary}>
                <View style={styles.summaryRow}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                  <Text style={styles.summaryText}>{day.totalDuration} minutes</Text>
                </View>
                <View style={styles.summaryRow}>
                  <MaterialCommunityIcons name="dumbbell" size={16} color="#666" />
                  <Text style={styles.summaryText}>{day.totalExercises} exercises</Text>
                </View>
                <View style={styles.summaryRow}>
                  <MaterialCommunityIcons name="fire" size={16} color="#666" />
                  <Text style={styles.summaryText}>{day.totalExercises * 8} calories</Text>
                </View>
              </View>
            )}

            <View style={styles.workoutsList}>
              {day.workouts.map((workout, index) => (
                <View key={index} style={[
                  styles.workoutItem,
                  workout.completed ? styles.workoutCompleted : styles.workoutMissed
                ]}>
                  <View style={styles.workoutInfo}>
                    <Text style={[
                      styles.workoutName,
                      workout.completed ? styles.workoutNameCompleted : styles.workoutNameMissed
                    ]}>
                      {workout.name}
                    </Text>
                    {workout.completed && (
                      <Text style={styles.workoutDetails}>
                        {workout.duration}min • {workout.exercises} exercises
                      </Text>
                    )}
                  </View>
                  <MaterialCommunityIcons 
                    name={workout.completed ? "check-circle" : "close-circle"} 
                    size={20} 
                    color={workout.completed ? "#4CAF50" : "#FF5722"} 
                  />
                </View>
              ))}
            </View>

            {day.completed && (
              <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color="#4CAF50" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {filteredHistory.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="history" size={64} color="#ddd" />
            <Text style={styles.emptyStateText}>No workouts found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Start working out to see your history!'}
            </Text>
          </View>
        )}
      </ScrollView>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  // Summary Card
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  // Search and Filter
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  // History List
  historyList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyCardCompleted: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  historyCardMissed: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  dayText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  missedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  missedText: {
    fontSize: 12,
    color: '#FF5722',
    fontWeight: '600',
  },
  workoutSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryText: {
    fontSize: 12,
    color: '#666',
  },
  workoutsList: {
    gap: 8,
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  workoutCompleted: {
    backgroundColor: '#f0f8f0',
    borderColor: '#e0f0e0',
  },
  workoutMissed: {
    backgroundColor: '#fff5f5',
    borderColor: '#ffe0e0',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  workoutNameCompleted: {
    color: '#000',
  },
  workoutNameMissed: {
    color: '#666',
  },
  workoutDetails: {
    fontSize: 12,
    color: '#666',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default WorkoutHistoryScreen; 
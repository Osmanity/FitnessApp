import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ProgressScreen = ({ navigation }) => {
  const [timeframe, setTimeframe] = useState('week'); // week, month, year
  const [stats, setStats] = useState({
    totalWorkouts: 12,
    totalTime: 540, // minutes
    totalCalories: 2400,
    currentStreak: 5,
    weeklyGoal: 4,
    completedThisWeek: 3,
    averageWorkoutTime: 45,
    personalRecords: 8
  });

  const progressPercentage = (stats.completedThisWeek / stats.weeklyGoal) * 100;

  const weeklyData = [
    { day: 'Mon', completed: true, duration: 45 },
    { day: 'Tue', completed: true, duration: 50 },
    { day: 'Wed', completed: false, duration: 0 },
    { day: 'Thu', completed: true, duration: 40 },
    { day: 'Fri', completed: false, duration: 0 },
    { day: 'Sat', completed: false, duration: 0 },
    { day: 'Sun', completed: false, duration: 0 },
  ];

  const achievements = [
    { id: 1, title: 'First Workout', description: 'Complete your first workout', completed: true, icon: 'trophy' },
    { id: 2, title: '5 Day Streak', description: 'Workout 5 days in a row', completed: true, icon: 'fire' },
    { id: 3, title: 'Strength Builder', description: 'Complete 50 exercises', completed: true, icon: 'dumbbell' },
    { id: 4, title: 'Consistency King', description: 'Workout 4 weeks straight', completed: false, icon: 'calendar-check' },
    { id: 5, title: 'Iron Will', description: 'Complete 100 workouts', completed: false, icon: 'medal' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Progress</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="share-variant" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weekly Goal Progress */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Weekly Goal</Text>
            <Text style={styles.goalProgress}>{stats.completedThisWeek}/{stats.weeklyGoal}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progressPercentage, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progressPercentage)}%</Text>
          </View>
          <Text style={styles.goalSubtext}>
            {stats.weeklyGoal - stats.completedThisWeek > 0 
              ? `${stats.weeklyGoal - stats.completedThisWeek} more workouts to reach your goal!`
              : 'Goal achieved! 🎉'
            }
          </Text>
        </View>

        {/* Key Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="fire" size={32} color="#FF6B35" />
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="dumbbell" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="clock-outline" size={32} color="#2196F3" />
            <Text style={styles.statValue}>{Math.floor(stats.totalTime / 60)}h</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="trophy" size={32} color="#FFD700" />
            <Text style={styles.statValue}>{stats.personalRecords}</Text>
            <Text style={styles.statLabel}>Personal Records</Text>
          </View>
        </View>

        {/* Weekly Activity Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>This Week's Activity</Text>
          <View style={styles.weekChart}>
            {weeklyData.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <View style={styles.chartBar}>
                  <View 
                    style={[
                      styles.chartBarFill, 
                      { 
                        height: day.completed ? `${(day.duration / 60) * 100}%` : '5%',
                        backgroundColor: day.completed ? '#4CAF50' : '#E0E0E0'
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.dayLabel, day.completed && styles.dayLabelActive]}>
                  {day.day}
                </Text>
                {day.completed && (
                  <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsCard}>
          <Text style={styles.achievementsTitle}>Achievements</Text>
          <View style={styles.achievementsList}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={[
                styles.achievementItem,
                achievement.completed && styles.achievementCompleted
              ]}>
                <View style={[
                  styles.achievementIcon,
                  achievement.completed && styles.achievementIconCompleted
                ]}>
                  <MaterialCommunityIcons 
                    name={achievement.icon} 
                    size={24} 
                    color={achievement.completed ? '#FFD700' : '#999'} 
                  />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={[
                    styles.achievementTitle,
                    achievement.completed && styles.achievementTitleCompleted
                  ]}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                </View>
                {achievement.completed && (
                  <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Additional Metrics */}
        <View style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>Performance Metrics</Text>
          <View style={styles.metricsList}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Average Workout Time</Text>
              <Text style={styles.metricValue}>{stats.averageWorkoutTime} min</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Calories Burned</Text>
              <Text style={styles.metricValue}>{stats.totalCalories}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Workout Frequency</Text>
              <Text style={styles.metricValue}>3.5x/week</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Consistency Rate</Text>
              <Text style={styles.metricValue}>85%</Text>
            </View>
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  // Goal Card
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  goalProgress: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    minWidth: 40,
  },
  goalSubtext: {
    fontSize: 14,
    color: '#666',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  // Chart Card
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  weekChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 20,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 10,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dayLabelActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  // Achievements
  achievementsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    gap: 12,
  },
  achievementCompleted: {
    backgroundColor: '#f0f8f0',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIconCompleted: {
    backgroundColor: '#fff3e0',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  achievementTitleCompleted: {
    color: '#000',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#999',
  },
  // Metrics
  metricsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  metricsList: {
    gap: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 16,
    color: '#666',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

export default ProgressScreen; 
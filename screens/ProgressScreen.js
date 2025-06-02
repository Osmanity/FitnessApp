import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  StatusBar 
} from 'react-native';
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>Track your fitness journey</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialCommunityIcons name="share-variant" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weekly Goal Progress */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View>
              <Text style={styles.goalTitle}>Weekly Goal</Text>
              <Text style={styles.goalSubtitle}>Stay consistent with your workouts</Text>
            </View>
            <View style={styles.goalProgressContainer}>
              <Text style={styles.goalProgress}>{stats.completedThisWeek}</Text>
              <Text style={styles.goalTotal}>/{stats.weeklyGoal}</Text>
            </View>
          </View>
          
          <View style={styles.progressSection}>
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
        </View>

        {/* Key Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FF6B35' }]}>
              <MaterialCommunityIcons name="fire" size={24} color="#fff" />
            </View>
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#4CAF50' }]}>
              <MaterialCommunityIcons name="dumbbell" size={24} color="#fff" />
            </View>
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#2196F3' }]}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.statValue}>{Math.floor(stats.totalTime / 60)}h</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FFD700' }]}>
              <MaterialCommunityIcons name="trophy" size={24} color="#fff" />
            </View>
            <Text style={styles.statValue}>{stats.personalRecords}</Text>
            <Text style={styles.statLabel}>Personal Records</Text>
          </View>
        </View>

        {/* Weekly Activity Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>This Week's Activity</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.weekChart}>
            {weeklyData.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <View style={styles.chartBar}>
                  <View 
                    style={[
                      styles.chartBarFill, 
                      { 
                        height: day.completed ? `${Math.max((day.duration / 60) * 100, 20)}%` : '8%',
                        backgroundColor: day.completed ? '#000' : '#f0f0f0'
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.dayLabel, day.completed && styles.dayLabelActive]}>
                  {day.day}
                </Text>
                {day.completed && (
                  <View style={styles.checkContainer}>
                    <MaterialCommunityIcons name="check" size={12} color="#fff" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsCard}>
          <View style={styles.achievementsHeader}>
            <Text style={styles.achievementsTitle}>Achievements</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.achievementsList}>
            {achievements.slice(0, 3).map((achievement) => (
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
                    size={20} 
                    color={achievement.completed ? '#000' : '#999'} 
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
                  <View style={styles.completedBadge}>
                    <MaterialCommunityIcons name="check" size={12} color="#fff" />
                  </View>
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
              <View style={styles.metricLeft}>
                <View style={styles.metricIconContainer}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                </View>
                <Text style={styles.metricLabel}>Average Workout Time</Text>
              </View>
              <Text style={styles.metricValue}>{stats.averageWorkoutTime} min</Text>
            </View>
            
            <View style={styles.metricRow}>
              <View style={styles.metricLeft}>
                <View style={styles.metricIconContainer}>
                  <MaterialCommunityIcons name="fire" size={16} color="#666" />
                </View>
                <Text style={styles.metricLabel}>Calories Burned</Text>
              </View>
              <Text style={styles.metricValue}>{stats.totalCalories.toLocaleString()}</Text>
            </View>
            
            <View style={styles.metricRow}>
              <View style={styles.metricLeft}>
                <View style={styles.metricIconContainer}>
                  <MaterialCommunityIcons name="calendar-week" size={16} color="#666" />
                </View>
                <Text style={styles.metricLabel}>Workout Frequency</Text>
              </View>
              <Text style={styles.metricValue}>3.5x/week</Text>
            </View>
            
            <View style={styles.metricRow}>
              <View style={styles.metricLeft}>
                <View style={styles.metricIconContainer}>
                  <MaterialCommunityIcons name="chart-line" size={16} color="#666" />
                </View>
                <Text style={styles.metricLabel}>Consistency Rate</Text>
              </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  // Goal Card
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
  },
  goalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  goalProgressContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  goalProgress: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -1,
  },
  goalTotal: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginLeft: 2,
  },
  progressSection: {
    marginTop: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    minWidth: 40,
  },
  goalSubtext: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: (width - 52) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Chart Card
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
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
    width: 24,
    height: 80,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'flex-end',
    marginBottom: 12,
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 12,
    minHeight: 6,
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  dayLabelActive: {
    color: '#000',
    fontWeight: '700',
  },
  checkContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Achievements
  achievementsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  achievementsList: {
    gap: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
  },
  achievementCompleted: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementIconCompleted: {
    backgroundColor: '#fff',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  achievementTitleCompleted: {
    color: '#000',
    fontWeight: '700',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  completedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Metrics
  metricsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  metricsList: {
    gap: 20,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});

export default ProgressScreen; 
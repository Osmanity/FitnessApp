import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import WeekSchedule from '../components/WeekSchedule';
import DaySchedule from '../components/DaySchedule';

// Helper function to find today's date data
const findTodaysData = () => {
  const today = new Date();
  const startOfWeek = new Date(today);
  const currentDay = startOfWeek.getDay();
  const diff = currentDay === 0 ? -6 : 1 - currentDay;
  startOfWeek.setDate(startOfWeek.getDate() + diff);

  // Workout templates for different days (same as in WeekSchedule)
  const workoutTemplates = {
    monday: [
      {
        id: 'monday-1',
        time: '20:00',
        group: 'Chest',
        duration: 45,
        completed: false,
        exercises: [
          { id: 'chest-1', name: 'Bench Press', sets: 4, reps: 8, completed: false },
          { id: 'chest-2', name: 'Incline Press', sets: 3, reps: 10, completed: false },
          { id: 'chest-3', name: 'Chest Flyes', sets: 3, reps: 12, completed: false },
        ],
      },
      {
        id: 'monday-2',
        time: '21:00',
        group: 'Triceps',
        duration: 30,
        completed: false,
        exercises: [
          { id: 'triceps-1', name: 'Tricep Pushdowns', sets: 3, reps: 12, completed: false },
          { id: 'triceps-2', name: 'Skull Crushers', sets: 3, reps: 10, completed: false },
          { id: 'triceps-3', name: 'Overhead Extensions', sets: 3, reps: 12, completed: false },
        ],
      }
    ],
    tuesday: [
      {
        id: 'tuesday-1',
        time: '19:30',
        group: 'Back',
        duration: 50,
        completed: false,
        exercises: [
          { id: 'back-1', name: 'Pull-Ups', sets: 4, reps: 8, completed: false },
          { id: 'back-2', name: 'Barbell Rows', sets: 3, reps: 10, completed: false },
          { id: 'back-3', name: 'Lat Pulldowns', sets: 3, reps: 12, completed: false },
        ],
      },
      {
        id: 'tuesday-2',
        time: '20:30',
        group: 'Biceps',
        duration: 25,
        completed: false,
        exercises: [
          { id: 'biceps-1', name: 'Barbell Curls', sets: 3, reps: 12, completed: false },
          { id: 'biceps-2', name: 'Hammer Curls', sets: 3, reps: 12, completed: false },
          { id: 'biceps-3', name: 'Preacher Curls', sets: 3, reps: 10, completed: false },
        ],
      }
    ],
    thursday: [
      {
        id: 'thursday-1',
        time: '20:00',
        group: 'Shoulders',
        duration: 40,
        completed: false,
        exercises: [
          { id: 'shoulders-1', name: 'Military Press', sets: 4, reps: 8, completed: false },
          { id: 'shoulders-2', name: 'Lateral Raises', sets: 3, reps: 12, completed: false },
          { id: 'shoulders-3', name: 'Front Raises', sets: 3, reps: 12, completed: false },
        ],
      },
      {
        id: 'thursday-2',
        time: '21:00',
        group: 'Traps',
        duration: 20,
        completed: false,
        exercises: [
          { id: 'traps-1', name: 'Shrugs', sets: 3, reps: 15, completed: false },
          { id: 'traps-2', name: 'Upright Rows', sets: 3, reps: 12, completed: false },
          { id: 'traps-3', name: 'Face Pulls', sets: 3, reps: 15, completed: false },
        ],
      }
    ],
    saturday: [
      {
        id: 'saturday-1',
        time: '19:00',
        group: 'Legs',
        duration: 60,
        completed: false,
        exercises: [
          { id: 'legs-1', name: 'Squats', sets: 4, reps: 8, completed: false },
          { id: 'legs-2', name: 'Leg Press', sets: 3, reps: 12, completed: false },
          { id: 'legs-3', name: 'Romanian Deadlifts', sets: 3, reps: 10, completed: false },
        ],
      },
      {
        id: 'saturday-2',
        time: '20:00',
        group: 'Calves',
        duration: 15,
        completed: false,
        exercises: [
          { id: 'calves-1', name: 'Standing Calf Raises', sets: 4, reps: 15, completed: false },
          { id: 'calves-2', name: 'Seated Calf Raises', sets: 3, reps: 20, completed: false },
          { id: 'calves-3', name: 'Leg Press Calf Raises', sets: 3, reps: 15, completed: false },
        ],
      }
    ],
    sunday: [
      {
        id: 'sunday-1',
        time: '20:00',
        group: 'Core',
        duration: 30,
        completed: false,
        exercises: [
          { id: 'core-1', name: 'Planks', sets: 3, reps: 60, completed: false },
          { id: 'core-2', name: 'Russian Twists', sets: 3, reps: 20, completed: false },
          { id: 'core-3', name: 'Leg Raises', sets: 3, reps: 15, completed: false },
        ],
      },
      {
        id: 'sunday-2',
        time: '21:00',
        group: 'Arms',
        duration: 25,
        completed: false,
        exercises: [
          { id: 'arms-1', name: 'Superset Curls', sets: 3, reps: 12, completed: false },
          { id: 'arms-2', name: 'Tricep Extensions', sets: 3, reps: 12, completed: false },
          { id: 'arms-3', name: 'Forearm Curls', sets: 3, reps: 15, completed: false },
        ],
      }
    ]
  };

  const dayIndex = (today.getDay() + 6) % 7;
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Map day index to workout template
  let workouts = [];
  if (dayIndex === 0) workouts = workoutTemplates.monday;
  else if (dayIndex === 1) workouts = workoutTemplates.tuesday;
  else if (dayIndex === 3) workouts = workoutTemplates.thursday;
  else if (dayIndex === 5) workouts = workoutTemplates.saturday;
  else if (dayIndex === 6) workouts = workoutTemplates.sunday;

  return {
    day: dayNames[dayIndex],
    date: today.getDate().toString(),
    hasWorkout: ![2, 4].includes(dayIndex),
    isRest: [2, 4].includes(dayIndex),
    isToday: true,
    fullDate: today,
    workouts
  };
};

const PlansScreen = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [workoutProgress, setWorkoutProgress] = useState({});
  const scrollY = useSharedValue(0);

  // Auto-select today's date on component mount
  useEffect(() => {
    const todaysData = findTodaysData();
    setSelectedDay(todaysData);
  }, []);

  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };

  const handleWorkoutComplete = (workoutId) => {
    Alert.alert(
      'Workout Complete!',
      'Great job finishing your workout! 💪',
      [
        {
          text: 'OK',
          onPress: () => {
            setWorkoutProgress(prev => ({
              ...prev,
              [workoutId]: true
            }));
          }
        }
      ]
    );
  };

  const handleExerciseComplete = (exerciseId) => {
    setWorkoutProgress(prev => ({
      ...prev,
      [exerciseId]: true
    }));
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated styles for the sticky header
  const stickyHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 30, 80],
      [0, 0.3, 1],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, 80],
      [-20, 0],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [0, 80],
      [0.95, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity: withTiming(opacity, { duration: 200 }),
      transform: [
        { translateY: withSpring(translateY, { damping: 15, stiffness: 150 }) },
        { scale: withTiming(scale, { duration: 200 }) }
      ],
    };
  });

  // Animated styles for the main week schedule
  const weekScheduleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, 80, 120],
      [1, 0.95, 0.9],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, 40, 80],
      [1, 0.8, 0.4],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, 80],
      [0, -10],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { scale: withTiming(scale, { duration: 200 }) },
        { translateY: withSpring(translateY, { damping: 15, stiffness: 150 }) }
      ],
      opacity: withTiming(opacity, { duration: 200 }),
    };
  });

  // Animated styles for the content container
  const contentStyle = useAnimatedStyle(() => {
    const paddingTop = interpolate(
      scrollY.value,
      [0, 80],
      [0, 80],
      Extrapolate.CLAMP
    );

    return {
      paddingTop: withTiming(paddingTop, { duration: 200 }),
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="menu" size={24} color="#000" style={styles.menuIcon} />
        <Text style={styles.title}>Plans</Text>
        <MaterialCommunityIcons name="bell" size={24} color="#000" style={styles.bellIcon} />
      </View>

      {/* Sticky Header */}
      <Animated.View style={[styles.stickyHeader, stickyHeaderStyle]}>
        <WeekSchedule 
          onDaySelect={handleDaySelect} 
          selectedDate={selectedDay?.date}
          isCompact={true}
        />
      </Animated.View>

      <Animated.ScrollView 
        style={styles.content}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.contentContainer, contentStyle]}>
          <Animated.View style={weekScheduleStyle}>
            <WeekSchedule 
              onDaySelect={handleDaySelect} 
              selectedDate={selectedDay?.date}
              isCompact={false}
            />
          </Animated.View>
          <DaySchedule 
            selectedDay={selectedDay} 
            workoutProgress={workoutProgress}
            onWorkoutComplete={handleWorkoutComplete}
            onExerciseComplete={handleExerciseComplete}
          />
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  stickyHeader: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    zIndex: 5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  menuIcon: {
    padding: 4,
  },
  bellIcon: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default PlansScreen; 
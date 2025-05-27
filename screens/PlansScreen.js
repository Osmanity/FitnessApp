import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
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
        time: '20:00',
        group: 'Chest',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: 8 },
          { name: 'Incline Press', sets: 3, reps: 10 },
          { name: 'Chest Flyes', sets: 3, reps: 12 },
        ],
      },
      {
        time: '21:00',
        group: 'Triceps',
        exercises: [
          { name: 'Tricep Pushdowns', sets: 3, reps: 12 },
          { name: 'Skull Crushers', sets: 3, reps: 10 },
          { name: 'Overhead Extensions', sets: 3, reps: 12 },
        ],
      }
    ],
    tuesday: [
      {
        time: '19:30',
        group: 'Back',
        exercises: [
          { name: 'Pull-Ups', sets: 4, reps: 8 },
          { name: 'Barbell Rows', sets: 3, reps: 10 },
          { name: 'Lat Pulldowns', sets: 3, reps: 12 },
        ],
      },
      {
        time: '20:30',
        group: 'Biceps',
        exercises: [
          { name: 'Barbell Curls', sets: 3, reps: 12 },
          { name: 'Hammer Curls', sets: 3, reps: 12 },
          { name: 'Preacher Curls', sets: 3, reps: 10 },
        ],
      }
    ],
    thursday: [
      {
        time: '20:00',
        group: 'Shoulders',
        exercises: [
          { name: 'Military Press', sets: 4, reps: 8 },
          { name: 'Lateral Raises', sets: 3, reps: 12 },
          { name: 'Front Raises', sets: 3, reps: 12 },
        ],
      },
      {
        time: '21:00',
        group: 'Traps',
        exercises: [
          { name: 'Shrugs', sets: 3, reps: 15 },
          { name: 'Upright Rows', sets: 3, reps: 12 },
          { name: 'Face Pulls', sets: 3, reps: 15 },
        ],
      }
    ],
    saturday: [
      {
        time: '19:00',
        group: 'Legs',
        exercises: [
          { name: 'Squats', sets: 4, reps: 8 },
          { name: 'Leg Press', sets: 3, reps: 12 },
          { name: 'Romanian Deadlifts', sets: 3, reps: 10 },
        ],
      },
      {
        time: '20:00',
        group: 'Calves',
        exercises: [
          { name: 'Standing Calf Raises', sets: 4, reps: 15 },
          { name: 'Seated Calf Raises', sets: 3, reps: 20 },
          { name: 'Leg Press Calf Raises', sets: 3, reps: 15 },
        ],
      }
    ],
    sunday: [
      {
        time: '20:00',
        group: 'Core',
        exercises: [
          { name: 'Planks', sets: 3, reps: 60 },
          { name: 'Russian Twists', sets: 3, reps: 20 },
          { name: 'Leg Raises', sets: 3, reps: 15 },
        ],
      },
      {
        time: '21:00',
        group: 'Arms',
        exercises: [
          { name: 'Superset Curls', sets: 3, reps: 12 },
          { name: 'Tricep Extensions', sets: 3, reps: 12 },
          { name: 'Forearm Curls', sets: 3, reps: 15 },
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
  const scrollY = useSharedValue(0);

  // Auto-select today's date on component mount
  useEffect(() => {
    const todaysData = findTodaysData();
    setSelectedDay(todaysData);
  }, []);

  const handleDaySelect = (day) => {
    setSelectedDay(day);
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
          <DaySchedule selectedDay={selectedDay} />
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
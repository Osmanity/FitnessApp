import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withSpring,
  withTiming,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
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

// Helper function to generate all workout days for swipe navigation
const generateAllWorkoutDays = () => {
  const days = [];
  const today = new Date();
  
  // Generate 30 days (15 before, today, 14 after)
  for (let i = -15; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayIndex = (date.getDay() + 6) % 7; // Convert to Monday = 0
    const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const isToday = date.toDateString() === today.toDateString();
    
    // Workout templates for different days
    const workoutTemplates = {
      monday: [
        {
          id: `monday-1-${i}`,
          time: '20:00',
          group: 'Chest',
          duration: 45,
          completed: false,
          exercises: [
            { id: `chest-1-${i}`, name: 'Bench Press', sets: 4, reps: 8, completed: false },
            { id: `chest-2-${i}`, name: 'Incline Press', sets: 3, reps: 10, completed: false },
            { id: `chest-3-${i}`, name: 'Chest Flyes', sets: 3, reps: 12, completed: false },
          ],
        },
        {
          id: `monday-2-${i}`,
          time: '21:00',
          group: 'Triceps',
          duration: 30,
          completed: false,
          exercises: [
            { id: `triceps-1-${i}`, name: 'Tricep Pushdowns', sets: 3, reps: 12, completed: false },
            { id: `triceps-2-${i}`, name: 'Skull Crushers', sets: 3, reps: 10, completed: false },
            { id: `triceps-3-${i}`, name: 'Overhead Extensions', sets: 3, reps: 12, completed: false },
          ],
        }
      ],
      tuesday: [
        {
          id: `tuesday-1-${i}`,
          time: '19:30',
          group: 'Back',
          duration: 50,
          completed: false,
          exercises: [
            { id: `back-1-${i}`, name: 'Pull-Ups', sets: 4, reps: 8, completed: false },
            { id: `back-2-${i}`, name: 'Barbell Rows', sets: 3, reps: 10, completed: false },
            { id: `back-3-${i}`, name: 'Lat Pulldowns', sets: 3, reps: 12, completed: false },
          ],
        },
        {
          id: `tuesday-2-${i}`,
          time: '20:30',
          group: 'Biceps',
          duration: 25,
          completed: false,
          exercises: [
            { id: `biceps-1-${i}`, name: 'Barbell Curls', sets: 3, reps: 12, completed: false },
            { id: `biceps-2-${i}`, name: 'Hammer Curls', sets: 3, reps: 12, completed: false },
            { id: `biceps-3-${i}`, name: 'Preacher Curls', sets: 3, reps: 10, completed: false },
          ],
        }
      ],
      thursday: [
        {
          id: `thursday-1-${i}`,
          time: '20:00',
          group: 'Shoulders',
          duration: 40,
          completed: false,
          exercises: [
            { id: `shoulders-1-${i}`, name: 'Military Press', sets: 4, reps: 8, completed: false },
            { id: `shoulders-2-${i}`, name: 'Lateral Raises', sets: 3, reps: 12, completed: false },
            { id: `shoulders-3-${i}`, name: 'Front Raises', sets: 3, reps: 12, completed: false },
          ],
        },
        {
          id: `thursday-2-${i}`,
          time: '21:00',
          group: 'Traps',
          duration: 20,
          completed: false,
          exercises: [
            { id: `traps-1-${i}`, name: 'Shrugs', sets: 3, reps: 15, completed: false },
            { id: `traps-2-${i}`, name: 'Upright Rows', sets: 3, reps: 12, completed: false },
            { id: `traps-3-${i}`, name: 'Face Pulls', sets: 3, reps: 15, completed: false },
          ],
        }
      ],
      saturday: [
        {
          id: `saturday-1-${i}`,
          time: '19:00',
          group: 'Legs',
          duration: 60,
          completed: false,
          exercises: [
            { id: `legs-1-${i}`, name: 'Squats', sets: 4, reps: 8, completed: false },
            { id: `legs-2-${i}`, name: 'Leg Press', sets: 3, reps: 12, completed: false },
            { id: `legs-3-${i}`, name: 'Romanian Deadlifts', sets: 3, reps: 10, completed: false },
          ],
        },
        {
          id: `saturday-2-${i}`,
          time: '20:00',
          group: 'Calves',
          duration: 15,
          completed: false,
          exercises: [
            { id: `calves-1-${i}`, name: 'Standing Calf Raises', sets: 4, reps: 15, completed: false },
            { id: `calves-2-${i}`, name: 'Seated Calf Raises', sets: 3, reps: 20, completed: false },
            { id: `calves-3-${i}`, name: 'Leg Press Calf Raises', sets: 3, reps: 15, completed: false },
          ],
        }
      ],
      sunday: [
        {
          id: `sunday-1-${i}`,
          time: '20:00',
          group: 'Core',
          duration: 30,
          completed: false,
          exercises: [
            { id: `core-1-${i}`, name: 'Planks', sets: 3, reps: 60, completed: false },
            { id: `core-2-${i}`, name: 'Russian Twists', sets: 3, reps: 20, completed: false },
            { id: `core-3-${i}`, name: 'Leg Raises', sets: 3, reps: 15, completed: false },
          ],
        },
        {
          id: `sunday-2-${i}`,
          time: '21:00',
          group: 'Arms',
          duration: 25,
          completed: false,
          exercises: [
            { id: `arms-1-${i}`, name: 'Superset Curls', sets: 3, reps: 12, completed: false },
            { id: `arms-2-${i}`, name: 'Tricep Extensions', sets: 3, reps: 12, completed: false },
            { id: `arms-3-${i}`, name: 'Forearm Curls', sets: 3, reps: 15, completed: false },
          ],
        }
      ]
    };

    // Map day index to workout template
    let workouts = [];
    if (dayIndex === 0) workouts = workoutTemplates.monday;
    else if (dayIndex === 1) workouts = workoutTemplates.tuesday;
    else if (dayIndex === 3) workouts = workoutTemplates.thursday;
    else if (dayIndex === 5) workouts = workoutTemplates.saturday;
    else if (dayIndex === 6) workouts = workoutTemplates.sunday;

    days.push({
      day: dayNames[dayIndex],
      date: date.getDate().toString(),
      hasWorkout: ![2, 4].includes(dayIndex),
      isRest: [2, 4].includes(dayIndex),
      isToday,
      fullDate: date,
      workouts,
      dayIndex: i + 15 // Index in the array (today is at index 15)
    });
  }
  
  return days;
};

const PlansScreen = ({ navigation }) => {
  const [selectedDay, setSelectedDay] = useState(findTodaysData());
  const [workoutProgress, setWorkoutProgress] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [workoutStats, setWorkoutStats] = useState({
    totalWorkouts: 0,
    currentStreak: 0
  });
  
  // Scroll synchronization state
  const [currentScrollIndex, setCurrentScrollIndex] = useState(2);
  const [scrollToIndex, setScrollToIndex] = useState(undefined);

  // Swipe navigation state
  const [allWorkoutDays] = useState(generateAllWorkoutDays());
  const [currentDayIndex, setCurrentDayIndex] = useState(15); // Today is at index 15
  const translateX = useSharedValue(0);
  const screenWidth = Dimensions.get('window').width;

  const scrollY = useSharedValue(0);

  // Auto-select today's date on component mount
  useEffect(() => {
    const todaysData = findTodaysData();
    setSelectedDay(todaysData);
  }, []);

  // Calculate basic workout statistics
  useEffect(() => {
    const completedWorkouts = Object.keys(workoutProgress).filter(key => 
      key.includes('-') && workoutProgress[key] === true
    ).length;
    
    setWorkoutStats({
      totalWorkouts: completedWorkouts,
      currentStreak: calculateStreak()
    });
  }, [workoutProgress]);

  const calculateStreak = () => {
    const recentWorkouts = Object.keys(workoutProgress)
      .filter(key => key.includes('-') && workoutProgress[key] === true)
      .length;
    return Math.min(recentWorkouts, 7);
  };

  const handleDaySelect = (day) => {
    // Find the corresponding day in allWorkoutDays array
    const dayIndex = allWorkoutDays.findIndex(workoutDay => 
      workoutDay.fullDate.toDateString() === day.fullDate.toDateString()
    );
    
    if (dayIndex !== -1) {
      navigateToDay(dayIndex);
    } else {
      // Fallback: create a compatible day object and find closest match
      const selectedDate = day.fullDate;
      const today = new Date();
      const daysDiff = Math.floor((selectedDate - today) / (1000 * 60 * 60 * 24));
      const targetIndex = 15 + daysDiff; // Today is at index 15
      
      if (targetIndex >= 0 && targetIndex < allWorkoutDays.length) {
        navigateToDay(targetIndex);
      } else {
        setSelectedDay(day);
      }
    }
  };

  const handleWorkoutComplete = (workoutId) => {
    const completedExercises = selectedDay?.workouts
      ?.find(w => w.id === workoutId)
      ?.exercises?.filter(ex => workoutProgress[ex.id])?.length || 0;
    
    const totalExercises = selectedDay?.workouts
      ?.find(w => w.id === workoutId)
      ?.exercises?.length || 0;

    Alert.alert(
      '🎉 Workout Complete!',
      `Amazing work! You completed ${completedExercises}/${totalExercises} exercises.\n\n💪 Keep up the great momentum!`,
      [
        {
          text: 'View Progress',
          onPress: () => navigation.navigate('Progress')
        },
        {
          text: 'Continue',
          onPress: () => {
            setWorkoutProgress(prev => ({
              ...prev,
              [workoutId]: true
            }));
          },
          style: 'default'
        }
      ]
    );
  };

  const handleExerciseComplete = (exerciseId) => {
    setWorkoutProgress(prev => ({
      ...prev,
      [exerciseId]: true
    }));

    // Show motivational message occasionally
    if (Math.random() < 0.3) {
      const motivationalMessages = [
        "Great form! 💪",
        "You're crushing it! 🔥",
        "One step closer to your goals! 🎯",
        "Strength building! 💯",
        "Keep that energy up! ⚡"
      ];
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      
      setTimeout(() => {
        Alert.alert('Nice Work!', randomMessage, [{ text: 'Thanks!', style: 'default' }]);
      }, 500);
    }
  };

  const handleExerciseDataUpdate = (exerciseId, data) => {
    setExerciseData(prev => ({
      ...prev,
      [exerciseId]: data
    }));
  };

  // Swipe navigation functions
  const navigateToDay = useCallback((dayIndex) => {
    if (dayIndex >= 0 && dayIndex < allWorkoutDays.length) {
      setCurrentDayIndex(dayIndex);
      const newSelectedDay = allWorkoutDays[dayIndex];
      setSelectedDay(newSelectedDay);
      
      // Calculate which week this day belongs to and update week schedule
      const today = new Date();
      const selectedDate = newSelectedDay.fullDate;
      
      // Get the start of the current week (Monday)
      const startOfCurrentWeek = new Date(today);
      const currentDayOfWeek = startOfCurrentWeek.getDay();
      const daysToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
      startOfCurrentWeek.setDate(today.getDate() + daysToMonday);
      startOfCurrentWeek.setHours(0, 0, 0, 0);
      
      // Get the start of the selected week (Monday)
      const startOfSelectedWeek = new Date(selectedDate);
      const selectedDayOfWeek = startOfSelectedWeek.getDay();
      const daysToMondaySelected = selectedDayOfWeek === 0 ? -6 : 1 - selectedDayOfWeek;
      startOfSelectedWeek.setDate(selectedDate.getDate() + daysToMondaySelected);
      startOfSelectedWeek.setHours(0, 0, 0, 0);
      
      // Calculate week difference
      const weeksDiff = Math.round((startOfSelectedWeek - startOfCurrentWeek) / (7 * 24 * 60 * 60 * 1000));
      const newWeekIndex = 2 + weeksDiff; // Center week is at index 2
      
      // Update week schedule if we're in a different week
      if (newWeekIndex !== currentScrollIndex && newWeekIndex >= 0 && newWeekIndex <= 4) {
        setCurrentScrollIndex(newWeekIndex);
        setScrollToIndex(newWeekIndex);
        setTimeout(() => setScrollToIndex(undefined), 150);
      }
      
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [allWorkoutDays, currentScrollIndex]);

  const navigateToNextDay = useCallback(() => {
    const nextIndex = currentDayIndex + 1;
    if (nextIndex < allWorkoutDays.length) {
      navigateToDay(nextIndex);
    }
  }, [currentDayIndex, navigateToDay]);

  const navigateToPreviousDay = useCallback(() => {
    const prevIndex = currentDayIndex - 1;
    if (prevIndex >= 0) {
      navigateToDay(prevIndex);
    }
  }, [currentDayIndex, navigateToDay]);

  // Pan gesture handler for swipe navigation
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      const threshold = screenWidth * 0.25; // 25% of screen width
      
      if (event.translationX > threshold && event.velocityX > 0) {
        // Swipe right - go to previous day
        translateX.value = withSpring(0);
        runOnJS(navigateToPreviousDay)();
      } else if (event.translationX < -threshold && event.velocityX < 0) {
        // Swipe left - go to next day
        translateX.value = withSpring(0);
        runOnJS(navigateToNextDay)();
      } else {
        // Snap back to center
        translateX.value = withSpring(0);
      }
    },
  });

  // Animated style for swipe container
  const swipeContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, screenWidth * 0.1, screenWidth * 0.25],
      [1, 0.9, 0.7],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX: translateX.value }],
      opacity,
    };
  });

  // Handle scroll synchronization between compact and normal week schedulers
  const handleScrollChange = useCallback((newIndex) => {
    if (newIndex !== currentScrollIndex) {
      setCurrentScrollIndex(newIndex);
      setScrollToIndex(newIndex);
      // Reset scrollToIndex after a brief delay to allow both components to sync
      setTimeout(() => setScrollToIndex(undefined), 150);
    }
  }, [currentScrollIndex]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated styles for the sticky header
  const stickyHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 40, 80],
      [0, 0.8, 1],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, 80],
      [-60, 0],
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
        { translateY: withSpring(translateY, { damping: 25, stiffness: 200 }) },
        { scale: withTiming(scale, { duration: 200 }) }
      ],
    };
  });

  // Animated styles for the main week schedule
  const weekScheduleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, 80, 160],
      [1, 0.98, 0.94],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, 80, 160],
      [1, 0.7, 0.2],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, 160],
      [0, -30],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { scale: withTiming(scale, { duration: 300 }) },
        { translateY: withSpring(translateY, { damping: 25, stiffness: 150 }) }
      ],
      opacity: withTiming(opacity, { duration: 300 }),
    };
  });

  // Animated styles for the content container
  const contentStyle = useAnimatedStyle(() => {
    const paddingTop = interpolate(
      scrollY.value,
      [0, 80],
      [0, 60],
      Extrapolate.CLAMP
    );

    return {
      paddingTop: withTiming(paddingTop, { duration: 200 }),
    };
  });

  // Animated styles for the header
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      // Remove animation - keep header static
    };
  });

  const { currentStreak } = workoutStats;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>My Plans</Text>
            <Text style={styles.headerSubtitle}>Stay consistent, stay strong</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('WorkoutHistory')}
            >
              <MaterialCommunityIcons name="history" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('WorkoutTemplates')}
            >
              <MaterialCommunityIcons name="view-grid-plus" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
        {currentStreak > 0 && (
          <View style={styles.streakBadge}>
            <MaterialCommunityIcons name="fire" size={16} color="#FF6B35" />
            <Text style={styles.streakText}>{currentStreak} day streak!</Text>
          </View>
        )}
      </Animated.View>
      {/* Sticky Header */}
      <Animated.View style={[styles.stickyHeader, stickyHeaderStyle]}>
        <WeekSchedule 
          onDaySelect={handleDaySelect} 
          selectedDate={selectedDay?.fullDate?.toDateString()}
          isCompact={true}
          currentScrollIndex={currentScrollIndex}
          onScrollChange={handleScrollChange}
          scrollToIndex={scrollToIndex}
          externalWorkoutDays={allWorkoutDays}
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
              selectedDate={selectedDay?.fullDate?.toDateString()}
              isCompact={false}
              currentScrollIndex={currentScrollIndex}
              onScrollChange={handleScrollChange}
              scrollToIndex={scrollToIndex}
              externalWorkoutDays={allWorkoutDays}
            />
          </Animated.View>
          
          {/* Quick Action Cards - moved here for better UX */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Progress')}
            >
              <MaterialCommunityIcons name="trending-up" size={24} color="#4CAF50" />
              <Text style={styles.actionText}>Progress</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('WorkoutHistory')}
            >
              <MaterialCommunityIcons name="history" size={24} color="#2196F3" />
              <Text style={styles.actionText}>History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('WorkoutTemplates')}
            >
              <MaterialCommunityIcons name="dumbbell" size={24} color="#FF6B35" />
              <Text style={styles.actionText}>Templates</Text>
            </TouchableOpacity>
          </View>

          {/* Swipeable Day Schedule */}
          <PanGestureHandler 
            onGestureEvent={panGestureHandler}
            activeOffsetX={[-10, 10]}
            failOffsetY={[-20, 20]}
            shouldCancelWhenOutside={true}
          >
            <Animated.View style={[styles.swipeContainer, swipeContainerStyle]}>
              <DaySchedule 
                selectedDay={selectedDay} 
                workoutProgress={workoutProgress}
                onWorkoutComplete={handleWorkoutComplete}
                onExerciseComplete={handleExerciseComplete}
                exerciseData={exerciseData}
                onExerciseDataUpdate={handleExerciseDataUpdate}
                navigation={navigation}
              />
              
              {/* Swipe indicators */}
              <View style={styles.swipeIndicators}>
                {currentDayIndex > 0 && (
                  <View style={styles.swipeIndicatorLeft}>
                    <MaterialCommunityIcons name="chevron-left" size={20} color="#666" />
                    <Text style={styles.swipeIndicatorText}>Previous Day</Text>
                  </View>
                )}
                
                {/* Current day indicator */}
                <View style={styles.currentDayIndicator}>
                  <View style={styles.currentDayInfo}>
                    <Text style={styles.currentDayText}>
                      {selectedDay?.fullDate?.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Text>
                    {selectedDay?.isToday && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayBadgeText}>Today</Text>
                      </View>
                    )}
                  </View>
                  {selectedDay?.isRest ? (
                    <Text style={styles.restDayText}>Rest Day</Text>
                  ) : (
                    <Text style={styles.workoutDayText}>
                      {selectedDay?.workouts?.length || 0} workout{selectedDay?.workouts?.length !== 1 ? 's' : ''}
                    </Text>
                  )}
                </View>
                
                {currentDayIndex < allWorkoutDays.length - 1 && (
                  <View style={styles.swipeIndicatorRight}>
                    <Text style={styles.swipeIndicatorText}>Next Day</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
                  </View>
                )}
              </View>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 0,
    marginTop: -10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 10,
    elevation: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  headerButton: {
    backgroundColor: '#E8F5E8',
    padding: 10,
    borderRadius: 12,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  streakText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  statsButton: {
    backgroundColor: '#E8F5E8',
    padding: 10,
    borderRadius: 12,
  },
  // Quick Action Cards
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 16,
    marginBottom: 8,
    gap: 12,
    backgroundColor: '#fff',
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  stickyHeader: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  swipeContainer: {
    flex: 1,
  },
  swipeIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 20,
  },
  swipeIndicatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.8,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  swipeIndicatorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.8,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  swipeIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  currentDayIndicator: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    flex: 1,
    justifyContent: 'center',
  },
  currentDayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  todayBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  restDayText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
    fontStyle: 'italic',
  },
  workoutDayText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4CAF50',
  },
});

export default PlansScreen; 
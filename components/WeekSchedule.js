import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * WeekSchedule Component
 * 
 * This component displays a weekly schedule that can be rendered in two modes:
 * - Normal mode: Full week view with detailed information
 * - Compact mode: Condensed week view for sticky headers
 * 
 * Scroll Synchronization:
 * Both modes can be synchronized so that when one is swiped, the other follows.
 * This is achieved through:
 * - currentScrollIndex: The current week index (0-4, where 2 is the center/current week)
 * - onScrollChange: Callback fired when user scrolls to notify parent of index change
 * - scrollToIndex: External command to scroll to a specific index
 */

const DayItem = ({ day, date, hasWorkout, isRest, isSelected, isToday, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.dayItem, 
      isToday && styles.todayDay,
      isSelected && styles.selectedDay,
    ]} 
    onPress={onPress}
  >
    <Text style={[
      styles.dayText,
      isToday && !isSelected && styles.todayText,
      isSelected && styles.selectedText,
    ]}>{day}</Text>
    <Text style={[
      styles.dateText,
      isToday && !isSelected && styles.todayText,
      isSelected && styles.selectedText,
    ]}>{date}</Text>
    <View style={styles.iconContainer}>
      {isRest ? (
        <Text style={[
          styles.restText,
          isToday && !isSelected && styles.todayText,
          isSelected && styles.selectedText,
        ]}>R</Text>
      ) : (
        <MaterialCommunityIcons
          name="dumbbell"
          size={20}
          color={isSelected ? '#fff' : isToday ? '#000' : '#666'}
        />
      )}
    </View>
    <View style={styles.timeContainer}>
      <MaterialCommunityIcons
        name="clock-outline"
        size={14}
        color={isSelected ? '#fff' : isToday ? '#000' : '#666'}
      />
      <Text style={[
        styles.timeText,
        isToday && !isSelected && styles.todayText,
        isSelected && styles.selectedText,
      ]}>8h</Text>
    </View>
  </TouchableOpacity>
);

const getWeekNumber = (date) => {
  // Copy date so don't modify original
  const d = new Date(date);
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};

const WeekView = ({ days, selectedDate, onDaySelect, weekOffset, isCompact = false }) => {
  if (isCompact) {
    return (
      <View style={styles.compactWeekContainer}>
        <View style={styles.compactDaysWrapper}>
          {days.map((item, index) => (
            <CompactDayItem 
              key={index} 
              {...item} 
              isSelected={selectedDate === item.fullDate?.toDateString()}
              onPress={() => onDaySelect(item)}
            />
          ))}
        </View>
      </View>
    );
  }

  let weekText = 'Current';
  let weekTextColor = '#000';
  if (weekOffset < 0) {
    weekText = 'Previous';
    weekTextColor = '#666';
  } else if (weekOffset > 0) {
    weekText = 'Ahead';
    weekTextColor = '#666';
  }

  const firstDayOfWeek = days[0].fullDate;
  const weekNumber = getWeekNumber(firstDayOfWeek);

  return (
    <View style={styles.weekContainer}>
      <View style={styles.weekHeader}>
        <View style={styles.weekTopRow}>
          <View style={styles.weekNumberContainer}>
            <Text style={styles.weekNumberLabel}>Week</Text>
            <Text style={styles.weekNumberValue}>{weekNumber}</Text>
          </View>
          <View style={[styles.weekStatusBadge, { backgroundColor: weekTextColor === '#000' ? '#E8F3FF' : '#F5F5F5' }]}>
            <Text style={[styles.weekStatusText, { color: weekTextColor }]}>{weekText}</Text>
          </View>
        </View>
      </View>
      <View style={styles.daysWrapper}>
        {days.map((item, index) => (
          <DayItem 
            key={index} 
            {...item} 
            isSelected={selectedDate === item.fullDate?.toDateString()}
            onPress={() => onDaySelect(item)}
          />
        ))}
      </View>
    </View>
  );
};

const CompactDayItem = ({ day, date, hasWorkout, isRest, isSelected, isToday, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.compactDayItem, 
      isToday && styles.compactTodayDay,
      isSelected && styles.compactSelectedDay,
    ]} 
    onPress={onPress}
  >
    <Text style={[
      styles.compactDayText,
      isToday && !isSelected && styles.compactTodayText,
      isSelected && styles.compactSelectedText,
    ]}>{day}</Text>
    <Text style={[
      styles.compactDateText,
      isToday && !isSelected && styles.compactTodayText,
      isSelected && styles.compactSelectedText,
    ]}>{date}</Text>
    {!isRest && (
      <View style={[
        styles.compactWorkoutIndicator,
        isSelected && styles.compactWorkoutIndicatorSelected
      ]} />
    )}
  </TouchableOpacity>
);

const WeekSchedule = ({ 
  onDaySelect, 
  selectedDate, 
  isCompact = false,
  currentScrollIndex = 2,
  onScrollChange,
  scrollToIndex,
  externalWorkoutDays
}) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const scrollViewRef = useRef(null);
  const compactScrollViewRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;
  const weekWidth = screenWidth;
  const isInitialized = useRef(false);
  const lastScrollIndex = useRef(2); // Track the last scroll position

  // Define the fixed week range
  const minWeekOffset = -2;
  const maxWeekOffset = 2;
  const totalWeeks = maxWeekOffset - minWeekOffset + 1; // 5 weeks total

  // Generate weeks from external data if provided
  const generateWeeksFromExternalData = () => {
    if (!externalWorkoutDays || externalWorkoutDays.length === 0) {
      return [];
    }

    const weeks = [];
    const today = new Date();
    
    // Group external workout days by week
    for (let weekOffset = minWeekOffset; weekOffset <= maxWeekOffset; weekOffset++) {
      const startOfWeek = new Date(today);
      const currentDay = startOfWeek.getDay();
      const diff = currentDay === 0 ? -6 : 1 - currentDay;
      startOfWeek.setDate(startOfWeek.getDate() + diff + (weekOffset * 7));
      
      const weekDays = [];
      
      // Get 7 days for this week
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const targetDate = new Date(startOfWeek);
        targetDate.setDate(startOfWeek.getDate() + dayIndex);
        
        // Find matching day in external data
        const matchingDay = externalWorkoutDays.find(day => 
          day.fullDate.toDateString() === targetDate.toDateString()
        );
        
        if (matchingDay) {
          weekDays.push(matchingDay);
        } else {
          // Create a fallback day if not found
          const dayOfWeek = (targetDate.getDay() + 6) % 7;
          const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
          const isToday = targetDate.toDateString() === today.toDateString();
          
          weekDays.push({
            day: dayNames[dayOfWeek],
            date: targetDate.getDate().toString(),
            hasWorkout: ![2, 4].includes(dayOfWeek),
            isRest: [2, 4].includes(dayOfWeek),
            isToday,
            fullDate: targetDate,
            workouts: []
          });
        }
      }
      
      weeks.push(weekDays);
    }
    
    return weeks;
  };

  // Generate a single week's data based on offset (fallback when no external data)
  const generateSingleWeek = (offset = 0) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const currentDay = startOfWeek.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    startOfWeek.setDate(startOfWeek.getDate() + diff + (offset * 7));

    // Workout templates for different days
    const workoutTemplates = {
      monday: [
        {
          id: `monday-1-${offset}`,
          time: '20:00',
          group: 'Chest',
          duration: 45,
          completed: false,
          exercises: [
            { id: `chest-1-${offset}`, name: 'Bench Press', sets: 4, reps: 8, completed: false },
            { id: `chest-2-${offset}`, name: 'Incline Press', sets: 3, reps: 10, completed: false },
            { id: `chest-3-${offset}`, name: 'Chest Flyes', sets: 3, reps: 12, completed: false },
          ],
        },
        {
          id: `monday-2-${offset}`,
          time: '21:00',
          group: 'Triceps',
          duration: 30,
          completed: false,
          exercises: [
            { id: `triceps-1-${offset}`, name: 'Tricep Pushdowns', sets: 3, reps: 12, completed: false },
            { id: `triceps-2-${offset}`, name: 'Skull Crushers', sets: 3, reps: 10, completed: false },
            { id: `triceps-3-${offset}`, name: 'Overhead Extensions', sets: 3, reps: 12, completed: false },
          ],
        }
      ],
      tuesday: [
        {
          id: `tuesday-1-${offset}`,
          time: '19:30',
          group: 'Back',
          duration: 50,
          completed: false,
          exercises: [
            { id: `back-1-${offset}`, name: 'Pull-Ups', sets: 4, reps: 8, completed: false },
            { id: `back-2-${offset}`, name: 'Barbell Rows', sets: 3, reps: 10, completed: false },
            { id: `back-3-${offset}`, name: 'Lat Pulldowns', sets: 3, reps: 12, completed: false },
          ],
        },
        {
          id: `tuesday-2-${offset}`,
          time: '20:30',
          group: 'Biceps',
          duration: 25,
          completed: false,
          exercises: [
            { id: `biceps-1-${offset}`, name: 'Barbell Curls', sets: 3, reps: 12, completed: false },
            { id: `biceps-2-${offset}`, name: 'Hammer Curls', sets: 3, reps: 12, completed: false },
            { id: `biceps-3-${offset}`, name: 'Preacher Curls', sets: 3, reps: 10, completed: false },
          ],
        }
      ],
      thursday: [
        {
          id: `thursday-1-${offset}`,
          time: '20:00',
          group: 'Shoulders',
          duration: 40,
          completed: false,
          exercises: [
            { id: `shoulders-1-${offset}`, name: 'Military Press', sets: 4, reps: 8, completed: false },
            { id: `shoulders-2-${offset}`, name: 'Lateral Raises', sets: 3, reps: 12, completed: false },
            { id: `shoulders-3-${offset}`, name: 'Front Raises', sets: 3, reps: 12, completed: false },
          ],
        },
        {
          id: `thursday-2-${offset}`,
          time: '21:00',
          group: 'Traps',
          duration: 20,
          completed: false,
          exercises: [
            { id: `traps-1-${offset}`, name: 'Shrugs', sets: 3, reps: 15, completed: false },
            { id: `traps-2-${offset}`, name: 'Upright Rows', sets: 3, reps: 12, completed: false },
            { id: `traps-3-${offset}`, name: 'Face Pulls', sets: 3, reps: 15, completed: false },
          ],
        }
      ],
      saturday: [
        {
          id: `saturday-1-${offset}`,
          time: '19:00',
          group: 'Legs',
          duration: 60,
          completed: false,
          exercises: [
            { id: `legs-1-${offset}`, name: 'Squats', sets: 4, reps: 8, completed: false },
            { id: `legs-2-${offset}`, name: 'Leg Press', sets: 3, reps: 12, completed: false },
            { id: `legs-3-${offset}`, name: 'Romanian Deadlifts', sets: 3, reps: 10, completed: false },
          ],
        },
        {
          id: `saturday-2-${offset}`,
          time: '20:00',
          group: 'Calves',
          duration: 15,
          completed: false,
          exercises: [
            { id: `calves-1-${offset}`, name: 'Standing Calf Raises', sets: 4, reps: 15, completed: false },
            { id: `calves-2-${offset}`, name: 'Seated Calf Raises', sets: 3, reps: 20, completed: false },
            { id: `calves-3-${offset}`, name: 'Leg Press Calf Raises', sets: 3, reps: 15, completed: false },
          ],
        }
      ],
      sunday: [
        {
          id: `sunday-1-${offset}`,
          time: '20:00',
          group: 'Core',
          duration: 30,
          completed: false,
          exercises: [
            { id: `core-1-${offset}`, name: 'Planks', sets: 3, reps: 60, completed: false },
            { id: `core-2-${offset}`, name: 'Russian Twists', sets: 3, reps: 20, completed: false },
            { id: `core-3-${offset}`, name: 'Leg Raises', sets: 3, reps: 15, completed: false },
          ],
        },
        {
          id: `sunday-2-${offset}`,
          time: '21:00',
          group: 'Arms',
          duration: 25,
          completed: false,
          exercises: [
            { id: `arms-1-${offset}`, name: 'Superset Curls', sets: 3, reps: 12, completed: false },
            { id: `arms-2-${offset}`, name: 'Tricep Extensions', sets: 3, reps: 12, completed: false },
            { id: `arms-3-${offset}`, name: 'Forearm Curls', sets: 3, reps: 15, completed: false },
          ],
        }
      ]
    };

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const dayIndex = (date.getDay() + 6) % 7;
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
        date: date.getDate().toString(),
        hasWorkout: ![2, 4].includes(dayIndex),
        isRest: [2, 4].includes(dayIndex),
        isToday,
        fullDate: date,
        workouts
      };
    });
  };

  // Generate weeks data - use external data if provided, otherwise generate internally
  const weeks = externalWorkoutDays && externalWorkoutDays.length > 0 
    ? generateWeeksFromExternalData()
    : Array.from({ length: totalWeeks }, (_, index) => {
        const weekOffset = minWeekOffset + index;
        return generateSingleWeek(weekOffset);
      });

  // Initialize scroll position to center week (index 2)
  useEffect(() => {
    if (!isInitialized.current) {
      const targetRef = isCompact ? compactScrollViewRef : scrollViewRef;
      if (targetRef.current) {
        setTimeout(() => {
          targetRef.current.scrollTo({
            x: currentScrollIndex * weekWidth,
            animated: false
          });
          lastScrollIndex.current = currentScrollIndex;
        }, 100);
      }
      isInitialized.current = true;
    }
  }, [isCompact, weekWidth, currentScrollIndex]);

  // Handle external scroll commands
  useEffect(() => {
    if (scrollToIndex !== undefined && scrollToIndex !== lastScrollIndex.current) {
      const targetRef = isCompact ? compactScrollViewRef : scrollViewRef;
      if (targetRef.current && isInitialized.current) {
        // console.log(`WeekSchedule ${isCompact ? 'compact' : 'normal'} syncing to index:`, scrollToIndex);
        targetRef.current.scrollTo({
          x: scrollToIndex * weekWidth,
          animated: true
        });
        lastScrollIndex.current = scrollToIndex;
      }
    }
  }, [scrollToIndex, isCompact, weekWidth]);

  const handleScrollEnd = (event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(contentOffset.x / weekWidth);
    
    // Ensure index is within bounds
    const clampedIndex = Math.max(0, Math.min(currentIndex, totalWeeks - 1));
    
    if (clampedIndex !== lastScrollIndex.current) {
      lastScrollIndex.current = clampedIndex;
      // Notify parent component about scroll change
      if (onScrollChange && clampedIndex !== currentScrollIndex) {
        onScrollChange(clampedIndex);
      }
    }
  };

  if (isCompact) {
    return (
      <View style={styles.compactContainer}>
        <ScrollView 
          ref={compactScrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          snapToInterval={weekWidth}
          decelerationRate="fast"
          pagingEnabled
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          bounces={false}
        >
          {weeks.map((weekDays, weekIndex) => (
            <View key={`week-${minWeekOffset + weekIndex}`} style={styles.compactWeekWrapper}>
              <WeekView
                days={weekDays}
                selectedDate={selectedDate}
                onDaySelect={onDaySelect}
                weekOffset={minWeekOffset + weekIndex}
                isCompact={true}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        snapToInterval={weekWidth}
        decelerationRate="fast"
        pagingEnabled
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
      >
        {weeks.map((weekDays, weekIndex) => (
          <View key={`week-${minWeekOffset + weekIndex}`} style={styles.weekWrapper}>
            <WeekView
              days={weekDays}
              selectedDate={selectedDate}
              onDaySelect={onDaySelect}
              weekOffset={minWeekOffset + weekIndex}
              isCompact={false}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  weekWrapper: {
    width: Dimensions.get('window').width,
    paddingHorizontal: 6,
  },
  weekContainer: {
    width: '100%',
    alignItems: 'center',
  },
  weekHeader: {
    width: '100%',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  weekTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekNumberLabel: {
    fontSize: 15,
    color: '#666',
    marginRight: 6,
    fontWeight: '500',
  },
  weekNumberValue: {
    fontSize: 22,
    color: '#000',
    fontWeight: 'bold',
  },
  weekStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  weekStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  daysWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 2,
  },
  dayItem: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    padding: 6,
    paddingBottom: 10,
    width: 38,
    height: 100,
    marginHorizontal: 1,
  },
  selectedDay: {
    backgroundColor: '#000',
    borderWidth: 0,
  },
  todayDay: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  dayText: {
    fontSize: 14,
    marginBottom: 3,
    color: '#666',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 13,
    marginBottom: 6,
    color: '#666',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  todayText: {
    color: '#000',
    fontWeight: 'bold',
  },
  iconContainer: {
    marginBottom: 6,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 11,
    marginLeft: 2,
    color: '#666',
  },
  // Compact mode styles
  compactContainer: {
    backgroundColor: '#fff',
  },
  compactWeekWrapper: {
    width: Dimensions.get('window').width,
  },
  compactWeekContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  compactDaysWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  compactDayItem: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
    width: 36,
    height: 50,
    marginHorizontal: 1,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  compactSelectedDay: {
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  compactTodayDay: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  compactDayText: {
    fontSize: 11,
    marginBottom: 1,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  compactDateText: {
    fontSize: 10,
    marginBottom: 3,
    color: '#666',
    fontWeight: '500',
  },
  compactSelectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  compactTodayText: {
    color: '#000',
    fontWeight: 'bold',
  },
  compactWorkoutIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  compactWorkoutIndicatorSelected: {
    backgroundColor: '#fff',
    shadowColor: '#fff',
  },
});

export default WeekSchedule; 
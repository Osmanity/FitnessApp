import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

  if (isCompact) {
    return (
      <View style={styles.compactWeekContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactWeekText}>W{weekNumber}</Text>
          <View style={[styles.compactStatusBadge, { backgroundColor: weekTextColor === '#000' ? '#E8F3FF' : '#F5F5F5' }]}>
            <Text style={[styles.compactStatusText, { color: weekTextColor }]}>{weekText}</Text>
          </View>
        </View>
        <View style={styles.compactDaysWrapper}>
          {days.map((item, index) => (
            <CompactDayItem 
              key={index} 
              {...item} 
              isSelected={selectedDate === item.date}
              onPress={() => onDaySelect(item)}
            />
          ))}
        </View>
      </View>
    );
  }

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
            isSelected={selectedDate === item.date}
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

const generateWeekData = (weekOffset = 0) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  const currentDay = startOfWeek.getDay();
  const diff = currentDay === 0 ? -6 : 1 - currentDay;
  startOfWeek.setDate(startOfWeek.getDate() + diff + (weekOffset * 7));

  // Workout templates for different days
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

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
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

const WeekSchedule = ({ onDaySelect, selectedDate, isCompact = false }) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [visibleWeekIndex, setVisibleWeekIndex] = useState(2);
  const scrollViewRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;
  const weekWidth = screenWidth;

  const weeks = [
    generateWeekData(currentWeekOffset - 2),
    generateWeekData(currentWeekOffset - 1),
    generateWeekData(currentWeekOffset),
    generateWeekData(currentWeekOffset + 1),
    generateWeekData(currentWeekOffset + 2),
  ];

  const currentWeekIndex = weeks.findIndex(week => 
    week.some(day => day.isToday)
  );

  useEffect(() => {
    if (scrollViewRef.current && currentWeekIndex !== -1 && !isCompact) {
      setTimeout(() => {
        scrollViewRef.current.scrollTo({
          x: currentWeekIndex * weekWidth,
          animated: false
        });
      }, 100);
    }
  }, [isCompact]);

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / weekWidth);
    if (index !== visibleWeekIndex) {
      setVisibleWeekIndex(index);
    }
  };

  if (isCompact) {
    // Show only current week in compact mode
    const currentWeek = weeks[currentWeekIndex] || weeks[2];
    return (
      <WeekView
        days={currentWeek}
        selectedDate={selectedDate}
        onDaySelect={onDaySelect}
        weekOffset={0}
        isCompact={true}
      />
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {weeks.map((weekDays, weekIndex) => (
          <View key={weekIndex} style={styles.weekWrapper}>
            <WeekView
              days={weekDays}
              selectedDate={selectedDate}
              onDaySelect={onDaySelect}
              weekOffset={weekIndex - 2}
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
    paddingTop: 16,
  },
  weekWrapper: {
    width: Dimensions.get('window').width,
    paddingHorizontal: 8,
  },
  weekContainer: {
    width: '100%',
    alignItems: 'center',
  },
  weekHeader: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
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
    fontSize: 16,
    color: '#666',
    marginRight: 8,
    fontWeight: '500',
  },
  weekNumberValue: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  weekStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  weekStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  daysWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  dayItem: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 8,
    paddingBottom: 12,
    width: 42,
    height: 115,
    marginHorizontal: 1,
  },
  selectedDay: {
    backgroundColor: '#000',
    borderWidth: 0,
  },
  todayDay: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
  },
  dayText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#666',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
    marginBottom: 8,
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
    marginBottom: 8,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 12,
    marginLeft: 2,
    color: '#666',
  },
  // Compact mode styles
  compactWeekContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compactWeekText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 0.5,
  },
  compactStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactStatusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  compactDaysWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  compactDayItem: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 8,
    width: 36,
    height: 65,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
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
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  compactTodayDay: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  compactDayText: {
    fontSize: 13,
    marginBottom: 3,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  compactDateText: {
    fontSize: 12,
    marginBottom: 6,
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  compactWorkoutIndicatorSelected: {
    backgroundColor: '#fff',
    shadowColor: '#fff',
  },
});

export default WeekSchedule; 
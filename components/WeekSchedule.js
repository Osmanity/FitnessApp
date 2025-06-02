import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
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

// Constants
const SCREEN_WIDTH = Dimensions.get('window').width;
const WEEK_VIEW_HEIGHT = 170;
const MONTH_VIEW_HEIGHT = 450;
const DAYS_IN_WEEK = 7;
const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const DayItem = ({ day, date, hasWorkout, isRest, isSelected, isToday, onPress }) => {
  // Handle press with immediate response
  const handlePress = () => {
    if (onPress && typeof onPress === 'function') {
      onPress();
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.dayItem, 
        isToday && styles.todayDay,
        isSelected && styles.selectedDay,
      ]} 
      onPress={handlePress}
      activeOpacity={0.6}
      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
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
      <View style={styles.indicatorContainer}>
        {!isRest && (
          <MaterialCommunityIcons 
            name="dumbbell" 
            size={12} 
            color={isSelected ? '#fff' : '#000'} 
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

// Helper function to get week number
const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Helper function to get month display info
const getMonthDisplayInfo = (days) => {
  if (!days || days.length === 0) return { monthName: '', year: new Date().getFullYear() };

  // Count occurrences of each month in the week
  const monthCounts = {};
  days.forEach(day => {
    if (day.fullDate) {
      const month = day.fullDate.getMonth();
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
  });

  // Get the most frequent month
  const dominantMonth = Object.entries(monthCounts)
    .sort((a, b) => b[1] - a[1])[0][0];

  // Use the middle day (Wednesday) for the year
  const referenceDate = days[3]?.fullDate || days[0]?.fullDate || new Date();
  const displayDate = new Date(referenceDate);
  displayDate.setMonth(parseInt(dominantMonth));

  return {
    monthName: displayDate.toLocaleDateString('en-US', { month: 'long' }),
    year: displayDate.getFullYear()
  };
};

const WeekView = ({ days, selectedDate, onDaySelect, weekOffset, isCompact = false, onMonthToggle, isMonthExpanded, monthInfo }) => {
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

  const firstDayOfWeek = days[0].fullDate;
  const weekNumber = getWeekNumber(firstDayOfWeek);
  
  return (
    <View style={styles.weekWrapper}>
      <View style={styles.weekHeader}>
        <View style={styles.weekInfo}>
          <View style={styles.weekNumberBadge}>
            <Text style={styles.weekNumberLabel}>Week</Text>
            <Text style={styles.weekNumberValue}>{weekNumber}</Text>
          </View>
          <TouchableOpacity 
            style={styles.monthDisplay}
            onPress={onMonthToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.monthText}>{monthInfo.monthName}</Text>
            <MaterialCommunityIcons 
              name={isMonthExpanded ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#333" 
            />
          </TouchableOpacity>
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

const CompactDayItem = ({ day, date, hasWorkout, isRest, isSelected, isToday, onPress }) => {
  // Handle press with immediate response
  const handlePress = () => {
    if (onPress && typeof onPress === 'function') {
      onPress();
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.compactDayItem, 
        isToday && styles.compactTodayDay,
        isSelected && styles.compactSelectedDay,
      ]} 
      onPress={handlePress}
      activeOpacity={0.6}
      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
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
      <View style={styles.compactIndicatorContainer}>
        {!isRest && (
          <MaterialCommunityIcons 
            name="dumbbell" 
            size={10} 
            color={isSelected ? '#fff' : '#000'} 
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const MonthView = ({ selectedDate, onDaySelect, currentMonth, currentYear, onMonthChange }) => {
  // Get first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
  // Get the first Monday of the calendar (might be from previous month)
  const startDate = new Date(firstDayOfMonth);
  const dayOfWeek = startDate.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setDate(startDate.getDate() - daysToSubtract);
  
  // Generate 6 weeks (42 days) to cover the entire month view
  const weeks = [];
  const today = new Date();
  
  for (let week = 0; week < 6; week++) {
    const weekDays = [];
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (week * 7) + day);
      
      const isCurrentMonth = currentDate.getMonth() === currentMonth;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected = selectedDate === currentDate.toDateString();
      
      // Determine if it's a workout day (same logic as week view)
      const dayIndex = (currentDate.getDay() + 6) % 7; // Convert to Monday = 0
      const isRest = [2, 4].includes(dayIndex); // Wednesday and Friday are rest days
      const hasWorkout = !isRest;
      
      const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      
      weekDays.push({
        day: dayNames[dayIndex],
        date: currentDate.getDate().toString(),
        hasWorkout,
        isRest,
        isToday,
        isCurrentMonth,
        isSelected,
        fullDate: currentDate,
        workouts: [] // Could be populated with actual workout data
      });
    }
    
    weeks.push(weekDays);
  }
  
  const monthName = firstDayOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    onMonthChange(newDate.getMonth(), newDate.getFullYear());
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    onMonthChange(newDate.getMonth(), newDate.getFullYear());
  };
  
  // Handle day selection with immediate response
  const handleDayPress = (day) => {
    // Ensure immediate response by calling onDaySelect directly
    if (onDaySelect && typeof onDaySelect === 'function') {
      onDaySelect(day);
    }
  };

  return (
    <View style={styles.monthContainer}>
      <View style={styles.monthHeader}>
        <View style={styles.monthHeaderContent}>
          <TouchableOpacity 
            style={styles.monthNavButton}
            onPress={goToPreviousMonth}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{monthName}</Text>
          <TouchableOpacity 
            style={styles.monthNavButton}
            onPress={goToNextMonth}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="chevron-right" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Day headers */}
      <View style={styles.monthDayHeaders}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, index) => (
          <View key={index} style={styles.monthDayHeader}>
            <Text style={styles.monthDayHeaderText}>{dayName}</Text>
          </View>
        ))}
      </View>
      
      {/* Calendar grid */}
      <View style={styles.monthGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.monthWeekRow}>
            {week.map((day, dayIndex) => (
              <TouchableOpacity
                key={`${weekIndex}-${dayIndex}`}
                style={[
                  styles.monthDayItem,
                  day.isToday && styles.monthTodayDay,
                  day.isSelected && styles.monthSelectedDay,
                  !day.isCurrentMonth && styles.monthOtherMonthDay,
                ]} 
                onPress={() => handleDayPress(day)}
                activeOpacity={0.6}
                hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
              >
                <Text style={[
                  styles.monthDayText,
                  day.isToday && !day.isSelected && styles.monthTodayText,
                  day.isSelected && styles.monthSelectedText,
                  !day.isCurrentMonth && styles.monthOtherMonthText,
                ]}>
                  {day.date}
                </Text>
                
                {/* Workout indicator */}
                {day.isCurrentMonth && !day.isRest && (
                  <MaterialCommunityIcons 
                    name="dumbbell" 
                    size={10} 
                    color={day.isSelected ? '#fff' : '#000'} 
                  />
                )}
                
                {/* Rest day indicator */}
                {day.isCurrentMonth && day.isRest && (
                  <Text style={[
                    styles.monthRestIndicator,
                    day.isSelected && styles.monthRestIndicatorSelected
                  ]}>
                    R
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const SwipeableMonthView = ({ selectedDate, onDaySelect, currentMonth, currentYear, onMonthChange, onToggleExpanded }) => {
  const scrollViewRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;
  const monthWidth = screenWidth;
  const isInitialized = useRef(false);
  const isScrolling = useRef(false);
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState({ month: currentMonth, year: currentYear });
  const scrollTimeout = useRef(null);

  // Generate 3 months: previous, current, next
  const generateMonthData = useCallback((baseMonth, baseYear, monthOffset = 0) => {
    const targetDate = new Date(baseYear, baseMonth + monthOffset, 1);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();
    
    // Get first day of the month
    const firstDayOfMonth = new Date(targetYear, targetMonth, 1);
    
    // Get the first Monday of the calendar (might be from previous month)
    const startDate = new Date(firstDayOfMonth);
    const dayOfWeek = startDate.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    // Generate 6 weeks (42 days) to cover the entire month view
    const weeks = [];
    const today = new Date();
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (week * 7) + day);
        
        const isCurrentMonth = currentDate.getMonth() === targetMonth;
        const isToday = currentDate.toDateString() === today.toDateString();
        const isSelected = selectedDate === currentDate.toDateString();
        
        // Determine if it's a workout day (same logic as week view)
        const dayIndex = (currentDate.getDay() + 6) % 7; // Convert to Monday = 0
        const isRest = [2, 4].includes(dayIndex); // Wednesday and Friday are rest days
        const hasWorkout = !isRest;
        
        const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        
        weekDays.push({
          day: dayNames[dayIndex],
          date: currentDate.getDate().toString(),
          hasWorkout,
          isRest,
          isToday,
          isCurrentMonth,
          isSelected,
          fullDate: currentDate,
          workouts: []
        });
      }
      
      weeks.push(weekDays);
    }
    
    return {
      weeks,
      monthName: firstDayOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      month: targetMonth,
      year: targetYear
    };
  }, [selectedDate]);

  // Stable months generation - only regenerate when currentDisplayMonth changes
  const months = useMemo(() => [
    generateMonthData(currentDisplayMonth.month, currentDisplayMonth.year, -1), // Previous month
    generateMonthData(currentDisplayMonth.month, currentDisplayMonth.year, 0),  // Current month
    generateMonthData(currentDisplayMonth.month, currentDisplayMonth.year, 1)   // Next month
  ], [currentDisplayMonth.month, currentDisplayMonth.year, generateMonthData]);

  // Update display month when props change
  useEffect(() => {
    if (currentMonth !== currentDisplayMonth.month || currentYear !== currentDisplayMonth.year) {
      setCurrentDisplayMonth({ month: currentMonth, year: currentYear });
    }
  }, [currentMonth, currentYear, currentDisplayMonth.month, currentDisplayMonth.year]);

  // Initialize scroll position on mount
  useEffect(() => {
    if (!isInitialized.current && scrollViewRef.current) {
      const timer = setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: 1 * monthWidth, // Always start at center (index 1)
            animated: false
          });
          isInitialized.current = true;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [monthWidth]);

  // Improved scroll handling
  const handleScrollBegin = () => {
    isScrolling.current = true;
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
  };

  // Add missing handleScroll function for SwipeableMonthView
  const handleScroll = (event) => {
    // This can be used for real-time scroll feedback if needed
    // For now, we rely on handleScrollEnd for month changes
  };

  const handleScrollEnd = (event) => {
    if (!isScrolling.current) return;
    
    const contentOffset = event.nativeEvent.contentOffset;
    const newIndex = Math.round(contentOffset.x / monthWidth);
    
    // Ensure index is within bounds
    const clampedIndex = Math.max(0, Math.min(newIndex, 2));
    
    // Debounce the scroll handling to prevent rapid changes
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      // Only process if we moved to a different month
      if (clampedIndex !== 1) {
        let newMonth, newYear;
        
        if (clampedIndex === 0) {
          // Swiped to previous month
          const newDate = new Date(currentDisplayMonth.year, currentDisplayMonth.month - 1, 1);
          newMonth = newDate.getMonth();
          newYear = newDate.getFullYear();
        } else if (clampedIndex === 2) {
          // Swiped to next month
          const newDate = new Date(currentDisplayMonth.year, currentDisplayMonth.month + 1, 1);
          newMonth = newDate.getMonth();
          newYear = newDate.getFullYear();
        }
        
        if (newMonth !== undefined && newYear !== undefined) {
          // Update current display state
          setCurrentDisplayMonth({ month: newMonth, year: newYear });
          
          // Notify parent component
          onMonthChange(newMonth, newYear);
          
          // Reset to center position after a brief delay
          setTimeout(() => {
            if (scrollViewRef.current && isScrolling.current) {
              scrollViewRef.current.scrollTo({
                x: 1 * monthWidth,
                animated: false
              });
            }
            isScrolling.current = false;
          }, 150);
        } else {
          isScrolling.current = false;
        }
      } else {
        isScrolling.current = false;
      }
    }, 100);
  };

  // Handle day selection with immediate response
  const handleDayPress = (day) => {
    if (onDaySelect && typeof onDaySelect === 'function') {
      onDaySelect(day);
    }
  };

  const renderMonth = (monthData, index) => (
    <View key={`${monthData.month}-${monthData.year}-${index}`} style={[styles.swipeableMonthWrapper, { width: monthWidth }]}>
      <View style={styles.monthHeader}>
        <View style={styles.monthHeaderContent}>
          <View style={styles.monthPlaceholder} />
          <Text style={styles.monthTitle}>{monthData.monthName}</Text>
          <TouchableOpacity 
            style={styles.monthCollapseButton}
            onPress={onToggleExpanded}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="chevron-up" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Day headers */}
      <View style={styles.monthDayHeaders}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, headerIndex) => (
          <View key={headerIndex} style={styles.monthDayHeader}>
            <Text style={styles.monthDayHeaderText}>{dayName}</Text>
          </View>
        ))}
      </View>
      
      {/* Calendar grid */}
      <View style={styles.monthGrid}>
        {monthData.weeks.map((week, weekIndex) => (
          <View key={`${weekIndex}-${monthData.month}-${monthData.year}`} style={styles.monthWeekRow}>
            {week.map((day, dayIndex) => (
              <TouchableOpacity
                key={`${weekIndex}-${dayIndex}-${day.fullDate.getTime()}`}
                style={[
                  styles.monthDayItem,
                  day.isToday && styles.monthTodayDay,
                  day.isSelected && styles.monthSelectedDay,
                  !day.isCurrentMonth && styles.monthOtherMonthDay,
                ]}
                onPress={() => handleDayPress(day)}
                activeOpacity={0.6}
                hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
              >
                <Text style={[
                  styles.monthDayText,
                  day.isToday && !day.isSelected && styles.monthTodayText,
                  day.isSelected && styles.monthSelectedText,
                  !day.isCurrentMonth && styles.monthOtherMonthText,
                ]}>
                  {day.date}
                </Text>
                
                {/* Workout indicator */}
                {day.isCurrentMonth && !day.isRest && (
                  <MaterialCommunityIcons 
                    name="dumbbell" 
                    size={10} 
                    color={day.isSelected ? '#fff' : '#000'} 
                  />
                )}
                
                {/* Rest day indicator */}
                {day.isCurrentMonth && day.isRest && (
                  <Text style={[
                    styles.monthRestIndicator,
                    day.isSelected && styles.monthRestIndicatorSelected
                  ]}>
                    R
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      
      {/* Swipe indicators */}
      <View style={styles.swipeIndicators}>
        <View style={styles.swipeIndicatorContainer}>
          <MaterialCommunityIcons name="gesture-swipe-left" size={16} color="#999" />
          <Text style={styles.swipeIndicatorText}>Previous</Text>
        </View>
        <View style={styles.monthIndicatorDots}>
          {[0, 1, 2].map((dotIndex) => (
            <View
              key={dotIndex}
              style={[
                styles.monthIndicatorDot,
                dotIndex === 1 && styles.monthIndicatorDotActive
              ]}
            />
          ))}
        </View>
        <View style={styles.swipeIndicatorContainer}>
          <Text style={styles.swipeIndicatorText}>Next</Text>
          <MaterialCommunityIcons name="gesture-swipe-right" size={16} color="#999" />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.swipeableMonthContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={monthWidth}
        decelerationRate="fast"
        pagingEnabled
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={32}
        bounces={false}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={false}
      >
        {months.map((monthData, index) => renderMonth(monthData, index))}
      </ScrollView>
    </View>
  );
};

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
  const [isMonthExpanded, setIsMonthExpanded] = useState(false);
  const [currentMonthView, setCurrentMonthView] = useState(() => {
    const today = new Date();
    return {
      month: today.getMonth(),
      year: today.getFullYear()
    };
  });
  
  // Add stable month name state to prevent glitches
  const [stableMonthName, setStableMonthName] = useState('');
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  
  // Animation values
  const weekViewOpacity = useRef(new Animated.Value(1)).current;
  const monthViewOpacity = useRef(new Animated.Value(0)).current;
  const weekViewScale = useRef(new Animated.Value(1)).current;
  const monthViewScale = useRef(new Animated.Value(0.95)).current;
  const weekViewTranslateY = useRef(new Animated.Value(0)).current;
  const monthViewTranslateY = useRef(new Animated.Value(20)).current;
  const containerHeight = useRef(new Animated.Value(170)).current; // Start with week view height
  
  // Add scroll position tracking for more responsive updates
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const scrollViewRef = useRef(null);
  const compactScrollViewRef = useRef(null);
  const isInitialized = useRef(false);
  const lastScrollIndex = useRef(currentScrollIndex);

  // Constants for week generation
  const totalWeeks = 5; // Show 5 weeks total (2 before, current, 2 after)
  const minWeekOffset = -2; // Start 2 weeks before current
  const maxWeekOffset = 2; // End 2 weeks after current
  const weekWidth = Dimensions.get('window').width;

  // Pre-calculate month names for all weeks to improve performance
  const preCalculatedMonthNames = useRef(new Map());

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

  // Helper function to calculate stable month name with caching
  const calculateStableMonthName = useCallback((weekIndex) => {
    // Check cache first
    if (preCalculatedMonthNames.current.has(weekIndex)) {
      return preCalculatedMonthNames.current.get(weekIndex);
    }

    const currentWeek = weeks[weekIndex];
    if (!currentWeek || currentWeek.length === 0) {
      const fallbackName = new Date().toLocaleDateString('en-US', { month: 'long' });
      preCalculatedMonthNames.current.set(weekIndex, fallbackName);
      return fallbackName;
    }
    
    // Use the same logic as WeekView: find the month that appears most frequently in the week
    const monthCounts = {};
    currentWeek.forEach(day => {
      if (day.fullDate) {
        const month = day.fullDate.getMonth();
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      }
    });

    // Find the month with the highest count
    const mostFrequentMonth = Object.keys(monthCounts).reduce((a, b) => 
      monthCounts[a] > monthCounts[b] ? a : b
    );
    
    // Get the year from the middle day of the week (Wednesday, index 2) or first day as fallback
    const middleDayOfWeek = currentWeek[2]?.fullDate || currentWeek[0]?.fullDate || new Date();
    
    const displayDate = new Date(middleDayOfWeek);
    displayDate.setMonth(parseInt(mostFrequentMonth));
    
    const monthName = displayDate.toLocaleDateString('en-US', { month: 'long' });
    
    // Cache the result
    preCalculatedMonthNames.current.set(weekIndex, monthName);
    return monthName;
  }, [weeks]);

  // Pre-calculate all month names when weeks change
  useEffect(() => {
    // Clear cache when weeks change
    preCalculatedMonthNames.current.clear();
    
    // Pre-calculate month names for all weeks
    weeks.forEach((_, index) => {
      calculateStableMonthName(index);
    });
    
    // Set initial stable month name
    if (!stableMonthName) {
      const initialMonthName = calculateStableMonthName(currentScrollIndex);
      setStableMonthName(initialMonthName);
    }
  }, [weeks, calculateStableMonthName, currentScrollIndex, stableMonthName]);

  // Add real-time scroll listener for immediate month text updates
  useEffect(() => {
    const listenerId = scrollX.addListener(({ value }) => {
      const currentIndex = Math.round(value / weekWidth);
      const clampedIndex = Math.max(0, Math.min(currentIndex, totalWeeks - 1));
      
      if (clampedIndex !== lastScrollIndex.current) {
        const newMonthName = calculateStableMonthName(clampedIndex);
        setStableMonthName(newMonthName);
        lastScrollIndex.current = clampedIndex;
      }
    });

    return () => {
      scrollX.removeListener(listenerId);
    };
  }, [scrollX, weekWidth, totalWeeks, calculateStableMonthName]);

  // Initialize scroll position to center week (index 2)
  useEffect(() => {
    if (!isInitialized.current) {
      const targetRef = isCompact ? compactScrollViewRef : scrollViewRef;
      if (targetRef.current) {
        setTimeout(() => {
          if (targetRef.current) {
            targetRef.current.scrollTo({
              x: currentScrollIndex * weekWidth,
              animated: false
            });
            isInitialized.current = true;
          }
        }, 100);
      }
    }
  }, [currentScrollIndex, weekWidth, isCompact]);

  // Handle external scroll to index
  useEffect(() => {
    if (scrollToIndex !== undefined && isInitialized.current) {
      const targetRef = isCompact ? compactScrollViewRef : scrollViewRef;
      if (targetRef.current) {
        targetRef.current.scrollTo({
          x: scrollToIndex * weekWidth,
          animated: true
        });
      }
    }
  }, [scrollToIndex, weekWidth, isCompact]);

  // Handle scroll events for immediate month text updates with improved performance
  const handleScroll = useCallback((event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(contentOffset.x / weekWidth);
    const clampedIndex = Math.max(0, Math.min(currentIndex, totalWeeks - 1));
    
    // Update month name immediately during scroll for responsive UI
    if (clampedIndex !== lastScrollIndex.current) {
      const newMonthName = calculateStableMonthName(clampedIndex);
      setStableMonthName(newMonthName);
      lastScrollIndex.current = clampedIndex;
    }
  }, [weekWidth, totalWeeks, calculateStableMonthName]);

  // Create animated scroll event for better performance
  const animatedScrollEvent = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { 
      useNativeDriver: false,
      listener: handleScroll
    }
  );

  const handleScrollEnd = useCallback((event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const currentIndex = Math.round(contentOffset.x / weekWidth);
    
    // Ensure index is within bounds
    const clampedIndex = Math.max(0, Math.min(currentIndex, totalWeeks - 1));
    
    if (clampedIndex !== lastScrollIndex.current) {
      lastScrollIndex.current = clampedIndex;
      
      // Update stable month name immediately (no delay)
      const newMonthName = calculateStableMonthName(clampedIndex);
      setStableMonthName(newMonthName);
      setIsScrolling(false);
      
      // Notify parent component about scroll change
      if (onScrollChange && clampedIndex !== currentScrollIndex) {
        onScrollChange(clampedIndex);
      }
      
      // Update current week offset for internal tracking
      const newOffset = minWeekOffset + clampedIndex;
      setCurrentWeekOffset(newOffset);
    }
  }, [weekWidth, totalWeeks, calculateStableMonthName, onScrollChange, currentScrollIndex, minWeekOffset]);

  // Add scroll begin handler to set scrolling state
  const handleScrollBegin = useCallback(() => {
    setIsScrolling(true);
    // Clear any pending timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Get current month and year for month view
  const getCurrentMonthInfo = useCallback(() => {
    const today = new Date();
    const currentWeek = weeks[currentScrollIndex] || weeks[2]; // Fallback to center week
    
    if (!currentWeek || currentWeek.length === 0) {
      return {
        month: today.getMonth(),
        year: today.getFullYear(),
        monthName: today.toLocaleDateString('en-US', { month: 'long' })
      };
    }
    
    // Use the same logic as WeekView: find the month that appears most frequently in the week
    const monthCounts = {};
    currentWeek.forEach(day => {
      if (day.fullDate) {
        const month = day.fullDate.getMonth();
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      }
    });
    
    // Find the month with the highest count
    const mostFrequentMonth = Object.keys(monthCounts).reduce((a, b) => 
      monthCounts[a] > monthCounts[b] ? a : b
    );
    
    // Get the year from the middle day of the week (Wednesday, index 2) or first day as fallback
    const middleDayOfWeek = currentWeek[2]?.fullDate || currentWeek[0]?.fullDate || today;
    
    const displayDate = new Date(middleDayOfWeek);
    displayDate.setMonth(parseInt(mostFrequentMonth));
    
    return {
      month: parseInt(mostFrequentMonth),
      year: displayDate.getFullYear(),
      monthName: displayDate.toLocaleDateString('en-US', { month: 'long' })
    };
  }, [weeks, currentScrollIndex]);

  // Memoize month info to prevent unnecessary recalculations
  const monthInfo = useMemo(() => {
    if (stableMonthName) {
      return { monthName: stableMonthName };
    }
    return getCurrentMonthInfo();
  }, [stableMonthName, getCurrentMonthInfo]);

  const handleMonthToggle = () => {
    if (!isMonthExpanded) {
      // When expanding to month view, sync with current week
      const { month, year } = getCurrentMonthInfo();
      setCurrentMonthView({ month, year });
      
      // Animate to month view with spring animations
      Animated.parallel([
        // Animate container height to month view size
        Animated.spring(containerHeight, {
          toValue: 450, // Height for month view
          tension: 100,
          friction: 8,
          useNativeDriver: false, // Height animation requires native driver false
        }),
        // Fade out week view
        Animated.spring(weekViewOpacity, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Scale down week view slightly
        Animated.spring(weekViewScale, {
          toValue: 0.9,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Move week view up
        Animated.spring(weekViewTranslateY, {
          toValue: -30,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Fade in month view with delay
        Animated.sequence([
          Animated.delay(100),
          Animated.spring(monthViewOpacity, {
            toValue: 1,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          })
        ]),
        // Scale up month view
        Animated.sequence([
          Animated.delay(100),
          Animated.spring(monthViewScale, {
            toValue: 1,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          })
        ]),
        // Move month view to center
        Animated.sequence([
          Animated.delay(100),
          Animated.spring(monthViewTranslateY, {
            toValue: 0,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          })
        ]),
      ]).start(() => {
        setIsMonthExpanded(true);
      });
    } else {
      // Animate back to week view with spring animations
      Animated.parallel([
        // Animate container height back to week view size
        Animated.spring(containerHeight, {
          toValue: 170, // Height for week view
          tension: 100,
          friction: 8,
          useNativeDriver: false, // Height animation requires native driver false
        }),
        // Fade in week view with delay
        Animated.sequence([
          Animated.delay(100),
          Animated.spring(weekViewOpacity, {
            toValue: 1,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          })
        ]),
        // Scale up week view
        Animated.sequence([
          Animated.delay(100),
          Animated.spring(weekViewScale, {
            toValue: 1,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          })
        ]),
        // Move week view back to center
        Animated.sequence([
          Animated.delay(100),
          Animated.spring(weekViewTranslateY, {
            toValue: 0,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          })
        ]),
        // Fade out month view
        Animated.spring(monthViewOpacity, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Scale down month view
        Animated.spring(monthViewScale, {
          toValue: 0.9,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Move month view down
        Animated.spring(monthViewTranslateY, {
          toValue: 30,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsMonthExpanded(false);
      });
    }
  };

  // Handle month navigation in month view
  const handleMonthChange = (newMonth, newYear) => {
    setCurrentMonthView({
      month: newMonth,
      year: newYear
    });
  };

  // Improved day selection handler to prevent double-click issues
  const handleDaySelection = (day) => {
    // Ensure immediate response
    if (onDaySelect && typeof onDaySelect === 'function') {
      // Use setTimeout to ensure the selection happens on next tick
      setTimeout(() => {
        onDaySelect(day);
      }, 0);
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
          onScroll={animatedScrollEvent}
          onScrollBeginDrag={handleScrollBegin}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={1}
          bounces={false}
        >
          {weeks.map((weekDays, weekIndex) => (
            <View key={`week-${minWeekOffset + weekIndex}`} style={styles.compactWeekWrapper}>
              <WeekView
                days={weekDays}
                selectedDate={selectedDate}
                onDaySelect={handleDaySelection}
                weekOffset={minWeekOffset + weekIndex}
                isCompact={true}
                onMonthToggle={handleMonthToggle}
                isMonthExpanded={isMonthExpanded}
                monthInfo={monthInfo}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { height: containerHeight }]}>
      {/* Week View - Always rendered but animated */}
      <Animated.View 
        style={[
          styles.weekViewContainer,
          {
            opacity: weekViewOpacity,
            transform: [
              { scale: weekViewScale },
              { translateY: weekViewTranslateY }
            ]
          }
        ]}
        pointerEvents={isMonthExpanded ? 'none' : 'auto'}
      >
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          snapToInterval={weekWidth}
          decelerationRate="fast"
          pagingEnabled
          onScroll={animatedScrollEvent}
          onScrollBeginDrag={handleScrollBegin}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={1}
          bounces={false}
        >
          {weeks.map((weekDays, weekIndex) => (
            <View key={`week-${minWeekOffset + weekIndex}`} style={styles.weekWrapper}>
              <WeekView
                days={weekDays}
                selectedDate={selectedDate}
                onDaySelect={handleDaySelection}
                weekOffset={minWeekOffset + weekIndex}
                isCompact={false}
                onMonthToggle={handleMonthToggle}
                isMonthExpanded={isMonthExpanded}
                monthInfo={monthInfo}
              />
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Month View - Always rendered but animated */}
      <Animated.View 
        style={[
          styles.monthViewContainer,
          {
            opacity: monthViewOpacity,
            transform: [
              { scale: monthViewScale },
              { translateY: monthViewTranslateY }
            ]
          }
        ]}
        pointerEvents={isMonthExpanded ? 'auto' : 'none'}
      >
        <SwipeableMonthView
          selectedDate={selectedDate}
          onDaySelect={handleDaySelection}
          currentMonth={currentMonthView.month}
          currentYear={currentMonthView.year}
          onMonthChange={handleMonthChange}
          onToggleExpanded={handleMonthToggle}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  weekWrapper: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingBottom: 8,
  },
  weekHeader: {
    width: '100%',
    marginTop: 12,
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  weekInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekNumberBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  weekNumberLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  weekNumberValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  monthDisplay: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  monthText: {
    fontSize: 15,
    color: '#333',
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
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    minWidth: 44,
    minHeight: 70,
    marginHorizontal: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
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
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedText: {
    color: '#fff',
  },
  todayText: {
    color: '#000',
    fontWeight: 'bold',
  },
  workoutIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  workoutIndicatorSelected: {
    backgroundColor: '#fff',
  },
  compactContainer: {
    paddingVertical: 8,
    paddingBottom: 12,
    backgroundColor: '#f8f9fa',
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
    paddingHorizontal: 20,
  },
  compactWeekWrapper: {
    width: SCREEN_WIDTH,
  },
  compactWeekContainer: {
    width: '100%',
  },
  compactDayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    minWidth: 40,
    minHeight: 60,
    marginHorizontal: 1,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
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
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  compactDateText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  compactSelectedText: {
    color: '#fff',
  },
  compactTodayText: {
    color: '#000',
    fontWeight: 'bold',
  },
  compactIndicatorContainer: {
    marginTop: 2,
    minHeight: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactWorkoutIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4CAF50',
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
  monthDayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  monthDayHeader: {
    flex: 1,
    alignItems: 'center',
  },
  monthDayHeaderText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  monthGrid: {
    // Vertical stacking of weeks
  },
  monthWeekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  monthDayItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    minHeight: 50,
    borderRadius: 12,
    marginHorizontal: 1,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  monthTodayDay: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  monthSelectedDay: {
    backgroundColor: '#000',
  },
  monthOtherMonthDay: {
    opacity: 0.3,
  },
  monthDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  monthTodayText: {
    color: '#000',
    fontWeight: 'bold',
  },
  monthSelectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  monthOtherMonthText: {
    color: '#999',
  },
  monthWorkoutIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  monthWorkoutIndicatorSelected: {
    backgroundColor: '#fff',
  },
  monthRestIndicator: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  monthRestIndicatorSelected: {
    color: '#fff',
  },
  monthToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  monthNavButton: {
    marginHorizontal: 12,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  monthContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  monthHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  monthHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  swipeableMonthContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  swipeableMonthWrapper: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  swipeIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  swipeIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeIndicatorText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
    fontWeight: '600',
  },
  monthIndicatorDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginHorizontal: 4,
  },
  monthIndicatorDotActive: {
    backgroundColor: '#000',
  },
  monthCollapseButton: {
    marginHorizontal: 12,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  monthPlaceholder: {
    width: 48,
    marginHorizontal: 12,
  },
  weekViewContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  monthViewContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  indicatorContainer: {
    marginTop: 2,
    minHeight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WeekSchedule; 
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MealSchedule = ({ navigation, selectedDate }) => {
  const [mealProgress, setMealProgress] = useState({});

  // Meal data with timeline integration
  const meals = [
    {
      id: 'breakfast',
      name: 'Frukost',
      time: '08:00',
      calories: 420,
      dishes: 2,
      icon: 'coffee',
      color: '#FF6B6B',
      backgroundColor: '#FFF5F5',
      borderColor: '#FFE5E5',
      items: ['Havregrynsgröt med bär', 'Grekisk yoghurt']
    },
    {
      id: 'snack1',
      name: 'Mellanmål',
      time: '10:30',
      calories: 150,
      dishes: 1,
      icon: 'food-apple',
      color: '#4ECDC4',
      backgroundColor: '#F0FFFE',
      borderColor: '#E0FFFC',
      items: ['Äpple med mandlar']
    },
    {
      id: 'lunch',
      name: 'Lunch',
      time: '12:30',
      calories: 650,
      dishes: 3,
      icon: 'food',
      color: '#FFD93D',
      backgroundColor: '#FFFEF0',
      borderColor: '#FFFCE0',
      items: ['Grillad kyckling', 'Quinoa sallad', 'Avokado']
    },
    {
      id: 'snack2',
      name: 'Mellanmål',
      time: '15:00',
      calories: 200,
      dishes: 1,
      icon: 'food-variant',
      color: '#9B59B6',
      backgroundColor: '#F8F5FF',
      borderColor: '#F0E5FF',
      items: ['Protein smoothie']
    },
    {
      id: 'dinner',
      name: 'Middag',
      time: '18:00',
      calories: 777,
      dishes: 4,
      icon: 'silverware-fork-knife',
      color: '#E74C3C',
      backgroundColor: '#FFF5F5',
      borderColor: '#FFE5E5',
      items: ['Lax med quinoa', 'Ångade grönsaker', 'Sallad', 'Olivolja']
    },
    {
      id: 'evening',
      name: 'Kvällsmål',
      time: '21:00',
      calories: 180,
      dishes: 1,
      icon: 'cup',
      color: '#3498DB',
      backgroundColor: '#F5F9FF',
      borderColor: '#E5F2FF',
      items: ['Kvarg med nötter']
    }
  ];

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const targetCalories = 2200;
  const progressPercentage = Math.round((totalCalories / targetCalories) * 100);

  const handleMealPress = (meal) => {
    navigation.navigate('MealSelection', {
      mealName: meal.name,
      mealTime: meal.time,
      mealId: meal.id
    });
  };

  const toggleMealComplete = (mealId) => {
    setMealProgress(prev => ({
      ...prev,
      [mealId]: !prev[mealId]
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>Dagens</Text>
          <Text style={styles.title}>Måltidsschema</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.caloriesSummary}>
            <Text style={styles.caloriesText}>{totalCalories}</Text>
            <Text style={styles.caloriesLabel}>/{targetCalories} kcal</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(progressPercentage, 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{progressPercentage}% av dagsmål</Text>
      </View>

      {/* Meal Timeline */}
      <View style={styles.timeline}>
        {meals.map((meal, index) => {
          const isCompleted = mealProgress[meal.id];
          
          return (
            <View key={meal.id} style={styles.timeBlock}>
              {/* Time Container - matching DaySchedule structure */}
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{meal.time}</Text>
                <View style={[
                  styles.timeLine,
                  index === meals.length - 1 && styles.timeLineEnd
                ]} />
              </View>

              {/* Meal Container */}
              <View style={styles.mealContainer}>
                <TouchableOpacity
                  style={[
                    styles.mealCard,
                    { 
                      backgroundColor: meal.backgroundColor,
                      borderColor: isCompleted ? meal.color : meal.borderColor,
                      borderWidth: isCompleted ? 2 : 1
                    }
                  ]}
                  onPress={() => handleMealPress(meal)}
                  activeOpacity={0.7}
                >
                  {/* Meal Header */}
                  <View style={styles.mealHeader}>
                    <View style={styles.mealTitleContainer}>
                      <View style={[styles.mealIcon, { backgroundColor: meal.color }]}>
                        <MaterialCommunityIcons 
                          name={meal.icon} 
                          size={20} 
                          color="#fff" 
                        />
                      </View>
                      <View style={styles.mealInfo}>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        <Text style={styles.mealDetails}>
                          {meal.calories} kcal • {meal.dishes} rätt{meal.dishes !== 1 ? 'er' : ''}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.mealActions}>
                      <TouchableOpacity
                        style={[
                          styles.checkBox,
                          isCompleted && styles.checkBoxCompleted
                        ]}
                        onPress={() => toggleMealComplete(meal.id)}
                      >
                        {isCompleted && (
                          <MaterialCommunityIcons name="check" size={16} color="#fff" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Meal Items Preview */}
                  <View style={styles.mealItems}>
                    {meal.items.slice(0, 2).map((item, itemIndex) => (
                      <View key={itemIndex} style={styles.mealItem}>
                        <View style={[styles.itemDot, { backgroundColor: meal.color }]} />
                        <Text style={styles.itemText}>{item}</Text>
                      </View>
                    ))}
                    {meal.items.length > 2 && (
                      <Text style={styles.moreItems}>
                        +{meal.items.length - 2} till
                      </Text>
                    )}
                  </View>

                  {/* Add Food Button */}
                  <TouchableOpacity 
                    style={[styles.addButton, { borderColor: meal.color }]}
                    onPress={() => handleMealPress(meal)}
                  >
                    <MaterialCommunityIcons 
                      name="plus" 
                      size={16} 
                      color={meal.color} 
                    />
                    <Text style={[styles.addButtonText, { color: meal.color }]}>
                      Lägg till mat
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Daily Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Dagens sammanfattning</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="fire" size={20} color="#FF6B6B" />
            <Text style={styles.summaryValue}>{totalCalories}</Text>
            <Text style={styles.summaryLabel}>Kalorier</Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="food" size={20} color="#4ECDC4" />
            <Text style={styles.summaryValue}>{meals.reduce((sum, meal) => sum + meal.dishes, 0)}</Text>
            <Text style={styles.summaryLabel}>Rätter</Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#2ECC71" />
            <Text style={styles.summaryValue}>
              {Object.values(mealProgress).filter(Boolean).length}
            </Text>
            <Text style={styles.summaryLabel}>Klara</Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="target" size={20} color="#9B59B6" />
            <Text style={styles.summaryValue}>{progressPercentage}%</Text>
            <Text style={styles.summaryLabel}>Mål</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerActions: {
    alignItems: 'flex-end',
  },
  caloriesSummary: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    minWidth: 100,
  },
  caloriesText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  caloriesLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  timeline: {
    paddingTop: 16,
  },
  timeBlock: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timeContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  timeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
  },
  timeLineEnd: {
    backgroundColor: 'transparent',
  },
  mealContainer: {
    flex: 1,
  },
  mealCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  mealDetails: {
    fontSize: 14,
    color: '#666',
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkBoxCompleted: {
    backgroundColor: '#2ECC71',
    borderColor: '#2ECC71',
  },
  mealItems: {
    marginBottom: 12,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  moreItems: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginLeft: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default MealSchedule; 
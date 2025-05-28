import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const WorkoutTemplatesScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: 'dumbbell' },
    { id: 'strength', name: 'Strength', icon: 'weight-lifter' },
    { id: 'cardio', name: 'Cardio', icon: 'run' },
    { id: 'flexibility', name: 'Flexibility', icon: 'yoga' },
    { id: 'hiit', name: 'HIIT', icon: 'timer' },
  ];

  const templates = [
    {
      id: 1,
      name: 'Push Day',
      category: 'strength',
      duration: 60,
      difficulty: 'Intermediate',
      exercises: 8,
      description: 'Focus on chest, shoulders, and triceps',
      muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
      exerciseList: [
        'Bench Press - 4x8',
        'Incline Dumbbell Press - 3x10',
        'Military Press - 4x8',
        'Lateral Raises - 3x12',
        'Tricep Dips - 3x12',
        'Overhead Press - 3x10',
        'Chest Flyes - 3x12',
        'Tricep Extensions - 3x12'
      ],
      calories: 320
    },
    {
      id: 2,
      name: 'Pull Day',
      category: 'strength',
      duration: 55,
      difficulty: 'Intermediate',
      exercises: 7,
      description: 'Target back and biceps effectively',
      muscleGroups: ['Back', 'Biceps'],
      exerciseList: [
        'Pull-ups - 4x8',
        'Barbell Rows - 4x8',
        'Lat Pulldowns - 3x10',
        'Cable Rows - 3x12',
        'Barbell Curls - 3x12',
        'Hammer Curls - 3x12',
        'Face Pulls - 3x15'
      ],
      calories: 280
    },
    {
      id: 3,
      name: 'Leg Day',
      category: 'strength',
      duration: 70,
      difficulty: 'Advanced',
      exercises: 9,
      description: 'Complete lower body workout',
      muscleGroups: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
      exerciseList: [
        'Squats - 4x8',
        'Romanian Deadlifts - 4x8',
        'Leg Press - 3x12',
        'Bulgarian Split Squats - 3x10',
        'Leg Curls - 3x12',
        'Calf Raises - 4x15',
        'Lunges - 3x12',
        'Leg Extensions - 3x12',
        'Glute Bridges - 3x15'
      ],
      calories: 400
    },
    {
      id: 4,
      name: 'HIIT Cardio',
      category: 'hiit',
      duration: 25,
      difficulty: 'Beginner',
      exercises: 6,
      description: 'High intensity interval training',
      muscleGroups: ['Full Body'],
      exerciseList: [
        'Burpees - 30s on/30s off',
        'Mountain Climbers - 30s on/30s off',
        'Jump Squats - 30s on/30s off',
        'High Knees - 30s on/30s off',
        'Push-ups - 30s on/30s off',
        'Plank Jacks - 30s on/30s off'
      ],
      calories: 250
    },
    {
      id: 5,
      name: 'Core Blast',
      category: 'strength',
      duration: 30,
      difficulty: 'Beginner',
      exercises: 6,
      description: 'Strengthen your core muscles',
      muscleGroups: ['Core', 'Abs'],
      exerciseList: [
        'Planks - 3x60s',
        'Russian Twists - 3x20',
        'Leg Raises - 3x15',
        'Dead Bug - 3x12',
        'Bicycle Crunches - 3x20',
        'Mountain Climbers - 3x30s'
      ],
      calories: 150
    },
    {
      id: 6,
      name: 'Morning Stretch',
      category: 'flexibility',
      duration: 15,
      difficulty: 'Beginner',
      exercises: 8,
      description: 'Gentle stretches to start your day',
      muscleGroups: ['Full Body'],
      exerciseList: [
        'Cat-Cow Stretch - 10 reps',
        'Child\'s Pose - 60s',
        'Downward Dog - 60s',
        'Hip Circles - 10 each way',
        'Shoulder Rolls - 10 each way',
        'Neck Stretches - 30s each side',
        'Spinal Twist - 30s each side',
        'Forward Fold - 60s'
      ],
      calories: 50
    },
    {
      id: 7,
      name: 'Upper Body Power',
      category: 'strength',
      duration: 45,
      difficulty: 'Advanced',
      exercises: 7,
      description: 'Explosive upper body movements',
      muscleGroups: ['Chest', 'Back', 'Shoulders', 'Arms'],
      exerciseList: [
        'Power Push-ups - 4x6',
        'Explosive Pull-ups - 4x5',
        'Medicine Ball Slams - 4x10',
        'Plyometric Push-ups - 3x8',
        'Battle Ropes - 3x30s',
        'Box Push-ups - 3x10',
        'Clap Push-ups - 3x5'
      ],
      calories: 300
    },
    {
      id: 8,
      name: 'Cardio Burn',
      category: 'cardio',
      duration: 40,
      difficulty: 'Intermediate',
      exercises: 5,
      description: 'Steady-state cardio workout',
      muscleGroups: ['Full Body'],
      exerciseList: [
        'Jumping Jacks - 5 min',
        'Running in Place - 10 min',
        'Step-ups - 8 min',
        'Butt Kickers - 5 min',
        'Cool Down Walk - 12 min'
      ],
      calories: 350
    }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#666';
    }
  };

  const handleTemplatePress = (template) => {
    setSelectedTemplate(template);
    setModalVisible(true);
  };

  const handleUseTemplate = () => {
    setModalVisible(false);
    // Navigate back to plans with selected template
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Workout Templates</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="plus" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <MaterialCommunityIcons 
              name={category.icon} 
              size={20} 
              color={selectedCategory === category.id ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Templates Grid */}
      <ScrollView style={styles.templatesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.templatesGrid}>
          {filteredTemplates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateCard}
              onPress={() => handleTemplatePress(template)}
            >
              <View style={styles.templateHeader}>
                <Text style={styles.templateName}>{template.name}</Text>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(template.difficulty) }
                ]}>
                  <Text style={styles.difficultyText}>{template.difficulty}</Text>
                </View>
              </View>

              <Text style={styles.templateDescription}>{template.description}</Text>

              <View style={styles.templateStats}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                  <Text style={styles.statText}>{template.duration} min</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="dumbbell" size={16} color="#666" />
                  <Text style={styles.statText}>{template.exercises} exercises</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="fire" size={16} color="#666" />
                  <Text style={styles.statText}>{template.calories} cal</Text>
                </View>
              </View>

              <View style={styles.muscleGroups}>
                {template.muscleGroups.slice(0, 3).map((muscle, index) => (
                  <View key={index} style={styles.muscleTag}>
                    <Text style={styles.muscleText}>{muscle}</Text>
                  </View>
                ))}
                {template.muscleGroups.length > 3 && (
                  <View style={styles.muscleTag}>
                    <Text style={styles.muscleText}>+{template.muscleGroups.length - 3}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Template Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTemplate?.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>{selectedTemplate?.description}</Text>

              <View style={styles.modalStats}>
                <View style={styles.modalStatItem}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#4CAF50" />
                  <Text style={styles.modalStatValue}>{selectedTemplate?.duration}</Text>
                  <Text style={styles.modalStatLabel}>Minutes</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <MaterialCommunityIcons name="dumbbell" size={20} color="#2196F3" />
                  <Text style={styles.modalStatValue}>{selectedTemplate?.exercises}</Text>
                  <Text style={styles.modalStatLabel}>Exercises</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <MaterialCommunityIcons name="fire" size={20} color="#FF6B35" />
                  <Text style={styles.modalStatValue}>{selectedTemplate?.calories}</Text>
                  <Text style={styles.modalStatLabel}>Calories</Text>
                </View>
              </View>

              <View style={styles.exercisesList}>
                <Text style={styles.exercisesTitle}>Exercises</Text>
                {selectedTemplate?.exerciseList.map((exercise, index) => (
                  <View key={index} style={styles.exerciseItem}>
                    <View style={styles.exerciseNumber}>
                      <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.exerciseText}>{exercise}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.muscleGroupsList}>
                <Text style={styles.muscleGroupsTitle}>Target Muscles</Text>
                <View style={styles.muscleGroupsContainer}>
                  {selectedTemplate?.muscleGroups.map((muscle, index) => (
                    <View key={index} style={styles.muscleGroupTag}>
                      <Text style={styles.muscleGroupText}>{muscle}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.previewButton}>
                <MaterialCommunityIcons name="eye" size={20} color="#666" />
                <Text style={styles.previewButtonText}>Preview</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.useButton} onPress={handleUseTemplate}>
                <MaterialCommunityIcons name="play" size={20} color="#fff" />
                <Text style={styles.useButtonText}>Use Template</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Categories
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  // Templates
  templatesContainer: {
    flex: 1,
    padding: 20,
  },
  templatesGrid: {
    gap: 16,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  templateStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  muscleTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  muscleText: {
    fontSize: 12,
    color: '#666',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  exercisesList: {
    marginBottom: 24,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  exerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  exerciseText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  muscleGroupsList: {
    marginBottom: 24,
  },
  muscleGroupsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleGroupTag: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  muscleGroupText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    gap: 8,
  },
  previewButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  useButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    gap: 8,
  },
  useButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default WorkoutTemplatesScreen; 
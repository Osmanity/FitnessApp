import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProgressScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="menu" size={24} color="#000" style={styles.menuIcon} />
        <Text style={styles.title}>Progress</Text>
        <MaterialCommunityIcons name="bell" size={24} color="#000" style={styles.bellIcon} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.comingSoonText}>Coming Soon</Text>
        <Text style={styles.descriptionText}>Track your fitness progress here</Text>
      </View>
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  comingSoonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProgressScreen; 
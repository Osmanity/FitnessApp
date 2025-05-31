import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MenuScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="menu" size={24} color="#000" style={styles.menuIcon} />
        <Text style={styles.title}>Meny</Text>
        <MaterialCommunityIcons name="bell" size={24} color="#000" style={styles.bellIcon} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil & Konto</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="account-edit" size={24} color="#666" />
            <Text style={styles.menuText}>Redigera profil</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="lock" size={24} color="#666" />
            <Text style={styles.menuText}>Ändra lösenord</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="bell" size={24} color="#666" />
            <Text style={styles.menuText}>Notifikationer</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="shield-account" size={24} color="#666" />
            <Text style={styles.menuText}>Integritet</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Träning & Mål</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="target" size={24} color="#666" />
            <Text style={styles.menuText}>Mål & Preferenser</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="chart-line" size={24} color="#666" />
            <Text style={styles.menuText}>Statistik</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="calendar-sync" size={24} color="#666" />
            <Text style={styles.menuText}>Synkronisering</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Inställningar</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="palette" size={24} color="#666" />
            <Text style={styles.menuText}>Tema & Utseende</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="translate" size={24} color="#666" />
            <Text style={styles.menuText}>Språk</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="backup-restore" size={24} color="#666" />
            <Text style={styles.menuText}>Säkerhetskopiering</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Info</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="help-circle" size={24} color="#666" />
            <Text style={styles.menuText}>Hjälp & Support</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="information" size={24} color="#666" />
            <Text style={styles.menuText}>Om appen</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="file-document" size={24} color="#666" />
            <Text style={styles.menuText}>Användarvillkor</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="logout" size={24} color="#e74c3c" />
            <Text style={[styles.menuText, { color: '#e74c3c' }]}>Logga ut</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#e74c3c" />
          </TouchableOpacity>
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
    padding: 20,
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
});

export default MenuScreen; 
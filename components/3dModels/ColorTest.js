import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ColorTest() {
  return (
    <View style={styles.container}>
      <View style={styles.redBox}>
        <Text style={styles.text}>RÖD BOX</Text>
      </View>
      <View style={styles.blueBox}>
        <Text style={styles.text}>BLÅ BOX</Text>
      </View>
      <View style={styles.greenBox}>
        <Text style={styles.text}>GRÖN BOX</Text>
      </View>
      <Text style={styles.infoText}>
        Om du ser denna text och färgade boxar, fungerar grundläggande rendering.
        Om allt är vitt, finns det ett problem med appen själv.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redBox: {
    width: 100,
    height: 100,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
  },
  blueBox: {
    width: 100,
    height: 100,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
  },
  greenBox: {
    width: 100,
    height: 100,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    marginTop: 20,
    paddingHorizontal: 20,
  },
}); 
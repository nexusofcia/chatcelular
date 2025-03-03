import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        
        // Wait a moment to show the splash screen
        setTimeout(() => {
          if (userToken) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'ContactsList' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'PhoneAuth' }],
            });
          }
        }, 1500);
      } catch (error) {
        console.error('Error checking authentication status:', error);
        navigation.navigate('PhoneAuth');
      }
    };

    checkAuthStatus();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4A90E2" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
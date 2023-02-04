import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { GarageContextProvider } from './Context/GarageContext';
import { VehicleContextProvider } from './Context/VehicleContext';
import Garages from './Pages/Garages';
import Vehicles from './Pages/Vehicles';
import Wishlist from './Pages/Wishlist';

const Tab = createMaterialTopTabNavigator();

const OnlineGarageManager = () => {
  return (
    <NavigationContainer>
      <GarageContextProvider>
        <VehicleContextProvider>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Garage Manager for GTA Online</Text>
          </View>
          <Tab.Navigator
            initialRouteName="Garages"
            screenOptions={{
              "tabBarActiveTintColor": '#FFFFFF',
              "tabBarInactiveTintColor": '#B3E5FC',
              "tabBarIndicatorStyle": { backgroundColor: '#FFFFFF' },
              "tabBarStyle": { backgroundColor: '#2D640F' },
            }}>
            <Tab.Screen name="Garages" component={Garages} />
            <Tab.Screen name="Vehicles" component={Vehicles} />
            <Tab.Screen name="Wishlist" component={Wishlist} />
          </Tab.Navigator>
        </VehicleContextProvider>
      </GarageContextProvider>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    fontWeight: 'bold',
    fontSize: 20,
    color: 'white'
  },
  headerContainer: {
    backgroundColor: '#2D640F',
    justifyContent: 'center',
    height: 50,
    alignItems: 'center',
  }
});

export default OnlineGarageManager;

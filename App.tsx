import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Garages from './Pages/Garages';
import Cars from './Pages/Cars';
import Other from './Pages/Other';

const Tab = createMaterialTopTabNavigator();

const OnlineGarageManager = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Garages"
        screenOptions={{
          "tabBarActiveTintColor": '#FFFFFF',
          "tabBarInactiveTintColor": '#B3E5FC',
          "tabBarIndicatorStyle": { backgroundColor: '#FFFFFF' },
          "tabBarStyle": { backgroundColor: '#009A44' },
        }}>
        <Tab.Screen name="Garages" component={Garages} />
        <Tab.Screen name="Cars" component={Cars} />
        <Tab.Screen name="Other" component={Other} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default OnlineGarageManager;

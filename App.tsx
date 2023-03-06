import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WishlistContextProvider } from './src/context/WishlistContext';
import { VehicleContextProvider } from './src/context/VehicleContext';
import { GarageContextProvider } from './src/context/GarageContext';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import SettingsIcon from './src/images/settingsIcon.png';
import Wishlist from './src/pages/Wishlist';
import Vehicles from './src/pages/Vehicles';
import Settings from './src/pages/Settings';
import Garages from './src/pages/Garages';
import styles from './src/styles/Styles';

const SettingsStack = createNativeStackNavigator();

const Tab = createMaterialTopTabNavigator();

const JohnnyOnTheSpot = () => {
  return (
    <NavigationContainer>
      <GarageContextProvider>
        <VehicleContextProvider>
          <WishlistContextProvider>

            <View style={styles.containerHeaderMain}>
              <Text style={styles.headerMain}> Johnny-on-the-Spot </Text>
                <TouchableOpacity style={{ position: 'absolute', right: 10, top: 10 }}>
                  <Image source={SettingsIcon} style={{ width: 27.5, height: 27.5 }} />
                </TouchableOpacity>
            </View>
            
            <Tab.Navigator
              initialRouteName='Garages'
              screenOptions={{
                tabBarLabelStyle: {
                  fontFamily: 'FOTNewRodin Pro B', fontSize: 12
                },
                'tabBarActiveTintColor': '#FFFFFF',
                'tabBarInactiveTintColor': '#B3E5FC',
                'tabBarIndicatorStyle': { backgroundColor: '#FFFFFF' },
                'tabBarStyle': { backgroundColor: '#2D640F' },
                
              }}>
              <Tab.Screen name='Garages' component={Garages} />
              <Tab.Screen name='Vehicles' component={Vehicles} />
              <Tab.Screen name='Wishlist' component={Wishlist} />
            </Tab.Navigator>
          </WishlistContextProvider>
        </VehicleContextProvider>
      </GarageContextProvider>
    </NavigationContainer>
  );
};

export default JohnnyOnTheSpot;

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { WishlistContextProvider } from './Context/WishlistContext';
import { VehicleContextProvider } from './Context/VehicleContext';
import { GarageContextProvider } from './Context/GarageContext';
import { NavigationContainer } from '@react-navigation/native';
import Garages from './Pages/Garages';
import Vehicles from './Pages/Vehicles';
import Wishlist from './Pages/Wishlist';

const Tab = createMaterialTopTabNavigator();

const JohnnyOnTheSpot = () => {
  return (
    <NavigationContainer>
      <GarageContextProvider>
        <VehicleContextProvider>
          <WishlistContextProvider>
            <View style={styles.headerContainer}>
              <Image
                style={styles.backgroundImage}
                source={require('./Images/headerBackground.png')}
                blurRadius={0}
              />
              <Text style={styles.header}> Johnny-on-the-Spot  </Text>
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
          </WishlistContextProvider>
        </VehicleContextProvider>
      </GarageContextProvider>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 5,
    fontSize: 30,
    color: 'white',
    fontFamily: 'SignPainter-HouseScript'
  },
  headerContainer: {
    backgroundColor: '#2D640F',
    justifyContent: 'center',
    height: 50,
    alignItems: 'center'
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
});

export default JohnnyOnTheSpot;

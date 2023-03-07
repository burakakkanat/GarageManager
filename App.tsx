import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { WishlistContextProvider } from './src/context/WishlistContext';
import { VehicleContextProvider } from './src/context/VehicleContext';
import { GarageContextProvider } from './src/context/GarageContext';
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import dataManagementUtil from './src/util/DataManagementUtil';
import SettingsIcon from './src/images/settingsIcon.png';
import Wishlist from './src/pages/Wishlist';
import Vehicles from './src/pages/Vehicles';
import Garages from './src/pages/Garages';
import styles from './src/styles/Styles';
import React, { useState } from 'react';

const Tab = createMaterialTopTabNavigator();

const JohnnyOnTheSpot = () => {

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const showSettings = async () => {
    setSettingsModalVisible(true);
  };

  return (
    <NavigationContainer>
      <GarageContextProvider>
        <VehicleContextProvider>
          <WishlistContextProvider>

            <View style={styles.containerHeaderMain}>
              <Text style={styles.headerMain}> Johnny-on-the-Spot </Text>
              <TouchableOpacity style={{ position: 'absolute', right: 10, top: 10 }} onPress={() => showSettings()}>
                <Image source={SettingsIcon} style={{ width: 25, height: 25 }} />
              </TouchableOpacity>
            </View>

            <Modal
              animationType='slide'
              transparent={false}
              visible={settingsModalVisible}
              onRequestClose={() => {
                setSettingsModalVisible(false);
              }}
            >
              <View style={styles.containerHeader}>
                <Text style={styles.header}>Settings</Text>
              </View>

              <View style={{height: '25%', marginTop: '70%' }}>
                <View style={styles.containerButton}>
                  <TouchableOpacity
                    style={styles.buttonGreen}
                    onPress={dataManagementUtil.backupData}>
                    <Text style={styles.textButton}>Backup</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.containerButton}>
                  <TouchableOpacity
                    style={styles.buttonYellow}
                    onPress={dataManagementUtil.restoreFromBackup}>
                    <Text style={styles.textButton}>Restore</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.containerButton}>
                  <TouchableOpacity
                    style={styles.buttonRed}
                    onPress={dataManagementUtil.clearAllData}>
                    <Text style={styles.textButton}>Clear All</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

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
    </NavigationContainer >
  );
};

export default JohnnyOnTheSpot;

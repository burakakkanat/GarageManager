import { Clipboard, Image, Modal, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { GarageContextProvider } from './src/context/GarageContext';
import { NavigationContainer } from '@react-navigation/native';
import dataManagementUtil from './src/util/DataManagementUtil';
import SettingsIcon from './src/images/settingsIcon.png';
import React, { useEffect, useState } from 'react';
import loggerUtil from './src/util/LoggerUtil';
import Wishlist from './src/pages/Wishlist';
import Vehicles from './src/pages/Vehicles';
import Garages from './src/pages/Garages';
import styles from './src/styles/Styles';
import Dialog from "react-native-dialog";
import util from './src/util/Util';

const Tab = createMaterialTopTabNavigator();

const JohnnyOnTheSpot = () => {

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Backup stuff
  const [userIdDialogVisible, setUserIdDialogVisible] = useState(false);
  const [dialogInputValue, setDialogInputValue] = useState('');
  const [userId, setUserId] = useState('');

  // Alert stuff
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    confirmButtonText: '',
    message: '',
    showCancelButton: true,
    title: '',
  });

  useEffect(() => {
    const getUserId = async () => {
      var storedUserId = await util.retrieveObject('@UserId');
      if (storedUserId && storedUserId.length !== 0) {
        setUserId(storedUserId);
      }
    };

    getUserId();
  }, []);

  const showSettings = async () => {
    setSettingsModalVisible(true);
  };

  const backupData = async () => {

    setAlertConfig({

      confirmButtonText: 'Confirm',
      message: 'Are you sure you want to backup your current data?',
      showCancelButton: true,
      title: 'Backup Data',

      onConfirmPressed: async () => {
        try {
          dataManagementUtil.backupData();
        } catch (error) {
          loggerUtil.logError('App_backupData', error);
        } finally {
          setShowAlert(false);
        }
      },
      onCancelPressed: async () => {
        setShowAlert(false);
      }
    });

    setShowAlert(true);
  }

  const restoreData = async () => {

    if (!userId || userId.length === 0) {

      setUserIdDialogVisible(true);

    } else {

      setAlertConfig({

        confirmButtonText: 'Confirm',
        message: 'Are you sure you want to restore data from your latest backup?',
        showCancelButton: true,
        title: 'Restore Data',

        onConfirmPressed: async () => {
          try {
            dataManagementUtil.restoreFromBackup();
          } catch (error) {
            loggerUtil.logError('App_restoreData', error);
          } finally {
            setShowAlert(false);
          }
        },
        onCancelPressed: async () => {
          setShowAlert(false);
        }
      });

      setShowAlert(true);
    }
  }

  const handleUserIdDialogSubmit = async () => {

    try {
      const userId = dialogInputValue.trim();
      setUserId(userId);
      await util.saveObject('@UserId', userId);
      setUserIdDialogVisible(false);
      dataManagementUtil.restoreFromBackup();
    } catch (error) {
      loggerUtil.logError('App_handleUserIdDialogSubmit', error);
    }
  }

  const handleUserIdDialogCancel = async () => {
    setDialogInputValue('');
    setUserIdDialogVisible(false);
  }

  const clearAllData = async () => {

    setAlertConfig({

      confirmButtonText: 'Confirm',
      message: 'This will erase your data from the application and the backup server. Are you sure?',
      showCancelButton: true,
      title: 'Clear All Data',

      onConfirmPressed: async () => {
        try {
          dataManagementUtil.clearAllData();
        } catch (error) {
          loggerUtil.logError('App_clearAllData', error);
        } finally {
          setShowAlert(false);
        }
      },
      onCancelPressed: async () => {
        setShowAlert(false);
      }
    });

    setShowAlert(true);
  }

  const renderUserIdSection = () => {
    if (userId && userId.length > 0) {
      return (
        <TouchableOpacity
          style={styles.userIdContainer}
          onPress={() => {
            Clipboard.setString(userId);
            ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
          }}
        >
          <Text style={styles.userIdText}>
            <Text style={{ fontWeight: 'bold' }}>User ID (save this in case of device change): </Text>
            {userId}
          </Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <NavigationContainer>
      <GarageContextProvider>

        <View style={styles.containerHeaderMain}>
          <Text style={styles.headerMain}> Johnny-on-the-Spot </Text>
          <TouchableOpacity style={{ position: 'absolute', right: 10, top: 10 }} onPress={() => showSettings()}>
            <Image source={SettingsIcon} style={{ width: 25, height: 25 }} />
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

          <View style={{ height: '25%', marginTop: '60%' }}>
            <View style={styles.containerButton}>
              <TouchableOpacity
                style={styles.buttonGreen}
                onPress={backupData}>
                <Text style={styles.textButton}>Backup</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.containerButton}>
              <TouchableOpacity
                style={styles.buttonOrange}
                onPress={restoreData}>
                <Text style={styles.textButton}>Restore</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.containerButton}>
              <TouchableOpacity
                style={styles.buttonRed}
                onPress={clearAllData}>
                <Text style={styles.textButton}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View>
            {renderUserIdSection()}
          </View>

          <View>
            <Dialog.Container visible={userIdDialogVisible}>
              <Dialog.Title style={styles.textUserIdDialogTitle}>No User ID Found</Dialog.Title>
              <Dialog.Description style={styles.textUserIdDetails}>
                Please submit the "Backup Id" you obtained from your other device.
              </Dialog.Description>
              <Dialog.Input
                style={styles.textUserIdDetails}
                onChangeText={text => setDialogInputValue(text)} />
              <Dialog.Button label="Cancel" style={styles.textButton} onPress={handleUserIdDialogCancel} />
              <Dialog.Button label="Submit" style={styles.textButton} onPress={handleUserIdDialogSubmit} />
            </Dialog.Container>
          </View>

        </Modal>

        {util.renderAwesomeAlert(alertConfig, showAlert)}

      </GarageContextProvider>
    </NavigationContainer >
  );
};

export default JohnnyOnTheSpot;

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
  const [backupIdDialogVisible, setBackupIdDialogVisible] = useState(false);
  const [dialogInputValue, setDialogInputValue] = useState('');
  const [backupId, setBackupId] = useState('');

  // Alert stuff
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    confirmButtonText: '',
    message: '',
    showCancelButton: true,
    title: '',
  });

  useEffect(() => {
    const getBackupId = async () => {
      var storedBackupId = await util.retrieveObject('@BackupId');
      if (storedBackupId && storedBackupId.length !== 0) {
        setBackupId(storedBackupId);
      }
    };

    getBackupId();
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

    if (!backupId || backupId.length === 0) {

      setBackupIdDialogVisible(true);

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

  const handleBackupIdDialogSubmit = async () => {

    try {
      const backupId = dialogInputValue.trim();
      setBackupId(backupId);
      await util.saveObject('@BackupId', backupId);
      setBackupIdDialogVisible(false);
      dataManagementUtil.restoreFromBackup();
    } catch (error) {
      loggerUtil.logError('App_handleBackupIdDialogSubmit', error);
    }
  }

  const handleBackupIdDialogCancel = async () => {
    setDialogInputValue('');
    setBackupIdDialogVisible(false);
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

  const renderBackupIdSection = () => {
    if (backupId && backupId.length > 0) {
      return (
        <TouchableOpacity
          style={styles.backupIdContainer}
          onPress={() => {
            Clipboard.setString(backupId);
            ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
          }}
        >
          <Text style={styles.backupIdText}>
            <Text style={{ fontWeight: 'bold' }}>Backup ID (save this in case of device change): </Text>
            {backupId}
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
            {renderBackupIdSection()}
          </View>

          <View>
            <Dialog.Container visible={backupIdDialogVisible}>
              <Dialog.Title style={styles.textBackupIdDialogTitle}>No Backup ID Found</Dialog.Title>
              <Dialog.Description style={styles.textBackupIdDetails}>
                Please submit the "Backup Id" you obtained from your other device.
              </Dialog.Description>
              <Dialog.Input
                style={styles.textBackupIdDetails}
                onChangeText={text => setDialogInputValue(text)} />
              <Dialog.Button label="Cancel" style={styles.textButton} onPress={handleBackupIdDialogCancel} />
              <Dialog.Button label="Submit" style={styles.textButton} onPress={handleBackupIdDialogSubmit} />
            </Dialog.Container>
          </View>

        </Modal>

        {util.renderAwesomeAlert(alertConfig, showAlert)}

      </GarageContextProvider>
    </NavigationContainer >
  );
};

export default JohnnyOnTheSpot;

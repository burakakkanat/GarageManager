import { firebase } from '@react-native-firebase/database';
import { ToastAndroid } from 'react-native';
import util from '../util/Util';

async function getLogDatabaseRef(functionName) {

    var storedUserId = await util.retrieveObject('@UserId');

    if (!storedUserId || storedUserId.length === 0) {
        storedUserId = uuid.v1();
        await util.saveObject('@UserId', storedUserId);
    }

    const databaseRefPath = '/errorLog/' + storedUserId + '/' + functionName;

    const databaseRef = firebase
        .app()
        .database('https://johnny-on-the-spot-130a2-default-rtdb.europe-west1.firebasedatabase.app/')
        .ref(databaseRefPath);

    return databaseRef;
}

const loggerUtil = {
    logError: async (functionName, error) => {
        try {
            ToastAndroid.showWithGravity(
                'An error occured. Please report to admin with your User ID.',
                ToastAndroid.SHORT,
                ToastAndroid.TOP, // Not working
            );

            const databaseRef = await getLogDatabaseRef(functionName);
            const newDatabaseRef = databaseRef.push();
            newDatabaseRef.set(error.message);
        } catch (error) {
            console.error(error);
        }
    }
}

export default loggerUtil;
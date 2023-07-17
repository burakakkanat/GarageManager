import { firebase } from '@react-native-firebase/database';

async function getLogDatabaseRef(functionName) {

    const databaseRefPath = '/errorLog/' + functionName

    const databaseRef = firebase
        .app()
        .database('https://johnny-on-the-spot-130a2-default-rtdb.europe-west1.firebasedatabase.app/')
        .ref(databaseRefPath);

    return databaseRef;
}

const loggerUtil = {
    logError: async (functionName, error) => {
        try {
            const databaseRef = await getLogDatabaseRef(functionName);
            const newDatabaseRef = databaseRef.push();
            newDatabaseRef.set(error.message);
        } catch (error) {
            console.error(error);
        }
    }
}

export default loggerUtil;
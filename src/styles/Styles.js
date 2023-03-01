import { StyleSheet } from 'react-native';
import util from '../util/Util';

const styles = StyleSheet.create({
    buttonGreen: {
        padding: 10,
        backgroundColor: '#2D640F',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10
    },
    buttonRed: {
        padding: 10,
        backgroundColor: '#c70000',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10
    },
    buttonYellow: {
        padding: 10,
        backgroundColor: 'orange',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10
    },
    containerAddNewVehicle: {
        alignItems: 'flex-end',
        borderTopColor: '#ccc',
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: 10,
    },
    containerHeader: {
        backgroundColor: '#2D640F',
        justifyContent: 'center',
        height: 50,
        alignItems: 'center'
    },
    containerHeaderMain: {
        backgroundColor: '#2D640F',
        justifyContent: 'center',
        height: 50,
        alignItems: 'center'
    },
    containerForLists: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: 'lightgrey',
        padding: 10,
    },
    containerForSimpleLists: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        paddingTop: 0
    },
    containerForGarageList: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: 'lightgrey',
        padding: 8,
    },
    containerPickerAddVehicle: {
        width: '54%'
    },
    containerPickerWishlist: {
        marginLeft: 10,
        width: '95%'
    },
    containerWishlistHeader: {
        backgroundColor: '#2D640F',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        alignItems: 'center',
    },
    header: {
        marginTop: 10,
        fontSize: 30,
        color: 'white',
        fontFamily: 'SignPainter-HouseScript'
    },
    headerMain: {
        marginTop: 5,
        fontSize: 30,
        color: 'white',
        fontFamily: 'SignPainter-HouseScript'
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent black background
        zIndex: 999 // ensure the loading indicator is on top of everything else
    },
    loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    screenOptons: {
        tabBarLabelStyle: { fontFamily: util.getBoldFontName(), fontSize: 12 },
        "tabBarActiveTintColor": '#FFFFFF',
        "tabBarInactiveTintColor": '#B3E5FC',
        "tabBarIndicatorStyle": { backgroundColor: '#FFFFFF' },
        "tabBarStyle": { backgroundColor: '#2D640F' },
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: 'lightgrey',
        marginVertical: 5,
    },
    separatorTop: {
        width: '100%',
        height: 1,
        backgroundColor: 'lightgrey',
        marginTop: 3
    },
    textButton: {
        fontFamily: util.getBoldFontName(),
        color: 'white',
        fontSize: 12
    },
    textGarageDetails: {
        fontFamily: util.getFontName(),
        color: 'grey',
        fontSize: 12,
    },
    textGarageDetailsSoftTitle: {
        fontFamily: util.getBoldFontName(),
        color: 'grey',
        fontSize: 12,
    },
    textGarageDetailsTitle: {
        fontFamily: util.getBoldFontName(),
        color: 'black',
        fontSize: 15,
        margin: 10
    },
    textHeaderWishlist: {
        fontFamily: util.getFontName(),
        fontSize: 12,
        color: '#F2F2F2',
    },
    textInput: {
        color: 'black',
        borderWidth: 0.5,
        margin: 10,
        height: 40,
        fontFamily: util.getFontName(),
        fontSize: 12
    },
    textInputNewVehicleName: {
        borderColor: 'black',
        borderRadius: 10,
        borderWidth: 1,
        color: 'black',
        fontFamily: util.getFontName(),
        fontSize: 12,
        marginRight: 10,
        width: '44%',
        height: 50
    },
    textListItemGarageB: {
        fontFamily: util.getBoldFontName(),
        color: 'black',
        fontSize: 11
    },
    textListItemGarageM: {
        fontFamily: util.getFontName(),
        color: 'black',
        fontSize: 11
    },
    textListItemVehicleB: {
        fontFamily: util.getBoldFontName(),
        color: 'black',
        fontSize: 10.5
    },
    textListItemVehicleM: {
        fontFamily: util.getFontName(),
        color: 'black',
        fontSize: 10.5
    },
    textSoftTitle: {
        fontFamily: util.getBoldFontName(),
        color: 'black',
        fontSize: 10.5,
        margin: 10
    },
    textWishlistObjectM: {
        fontFamily: util.getFontName(),
        fontSize: 10,
        color: 'black',
    },
    textWishlistObjectB: {
        fontFamily: util.getBoldFontName(),
        fontSize: 10,
        color: 'black',
    }
});

export default styles;
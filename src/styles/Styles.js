import { StyleSheet } from 'react-native';
import util from '../util/Util';

const styles = StyleSheet.create({
    buttonGreen: {
        alignItems: 'center',
        backgroundColor: '#2D640F',
        borderRadius: 10,
        elevation: 5,
        justifyContent: 'center',
        margin: 10,
        padding: 10
    },
    buttonRed: {
        alignItems: 'center',
        backgroundColor: '#c70000',
        borderRadius: 10,
        elevation: 5,
        justifyContent: 'center',
        margin: 10,
        padding: 10
    },
    buttonYellow: {
        alignItems: 'center',
        backgroundColor: 'orange',
        borderRadius: 10,
        elevation: 5,
        justifyContent: 'center',
        margin: 10,
        padding: 10
    },
    containerAddNewVehicle: {
        alignItems: 'flex-end',
        backgroundColor: 'transparent',
        borderTopColor: 'grey',
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    containerHeader: {
        alignItems: 'center',
        backgroundColor: '#2D640F',
        height: 50,
        justifyContent: 'center'
    },
    containerHeaderMain: {
        alignItems: 'center',
        backgroundColor: '#2D640F',
        height: 50,
        justifyContent: 'center'
    },
    containerForLists: {
        borderBottomWidth: 1,
        borderColor: 'lightgrey',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10
    },
    containerForSimpleLists: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        paddingTop: 0
    },
    containerForGarageList: {
        borderBottomWidth: 1,
        borderColor: 'lightgrey',
        flexDirection: 'row',
        padding: 8
    },
    containerPickerAddVehicle: {
        height: '100%',
        marginRight: 10,
        width: '52%'
    },
    containerPickerWishlist: {
        marginLeft: 10,
        width: '95%'
    },
    containerWishlistHeader: {
        alignItems: 'center',
        backgroundColor: '#2D640F',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10
    },
    header: {
        color: 'white',
        fontFamily: 'SignPainter-HouseScript',
        fontSize: 30,
        marginTop: 10
    },
    headerMain: {
        color: 'white',
        fontFamily: 'SignPainter-HouseScript',
        fontSize: 30,
        marginTop: 5
    },
    loadingContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        bottom: 0,
        justifyContent: 'center',
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 999
    },
    loadingIndicator: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    separator: {
        backgroundColor: 'lightgrey',
        height: 1,
        marginVertical: 5,
        width: '100%'
    },
    separatorTop: {
        backgroundColor: 'lightgrey',
        height: 1,
        marginTop: 3,
        width: '100%'
    },
    textButton: {
        color: 'white',
        fontFamily: util.getBoldFontName(),
        fontSize: 12
    },
    textGarageDetails: {
        color: 'grey',
        fontFamily: util.getFontName(),
        fontSize: 12
    },
    textGarageDetailsSoftTitle: {
        color: 'grey',
        fontFamily: util.getBoldFontName(),
        fontSize: 12
    },
    textGarageDetailsTitle: {
        color: 'black',
        fontFamily: util.getBoldFontName(),
        fontSize: 15,
        margin: 10
    },
    textHeaderWishlist: {
        color: '#F2F2F2',
        fontFamily: util.getFontName(),
        fontSize: 12
    },
    textInput: {
        borderWidth: 0.5,
        color: 'black',
        fontFamily: util.getFontName(),
        fontSize: 12,
        height: 40,
        margin: 10
    },
    textInputNewVehicleName: {
        backgroundColor: '#F2F2F2',
        borderColor: 'black',
        borderRadius: 10,
        borderWidth: 1,
        color: 'black',
        elevation: 5,
        fontFamily: util.getFontName(),
        fontSize: 12,
        height: 50,
        marginRight: 10,
        width: '41%'
    },
    textListItemGarageB: {
        color: 'black',
        fontFamily: util.getBoldFontName(),
        fontSize: 11
    },
    textListItemGarageM: {
        color: 'black',
        fontFamily: util.getFontName(),
        fontSize: 11
    },
    textListItemVehicleB: {
        color: 'black',
        fontFamily: util.getBoldFontName(),
        fontSize: 10.5
    },
    textListItemVehicleM: {
        color: 'black',
        fontFamily: util.getFontName(),
        fontSize: 10.5
    },
    textSoftTitle: {
        color: 'black',
        fontFamily: util.getBoldFontName(),
        fontSize: 10.5,
        margin: 10
    },
    textWishlistObjectM: {
        color: 'black',
        fontFamily: util.getFontName(),
        fontSize: 10
    },
    textWishlistObjectB: {
        color: 'black',
        fontFamily: util.getBoldFontName(),
        fontSize: 10
    }
});

export default styles;
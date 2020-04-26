import { StyleSheet } from 'react-native';
import { scale } from '../../util';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: scale(50),
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextStyles: {
    height: 22,
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    flex: 8,
  },
  disclaimerText: {
    width: scale(312),
    height: scale(22),
    fontSize: scale(18),
    marginTop: scale(60),
  },
  addressName: {
    width: 325,
    height: 58,
    fontSize: 24,
    fontWeight: '600',
    fontStyle: 'normal',
    marginTop: scale(42),
  },
  mapLink: {
    width: 146,
    height: 22,
    fontSize: 18,
    marginTop: scale(76),
  },
  inputLabel: {
    width: 184,
    height: 22,
    fontSize: 18,
    marginTop: scale(104),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(19),
    width: 327,
    height: 48,
  },
  inputDpto: {
    width: 327,
    height: 48,
    flex: 1,
    borderRadius: 32,
    backgroundColor: 'rgba(229, 229, 229, 0.2)',
    borderStyle: 'solid',
    borderWidth: 1,
    paddingLeft: scale(20),
    borderColor: '#e5e5e5',
  },
  inputFocus: {
    borderColor: 'rgb(255, 192, 61)',
  },
  cleanInput: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
    borderRadius: 50,
    backgroundColor: 'rgba(229, 229, 229, 0.2)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgb(255, 192, 61)',
    position: 'absolute',
    marginLeft: 295,
  },
});

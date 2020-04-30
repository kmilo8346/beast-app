import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  productDetailContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 60,
    paddingLeft: 19,
  },
  productDetailImage: {
    width: 240,
    height: 216,
    marginLeft: 49,
  },
  productName: {
    fontSize: 36,
    fontWeight: '600',
    marginTop: 93,
    marginLeft: 5,
  },
  productDetailsWeigth: {
    fontSize: 14,
    color: '#d0cfce',
    marginLeft: 5,
    marginTop: 8
  },
  addSubBtnPriceContainer: {
    width: '100%',
    justifyContent: 'space-between',
    height: 48,
    flexDirection: 'row',
    paddingRight: 24,
    marginTop: 16
  },
  cantControlers:{
    flexDirection: 'row',
    alignItems:'center',
    justifyContent: 'space-between',
    width: 132,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ebebeb",
    paddingHorizontal: 14
  },
  productDetailPrice: {
    fontSize: 36,
    fontWeight: '600',
  },
  cantLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  productDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 34
  },
  productDetails: {
    marginTop: 14
  },
  addToCarButton:{
    width: 327,
    height: 56,
    borderRadius: 28,
    marginTop: 46,
    marginRight: 24
  }

});

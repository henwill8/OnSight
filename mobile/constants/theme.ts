import { StyleSheet } from 'react-native';

export const COLORS = {
  backgroundPrimary: '#222222',
  backgroundSecondary: '#333333',
  headerText: '#cccccc',
  descriptionText: '#828282',
  primary: "#575757",
  border: '#333',
  shadow: '#000',
};

export const SIZES = {
  padding: 16,
  borderRadius: 15,
  fontSize: 18,
  headerHeight: 125,
};

export const SHADOWS = {
  elevation: 5,
  shadowColor: COLORS.shadow,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.8,
  shadowRadius: 4,
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
    padding: SIZES.padding,
  },
  link: {
    marginTop: 10,
    color: COLORS.headerText,
    textDecorationLine: "underline",
  },
});
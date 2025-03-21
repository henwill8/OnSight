import { StyleSheet } from 'react-native';

export const COLORS = {
  backgroundPrimary: '#222222',
  backgroundSecondary: '#333333',
  textPrimary: '#dedede',
  textSecondary: '#c2c2c2',
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

export const HOLD_SELECTION_COLORS = {
  intermediate: "rgba(0, 68, 255, 1)",
  start: "rgba(0, 255, 0, 1)",
  end: "rgba(216, 0, 0, 1)"
}

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
//    backgroundColor: COLORS.backgroundPrimary,
    backgroundColor: COLORS.backgroundPrimary,
    padding: SIZES.padding,
  },
  centerItemsContainer: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    backgroundColor: COLORS.backgroundPrimary,
    padding: SIZES.padding,
  },
  link: {
    marginTop: 10,
    color: COLORS.textPrimary,
    textDecorationLine: "underline",
  },
});

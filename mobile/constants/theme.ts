import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#222222',
  headerBackground: '#333333',
  climbItemBackground: '#2A2A2A',
  text: '#FAF9F6',
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
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  header: {
    height: SIZES.headerHeight,
    backgroundColor: COLORS.headerBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS,
  },
  flatListContent: {
    paddingVertical: 10,
  },
  climbItem: {
    height: 100,
    backgroundColor: COLORS.climbItemBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.borderRadius,
    marginHorizontal: 10,
    marginVertical: 5,
    elevation: SHADOWS.elevation,
    shadowColor: SHADOWS.shadowColor,
    shadowOffset: SHADOWS.shadowOffset,
    shadowOpacity: SHADOWS.shadowOpacity,
    shadowRadius: SHADOWS.shadowRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: 20,
  },
  item: {
    fontSize: SIZES.fontSize,
    color: COLORS.text,
  },
});
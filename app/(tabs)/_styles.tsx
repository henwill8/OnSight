import { StyleSheet, View, Text, FlatList} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222222',
    padding: 16,
  },
  header: {
    height: 125,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  flatListContent: {
    paddingVertical: 10,
  },
  climbItem: {
    height: 100,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15, 
    marginHorizontal: 10, 
    marginVertical: 5, 
    elevation: 5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9, 
    shadowRadius: 4, 
    borderWidth: 1, 
    borderColor: '#333', 
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FAF9F6', 
    padding: 20,
  },
  item: {
    fontSize: 18,
    color: '#FAF9F6', 
  },
});

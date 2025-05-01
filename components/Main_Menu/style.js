import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 20,
  },
  optionBox: {
    width: '90%',
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'green',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
  },
  optionText: {
    fontSize: 18,
    color: 'green',
  },
});

export default styles;

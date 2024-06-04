import { useColorScheme } from 'react-native';
import { MD2Colors } from 'react-native-paper';

const colors = {
  light: {
    background: MD2Colors.grey200,
    background2: MD2Colors.grey100,
    text: MD2Colors.black,
    accent: MD2Colors.blue400,
    accent2: MD2Colors.blue600,
    inactive: MD2Colors.grey900,
    inactiveBorder: '#E0E0E0',
    shadow: '#999999',
    is: 'light'
  },
  dark: {
    background: MD2Colors.grey900,
    background2: MD2Colors.grey800,
    text: MD2Colors.grey100,
    accent: MD2Colors.blue400,
    accent2: MD2Colors.blue600,
    inactive: MD2Colors.grey400,
    inactiveBorder: '#424242',
    shadow: '#424242',
    is: 'dark'
  }
};

export default function getColorScheme() {
  const colorScheme = useColorScheme();
  if (colorScheme === 'dark') {
    return colors.dark;
  } else if (colorScheme === 'light') {
    return colors.light;
  }
  return colors.dark;
}

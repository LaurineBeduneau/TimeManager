import React from 'react';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import FlashMessage from 'react-native-flash-message';

import store from './src/Store';
import { ConnectedApp } from './src/Main';

const App = () => {
  return (
    <Provider store={store}>
      <PaperProvider>
        <ConnectedApp />
        <FlashMessage position={'top'} />
      </PaperProvider>
    </Provider>
  );
};

export default App;

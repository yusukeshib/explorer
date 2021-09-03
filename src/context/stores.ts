import {
  applyMiddleware,
  compose,
  createStore as createReduxStore,
  Store,
} from 'redux';
import reducers from './reducer';
import { defaultContext } from './defaultContext';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

export const createStore = (): Store => {
  const composeEnhancers =
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const middlewares = [thunk];

  // persist
  const persistConfig = {
    key: 'root',
    storage: storage,
    whitelist: ['config'],
  };

  return createReduxStore(
    persistReducer(persistConfig, reducers),
    defaultContext,
    composeEnhancers(applyMiddleware(...middlewares)),
  );
};

export const defaultStore = createStore();
export const persistor = persistStore(defaultStore);

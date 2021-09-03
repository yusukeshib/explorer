import { combineReducers } from 'redux';

import config from './config';
import main from './main';

const rootReducer = combineReducers({
  config,
  main,
});

export default rootReducer;

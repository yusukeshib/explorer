import * as ACTION from '../action/constant';
import { REHYDRATE } from 'redux-persist';
import { ConfigContext } from '../type';
import produce from 'immer';
import { defaultConfig } from '../defaultContext';

interface ContextAction {
  type: string;
  context: ConfigContext;
  [key: string]: any;
}

export default (
  state: ConfigContext = defaultConfig,
  action: ContextAction,
) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case REHYDRATE:
        {
          Object.assign(draft, action.payload?.config ?? {});
        }
        break;

      case ACTION.UPDATE_CONFIG:
        {
          const { type, ...props } = action;
          Object.assign(draft, props);
        }
        break;
    }
  });
};

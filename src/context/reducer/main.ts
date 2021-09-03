import * as ACTION from '../action/constant';
import { MainContext } from '../type';
import produce from 'immer';
import { defaultMain } from '../defaultContext';

interface ContextAction {
  type: string;
  context: MainContext;
  [key: string]: any;
}

export default (state: MainContext = defaultMain, action: ContextAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case ACTION.UPDATE_MAIN:
        {
          const { type, ...props } = action;
          Object.assign(draft, props);
        }
        break;
    }
  });
};

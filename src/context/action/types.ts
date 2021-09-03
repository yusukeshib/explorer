import * as ACTION from './constant';
import { Dispatch } from 'redux';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { Context } from '../type';
import { ConfigContext, MainContext } from '../type';

export type AsyncMainAction<T, E = null> = ThunkAction<
  Promise<T>,
  Context,
  E,
  Action
>;

export type MainAction<T, E = null> = ThunkAction<T, Context, E, Action>;

export const dispatchMain = (
  dispatch: Dispatch,
  props: Partial<MainContext>,
) => {
  dispatch({
    ...props,
    type: ACTION.UPDATE_MAIN,
  });
};

export const dispatchConfig = (
  dispatch: Dispatch,
  props: Partial<ConfigContext>,
) => {
  dispatch({
    ...props,
    type: ACTION.UPDATE_CONFIG,
  });
};

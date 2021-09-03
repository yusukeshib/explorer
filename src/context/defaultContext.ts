import { Context, ConfigContext, MainContext } from './type';

export const defaultConfig: ConfigContext = {
  token: '',
  infoPanelOpened: false,
};

export const defaultMain: MainContext = {
  files: [],
  scrolling: false,
  scrollingLabel: '',
  saving: false,
  syncing: false,
  syncCancelled: false,
  syncCompleted: 0,
  error: '',
  width: 0,
  layoutList: [],
  visibleLayoutList: [],
  rect: { x: 0, y: 0, width: 0, height: 0 },
  dbx: null,
  thumbnailMap: {},
};

export const defaultContext: Context = {
  config: defaultConfig,
  main: defaultMain,
};

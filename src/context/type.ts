import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import type { Dropbox } from 'dropbox';

export type AppDispatch = ThunkDispatch<Context, any, AnyAction>;

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ConfigContext {
  token: string;
  infoPanelOpened: boolean;
}

export interface MainContext {
  files: FileInfo[];
  scrolling: boolean;
  scrollingLabel: string;
  saving: boolean;
  syncing: boolean;
  syncingMessage: string;
  syncCancelled: boolean;
  syncCompleted: number;
  error: string;
  width: number;
  layoutList: LayoutInfo[];
  visibleLayoutList: LayoutInfo[];
  rect: Rect;
  dbx: Dropbox | null;
  thumbnailMap: { [key: string]: string };
}

export interface Context {
  config: ConfigContext;
  main: MainContext;
}

export interface FolderInfo {
  id: string;
  name: string;
}

export interface FileInfo {
  id: string;
  name: string;
  width: number;
  height: number;
  hash: string;
  type: 'image' | 'video';
  time_taken: number;
  size: number;
  placeholder: boolean;
  location?: GpsCoordinates;
}

export interface LayoutInfo {
  type: 'image' | 'title';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TitleLayoutInfo extends LayoutInfo {
  type: 'title';
  label: string;
}

export interface ImageLayoutInfo extends LayoutInfo {
  type: 'image';
  file: FileInfo;
}

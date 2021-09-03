import { AppDispatch } from './type';
import * as action from './action';
import delay from 'delay';

export default class ThumbnailRequest {
  private _active = false;
  private _dispatch: AppDispatch;
  start(dispatch: AppDispatch) {
    if (this._active) return;
    this._active = true;
    this._dispatch = dispatch;
    this.loop();
  }
  stop() {
    this._active = false;
  }
  loop = async () => {
    while (this._active) {
      await this._dispatch(action.loadThumbnail());
      await delay(100);
    }
  };
}

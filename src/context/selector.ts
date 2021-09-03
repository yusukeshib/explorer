import { Context } from './type';
import { createSelector } from 'reselect';

export const token = (ctx: Context) => ctx.config.token;
export const infoPanelOpened = (ctx: Context) => ctx.config.infoPanelOpened;
export const files = (ctx: Context) => ctx.main.files;
export const scrolling = (ctx: Context) => ctx.main.scrolling;
export const scrollingLabel = (ctx: Context) => ctx.main.scrollingLabel;
export const saving = (ctx: Context) => ctx.main.saving;
export const syncing = (ctx: Context) => ctx.main.syncing;
export const syncCompleted = (ctx: Context) => ctx.main.syncCompleted;
export const syncCancelled = (ctx: Context) => ctx.main.syncCancelled;
export const error = (ctx: Context) => ctx.main.error;
export const width = (ctx: Context) => ctx.main.width;
export const layoutList = (ctx: Context) => ctx.main.layoutList;
export const visibleLayoutList = (ctx: Context) => ctx.main.visibleLayoutList;
export const rect = (ctx: Context) => ctx.main.rect;
export const thumbnailMap = (ctx: Context) => ctx.main.thumbnailMap;

export const layoutHeight = createSelector([layoutList], (layoutList) => {
  const last = layoutList[layoutList.length - 1];
  return last ? last.y + last.height : 0;
});

export const rectHeight = createSelector([rect], (rect) => {
  return rect.height;
});

export const rectTop = createSelector([rect], (rect) => {
  return rect.y;
});

export const fileTotal = createSelector([files], (files) => files.length);
export const signedIn = createSelector([token], (token) => !!token);

export const scrollbarHeight = createSelector(
  [layoutHeight, rectHeight],
  (layoutHeight, rectHeight) => {
    if (layoutHeight === 0) return 0;
    const ret = rectHeight * (rectHeight / layoutHeight);
    return Math.max(ret, 100);
  },
);

export const scrollbarTop = createSelector(
  [layoutHeight, rectHeight, rectTop, scrollbarHeight],
  (layoutHeight, rectHeight, rectTop, scrollbarHeight) => {
    const height = rectHeight - scrollbarHeight;
    const scrollableHeight = layoutHeight - rectHeight;
    if (scrollableHeight === 0) return 0;
    const per = rectTop / scrollableHeight;
    return height * per;
  },
);

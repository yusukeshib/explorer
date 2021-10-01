import {
  dispatchConfig,
  dispatchMain,
  MainAction,
  AsyncMainAction,
} from './types';
import {
  Rect,
  ImageLayoutInfo,
  TitleLayoutInfo,
  LayoutInfo,
  FileInfo,
} from '../type';
import type { files as Files } from 'dropbox';
import uniqBy from 'lodash/uniqBy';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import dayjs from 'dayjs';
import * as selector from '../selector';
import { Dropbox } from 'dropbox';
import { downloadBlob, dataURItoBlob } from '../../utils/blobUtils';
import ThumbnailRequest from '../thumbnail';
import { MINHEIGHT, MONTH_MARGIN } from '../../constants';

const thumbReq = new ThumbnailRequest();

export const startScrolling = (): MainAction<void> => (dispatch, getState) => {
  dispatchMain(dispatch, { scrolling: true });
};

export const endScrolling = (): MainAction<void> => (dispatch, getState) => {
  dispatchMain(dispatch, { scrolling: false });
};

export const toggleInfoPanel = (): MainAction<void> => (dispatch, getState) => {
  const ctx = getState();
  const opened = ctx.config.infoPanelOpened;
  dispatchConfig(dispatch, { infoPanelOpened: !opened });
};

export const buildLayout =
  (width: number): MainAction<void> =>
  (dispatch, getState) => {
    dispatchMain(dispatch, { width });
    dispatch(build());
  };

export const build = (): MainAction<void> => (dispatch, getState) => {
  const ctx = getState();

  // group by month
  const files = uniqBy(ctx.main.files, (file) => file.hash ?? file.id);
  const grouped = groupBy(files, (file) =>
    dayjs(file.time_taken || 0).format('YYYY-MM'),
  );

  // build absolute layout
  const layoutList: LayoutInfo[] = [];

  let y = 0;
  const keys = sortBy(
    Object.keys(grouped),
    (date) => -dayjs(date, 'YYYY-MM').toDate().getTime(),
  );
  for (const key of keys) {
    const count = grouped[key].filter((item) => !item.placeholder).length;
    if (count === 0) continue;

    const firstItem = grouped[key][0];
    const label = dayjs(firstItem.time_taken).format('MMM, YYYY');
    // title area
    const titleInfo: TitleLayoutInfo = {
      type: 'title',
      label: label,
      x: 0,
      y: y,
      width: ctx.main.width,
      height: MONTH_MARGIN,
    };
    layoutList.push(titleInfo);
    y += MONTH_MARGIN;

    const items = sortBy(grouped[key], (item) => -item.time_taken);
    let stack: FileInfo[] = [];
    for (const item of items) {
      // skip invalid
      if (item.placeholder) continue;

      stack.push(item);

      // check height for current row
      const wp = stack.reduce(
        (acc: number, item) => acc + item.width / item.height,
        0,
      );
      const rowHeight = Math.round(ctx.main.width / wp);
      if (rowHeight < MINHEIGHT) {
        let x = 0;
        for (const item of stack) {
          const width = Math.round((item.width * rowHeight) / item.height);
          const height = rowHeight;
          const info: ImageLayoutInfo = {
            type: 'image',
            file: item,
            x: x,
            y: y,
            width: width,
            height: height,
          };
          layoutList.push(info);
          x += width;
        }
        stack = [];
        y += rowHeight;
      }
    }
    if (stack.length > 0) {
      const wp = stack.reduce(
        (acc: number, item) => acc + item.width / item.height,
        0,
      );
      const rowHeight = Math.min(ctx.main.width / wp, MINHEIGHT);
      let x = 0;
      for (const item of stack) {
        const width = (item.width * rowHeight) / item.height;
        const height = rowHeight;
        const info: ImageLayoutInfo = {
          type: 'image',
          file: item,
          x: x,
          y: y,
          width: width,
          height: height,
        };
        layoutList.push(info);
        x += width;
      }
      stack = [];
      y += rowHeight;
    }
  }
  dispatchMain(dispatch, { layoutList });
  dispatch(updateRect(ctx.main.rect));
};

export const cancelSync = (): MainAction<void> => (dispatch, getState) => {
  dispatchMain(dispatch, { syncCancelled: true });
};

export const sync = (): AsyncMainAction<void> => async (dispatch, getState) => {
  const ctx = getState();
  if (ctx.main.syncing) return;
  const dbx = ctx.main.dbx;
  if (!dbx) return;

  dispatchMain(dispatch, {
    syncingMessage: 'Syncing',
    syncCancelled: false,
    syncing: true,
  });

  // TODO: check refetching is required before syncing

  let updated = false;
  try {
    // 1) sync files
    {
      const s = Date.now();

      let files: FileInfo[] = [...ctx.main.files];
      const fileMap = files.reduce((acc: { [id: string]: FileInfo }, file) => {
        acc[file.id] = file;
        return acc;
      }, {});

      let hasMore = false;
      let cursor: string = '';
      let cnt = 0;
      do {
        const res = cursor
          ? await dbx.filesListFolderContinue({ cursor })
          : await dbx.filesListFolder({
              path: '',
              recursive: true,
              include_non_downloadable_files: false,
              include_mounted_folders: false,
              include_has_explicit_shared_members: false,
              limit: 2000,
            });

        hasMore = res.result.has_more;
        cursor = res.result.cursor;
        console.log('syncing files:', cnt);

        for (const entry of res.result.entries) {
          if (!entry.path_display) continue;
          switch (entry['.tag']) {
            case 'file':
              if (entry.path_lower) {
                const isFile = entry.path_lower.match(/\.(jpe?g|mp4)$/);
                const isPhoto = entry.path_lower.match(/\.(jpe?g)$/);
                if (isFile && !fileMap[entry.id]) {
                  files = files.concat({
                    id: entry.id,
                    hash: entry.content_hash ?? entry.id,
                    name: entry.path_display,
                    size: entry.size,
                    width: 480,
                    height: 480,
                    type: isPhoto ? 'image' : 'video',
                    time_taken: new Date(entry.server_modified).getTime(),
                    placeholder: true,
                  });
                  updated = true;
                }
              }
              break;
          }
        }
        cnt += res.result.entries.length;

        // check syncCancelled
        const syncCancelled = selector.syncCancelled(getState());
        if (syncCancelled) break;

        dispatchMain(dispatch, { files });
      } while (hasMore);

      dispatchMain(dispatch, { files });

      const e = Date.now();
      console.log('took:', Math.round((e - s) / 1000), 's');
    }

    if (updated) await dispatch(save());

    // 2) sync metadatas
    {
      const s = Date.now();

      const ctx = getState();
      let files = [...ctx.main.files];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // if size is retrieved, skip it
        if (!file.placeholder) continue;

        const res = await dbx.filesGetMetadata({
          path: file.id,
          include_media_info: true,
        });

        const mediaInfo = (res.result as any)
          .media_info as Files.MediaInfoMetadata;
        const width = mediaInfo?.metadata?.dimensions?.width ?? 480;
        const height = mediaInfo?.metadata?.dimensions?.height ?? 480;
        const location = mediaInfo?.metadata?.location;
        const time_taken = new Date(
          mediaInfo?.metadata?.time_taken ?? file.time_taken,
        ).getTime();
        const newFile: FileInfo = {
          ...file,
          width,
          height,
          time_taken,
          location,
          placeholder: false,
        };
        files = files.map((f, index) => (index === i ? newFile : f));

        updated = true;

        // check syncCancelled
        const syncCancelled = selector.syncCancelled(getState());
        if (syncCancelled) break;

        // sometimes update files
        if (i % 50 === 0) {
          dispatchMain(dispatch, { files });
          dispatch(build());

          // save
          await dispatch(save());
        }

        dispatchMain(dispatch, { syncCompleted: i });
      }
      dispatchMain(dispatch, { files });

      const e = Date.now();
      console.log('took:', Math.round((e - s) / 1000), 's');
    }

    if (updated) {
      dispatch(build());
      await dispatch(save());
    }
  } catch (error) {
    dispatchMain(dispatch, { error: `${error}` });
  }
  dispatchMain(dispatch, {
    syncCancelled: false,
    syncCompleted: 0,
    syncing: false,
  });
};

export const dismissError = (): MainAction<void> => (dispatch, getState) => {
  dispatchMain(dispatch, { error: '' });
};

export const updateRect =
  (rect: Rect): MainAction<void> =>
  (dispatch, getState) => {
    const ctx = getState();
    const visibleLayoutList = ctx.main.layoutList.filter(
      (layout) =>
        rect.y < layout.y + layout.height && layout.y < rect.y + rect.height,
    );
    dispatchMain(dispatch, { rect, visibleLayoutList });
    const titleList = <TitleLayoutInfo[]>(
      ctx.main.layoutList.filter((layout) => layout.type === 'title')
    );
    const index = titleList.findIndex(
      (layout) => layout.type === 'title' && rect.y < layout.y + layout.height,
    );
    const titleLayout = titleList[index - 1];

    // floating indicator description
    dispatchMain(dispatch, { scrollingLabel: titleLayout?.label ?? '' });
  };

export const load = (): AsyncMainAction<void> => async (dispatch, getState) => {
  try {
    const ctx = getState();
    const signedIn = selector.signedIn(ctx);
    if (!signedIn) return;

    let dbx = ctx.main.dbx;
    if (!dbx) {
      dbx = new Dropbox({ accessToken: ctx.config.token });
      dispatchMain(dispatch, { dbx });
    }

    const res = await dbx.filesDownload({ path: '/dphoto.json' });
    const file = (res.result as any).fileBlob;

    const data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (result) => {
        const data: string = (result.target?.result as string) || '';
        resolve(data);
      };
      reader.readAsText(file);
    });
    const { files } = JSON.parse(data);
    dispatchMain(dispatch, { files });
    dispatch(build());
    if (process.env.NODE_ENV === 'production') dispatch(sync());

    // start thumbnailReq
    thumbReq.start(dispatch);
  } catch (error) {
    const reason = error.error?.error?.path?.['.tag'];
    if (reason !== 'not_found') {
      dispatchMain(dispatch, { error: `${error}` });
    }
  }
};

export const save = (): AsyncMainAction<void> => async (dispatch, getState) => {
  const ctx = getState();
  const signedIn = selector.signedIn(ctx);
  if (!signedIn) return;

  const dbx = ctx.main.dbx;
  if (!dbx) return;

  dispatchMain(dispatch, { saving: true });
  try {
    const files = selector.files(ctx);
    const data = JSON.stringify({ files });

    await dbx.filesUpload({
      path: '/dphoto.json',
      mode: { '.tag': 'overwrite' },
      contents: data,
    });
  } catch (error) {
    dispatchMain(dispatch, { error: `${error}` });
  }
  dispatchMain(dispatch, { saving: false });
};

export const signIn =
  (token: string): MainAction<void> =>
  (dispatch, getState) => {
    dispatchConfig(dispatch, { token });
    const dbx = new Dropbox({ accessToken: token });
    dispatchMain(dispatch, { dbx });
  };

export const signOut = (): MainAction<void> => (dispatch, getState) => {
  dispatchConfig(dispatch, { token: '' });
  dispatchMain(dispatch, {
    syncCancelled: true,
    files: [],
    layoutList: [],
    dbx: null,
  });
};

export const loadVideo =
  (fileId: string): AsyncMainAction<string | null> =>
  async (dispatch, getState) => {
    try {
      const ctx = getState();
      const signedIn = selector.signedIn(ctx);
      if (!signedIn) return null;

      const dbx = ctx.main.dbx;
      if (!dbx) return null;

      const file = ctx.main.files.find((file) => file.id === fileId);
      if (!file) return null;
      const res = await dbx.filesGetTemporaryLink({
        path: fileId,
      });
      return res.result.link;
    } catch (error) {
      dispatchMain(dispatch, { error: `${error}` });
      return null;
    }
  };

export const loadImage =
  (fileId: string): AsyncMainAction<Blob | null> =>
  async (dispatch, getState) => {
    try {
      const ctx = getState();
      const signedIn = selector.signedIn(ctx);
      if (!signedIn) return null;

      const dbx = ctx.main.dbx;
      if (!dbx) return null;

      const res = await dbx.filesGetThumbnailV2({
        resource: { '.tag': 'path', path: fileId },
        size: {
          '.tag': 'w1024h768',
        },
      });
      return (res.result as any).fileBlob as Blob;
    } catch (error) {
      dispatchMain(dispatch, { error: `${error}` });
      return null;
    }
  };

export const loadThumbnail =
  (): AsyncMainAction<void> => async (dispatch, getState) => {
    try {
      const ctx = getState();

      const dbx = ctx.main.dbx;
      if (!dbx) return;

      const pathList = ctx.main.visibleLayoutList
        .filter((layout) => layout.type === 'image')
        .map((layout) => (layout as ImageLayoutInfo).file.id)
        .filter((id) => !ctx.main.thumbnailMap[id])
        .slice(0, 25);

      if (pathList.length === 0) return;

      const res = await dbx.filesGetThumbnailBatch({
        entries: pathList.map((path) => ({
          path: path,
          size: { '.tag': 'w128h128' },
        })),
      });

      const thumbnailMap: { [key: string]: string } = {
        ...ctx.main.thumbnailMap,
      };
      for (const entry of res.result.entries) {
        if (entry['.tag'] !== 'success') continue;
        const result = entry as Files.GetThumbnailBatchResultEntrySuccess;
        const blob = dataURItoBlob(result.thumbnail, 'image/jpeg');
        const url = URL.createObjectURL(blob);
        thumbnailMap[result.metadata.id] = url;
      }

      dispatchMain(dispatch, { thumbnailMap });
    } catch (error) {
      dispatchMain(dispatch, { error: `${error}` });
    }
  };

export const downloadOriginal =
  (fileId: string): AsyncMainAction<void> =>
  async (dispatch, getState) => {
    try {
      const ctx = getState();

      const dbx = ctx.main.dbx;
      if (!dbx) return;

      const file = ctx.main.files.find((file) => file.id === fileId);
      if (!file) return;

      const res = await dbx.filesDownload({ path: fileId });
      const blob = (res.result as any).fileBlob;
      const filename = file.name.split('/').pop();
      downloadBlob(blob, filename || 'Unknown.jpeg');
    } catch (error) {
      dispatchMain(dispatch, { error: `${error}` });
    }
  };

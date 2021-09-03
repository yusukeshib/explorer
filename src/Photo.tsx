import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import PrevIcon from '@material-ui/icons/ArrowBack';
import CloseIcon from '@material-ui/icons/Close';
import { useDispatch, useSelector } from 'react-redux';
import { ImageLayoutInfo, AppDispatch, action, selector } from './context';
import { useHistory, useParams } from 'react-router';
import { createStructuredSelector } from 'reselect';
import { GlobalHotKeys } from 'react-hotkeys';
import dayjs from 'dayjs';
import filesize from 'filesize';
import PhotoImage from './PhotoImage';
import PhotoInfo from './PhotoInfo';

const drawerWidth = 360;
const keyMap = {
  ESC: 'Escape',
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
};

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.palette.background.default,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'row',
    zIndex: theme.zIndex.modal,
  },
  infoIcon: {
    color: 'white',
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    zIndex: 1,
  },
  closeIcon: {
    color: 'white',
    position: 'absolute',
    left: theme.spacing(1),
    top: theme.spacing(1),
    zIndex: 1,
  },
}));

const s = createStructuredSelector({
  layoutList: selector.layoutList,
  infoPanelOpened: selector.infoPanelOpened,
});

const Photo = memo(() => {
  const classes = useStyles();
  const { fileId } = useParams<{ fileId: string }>();
  const { infoPanelOpened, layoutList } = useSelector(s);
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();
  const index = layoutList.findIndex(
    (layout) =>
      layout.type === 'image' && (layout as ImageLayoutInfo).file.id === fileId,
  );
  const layout = layoutList[index] as ImageLayoutInfo;

  const onToggleInfo = useCallback(() => {
    dispatch(action.toggleInfoPanel());
  }, [dispatch]);

  const onClose = useCallback(() => {
    history.push('/');
  }, [history]);

  const onPrev = useCallback(() => {
    let i = index;
    let prevLayout: ImageLayoutInfo | null = null;
    while (true) {
      i--;
      const layout = layoutList[i];
      if (!layout) break;
      // skip title layout
      if (layout.type !== 'image') continue;
      prevLayout = layout as ImageLayoutInfo;
      break;
    }
    if (prevLayout) {
      history.push(`/photo/${prevLayout.file.id}`);
    }
  }, [history, layoutList, index]);

  const onNext = useCallback(() => {
    let i = index;
    let nextLayout: ImageLayoutInfo | null = null;
    while (true) {
      i++;
      const layout = layoutList[i];
      if (!layout) break;
      // skip title layout
      if (layout.type !== 'image') continue;
      nextLayout = layout as ImageLayoutInfo;
      break;
    }
    if (nextLayout) {
      history.push(`/photo/${nextLayout.file.id}`);
    }
  }, [history, layoutList, index]);

  if (!layout) return null;

  return (
    <div className={classes.container}>
      <IconButton onClick={onClose} className={classes.closeIcon}>
        <PrevIcon />
      </IconButton>
      <Hidden xsDown>
        <IconButton onClick={onToggleInfo} className={classes.infoIcon}>
          <InfoIcon />
        </IconButton>
      </Hidden>
      <GlobalHotKeys
        allowChanges
        keyMap={keyMap}
        handlers={{ ESC: onClose, RIGHT: onNext, LEFT: onPrev }}
      >
        <PhotoImage
          onPrev={onPrev}
          onNext={onNext}
          fileId={fileId}
          width={layout.file.width}
          height={layout.file.height}
        />
        <PhotoInfo />
      </GlobalHotKeys>
    </div>
  );
});

Photo.displayName = 'Photo';

export default Photo;

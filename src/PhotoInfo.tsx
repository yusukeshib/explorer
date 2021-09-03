import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { useDispatch, useSelector } from 'react-redux';
import { ImageLayoutInfo, AppDispatch, action, selector } from './context';
import { useParams } from 'react-router';
import { createStructuredSelector } from 'reselect';
import dayjs from 'dayjs';
import filesize from 'filesize';

const drawerWidth = 360;

const useStyles = makeStyles((theme) => ({
  closeInfoIcon: {
    color: 'black',
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    zIndex: 3,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    zIndex: 2,
    position: 'relative',
  },
  info: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'auto',
    padding: theme.spacing(3),
  },
  infoRow: {
    padding: theme.spacing(1, 0),
  },
}));

const s = createStructuredSelector({
  layoutList: selector.layoutList,
  infoPanelOpened: selector.infoPanelOpened,
});

const PhotoInfo = memo(() => {
  const classes = useStyles();
  const { fileId } = useParams<{ fileId: string }>();
  const { infoPanelOpened, layoutList } = useSelector(s);
  const dispatch = useDispatch<AppDispatch>();
  const index = layoutList.findIndex(
    (layout) =>
      layout.type === 'image' && (layout as ImageLayoutInfo).file.id === fileId,
  );
  const layout = layoutList[index] as ImageLayoutInfo;

  const onToggleInfo = useCallback(() => {
    dispatch(action.toggleInfoPanel());
  }, [dispatch]);

  if (!layout) return null;

  return (
    <Hidden xsDown>
      {infoPanelOpened && (
        <nav className={classes.drawer}>
          <IconButton onClick={onToggleInfo} className={classes.closeInfoIcon}>
            <CloseIcon />
          </IconButton>
          <div className={classes.info}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <div className={classes.infoRow}>
              <Typography variant="body2">Name</Typography>
              <Typography noWrap gutterBottom>
                {layout.file.name}
              </Typography>
            </div>
            <div className={classes.infoRow}>
              <Typography variant="body2">Dimension</Typography>
              <Typography noWrap gutterBottom>
                {layout.file.width} x {layout.file.height}
              </Typography>
            </div>
            <div className={classes.infoRow}>
              <Typography variant="body2">File size</Typography>
              <Typography noWrap gutterBottom>
                {filesize(layout.file.size)}
              </Typography>
            </div>
            <div className={classes.infoRow}>
              <Typography variant="body2">Date Taken</Typography>
              <Typography noWrap gutterBottom>
                {dayjs(layout.file.time_taken).format('YYYY/MM/DD hh:mm:ss')}
              </Typography>
            </div>
            {layout.file.location && (
              <div className={classes.infoRow}>
                <Typography variant="body2">Location</Typography>
                <Typography noWrap gutterBottom>
                  {layout.file.location.latitude}.
                  {layout.file.location.longitude}
                </Typography>
              </div>
            )}
          </div>
        </nav>
      )}
    </Hidden>
  );
});

PhotoInfo.displayName = 'PhotoInfo';

export default PhotoInfo;

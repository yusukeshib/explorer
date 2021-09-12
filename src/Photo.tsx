import React, { memo, useRef, useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import PrevIcon from '@material-ui/icons/ArrowBack';
import NextIcon from '@material-ui/icons/ArrowForward';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/MoreVert';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, action, selector } from './context';
import { createStructuredSelector } from 'reselect';
import { useSize } from './hooks';
import Video from './Video';
import Image from './Image';

const useStyles = makeStyles((theme) => ({
  container: {
    userSelect: 'none',
    position: 'relative',
    flexGrow: 1,
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  prevIcon: {
    color: 'white',
    position: 'absolute',
    left: '50%',
    transform: `translateX(${-24 - 32}px)`,
    bottom: theme.spacing(1),
  },
  nextIcon: {
    color: 'white',
    position: 'absolute',
    left: '50%',
    transform: `translateX(${-24 + 32}px)`,
    bottom: theme.spacing(1),
  },
  menuIcon: {
    color: 'white',
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    zIndex: 1,
  },
}));

const s = createStructuredSelector({
  files: selector.files,
});

interface PhotoProps {
  fileId: string;
  width: number;
  height: number;
  onPrev: () => void;
  onNext: () => void;
}

const Photo: React.FC<PhotoProps> = memo((props) => {
  const { files } = useSelector(s);
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref);
  const p = Math.min(size.width / props.width, size.height / props.height);
  const file = files.find((file) => file.id === props.fileId);

  const onOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const onClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const onDownload = useCallback(() => {
    setAnchorEl(null);
    dispatch(action.downloadOriginal(props.fileId));
  }, [dispatch, props.fileId]);

  const onToggleInfo = useCallback(() => {
    setAnchorEl(null);
    dispatch(action.toggleInfoPanel());
  }, [dispatch]);

  return (
    <div ref={ref} className={classes.container}>
      {file?.type === 'video' && (
        <Video
          fileId={props.fileId}
          width={props.width * p}
          height={props.height * p}
        />
      )}
      {file?.type === 'image' && (
        <Image
          fileId={props.fileId}
          width={props.width * p}
          height={props.height * p}
        />
      )}
      <IconButton onClick={props.onPrev} className={classes.prevIcon}>
        <PrevIcon />
      </IconButton>
      <IconButton onClick={props.onNext} className={classes.nextIcon}>
        <NextIcon />
      </IconButton>
      <IconButton onClick={onOpen} className={classes.menuIcon}>
        <MenuIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
        <MenuItem onClick={onToggleInfo}>Toggle Information Panel</MenuItem>
        <MenuItem onClick={onDownload}>Download original</MenuItem>
      </Menu>
    </div>
  );
});

Photo.displayName = 'Photo';

export default Photo;

import React, { memo, useRef, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import PrevIcon from '@material-ui/icons/ArrowBack';
import NextIcon from '@material-ui/icons/ArrowForward';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, action, selector } from './context';
import { createStructuredSelector } from 'reselect';
import { useSize } from './hooks';

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
}));

const s = createStructuredSelector({
  thumbnailMap: selector.thumbnailMap,
});

interface PhotoImageProps {
  fileId: string;
  width: number;
  height: number;
  onPrev: () => void;
  onNext: () => void;
}

const PhotoImage: React.FC<PhotoImageProps> = memo((props) => {
  const classes = useStyles();
  const { thumbnailMap } = useSelector(s);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const lastRequestedFileId = useRef<string>('');
  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref);
  const p = Math.min(size.width / props.width, size.height / props.height);

  useEffect(() => {
    (async () => {
      if (lastRequestedFileId.current !== props.fileId) {
        lastRequestedFileId.current = props.fileId;
        setUrl(thumbnailMap[props.fileId] ?? '');
        const blob = await dispatch(action.loadImage(props.fileId));
        if (lastRequestedFileId.current !== props.fileId) return;
        setBlob(blob);
      }
    })();
  }, [dispatch, props.fileId]);

  // create/revoke URL
  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  return (
    <div ref={ref} className={classes.container}>
      {url && (
        <img src={url} width={props.width * p} height={props.height * p} />
      )}
      <IconButton onClick={props.onPrev} className={classes.prevIcon}>
        <PrevIcon />
      </IconButton>
      <IconButton onClick={props.onNext} className={classes.nextIcon}>
        <NextIcon />
      </IconButton>
    </div>
  );
});

PhotoImage.displayName = 'PhotoImage';

export default PhotoImage;

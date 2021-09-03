import React, { memo, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selector, action } from './context';
import { makeStyles } from '@material-ui/core/styles';
import { useScrollRect, useWindowWidth } from './hooks';
import PhotoLayout from './PhotoLayout';
import Scrollbar from './Scrollbar';
import ScrollLabel from './ScrollLabel';

const useStyles = makeStyles({
  container: {
    position: 'absolute',
    top: 48,
    right: 0,
    bottom: 0,
    left: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
    scrollbarWidth: 'none',
    MsOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

const Root = memo(() => {
  const classes = useStyles();
  const width = useWindowWidth();
  const ref = useRef<HTMLDivElement>(null);
  const rect = useScrollRect(ref);
  const dispatch = useDispatch();
  const signedIn = useSelector(selector.signedIn);

  useEffect(() => {
    dispatch(action.buildLayout(width));
  }, [width]);

  useEffect(() => {
    dispatch(action.updateRect(rect));
  }, [rect]);

  return (
    <div ref={ref} className={classes.container}>
      {signedIn && (
        <>
          <PhotoLayout />
          <Scrollbar scrollRef={ref} />
          <ScrollLabel />
        </>
      )}
    </div>
  );
});

Root.displayName = 'Root';

export default Root;

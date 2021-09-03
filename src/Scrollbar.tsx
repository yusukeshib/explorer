import React, { memo, useRef, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { action, selector } from './context';
import { useDispatch, useSelector } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { useEventListener } from './hooks';

const s = createStructuredSelector({
  top: selector.scrollbarTop,
  height: selector.scrollbarHeight,
  rectHeight: selector.rectHeight,
  layoutHeight: selector.layoutHeight,
});

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'fixed',
    top: 48,
    right: 0,
    bottom: 0,
    width: theme.spacing(3),
    overflow: 'hidden',
  },
  bar: {
    pointerEvents: 'none',
    position: 'fixed',
    top: 100,
    height: 200,
    right: 0,
    width: theme.spacing(1),
    margin: theme.spacing(0, 1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: `rgba(0,0,0,0.65)`,
    zIndex: theme.zIndex.appBar,
  },
}));

interface ScrollbarProps {
  scrollRef: React.RefObject<HTMLDivElement>;
}

const Scrollbar: React.FC<ScrollbarProps> = memo((props) => {
  const classes = useStyles();
  const { rectHeight, layoutHeight, top, height } = useSelector(s);
  const dispatch = useDispatch();
  const down = useRef(false);

  const onMouseDown = useCallback(
    (evt) => {
      evt.stopPropagation();
      down.current = true;
      dispatch(action.startScrolling());

      const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      const p = (-height / 2 + clientY - 48) / (rectHeight - height);
      const top = layoutHeight * p;
      props.scrollRef.current?.scrollTo(0, top);
    },
    [height, dispatch, rectHeight, layoutHeight],
  );

  const onMouseMove = useCallback(
    (evt) => {
      if (!down.current) return;
      evt.stopPropagation();

      const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      const p = (-height / 2 + clientY - 48) / (rectHeight - height);
      const top = layoutHeight * p;
      props.scrollRef.current?.scrollTo(0, top);
    },
    [height, dispatch, rectHeight, layoutHeight],
  );

  const onMouseUp = useCallback(
    (evt) => {
      evt.stopPropagation();
      down.current = false;
      dispatch(action.endScrolling());
    },
    [dispatch],
  );

  useEventListener('touchmove', onMouseMove);
  useEventListener('touchend', onMouseUp);
  useEventListener('mousemove', onMouseMove);
  useEventListener('mouseup', onMouseUp);

  return (
    <div
      className={classes.container}
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
    >
      <div className={classes.bar} style={{ top: top + 48, height }} />
    </div>
  );
});

Scrollbar.displayName = 'Scrollbar';

export default Scrollbar;

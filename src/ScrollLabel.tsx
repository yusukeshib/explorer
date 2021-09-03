import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { selector } from './context';
import { useSelector } from 'react-redux';
import { createStructuredSelector } from 'reselect';

const s = createStructuredSelector({
  top: selector.scrollbarTop,
  height: selector.scrollbarHeight,
  scrolling: selector.scrolling,
  scrollingLabel: selector.scrollingLabel,
});

const useStyles = makeStyles((theme) => ({
  container: {
    userSelect: 'none',
    position: 'fixed',
    right: theme.spacing(3),
    height: 32,
    padding: theme.spacing(0, 2),
    borderRadius: theme.shape.borderRadius,
    zIndex: theme.zIndex.modal,
    backgroundColor: `rgba(0,0,0,0.15)`,
    display: 'flex',
    alignItems: 'center',
    justfiyContent: 'center',
  },
}));

const ScrollLabel = memo(() => {
  const classes = useStyles();
  const { scrolling, scrollingLabel, top, height } = useSelector(s);

  if (!scrolling || !scrollingLabel) return null;

  return (
    <div
      className={classes.container}
      style={{ top: top + height / 2 + 48 - 16 }}
    >
      <Typography>{scrollingLabel}</Typography>
    </div>
  );
});

ScrollLabel.displayName = 'ScrollLabel';

export default ScrollLabel;

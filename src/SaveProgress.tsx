import React, { memo } from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { selector } from './context';
import { createStructuredSelector } from 'reselect';

const useStyles = makeStyles((theme) => ({
  progress: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: theme.spacing(1),
  },
}));

const s = createStructuredSelector({
  saving: selector.saving,
});

const SaveProgress = memo(() => {
  const classes = useStyles();
  const { saving } = useSelector(s);

  if (!saving) return null;

  return (
    <LinearProgress
      color="secondary"
      className={classes.progress}
      variant="indeterminate"
    />
  );
});

SaveProgress.displayName = 'SaveProgress';

export default SaveProgress;

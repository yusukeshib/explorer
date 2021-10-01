import React, { memo, useCallback } from 'react';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import { useDispatch, useSelector } from 'react-redux';
import { action, selector } from './context';
import { createStructuredSelector } from 'reselect';

const s = createStructuredSelector({
  saving: selector.saving,
  syncing: selector.syncing,
  syncingMessage: selector.syncingMessage,
  syncCancelled: selector.syncCancelled,
});

const Progress = memo(() => {
  const { saving, syncing, syncCancelled, syncingMessage } = useSelector(s);
  const dispatch = useDispatch();

  const onStop = useCallback(() => {
    dispatch(action.cancelSync());
  }, [dispatch]);

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      open={syncing || saving}
      onClose={onStop}
      message={syncingMessage}
      action={
        <IconButton disabled={syncCancelled} onClick={onStop} color="inherit">
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    />
  );
});

Progress.displayName = 'Progress';

export default Progress;

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
  syncCompleted: selector.syncCompleted,
  syncCancelled: selector.syncCancelled,
  fileTotal: selector.fileTotal,
});

const Progress = memo(() => {
  const { fileTotal, saving, syncing, syncCancelled, syncCompleted } =
    useSelector(s);
  const dispatch = useDispatch();

  const onStop = useCallback(() => {
    dispatch(action.cancelSync());
  }, [dispatch]);

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      open={syncing || saving}
      onClose={onStop}
      message={`Syncing(${syncCompleted} / ${fileTotal})`}
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

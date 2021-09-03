import React, { memo, useCallback } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { useDispatch, useSelector } from 'react-redux';
import { selector, action } from './context';

const Notification = memo(() => {
  const error = useSelector(selector.error);
  const dispatch = useDispatch();

  const onClose = useCallback(() => {
    dispatch(action.dismissError());
  }, [dispatch]);

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={error !== ''}
      onClose={onClose}
      message={error}
      action={
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={onClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    />
  );
});

Notification.displayName = 'Notification';

export default Notification;

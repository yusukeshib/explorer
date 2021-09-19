import React, { memo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { persistor, defaultStore } from './context';
import { PersistGate } from 'redux-persist/integration/react';
import { HashRouter } from 'react-router-dom';
import { Route } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from './Toolbar';
import Root from './Root';
import Notification from './Notification';
import Signin from './Signin';
import Progress from './Progress';
import Photo from './PhotoRoute';

const useStyles = makeStyles({
  container: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});

const App = memo(() => {
  const classes = useStyles();
  return (
    <PersistGate loading={null} persistor={persistor}>
      <HashRouter>
        <ReduxProvider store={defaultStore}>
          <div className={classes.container}>
            <CssBaseline />
            <Toolbar />
            <Progress />
            <Route path="/" component={Root} />
            <Route path="/photo/:fileId" component={Photo} />
            <Signin />
            <Notification />
          </div>
        </ReduxProvider>
      </HashRouter>
    </PersistGate>
  );
});

App.displayName = 'App';

export default App;

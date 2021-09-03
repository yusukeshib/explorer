import React, { memo } from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    userSelect: 'none',
    padding: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
  },
}));

interface TitleProps {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const Title: React.FC<TitleProps> = memo((props) => {
  const classes = useStyles();
  return (
    <Typography
      noWrap
      className={classes.container}
      style={{
        left: props.x + 1,
        top: props.y + 1,
        width: props.width - 2,
        height: props.height - 2,
      }}
    >
      {props.label}
    </Typography>
  );
});

Title.displayName = 'Title';

export default Title;

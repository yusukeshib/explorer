import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';
import { Link } from 'react-router-dom';

interface ImageProps {
  isVideo: boolean;
  fileId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  url: string;
}

const useStyles = makeStyles((theme) => ({
  image: {
    backgroundColor: 'lightgray',
    backgroundSize: 'contain',
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.background.default,
  },
}));

const Image: React.FC<ImageProps> = memo((props) => {
  const classes = useStyles();
  return (
    <Link to={`/photo/${props.fileId}`}>
      <div
        className={classes.image}
        style={{
          backgroundImage: props.url ? `url(${props.url})` : undefined,
          left: props.x + 1,
          top: props.y + 1,
          width: props.width - 2,
          height: props.height - 2,
        }}
      >
        {props.isVideo && <PlayIcon fontSize="large" />}
      </div>
    </Link>
  );
});

Image.displayName = 'Image';

export default Image;

import React, { memo, useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, action, selector } from './context';
import { createStructuredSelector } from 'reselect';

const s = createStructuredSelector({
  thumbnailMap: selector.thumbnailMap,
});

interface PhotoProps {
  fileId: string;
  width: number;
  height: number;
}

const Video: React.FC<PhotoProps> = memo((props) => {
  const { thumbnailMap } = useSelector(s);
  const [info, setInfo] = useState<{
    type: 'image' | 'video';
    url: string | null;
  }>({
    type: 'image',
    url: '',
  });
  const dispatch = useDispatch<AppDispatch>();
  const lastRequestedFileId = useRef<string>('');

  useEffect(() => {
    (async () => {
      if (lastRequestedFileId.current !== props.fileId) {
        lastRequestedFileId.current = props.fileId;
        setInfo({ type: 'image', url: thumbnailMap[props.fileId] ?? '' });
        const url = await dispatch(action.loadVideo(props.fileId));
        if (lastRequestedFileId.current !== props.fileId) return;
        setInfo({ type: 'video', url });
      }
    })();
  }, [dispatch, props.fileId]);

  if (!info.url) return null;

  if (info.type === 'image') {
    return <img src={info.url} width={props.width} height={props.height} />;
  } else {
    return (
      <video
        controls
        width={props.width}
        height={props.height}
        src={info.url}
      />
    );
  }
});

Video.displayName = 'Video';

export default Video;

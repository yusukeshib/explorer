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

const Photo: React.FC<PhotoProps> = memo((props) => {
  const { thumbnailMap } = useSelector(s);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const lastRequestedFileId = useRef<string>('');

  useEffect(() => {
    (async () => {
      if (lastRequestedFileId.current !== props.fileId) {
        lastRequestedFileId.current = props.fileId;
        setUrl(thumbnailMap[props.fileId] ?? '');
        const blob = await dispatch(action.loadImage(props.fileId));
        if (lastRequestedFileId.current !== props.fileId) return;
        setBlob(blob);
      }
    })();
  }, [dispatch, props.fileId]);

  // create/revoke URL
  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  if (!url) return null;

  return <img src={url} width={props.width} height={props.height} />;
});

Photo.displayName = 'Photo';

export default Photo;

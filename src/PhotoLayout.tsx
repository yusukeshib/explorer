import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TitleLayoutInfo, ImageLayoutInfo, action, selector } from './context';
import { createStructuredSelector } from 'reselect';
import Thumbnail from './Thumbnail';
import Title from './Title';

const s = createStructuredSelector({
  visibleLayoutList: selector.visibleLayoutList,
  layoutHeight: selector.layoutHeight,
  thumbnailMap: selector.thumbnailMap,
});

const PhotoLayout = memo(() => {
  const { thumbnailMap, layoutHeight, visibleLayoutList } = useSelector(s);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(action.load());
  }, [dispatch]);

  return (
    <div style={{ height: layoutHeight }}>
      {visibleLayoutList.map((layout) => {
        if (layout.type === 'image') {
          const file = (layout as ImageLayoutInfo).file;
          return (
            <Thumbnail
              key={file.id}
              fileId={file.id}
              isVideo={file.type === 'video'}
              x={layout.x}
              y={layout.y}
              width={layout.width}
              height={layout.height}
              url={thumbnailMap[file.id]}
            />
          );
        } else if (layout.type === 'title') {
          return (
            <Title
              key={(layout as TitleLayoutInfo).label}
              x={layout.x}
              y={layout.y}
              width={layout.width}
              height={layout.height}
              label={(layout as TitleLayoutInfo).label}
            />
          );
        }
      })}
    </div>
  );
});

PhotoLayout.displayName = 'PhotoLayout';

export default PhotoLayout;

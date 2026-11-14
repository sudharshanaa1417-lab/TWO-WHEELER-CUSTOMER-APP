import React from 'react';
import { getHighlightSegments } from '../utils/search';

export default function HighlightText({ text, query }) {
  const segments = getHighlightSegments(text, query);
  return (
    <>
      {segments.map((seg, idx) =>
        seg.match ? (
          <mark key={idx} className="smart-highlight">
            {seg.text}
          </mark>
        ) : (
          <React.Fragment key={idx}>{seg.text}</React.Fragment>
        )
      )}
    </>
  );
}

import React from 'react';
import { FaImage, FaMicrophone, FaVideo } from 'react-icons/fa';
import { reportHasMedia } from '../utils/media';

export default function MediaIndicators({ report }) {
  const media = reportHasMedia(report);
  return (
    <div className="accidentreports-media-indicators" title="Attached media">
      {media.images ? (
        <span className="accidentreports-media-chip accidentreports-media-chip--image">
          <FaImage aria-hidden /> Img
        </span>
      ) : null}
      {media.voice ? (
        <span className="accidentreports-media-chip accidentreports-media-chip--voice">
          <FaMicrophone aria-hidden /> Voice
        </span>
      ) : null}
      {media.video ? (
        <span className="accidentreports-media-chip accidentreports-media-chip--video">
          <FaVideo aria-hidden /> Video
        </span>
      ) : null}
      {!media.images && !media.voice && !media.video ? (
        <span className="accidentreports-media-chip accidentreports-media-chip--none">—</span>
      ) : null}
    </div>
  );
}

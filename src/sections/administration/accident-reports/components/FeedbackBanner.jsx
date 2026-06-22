import React from 'react';

export default function FeedbackBanner({ message, messageType }) {
  if (!message) return null;
  return <div className={`accidentreports-feedback ${messageType || 'info'}`}>{message}</div>;
}

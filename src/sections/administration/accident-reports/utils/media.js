import { resolveMediaUrl } from '../../../../utils/resourceUrls';

export function getResourceUrl(url, resourceType = 'ACCIDENT_IMAGE') {
  return resolveMediaUrl(url, resourceType);
}

export function downloadResource(url, filename, resourceType = 'ACCIDENT_IMAGE') {
  const fullUrl = getResourceUrl(url, resourceType);
  const link = document.createElement('a');
  link.href = fullUrl;
  link.download = filename || 'download';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function reportHasMedia(report) {
  return {
    images: Boolean(report?.image_1_url || report?.image_2_url || report?.image_1 || report?.image_2),
    voice: Boolean(report?.voice_note_1_url || report?.voice_note_2_url || report?.voice_note_1 || report?.voice_note_2),
    video: Boolean(report?.video_1_url || report?.video_1),
  };
}

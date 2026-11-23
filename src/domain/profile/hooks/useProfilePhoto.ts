import { useState } from 'react';
import { Alert } from 'react-native';

import { useAttachmentPicker } from '@/domain/communications/hooks/useAttachmentPicker';
import type { Attachment } from '@/domain/communications/interfaces/CommunicationInterfaces';
import {
  removeProfilePhotoAction,
  uploadProfilePhotoAction,
} from '@/domain/profile/store/async-actions/ProfileAsyncActions';
import { setToastMessage, type ToastType } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const photoType = (photo: Attachment) => {
  if (photo.mimeType && PHOTO_TYPES.includes(photo.mimeType)) return photo.mimeType;
  const extension = photo.name.split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  return null;
};

export function useProfilePhoto(hasPhoto: boolean) {
  const dispatch = useAppDispatch();
  const picker = useAttachmentPicker();
  const [busy, setBusy] = useState(false);

  const notice = (message: string, type: ToastType = 'success') => {
    if (type === 'error') haptics.error();
    else haptics.success();
    dispatch(setToastMessage({ message, type }));
  };

  const upload = async (photo: Attachment | undefined) => {
    if (!photo) return;
    const type = photoType(photo);
    if (!type || (photo.size ?? 0) > MAX_PHOTO_BYTES) {
      notice('Choose a JPG, PNG or WebP photo up to 5 MB.', 'error');
      return;
    }
    setBusy(true);
    const result = await dispatch(
      uploadProfilePhotoAction({ uri: photo.uri, name: photo.name, type })
    );
    setBusy(false);
    const payload = uploadProfilePhotoAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) {
      notice(payload?.error || 'Couldn’t upload your photo. Try again.', 'error');
      return;
    }
    notice('Photo updated');
  };

  const remove = async () => {
    setBusy(true);
    const result = await dispatch(removeProfilePhotoAction());
    setBusy(false);
    const payload = removeProfilePhotoAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) {
      notice(payload?.error || 'Couldn’t remove your photo. Try again.', 'error');
      return;
    }
    notice('Photo removed');
  };

  const choose = () => {
    Alert.alert('Profile photo', undefined, [
      {
        text: 'Take photo',
        onPress: () => void picker.takePhoto().then(([photo]) => upload(photo)),
      },
      {
        text: 'Choose from library',
        onPress: () => void picker.pickImages(1).then(([photo]) => upload(photo)),
      },
      ...(hasPhoto
        ? [{ text: 'Remove photo', style: 'destructive' as const, onPress: () => void remove() }]
        : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  return { choose, busy };
}

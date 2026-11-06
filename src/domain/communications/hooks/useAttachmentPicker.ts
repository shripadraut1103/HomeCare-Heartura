import { nanoid } from '@reduxjs/toolkit';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';

import type { Attachment } from '@/domain/communications/interfaces/CommunicationInterfaces';
import { confirm } from '@/utils/confirm';

const IMAGE_QUALITY = 0.8;

const fromImage = (asset: ImagePicker.ImagePickerAsset): Attachment => ({
  id: nanoid(),
  kind: 'image',
  uri: asset.uri,
  name: asset.fileName ?? `Photo-${Date.now()}.jpg`,
  mimeType: asset.mimeType,
  size: asset.fileSize,
  width: asset.width,
  height: asset.height,
});

const fromDocument = (asset: DocumentPicker.DocumentPickerAsset): Attachment => ({
  id: nanoid(),
  kind: asset.mimeType?.startsWith('image/') ? 'image' : 'file',
  uri: asset.uri,
  name: asset.name,
  mimeType: asset.mimeType,
  size: asset.size,
});

async function askToOpenSettings(feature: string) {
  const open = await confirm({
    title: `Allow ${feature} access`,
    message: `Turn on ${feature} access for Heartura in Settings to attach photos.`,
    confirmLabel: 'Open Settings',
  });
  if (open) await Linking.openSettings();
}

export function useAttachmentPicker() {
  const [, requestLibrary] = ImagePicker.useMediaLibraryPermissions();
  const [, requestCamera] = ImagePicker.useCameraPermissions();

  const pickImages = async (limit: number): Promise<Attachment[]> => {
    const permission = await requestLibrary();
    if (!permission.granted) {
      if (!permission.canAskAgain) await askToOpenSettings('photo');
      return [];
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: limit,
      quality: IMAGE_QUALITY,
    });
    return result.canceled ? [] : result.assets.map(fromImage);
  };

  const takePhoto = async (): Promise<Attachment[]> => {
    const permission = await requestCamera();
    if (!permission.granted) {
      if (!permission.canAskAgain) await askToOpenSettings('camera');
      return [];
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: IMAGE_QUALITY,
    });
    return result.canceled ? [] : result.assets.map(fromImage);
  };

  const pickDocuments = async (types: string | string[] = '*/*'): Promise<Attachment[]> => {
    const result = await DocumentPicker.getDocumentAsync({ type: types, multiple: true });
    return result.canceled ? [] : result.assets.map(fromDocument);
  };

  return { pickImages, takePhoto, pickDocuments };
}

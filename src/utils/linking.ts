import { Linking, Platform } from 'react-native';

export function callPhone(phone: string) {
  return Linking.openURL(`tel:${phone.replace(/[^\d+]/g, '')}`).catch(() => {});
}

export async function openDirections(address: string) {
  const query = encodeURIComponent(address);
  const native =
    Platform.OS === 'ios' ? `http://maps.apple.com/?daddr=${query}` : `geo:0,0?q=${query}`;
  try {
    await Linking.openURL(native);
  } catch {
    await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${query}`).catch(
      () => {}
    );
  }
}

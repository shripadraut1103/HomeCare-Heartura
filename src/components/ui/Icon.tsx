import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import type { ColorValue } from 'react-native';

export type IconName = { ios: SFSymbol; android: AndroidSymbol };

type IconProps = {
  name: IconName;
  color: ColorValue;
  size?: number;
};

export function Icon({ name, color, size = 20 }: IconProps) {
  return (
    <SymbolView
      name={{ ios: name.ios, android: name.android, web: name.android }}
      size={size}
      tintColor={color}
    />
  );
}

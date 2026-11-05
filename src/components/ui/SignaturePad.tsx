import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Radius, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

const PAD_HEIGHT = 180;
const STROKE_WIDTH = 2.5;
const MIN_POINT_GAP = 1.5;

type Point = { x: number; y: number };
export type SignatureStrokes = readonly (readonly Point[])[];

type SignaturePadProps = {
  value: SignatureStrokes;
  onChange: (strokes: SignatureStrokes) => void;
  error?: boolean;
};

export function SignaturePad({ value, onChange, error = false }: SignaturePadProps) {
  const theme = useTheme();
  const [drawing, setDrawing] = useState<readonly Point[] | null>(null);
  const points = useRef<Point[] | null>(null);

  const pan = usePanGesture({
    runOnJS: true,
    minDistance: 0,
    onBegin: ({ x, y }) => {
      points.current = [{ x, y }];
      setDrawing(points.current);
    },
    onUpdate: ({ x, y }) => {
      const current = points.current;
      if (!current) return;
      const last = current[current.length - 1];
      if (Math.hypot(x - last.x, y - last.y) < MIN_POINT_GAP) return;
      points.current = [...current, { x, y }];
      setDrawing(points.current);
    },
    onFinalize: () => {
      if (points.current) onChange([...value, points.current]);
      points.current = null;
      setDrawing(null);
    },
  });

  const strokes = drawing ? [...value, drawing] : value;
  const empty = strokes.length === 0;

  return (
    <View style={[styles.frame, { borderColor: theme.border }]}>
      <GestureDetector gesture={pan}>
        <View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={empty ? 'Signature pad, empty' : 'Signature pad, signed'}
          style={[
            styles.pad,
            {
              backgroundColor: theme.surfaceMuted,
              borderColor: error ? theme.error : theme.border,
            },
          ]}>
          {empty ? (
            <View pointerEvents="none" style={styles.placeholder}>
              <Icon
                name={{ ios: 'pencil.line', android: 'draw' }}
                size={18}
                color={theme.textSecondary}
              />
              <ThemedText themeColor="textSecondary">Sign here with a finger</ThemedText>
            </View>
          ) : null}
          {strokes.map((stroke, index) => (
            <Stroke key={index} points={stroke} color={theme.text} />
          ))}
        </View>
      </GestureDetector>
      <Button
        title="Clear"
        variant="secondary"
        size="small"
        disabled={empty}
        style={styles.clear}
        onPress={() => onChange([])}
      />
    </View>
  );
}

function Stroke({ points, color }: { points: readonly Point[]; color: string }) {
  if (points.length === 1) {
    const [point] = points;
    return (
      <View
        pointerEvents="none"
        style={[
          styles.dot,
          {
            left: point.x - STROKE_WIDTH / 2,
            top: point.y - STROKE_WIDTH / 2,
            backgroundColor: color,
          },
        ]}
      />
    );
  }

  return points.slice(1).map((point, index) => {
    const from = points[index];
    const length = Math.hypot(point.x - from.x, point.y - from.y);
    const angle = Math.atan2(point.y - from.y, point.x - from.x);
    return (
      <View
        key={index}
        pointerEvents="none"
        style={[
          styles.segment,
          {
            width: length + STROKE_WIDTH,
            left: (from.x + point.x) / 2 - (length + STROKE_WIDTH) / 2,
            top: (from.y + point.y) / 2 - STROKE_WIDTH / 2,
            backgroundColor: color,
            transform: [{ rotate: `${angle}rad` }],
          },
        ]}
      />
    );
  });
}

const styles = StyleSheet.create({
  frame: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  pad: {
    height: PAD_HEIGHT,
    borderRadius: Radius.small,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  segment: {
    position: 'absolute',
    height: STROKE_WIDTH,
    borderRadius: STROKE_WIDTH / 2,
  },
  dot: {
    position: 'absolute',
    width: STROKE_WIDTH,
    height: STROKE_WIDTH,
    borderRadius: STROKE_WIDTH / 2,
  },
  clear: {
    alignSelf: 'flex-start',
  },
});

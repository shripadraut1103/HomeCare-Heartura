import {
  BottomSheetScrollView,
  useBottomSheetModal,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState, type Ref } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { DetailRow, detailValueTextStyle } from '@/components/ui/DetailRow';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { Spacing } from '@/constants/Theme';
import {
  ChangeStatusSheet,
  type ChangeStatusSheetData,
} from '@/domain/visits/components/ChangeStatusSheet';
import { useVisit } from '@/domain/visits/hooks/useVisits';
import type { Visit } from '@/domain/visits/interfaces/VisitInterfaces';
import { VISIT_STATUS } from '@/domain/visits/visitStatus';
import { useTheme } from '@/hooks/useTheme';
import { formatRelativeDay, formatTime } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';
import { callPhone, openDirections } from '@/utils/linking';

const SNAP_POINTS = ['92%'];
const COPIED_FEEDBACK_MS = 1500;

export type VisitDetailsSheetData = { visitId: string };

export function VisitDetailsSheet({ ref }: { ref: Ref<BottomSheetModal<VisitDetailsSheetData>> }) {
  const changeStatusSheet = useRef<BottomSheetModal<ChangeStatusSheetData>>(null);
  const changeStatus = (visit: Visit) =>
    changeStatusSheet.current?.present({ visitId: visit.id, status: visit.status });

  return (
    <>
      <AppBottomSheet<VisitDetailsSheetData>
        ref={ref}
        snapPoints={SNAP_POINTS}
        enableDynamicSizing={false}>
        {/* The sheet calls this as a plain function, so render the content as its own component. */}
        {({ data }) => (
          <VisitDetailsContent visitId={data?.visitId} onChangeStatus={changeStatus} />
        )}
      </AppBottomSheet>
      <ChangeStatusSheet ref={changeStatusSheet} />
    </>
  );
}

type VisitDetailsContentProps = {
  visitId: string | undefined;
  onChangeStatus: (visit: Visit) => void;
};

function VisitDetailsContent({ visitId, onChangeStatus }: VisitDetailsContentProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const visit = useVisit(visitId);

  if (!visit) return null;

  const status = VISIT_STATUS[visit.status];

  return (
    <View style={styles.container}>
      <SheetHeader
        title={visit.patientName}
        titleSuffix={`(${visit.patientTag})`}
        onClose={() => dismiss()}
      />

      <BottomSheetScrollView contentContainerStyle={styles.body}>
        <View style={styles.statusRow}>
          <Pill
            label={status.label}
            color={status.color}
            backgroundColor={status.background}
            dot
            dotColor={status.dot}
          />
          <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.visitType}>
            {visit.visitType} · {visit.discipline}
          </ThemedText>
        </View>

        <DetailRow label="When">
          <WhenValue visit={visit} />
        </DetailRow>
        <DetailRow label="Provider">{visit.providerName}</DetailRow>
        <DetailRow label="Location">{visit.location}</DetailRow>
        <DetailRow label="Address">
          <ThemedText style={detailValueTextStyle}>{visit.address}</ThemedText>
          {visit.travel ? (
            <Pressable
              accessibilityRole="link"
              accessibilityHint="Opens directions in your maps app"
              onPress={() => openDirections(visit.address)}
              style={styles.travel}>
              <Icon
                name={{ ios: 'car', android: 'directions_car' }}
                size={16}
                color={theme.primary}
              />
              <ThemedText themeColor="primary" style={styles.travelText}>
                {visit.travel.miles} mi from you · about {visit.travel.driveMinutes} min drive
              </ThemedText>
            </Pressable>
          ) : null}
        </DetailRow>
        <DetailRow label="Phone">
          <PhoneValue phone={visit.phone} />
        </DetailRow>
        {visit.guardian ? <DetailRow label="Guardian">{visit.guardian}</DetailRow> : null}
        <DetailRow label="Payer">{visit.payer}</DetailRow>
        <DetailRow label="Units">
          <ThemedText style={detailValueTextStyle}>{visit.units.summary}</ThemedText>
          {visit.units.detail ? (
            <ThemedText themeColor="textSecondary" style={detailValueTextStyle}>
              {visit.units.detail}
            </ThemedText>
          ) : null}
        </DetailRow>
        {visit.notes ? <DetailRow label="Notes">{visit.notes}</DetailRow> : null}
        {visit.documents ? <DetailRow label="Documents">{visit.documents}</DetailRow> : null}
        <DetailRow label="Outcome" isLast>
          {visit.outcome ?? 'Hidden for your role'}
        </DetailRow>

        <View style={styles.contactActions}>
          <Button
            title="Directions"
            variant="secondary"
            style={styles.flex}
            onPress={() => openDirections(visit.address)}
            icon={
              <Icon
                name={{ ios: 'mappin.and.ellipse', android: 'location_on' }}
                size={20}
                color={theme.text}
              />
            }
          />
          <Button
            title="Call"
            variant="secondary"
            style={styles.flex}
            onPress={() => callPhone(visit.phone)}
            icon={<Icon name={{ ios: 'phone', android: 'call' }} size={20} color={theme.text} />}
          />
        </View>
      </BottomSheetScrollView>

      <View
        style={[
          styles.footer,
          { borderTopColor: theme.border, paddingBottom: insets.bottom + Spacing.three },
        ]}>
        <Button
          title="Change status"
          variant="secondary"
          style={styles.flex}
          onPress={() => onChangeStatus(visit)}
        />
        {/* TODO: open the visit flow once its screens exist. */}
        <Button title={`Start ${visit.visitType.toLowerCase()}`} style={styles.flex} />
      </View>
    </View>
  );
}

function WhenValue({ visit }: { visit: Visit }) {
  const start = new Date(visit.startsAt);
  const end = new Date(start.getTime() + visit.durationMinutes * 60_000);

  return (
    <>
      <ThemedText style={detailValueTextStyle}>{formatRelativeDay(start)}</ThemedText>
      <ThemedText style={detailValueTextStyle}>
        {formatTime(start)} – {formatTime(end)} · {visit.durationMinutes} min
      </ThemedText>
    </>
  );
}

function PhoneValue({ phone }: { phone: string }) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    await Clipboard.setStringAsync(phone);
    haptics.success();
    setCopied(true);
  };

  return (
    <View style={styles.phone}>
      <Pressable
        accessibilityRole="link"
        accessibilityHint="Calls this number"
        onPress={() => callPhone(phone)}>
        <ThemedText themeColor="primary" style={[detailValueTextStyle, styles.phoneLink]}>
          {phone}
        </ThemedText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copied ? 'Copied' : 'Copy phone number'}
        hitSlop={8}
        onPress={copy}>
        <Icon
          name={
            copied
              ? { ios: 'checkmark', android: 'check' }
              : { ios: 'doc.on.doc', android: 'content_copy' }
          }
          size={20}
          color={copied ? theme.success : theme.textSecondary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    paddingBottom: Spacing.two,
  },
  visitType: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
  travel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
  },
  travelText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 600,
  },
  phone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  phoneLink: {
    textDecorationLine: 'underline',
  },
  contactActions: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingTop: Spacing.four,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  flex: {
    flex: 1,
  },
});

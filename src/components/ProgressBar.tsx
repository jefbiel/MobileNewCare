import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

export default function ProgressBar({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(progress, 1));
  const innerStyle = { width: `${pct * 100}%` };

  return (
    <View style={styles.outer}>
      <View style={[styles.inner, innerStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { width: '100%', height: 12, backgroundColor: colors.bg, borderRadius: 8, overflow: 'hidden' },
  inner: { height: '100%', backgroundColor: colors.primary },
});

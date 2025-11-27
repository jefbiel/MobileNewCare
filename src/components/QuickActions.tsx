import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors } from '../styles/theme';

// Props do componente Ações Rápidas
type Props = {
  onSchedule?: () => void;
  onViewHabits?: () => void;
  onUpdateGoals?: () => void;
  onDrinkWater?: () => void;
};

// Componete Ações Rápidas com botões para ações comuns
const QuickActions: React.FC<Props> = ({ onSchedule, onViewHabits, onUpdateGoals, onDrinkWater }) => {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.action} onPress={onSchedule} accessibilityLabel="Agendar exame">
        <View style={[styles.iconCircle, styles.iconBgSchedule]}>
          <Image source={require('../assets/images/appointment.png')} style={styles.iconImage} />
        </View>
        <Text style={styles.label}>Agendar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.action} onPress={onViewHabits} accessibilityLabel="Ver hábitos">
        <View style={[styles.iconCircle, styles.iconBgHabits]}>
          <Image source={require('../assets/images/habits.png')} style={styles.iconImage} />
        </View>
        <Text style={styles.label}>Hábitos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.action} onPress={onUpdateGoals} accessibilityLabel="Atualizar metas">
        <View style={[styles.iconCircle, styles.iconBgGoals]}>
          <Image source={require('../assets/images/setting.png')} style={styles.iconImage} />
        </View>
        <Text style={styles.label}>Metas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.action} onPress={onDrinkWater} accessibilityLabel="Beber água">
        <View style={[styles.iconCircle, styles.iconBgWater]}>
          <Image source={require('../assets/images/water.png')} style={styles.iconImage} />
        </View>
        <Text style={styles.label}>Beber</Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos do componente Ações Rápidas
const styles = StyleSheet.create({

  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },

  action: { flex: 1, backgroundColor: colors.surface, marginHorizontal: 6, padding: 12, borderRadius: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },

  icon: { width: 28, height: 28, marginBottom: 6, tintColor: colors.primary },

  iconImage: { width: 26, height: 26, tintColor: colors.primary, resizeMode: 'contain' },

  iconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },

  /* icon background variants (extracted from inline styles) */
  iconBgSchedule: { backgroundColor: '#E6F2FF' },
  iconBgHabits: { backgroundColor: '#F1F7FF' },
  iconBgGoals: { backgroundColor: '#F4F9F6' },
  iconBgWater: { backgroundColor: '#E8F8FF' },

  label: { color: colors.text, fontWeight: '600' },

  water: { fontSize: 20, marginBottom: 6 },

});

export default QuickActions;

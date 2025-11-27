import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Image, Alert, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DeviceEventEmitter } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../styles/theme';
import { getItem, saveItem } from '../services/storage';
import { iconKeyForCategory, iconAssetForKey } from '../utils/icons';

// Chave usada para armazenar os hábitos localmente
const HABITS_KEY = '@samvita:habits';

// Sugestões inteligentes rápidas
const SMART_SUGGESTIONS = [
  { key: 'sono', title: 'Melhora seu sono' },
  { key: 'energia', title: 'Aumenta energia' },
  { key: 'stress', title: 'Bom para controle de estresse' },
];

// Tipo do hábito salvo
type Habit = {
  id: string;
  name: string;
  category: string;
  frequency: string;
  time?: string;
  notifications: boolean;
  goal?: string;
  color?: string;
  xp: number;
  completedCount: number;
  icon?: string;
};

export default function HabitoScreen() {

  // Estados do formulário de criação de hábito
  const [name, setName] = useState('');
  const [category, setCategory] = useState('exercicios');
  const [frequency, setFrequency] = useState('diario');
  const [time, setTime] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [goal, setGoal] = useState('');
  const [color, setColor] = useState('#2276B8');

  // Lista de hábitos salvos
  const [habits, setHabits] = useState<Habit[]>([]);

  // Estatísticas rápidas (total, mais concluído, XP total, etc.)
  const stats = useMemo(() => {
    const total = habits.length;
    const mostCompleted = habits.slice().sort((a, b) => b.completedCount - a.completedCount)[0];
    const least = habits.slice().sort((a, b) => a.completedCount - b.completedCount)[0];
    const totalXP = habits.reduce((s, h) => s + h.xp, 0);
    return { total, mostCompleted, least, totalXP };
  }, [habits]);

  // Adicionar novo hábito
  function addHabit() {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Informe um nome para o hábito.');
      return;
    }

    // Mapeamento categoria -> chave de ícone
    // Cria objeto do hábito
    const newHabit: Habit = {
      id: String(Date.now()),
      name: name.trim(),
      category,
      frequency,
      time: time.trim(),
      notifications,
      goal: goal.trim(),
      color,
      // define ícone com base na categoria selecionada
      icon: iconKeyForCategory(category),
      xp: 0,
      completedCount: 0,
    };

    // Atualiza lista
    setHabits(h => [newHabit, ...h]);

    // Reseta formulário
    setName('');
    setGoal('');
    setTime('');

    Alert.alert('Sucesso', 'Hábito adicionado com um clique.');
  }

  // Marca hábito como concluído + adiciona XP
  function toggleComplete(habitId: string) {
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== habitId) return h;

        const gained = 10; // XP fixo
        return {
          ...h,
          xp: h.xp + gained,
          completedCount: h.completedCount + 1
        };
      }),
    );
  }

  // Sugestão automática (grupo: "Sugestões inteligentes")
  function quickSuggestion() {
    const suggestion =
      SMART_SUGGESTIONS[Math.floor(Math.random() * SMART_SUGGESTIONS.length)];

    setName(suggestion.title);
    Alert.alert('Sugestão inteligente',
      `${suggestion.title} — sugerido com base no seu perfil.`);
  }

  // Carrega hábitos salvos no storage
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await getItem(HABITS_KEY);
        if (!mounted) return;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setHabits(parsed);
        }
      } catch {
        // Ignora erro silenciosamente
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Salva hábitos automaticamente sempre que mudarem
  useEffect(() => {
    (async () => {
      try {
        await saveItem(HABITS_KEY, JSON.stringify(habits));
        // notifica outras telas que os hábitos mudaram
        try { DeviceEventEmitter.emit('habitsUpdated'); } catch {}
      } catch {}
    })();
  }, [habits]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Título principal */}
        <Text style={styles.title}>Meus Hábitos</Text>

        {/* Formulário de criação */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Criar novo hábito</Text>

          {/* Nome */}
          <Text style={styles.label}>Nome</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Beber água"
            style={styles.input}
          />

          {/* Categoria */}
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={category}
              onValueChange={v => setCategory(String(v))}
            >
              <Picker.Item label="Sono" value="sono" />
              <Picker.Item label="Exercícios" value="exercicios" />
              <Picker.Item label="Alimentação" value="alimentacao" />
              <Picker.Item label="Hidratação" value="hidratacao" />
              <Picker.Item label="Mente" value="mente" />
              <Picker.Item label="Exames" value="exames" />
            </Picker>
          </View>

          {/* Frequência */}
          <Text style={styles.label}>Frequência</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={frequency}
              onValueChange={v => setFrequency(String(v))}
            >
              <Picker.Item label="Diário" value="diario" />
              <Picker.Item label="Semanal" value="semanal" />
              <Picker.Item label="Mensal" value="mensal" />
            </Picker>
          </View>

          {/* Horário opcional */}
          <Text style={styles.label}>Horário (opcional)</Text>
          <TextInput
            value={time}
            onChangeText={setTime}
            placeholder="08:00"
            style={styles.input}
          />

          {/* Notificações e meta */}
          <View style={styles.rowBetween}>
            <View style={styles.formCol}>
              <Text style={styles.label}>Notificações</Text>
              <Switch value={notifications} onValueChange={setNotifications} />
            </View>

            <View style={styles.formCol}>
              <Text style={styles.label}>Meta numérica</Text>
              <TextInput
                value={goal}
                onChangeText={setGoal}
                placeholder="Ex: 2000ml"
                style={styles.input}
              />
            </View>
          </View>

          {/* Seleção de cor */}
          <Text style={styles.label}>Cor / Ícone</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={color} onValueChange={v => setColor(String(v))}>
              <Picker.Item label="Azul" value="#2276B8" />
              <Picker.Item label="Verde" value="#3CA3E0" />
              <Picker.Item label="Amarelo" value="#F8F18D" />
              <Picker.Item label="Vermelho" value="#FF675E" />
            </Picker>
          </View>

          {/* Botões do grupo de ações */}
          <View style={styles.rowActions}>

            {/* Botão de sugestões inteligentes */}
            <TouchableOpacity
              style={styles.suggestBtn}
              onPress={quickSuggestion}
            >
              <Text style={styles.suggestText}>Sugestões</Text>
            </TouchableOpacity>

            {/* Botão de adicionar */}
            {(() => {
              const addBtnStyle = [
                { ...styles.addBtn },
                { backgroundColor: color }
              ];
              return (
                <TouchableOpacity style={addBtnStyle} onPress={addHabit}>
                  <Text style={styles.addText}>+</Text>
                </TouchableOpacity>
              );
            })()}

            {/* Adicionar com um clique */}
            <TouchableOpacity style={styles.addOneTap} onPress={addHabit}>
              <Text style={styles.addOneTapText}>Adicionar com um clique</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lista de hábitos criados */}
        <Text style={styles.sectionTitle}>Seus hábitos</Text>

        {habits.length === 0 ? (
          <View style={styles.cardEmpty}>
            <Text style={styles.muted}>
              Nenhum hábito criado. Experimente adicionar um.
            </Text>
          </View>
        ) : (
          habits.map(h => {
            const rowStyle = [
              styles.habitRow,
              { borderLeftColor: h.color || colors.primary }
            ];
            

            return (
              <View key={h.id} style={rowStyle}>
                  <View style={styles.habitLeft}>
                    {/* Ícone do hábito com círculo colorido */}
                    <View style={[styles.iconCircle, { backgroundColor: h.color || colors.primary }]}> 
                      <Image source={iconAssetForKey(h.icon)} style={styles.iconImageInner} />
                    </View>
                  </View>

                <View style={styles.habitBody}>
                  <Text style={styles.habitTitle}>{h.name}</Text>
                  <Text style={styles.habitMeta}>
                    {h.category} • {h.frequency} {h.time ? '• ' + h.time : ''}
                  </Text>
                  <Text style={styles.habitMeta}>Meta: {h.goal || '—'}</Text>

                  {/* Botão de concluir hábito */}
                  <View style={styles.habitActions}>
                    <TouchableOpacity
                      style={styles.complete}
                      onPress={() => {
                        toggleComplete(h.id);
                        Alert.alert('Concluído', 'Hábito marcado como concluído. XP ganho.');
                      }}
                    >
                      <Text style={styles.completeText}>Concluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Estatísticas / gamificação */}
        <Text style={styles.sectionTitle}>Estatísticas & Gamificação</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{stats.total}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>XP</Text>
            <Text style={styles.statValue}>{stats.totalXP}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Melhor</Text>
            <Text style={styles.statValue}>
              {stats.mostCompleted ? stats.mostCompleted.name : '—'}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

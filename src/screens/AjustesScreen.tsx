import React, { useEffect, useState } from 'react';
import {View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/theme';
import { saveItem, getItem, clearAll } from '../services/storage';
import { MVP_MESSAGE } from '../constants/messages';

// Tipo para preferências do usuário
type Preferences = {
  darkMode: boolean;
  notifications: boolean;
  challengeAlerts: boolean;
  healthReminders: boolean;
};

// Chave de armazenamento para preferências
const PREFERENCES_KEY = '@samvita:preferences';


// Tela de ajustes e configurações do usuário
export default function AjustesScreen() {
  const navigation: any = useNavigation();
  const [prefs, setPrefs] = useState<Preferences>({
    darkMode: false,
    notifications: true,
    challengeAlerts: true,
    healthReminders: true,
  });


  // Restaura as preferências salvas ao montar o componente
  useEffect(() => {
    (async () => {
      const raw = await getItem(PREFERENCES_KEY);
      if (raw) {
        try {
          setPrefs(JSON.parse(raw));
        } catch {}
      }
    })();
  }, []);

  // Atualiza uma preferência específica e salva as mudanças
  const updatePref = async (key: keyof Preferences, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try {
      await saveItem(PREFERENCES_KEY, JSON.stringify(next));
    } catch {}
  };

  // Exibe um alerta para funcionalidades não implementadas
  const onPressRow = (label: string) => {
    Alert.alert(label, MVP_MESSAGE);
  };

  const handleEditProfile = () => onPressRow('Editar Perfil');

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair e desconectar da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearAll();
          } catch {}
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  // Renderiza a tela de ajustes
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Configurações</Text>
          <Text style={styles.subtitle}>Gerencie sua experiência no app</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon} onPress={() => Alert.alert('Notificações', MVP_MESSAGE) }>
          <Image source={require('../assets/images/bell.png')} style={styles.headerBell} />
        </TouchableOpacity>
      </View>

      {/* Seção de perfil do usuário */}
      <View style={styles.card}>
        <View style={styles.userRow}>
          <Image source={require('../assets/images/Samantha.jpg')} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Samantha</Text>
            <Text style={styles.userEmail}>user@example.com</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile} activeOpacity={0.8}>
            <Text style={styles.editText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Seção de preferências do aplicativo */}
      <Text style={styles.sectionTitle}>Preferências do App</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Image source={require('../assets/images/dark-mode.png')} style={[styles.iconImage, styles.iconSpacing]} />
            <Text style={styles.rowLabel}>Modo Escuro</Text>
          </View>
          <Switch value={prefs.darkMode} onValueChange={v => updatePref('darkMode', v)} />
        </View>

        {/* Seção de notificações */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Image source={require('../assets/images/bell2.png')} style={[styles.iconImage, styles.iconSpacing]} />
            <Text style={styles.rowLabel}>Notificações</Text>
          </View>
          <Switch value={prefs.notifications} onValueChange={v => updatePref('notifications', v)} />
        </View>

        {/* Seção de alertas de desafios */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Image source={require('../assets/images/warning.png')} style={[styles.iconImage, styles.iconSpacing]} />
            <Text style={styles.rowLabel}>Alertas de desafios</Text>
          </View>
          <Switch value={prefs.challengeAlerts} onValueChange={v => updatePref('challengeAlerts', v)} />
        </View>

        {/* Seção de lembretes de saúde */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Image source={require('../assets/images/notification.png')} style={[styles.iconImage, styles.iconSpacing]} />
            <Text style={styles.rowLabel}>Lembretes de saúde</Text>
          </View>
          <Switch value={prefs.healthReminders} onValueChange={v => updatePref('healthReminders', v)} />
        </View>
      </View>

      {/* Seção de privacidade e segurança */}
      <Text style={styles.sectionTitle}>Privacidade e Segurança</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.itemRow} onPress={() => onPressRow('Alterar senha')}>
          <View style={styles.rowLeft}>
            <Image source={require('../assets/images/padlock.png')} style={[styles.iconImage, styles.iconSpacing]} />
            <Text style={styles.itemLabel}>Alterar senha</Text>
          </View>
          <Image source={require('../assets/images/right-arrow.png')} style={styles.chevronImage} />
        </TouchableOpacity>

        {/* Seção de gerenciamento de permissões */}  
        <TouchableOpacity style={styles.itemRow} onPress={() => onPressRow('Gerenciar permissões')}>
          <View style={styles.rowLeft}>
            <Image source={require('../assets/images/key.png')} style={[styles.iconImage, styles.iconSpacing]} />
            <Text style={styles.itemLabel}>Gerenciar permissões</Text>
          </View>
          <Image source={require('../assets/images/right-arrow.png')} style={styles.chevronImage} />
        </TouchableOpacity>

        {/* Seção de política de privacidade */}
        <TouchableOpacity style={styles.itemRow} onPress={() => onPressRow('Política de Privacidade')}>
          <View style={styles.rowLeft}>
            <Image source={require('../assets/images/insurance.png')} style={[styles.iconImage, styles.iconSpacing]} />
            <Text style={styles.itemLabel}>Política de Privacidade</Text>
          </View>
          <Image source={require('../assets/images/right-arrow.png')} style={styles.chevronImage} />
        </TouchableOpacity>

        {/* Seção de termos de uso */}
        <TouchableOpacity style={styles.itemRow} onPress={() => onPressRow('Termos de Uso')}>
          <View style={styles.rowLeft}>
            <Image source={require('../assets/images/terms-and-conditions.png')} style={[styles.iconImage, styles.iconSpacing]} />
            <Text style={styles.itemLabel}>Termos de Uso</Text>
          </View>
          <Image source={require('../assets/images/right-arrow.png')} style={styles.chevronImage} />
        </TouchableOpacity>
      </View>

      {/* Seção de informações do aplicativo */}
      <Text style={styles.sectionTitle}>Informações do Aplicativo</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.itemRow} onPress={() => onPressRow('Sobre o App')}>
          <Text style={styles.itemLabel}>Sobre o App</Text>
          <Image source={require('../assets/images/right-arrow.png')} style={styles.chevronImage} />
        </TouchableOpacity>


        {/* Seção de versão do aplicativo */}
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Versão do app</Text>
          <Text style={styles.muted}>1.0.0</Text>
        </View>

        {/* Seção de enviar feedback */}
        <TouchableOpacity style={styles.itemRow} onPress={() => onPressRow('Enviar sugestões')}>
          <Text style={styles.itemLabel}>Enviar sugestões</Text>
          <Image source={require('../assets/images/right-arrow.png')} style={styles.chevronImage} />
        </TouchableOpacity>

        {/* Seção de reportar problema */}
        <TouchableOpacity style={styles.itemRow} onPress={() => onPressRow('Reportar problema')}>
          <Text style={styles.itemLabel}>Reportar problema</Text>
          <Image source={require('../assets/images/right-arrow.png')} style={styles.chevronImage} />
        </TouchableOpacity>
      </View>

      {/* Seção de sair da conta e aviso */}
      <View style={styles.bottomWrapper}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>MVP – Algumas funções podem não estar disponíveis.</Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos da tela de ajustes
const styles = StyleSheet.create({

  screen: { flex: 1, backgroundColor: colors.bg },

  container: { padding: 16 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, position: 'relative' },

  headerText: { flex: 1 },

  headerIcon: { position: 'absolute', right: 0, padding: 10, borderRadius: 12, backgroundColor: `${colors.primary}10` },

  headerBell: { width: 22, height: 22, resizeMode: 'contain', tintColor: colors.primary },

  title: { fontSize: 22, fontWeight: '700', color: colors.dark },

  subtitle: { fontSize: 13, color: colors.gray, marginTop: 4 },

  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },

  userRow: { flexDirection: 'row', alignItems: 'center' },

  avatar: { width: 68, height: 68, borderRadius: 12, backgroundColor: colors.primaryLight },

  userName: { fontSize: 16, fontWeight: '700', color: colors.dark },

  userEmail: { fontSize: 13, color: colors.gray, marginTop: 4 },

  editButton: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },

  editText: { color: '#fff', fontWeight: '600' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.dark, marginBottom: 8, marginTop: 6 },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },

  rowLeft: { flexDirection: 'row', alignItems: 'center' },

  rowLabel: { fontSize: 15, color: colors.dark },

  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F4F6' },

  itemLabel: { fontSize: 15, color: colors.dark },

  muted: { color: colors.gray },

  logoutButton: { marginTop: 8, backgroundColor: colors.danger, paddingVertical: 12, borderRadius: 10 },

  logoutText: { color: '#fff', textAlign: 'center', fontWeight: '700' },

  disclaimer: { fontSize: 12, color: colors.gray, textAlign: 'center', marginTop: 8 },

  userInfo: { flex: 1, marginLeft: 12 },

  iconSpacing: { marginRight: 10 },

  iconImage: { width: 20, height: 20, resizeMode: 'contain', tintColor: colors.primary },

  bottomWrapper: { marginTop: 8, marginBottom: 40 },

  chevronImage: { width: 18, height: 18, tintColor: colors.gray, resizeMode: 'contain' },

});

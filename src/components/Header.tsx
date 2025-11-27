import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

type Props = {
  name: string;
  onPressNotifications?: () => void;
};

// Função de saudação que retorna uma mensagem baseada no horário atual.
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Componente Header que exibe a saudação, nome do usuário e notificações.
const Header: React.FC<Props> = ({ name, onPressNotifications }) => {
  const greeting = getGreeting();

  return (


    // Container principal do header
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.avatarWrap} accessible accessibilityLabel={`Foto do usuário ${name}`}>
          <Image source={require('../assets/images/Samantha.jpg')} style={styles.avatar} />
          <View style={styles.levelBadge} accessibilityLabel="nível do usuário" />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.greeting}>{greeting}, <Text style={styles.name}>{name}</Text></Text>
          <Text style={styles.subtitle}>Pequenas ações, grandes mudanças</Text>
        </View>
      </View>

      <TouchableOpacity onPress={onPressNotifications} accessibilityLabel="Notificações" style={styles.notify}>
        <Image source={require('../assets/images/bell.png')} style={styles.bellIcon} />
        {/* badge removido conforme solicitado */}
      </TouchableOpacity>
    </View>
  );
};

// Estilos do componente Header
const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  left: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 68, height: 68, borderRadius: 12, overflow: 'hidden', marginRight: 12, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  levelBadge: { position: 'absolute', right: -6, top: -6, backgroundColor: 'transparent', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  levelText: { color: colors.surface, fontWeight: '700' },
  textWrap: { maxWidth: 220 },
  greeting: { fontSize: 16, color: colors.text, fontWeight: '700' },
  name: { color: colors.primary },
  subtitle: { color: colors.muted, marginTop: 2 },
  notify: { padding: 8, borderRadius: 8, backgroundColor: 'transparent' },
  bellIcon: { width: 26, height: 26, tintColor: colors.primary },
  /* badge removido */
});

export default Header;

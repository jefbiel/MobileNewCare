// Tela inicial do aplicativo, exibindo progresso, desafios diários, exames e recomendações.
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal, Alert, ScrollView } from 'react-native';
// navigation removed from this screen
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
// QuickActions section removed from Home
import ProgressBar from '../components/ProgressBar';
import { appendProgressLog } from '../services/storage';
import { colors } from '../styles/theme';
import { getItem, saveItem } from '../services/storage';
import { DeviceEventEmitter } from 'react-native';
import { iconAssetForKey } from '../utils/icons';
import { MVP_MESSAGE } from '../constants/messages';

type Challenge = { id: string; title: string; icon?: any; completed?: boolean };
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
};
type Exam = { id: string; date: string; title: string; place: string };

export default function Inicio() {


	// Estado geral do progresso diário
	const [progress, setProgress] = useState(0.45);
	const [habitsCompleted, setHabitsCompleted] = useState(3);

	// Lista dinâmica de hábitos exibidos na home
	const [challenges, setChallenges] = useState<Challenge[]>([]); // mantemos nome para compatibilidade visual
	const [_homeHabits, setHomeHabits] = useState<Habit[]>([]);

	/**
	 * Carrega desafios salvos no storage e escuta atualizações globais
	 * emitidas pela aba de tarefas diárias.
	 */
	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				const raw = await getItem('@samvita:habits');
				if (!mounted) return;

				if (raw) {
					const parsed = JSON.parse(raw);
					if (Array.isArray(parsed)) {
						setHomeHabits(parsed);
						// Mapeia para visual rápido na home (usando ícone padrão)
						const mapped = parsed.map((h: any) => ({ id: h.id, title: h.name, icon: iconAssetForKey(h.icon), completed: h.completedCount > 0 }));
						setChallenges(mapped);

							// atualiza contadores e progresso baseado nos desafios
							const completedCount = parsed.reduce((s: number, p: any) => s + (p.completedCount || 0), 0);
							setHabitsCompleted(Math.max(0, completedCount));
							const total = parsed.length || 0;
							const completedChallenges = parsed.filter((h: any) => (h.completedCount || 0) > 0).length;
							setProgress(total > 0 ? Math.min(1, completedChallenges / total) : 0);
					}
				}
			} catch {}
		})();

		// Atualiza quando hábitos mudarem em outra tela
		const sub = DeviceEventEmitter.addListener('habitsUpdated', async () => {
			try {
				const raw = await getItem('@samvita:habits');
				if (raw) {
					const parsed = JSON.parse(raw);
					if (Array.isArray(parsed)) {
						setHomeHabits(parsed);
						const mapped = parsed.map((h: any) => ({ id: h.id, title: h.name, icon: iconAssetForKey(h.icon), completed: h.completedCount > 0 }));
						setChallenges(mapped);

							const completedCount = parsed.reduce((s: number, p: any) => s + (p.completedCount || 0), 0);
							setHabitsCompleted(Math.max(0, completedCount));
							const total = parsed.length || 0;
							const completedChallenges = parsed.filter((h: any) => (h.completedCount || 0) > 0).length;
							setProgress(total > 0 ? Math.min(1, completedChallenges / total) : 0);
					}
				}
			} catch {}
		});

		return () => {
			mounted = false;
			sub.remove();
		};
	}, []);

	// Lista estática de próximos exames (placeholder para futuro backend)
	const [exams] = useState<Exam[]>([
		{ id: 'e1', date: '25 Nov', title: 'Exame de sangue', place: 'Laboratório São João' },
		{ id: 'e2', date: '02 Dez', title: 'Check-up cardiológico', place: 'Clínica Saúde' },
	]);

	const [modalVisible, setModalVisible] = useState(false);
	const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

	// Recomendações de exames baseadas em regras simples
	const recommended = [
		{ id: 'r1', name: 'Colesterol', reasons: ['Histórico familiar', 'Colesterol elevado em check-up anterior'] },
		{ id: 'r2', name: 'Glicemia', reasons: ['Fatores de risco metabólicos', 'Jejum recente indisponível'] },
		{ id: 'r3', name: 'Hemograma', reasons: ['Rotina anual', 'Monitorar anemia ou infecções'] },
	];

	/**
	 * Marca ou desmarca um desafio, atualiza storage
	 * e recalcula progresso e quantidade concluída.
	 */
	// Marca um hábito como concluído a partir da home
	async function markHabitComplete(id: string) {
		// Atualiza visualmente
		setChallenges(prev => prev.map(c => (c.id === id ? { ...c, completed: true } : c)));

		try {
			const raw = await getItem('@samvita:habits');
			const habits = raw ? JSON.parse(raw) : [];

			const next = habits.map((h: any) => {
				if (h.id !== id) return h;
				const gained = 10;
				return { ...h, xp: (h.xp || 0) + gained, completedCount: (h.completedCount || 0) + 1 };
			});

			await saveItem('@samvita:habits', JSON.stringify(next));
			// Notifica outras telas
			try { DeviceEventEmitter.emit('habitsUpdated'); } catch {}

			// Atualiza contadores locais
			const completedCount = next.reduce((s: number, p: any) => s + (p.completedCount || 0), 0);
			setHabitsCompleted(Math.max(0, completedCount));

			// calcula progresso com base na razão entre desafios concluídos e total
			const total = next.length || challenges.length || 0;
			const completedChallenges = next.filter((h: any) => (h.completedCount || 0) > 0).length;
			const newProgress = total > 0 ? Math.min(1, completedChallenges / total) : 0;
			setProgress(newProgress);

			// tenta gravar um log do progresso em `text.txt` (ou fallback para AsyncStorage)
			try { appendProgressLog(`${new Date().toISOString()} - completed ${id} - progress ${newProgress}`); } catch {}

			// Atualiza estado local de homeHabits
			setHomeHabits(next);
		} catch {}
	}

	// onDrinkWater removed (was used only by QuickActions section)

	/** Handler para agendamento — mostra Alert com mensagem MVP */
	function onScheduleExam() {
		Alert.alert('Agendamento (MVP)', MVP_MESSAGE);
	}

	return (
		    <SafeAreaView style={styles.container}>
			    <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
				{/* Logotipo horizontal no topo da home */}
				<Image source={require('../assets/images/newcareLogoHorizontal.png')} style={styles.logoHorizontal} resizeMode="contain" />
				<Header name="Samantha" />

				{/* Seção de progresso do bem-estar diário */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Progresso de Bem-Estar</Text>
					<View style={styles.progressWrap}>
						<View style={styles.progressLeft}>
							<Text style={styles.big}>{Math.round(progress * 100)}%</Text>
							<Text style={styles.sm}>Hoje</Text>
						</View>
						<View style={styles.progressRight}>
							<ProgressBar progress={progress} />
							<Text style={styles.habits}>{habitsCompleted} hábitos concluídos</Text>
						</View>
					</View>
				</View>

				{/* Lista horizontal de desafios do dia */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Desafios do Dia</Text>
					<FlatList
						data={challenges}
						horizontal
						showsHorizontalScrollIndicator={false}
						keyExtractor={item => item.id}
						renderItem={({ item }) => (
							<View style={[styles.challengeCard, item.completed && styles.challengeCompleted]}>
								{item.icon ? (
									<View style={styles.challengeIconWrap}>
										<Image source={item.icon} style={styles.challengeIconImage} />
									</View>
								) : null}
								<Text style={styles.challengeTitle}>{item.title}</Text>

								{/* Botão de conclusão */}
								<TouchableOpacity style={styles.completeBtn} onPress={() => markHabitComplete(item.id)}>
									<Text style={styles.completeText}>{item.completed ? 'Concluído' : 'Concluir'}</Text>
								</TouchableOpacity>
							</View>
						)}
					/>
				</View>

				{/* Próximos exames agendados */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Próximos Exames</Text>
					{exams.length === 0 ? (
						<TouchableOpacity style={styles.cta} onPress={onScheduleExam}>
							<Text style={styles.ctaText}>Agendar exame</Text>
						</TouchableOpacity>
					) : (
						exams.map(e => (
							<View key={e.id} style={styles.examCard}>
								<View style={styles.examLeft}>
									<Image source={require('../assets/images/microscope.png')} style={styles.iconImage} />
									<Text style={styles.examDate}>{e.date}</Text>
								</View>

								<View style={styles.examRight}>
									<Text style={styles.examTitle}>{e.title}</Text>
									<Text style={styles.examPlace}>{e.place}</Text>
								</View>

								{/* Abre detalhes do exame */}
								<TouchableOpacity
									style={styles.detailsBtn}
									onPress={() => {
										setSelectedExam(e);
										setModalVisible(true);
									}}
								>
									<Text style={styles.detailsText}>Ver detalhes</Text>
								</TouchableOpacity>
							</View>
						))
					)}
				</View>

				{/* Recomendações personalizadas de exames */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Recomendados para você</Text>
					<Text style={styles.sectionSubtitle}>Exames importantes para manter sua saúde em dia</Text>

					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recoContent}>
						{recommended.map(r => (
							<View key={r.id} style={[styles.card, styles.recoCardLarge]}>
								<View style={styles.row}>
									<View style={styles.iconWrapLarge}>
										<Image source={require('../assets/images/microscope.png')} style={styles.iconImage} />
									</View>

									<View style={styles.flex}>
										<Text style={styles.cardTitle}>{r.name}</Text>
										<Text style={styles.cardMeta}>Recomendado</Text>

										{/* Lista resumida de motivos */}
										{r.reasons.slice(0, 2).map((reason, i) => (
											<Text key={i} style={styles.cardNote}>• {reason}</Text>
										))}
									</View>

									<TouchableOpacity style={styles.ctaBtn} onPress={() => Alert.alert('Agendar', MVP_MESSAGE)}>
										<Text style={styles.ctaText}>Agendar</Text>
									</TouchableOpacity>
								</View>
							</View>
						))}
					</ScrollView>
				</View>

				{/* Seção "Ações Rápidas" removida */}

				{/* Modal com detalhes do exame selecionado */}
				<Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
					<View style={styles.modalOverlay}>
						<View style={styles.modalContent}>
							<Text style={styles.modalTitle}>{selectedExam?.title}</Text>
							<Text style={styles.modalDate}>{selectedExam?.date}</Text>
							<Text style={styles.modalPlace}>{selectedExam?.place}</Text>

							<TouchableOpacity
								style={styles.locationBtn}
								onPress={() => Alert.alert('Localização', MVP_MESSAGE)}
							>
								<Text style={styles.locationText}>Ver localização</Text>
							</TouchableOpacity>

							<View style={styles.modalActions}>
								<TouchableOpacity style={styles.modalBtn} onPress={() => { setModalVisible(false); setSelectedExam(null); }}>
									<Text style={styles.modalBtnText}>Fechar</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[styles.modalBtn, styles.modalPrimary]}
									onPress={() => {
										setModalVisible(false);
										Alert.alert('Remarcar', MVP_MESSAGE);
									}}
								>
									<Text style={[styles.modalBtnText, styles.modalPrimaryText]}>Remarcar</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</Modal>
			</ScrollView>
		</SafeAreaView>
	);
}


const styles = StyleSheet.create({

	container: { flex: 1, backgroundColor: colors.bg },

	inner: { padding: 16 },

	section: { marginBottom: 14 },

	sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },

	progressWrap: { flexDirection: 'row', alignItems: 'center' },

	progressLeft: { width: 72, alignItems: 'center', marginRight: 12 },

	big: { fontSize: 26, fontWeight: '800', color: colors.primary },

	sm: { color: colors.muted },

	progressRight: { flex: 1 },

	habits: { marginTop: 8, color: colors.muted, fontWeight: '600' },

	challengeCard: { width: 180, padding: 14, backgroundColor: colors.surface, borderRadius: 14, marginRight: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.gray, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },

	challengeCompleted: { opacity: 0.7, borderWidth: 1, borderColor: colors.primary },

	challengeIcon: { width: 48, height: 48, marginBottom: 10, borderRadius: 24, tintColor: colors.surface, backgroundColor: colors.primary, padding: 8 },

	challengeIconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 10, backgroundColor: colors.primary },

	challengeIconImage: { width: 36, height: 36, resizeMode: 'contain', tintColor: colors.surface },

	challengeTitle: { fontWeight: '700', marginBottom: 8, textAlign: 'center' },

	completeBtn: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },

	completeText: { color: colors.surface, fontWeight: '700' },

	examCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: 10, marginBottom: 8 },

	examLeft: { width: 64, alignItems: 'center', justifyContent: 'center' },

	examDate: { fontWeight: '700', color: colors.primary },

	examRight: { flex: 1, paddingLeft: 8 },

	examTitle: { fontWeight: '700' },

	examPlace: { color: colors.muted },

	detailsBtn: { paddingHorizontal: 10, paddingVertical: 6 },

	detailsText: { color: colors.primary, fontWeight: '700' },

	cta: { backgroundColor: colors.primary, padding: 12, borderRadius: 10, alignItems: 'center' },

	ctaText: { color: colors.surface, fontWeight: '700' },

	recoRow: { flexDirection: 'row', justifyContent: 'flex-start' },

	recoCard: { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },

	recoText: { color: colors.text, fontWeight: '600' },

	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },

	modalContent: { backgroundColor: colors.surface, padding: 18, borderTopLeftRadius: 14, borderTopRightRadius: 14 },

	modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6 },

	modalDate: { color: colors.primary, fontWeight: '700', marginBottom: 4 },

	modalPlace: { color: colors.muted, marginBottom: 12 },

	modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },

	modalBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginLeft: 8, backgroundColor: colors.bg },

	modalBtnText: { color: colors.text, fontWeight: '700' },

	modalPrimary: { backgroundColor: colors.primary },

	modalPrimaryText: { color: colors.surface },

	locationBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, marginBottom: 10 },

	locationText: { color: colors.primary, fontWeight: '700' },

	/* recommendation card styles (similar to ExameScreen) */

	card: { backgroundColor: colors.surface, padding: 14, borderRadius: 12, marginRight: 12, width: 300, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },

	row: { flexDirection: 'row', alignItems: 'center' },

	iconWrapLarge: { width: 68, height: 68, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },

	iconImage: { width: 28, height: 28, resizeMode: 'contain', tintColor: colors.surface },

	flex: { flex: 1 },

	cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },

	cardMeta: { fontSize: 13, color: colors.muted },

	ctaBtn: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },

	// Logo horizontal no topo da home
	logoHorizontal: { width: '60%', height: 48, alignSelf: 'center', marginBottom: 12 },

	// section subtitle (small muted text under titles)

	sectionSubtitle: { fontSize: 13, color: colors.muted, marginBottom: 8 },

	recoContent: { paddingVertical: 8, paddingLeft: 4 },

	recoCardLarge: { width: 300 },

	/* MVP card (moved inline styles) */
	mvpCardInline: { marginTop: 12, backgroundColor: colors.surface },
	mvpCardTitle: { fontWeight: '800', color: colors.text, marginBottom: 6 },
	mvpCardMessage: { color: colors.muted, marginBottom: 10 },
	mvpCardCloseAlign: { alignSelf: 'flex-end' },

	cardNote: { color: colors.muted, fontSize: 12, marginTop: 6 },

});

import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Theme } from '../theme';
import { profileService } from '../services/api';
import { Plus, X, Edit2, Trash2, Users, ChevronLeft, Heart, Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const RELATIONSHIP_EMOJIS = {
  Spouse: '❤️',
  Partner: '💑',
  Child: '👶',
  Son: '👦',
  Daughter: '👧',
  Parent: '👴',
  Mother: '👵',
  Father: '👴',
  Sibling: '🧒',
  Brother: '👦',
  Sister: '👧',
  Other: '👤'
};

const FamilyMembersScreen = ({
  navigation
}) => {
  const { t } = useTranslation();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    age: '',
    diet_notes: ''
  });

  useFocusEffect(useCallback(() => {
    initializeScreen();
  }, []));

  const initializeScreen = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        const id = parsed.user_id || parsed.id || 1;
        setUserId(id);
        await fetchFamilyMembers(id);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error('Error initializing screen:', e);
      setLoading(false);
    }
  };

  const fetchFamilyMembers = async id => {
    try {
      const response = await profileService.getFamilyMembers(id);
      setFamilyMembers(response.data || []);
    } catch (error) {
      console.log('No family members found:', error.message);
      setFamilyMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      relationship: '',
      age: '',
      diet_notes: ''
    });
    setEditingMember(null);
    setShowAddModal(true);
  };

  const openEditModal = member => {
    setFormData({
      name: member.name,
      relationship: member.relationship || '',
      age: member.age ? String(member.age) : '',
      diet_notes: member.diet_notes || ''
    });
    setEditingMember(member);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingMember(null);
    setFormData({
      name: '',
      relationship: '',
      age: '',
      diet_notes: ''
    });
  };

  const handleSaveMember = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter family member name');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        relationship: formData.relationship.trim(),
        age: formData.age ? parseInt(formData.age) : null,
        diet_notes: formData.diet_notes.trim()
      };
      if (editingMember) {
        await profileService.updateFamilyMember(userId, editingMember.id, payload);
      } else {
        await profileService.addFamilyMember(userId, payload);
      }
      await fetchFamilyMembers(userId);
      closeModal();
    } catch (error) {
      console.error('Error saving family member:', error);
      Alert.alert('Error', 'Failed to save family member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = member => {
    Alert.alert('Remove Family Member', `Remove ${member.name} from your household?`, [{
      text: 'Cancel',
      style: 'cancel'
    }, {
      text: 'Remove',
      style: 'destructive',
      onPress: async () => {
        try {
          setLoading(true);
          await profileService.deleteFamilyMember(userId, member.id);
          await fetchFamilyMembers(userId);
        } catch (error) {
          console.error('Error deleting family member:', error);
          Alert.alert('Error', 'Failed to remove family member.');
        } finally {
          setLoading(false);
        }
      }
    }]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={Theme.gradients.background} style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={Theme.gradients.background} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.glowOrb1} />
        <View style={styles.glowOrb2} />
        
        {/* Header */}
        <View style={styles.header}>
          {navigation && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={22} color="#ffffff" />
            </TouchableOpacity>
          )}
          <View style={styles.headerCenter}>
            <LinearGradient colors={['rgba(59, 130, 246, 0.2)', 'rgba(37, 99, 235, 0.2)']} style={styles.headerIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Users size={22} color="#3b82f6" />
            </LinearGradient>
            <View>
              <Text style={styles.title}>{t("FamilyMembersScreen.Family_Members")}</Text>
              <Text style={styles.subtitle}>{t("FamilyMembersScreen.Plan_meals_for_your_entire_hou")}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {familyMembers.length === 0 ? (
            <View style={styles.emptyCard}>
              <Users size={48} color="#94a3b8" />
              <Text style={styles.emptyTitle}>{t("FamilyMembersScreen.No_Family_Members_Added")}</Text>
              <Text style={styles.emptySub}>{t("FamilyMembersScreen.Add_members_of_your_household")}</Text>
            </View>
          ) : (
            familyMembers.map(member => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberAvatar}>
                  <Text style={{ fontSize: 24 }}>
                    {RELATIONSHIP_EMOJIS[member.relationship] || '👤'}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={styles.metaRow}>
                    {member.relationship ? (
                      <View style={styles.metaTag}>
                        <Text style={styles.metaTagText}>{member.relationship}</Text>
                      </View>
                    ) : null}
                    {member.age ? <Text style={styles.ageText}>{member.age}{t("FamilyMembersScreen.yrs_old")}</Text> : null}
                  </View>
                  {member.diet_notes ? <Text style={styles.dietNotes}>"{member.diet_notes}"</Text> : null}
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionIconBtn} onPress={() => openEditModal(member)}>
                    <Edit2 size={16} color="#10b981" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionIconBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]} onPress={() => handleDeleteMember(member)}>
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity style={styles.fab} onPress={openAddModal} activeOpacity={0.88}>
          <LinearGradient colors={Theme.gradients.primary} style={styles.fabGrad}>
            <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMember ? 'Edit Family Member' : 'Add Family Member'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>{t("FamilyMembersScreen.Name")}</Text>
              <TextInput 
                value={formData.name} 
                onChangeText={t => setFormData({ ...formData, name: t })} 
                placeholder={t("FamilyMembersScreen.placeholder_e_g_Sarah")} 
                placeholderTextColor="#64748b" 
                style={styles.input} 
              />

              <Text style={styles.inputLabel}>{t("FamilyMembersScreen.Relationship")}</Text>
              <TextInput 
                value={formData.relationship} 
                onChangeText={t => setFormData({ ...formData, relationship: t })} 
                placeholder={t("FamilyMembersScreen.placeholder_e_g_Spouse_Child")} 
                placeholderTextColor="#64748b" 
                style={styles.input} 
              />

              <Text style={styles.inputLabel}>{t("FamilyMembersScreen.Age")}</Text>
              <TextInput 
                value={formData.age} 
                onChangeText={t => setFormData({ ...formData, age: t })} 
                placeholder={t("FamilyMembersScreen.placeholder_e_g_28")} 
                keyboardType="numeric" 
                placeholderTextColor="#64748b" 
                style={styles.input} 
              />

              <Text style={styles.inputLabel}>{t("FamilyMembersScreen.Dietary_Notes_Allergies")}</Text>
              <TextInput 
                value={formData.diet_notes} 
                onChangeText={t => setFormData({ ...formData, diet_notes: t })} 
                placeholder={t("FamilyMembersScreen.placeholder_e_g_Lactose_intoler")} 
                placeholderTextColor="#64748b" 
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                multiline 
              />

              <TouchableOpacity style={[styles.saveModalBtn, saving && { opacity: 0.6 }]} onPress={handleSaveMember} disabled={saving} activeOpacity={0.88}>
                <LinearGradient colors={Theme.gradients.primary} style={styles.saveModalGrad}>
                  {saving ? <ActivityIndicator color="#FFFFFF" /> : (
                    <Text style={styles.saveModalText}>
                      {editingMember ? 'Save Changes' : 'Add Member'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  gradient: {
    flex: 1
  },
  glowOrb1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    top: -height * 0.1,
    right: -width * 0.2,
  },
  glowOrb2: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    bottom: height * 0.1,
    left: -width * 0.2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)'
  },
  title: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 20,
    color: '#ffffff',
    letterSpacing: -0.3
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 120
  },
  emptyCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 22,
    padding: 32,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginTop: 20
  },
  emptyTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 18,
    color: '#ffffff'
  },
  emptySub: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 13,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 20
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 14,
  },
  memberAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  memberInfo: {
    flex: 1
  },
  memberName: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 16,
    color: '#ffffff'
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4
  },
  metaTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  metaTagText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 11,
    color: '#10b981'
  },
  ageText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: '#94a3b8'
  },
  dietNotes: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 4
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGrad: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  modalBox: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  modalTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 20,
    color: '#ffffff'
  },
  inputLabel: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#ffffff',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  saveModalBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
  },
  saveModalGrad: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 20
  },
  saveModalText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.heading
  }
});

export default FamilyMembersScreen;
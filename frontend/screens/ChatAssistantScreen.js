import { useTranslation } from "react-i18next";
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';
import { aiService } from '../services/api';
import { Send, User, Sparkles, ChevronLeft } from 'lucide-react-native';
const ChatAssistantScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const [messages, setMessages] = useState([{
    id: '1',
    text: "Hi! I'm your Pantrix AI. How can I help you with your kitchen today?",
    isUser: false
  }]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    try {
      const response = await aiService.chat(inputText);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response.data.answer,
        isUser: false
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, {
        id: 'error',
        text: "Sorry, I'm having trouble connecting right now.",
        isUser: false
      }]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({
        animated: true
      });
    }
  }, [messages]);
  const renderMessage = ({
    item
  }) => <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
      {!item.isUser && <LinearGradient colors={Theme.gradients.amber} style={styles.aiAvatar}>
          <Sparkles size={13} color="#FFFFFF" />
        </LinearGradient>}

      <View style={[styles.bubbleContent, item.isUser ? styles.userContent : styles.aiContent]}>
        <Text style={[styles.messageText, item.isUser ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
      </View>

      {item.isUser && <LinearGradient colors={Theme.gradients.primary} style={styles.userAvatar}>
          <User size={13} color="#FFFFFF" />
        </LinearGradient>}
    </View>;
  return <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={Theme.gradients.background} style={styles.gradient} start={{
      x: 0,
      y: 0
    }} end={{
      x: 0,
      y: 1
    }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={22} color={Theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <LinearGradient colors={Theme.gradients.amber} style={styles.titleIconBg}>
              <Sparkles size={16} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>{t("ChatAssistantScreen.Pantrix_AI_Assistant")}</Text>
              <Text style={styles.headerSubtitle}>{t("ChatAssistantScreen.Always_ready_to_help")}</Text>
            </View>
          </View>
          <View style={{
          width: 40
        }} />
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexContainer}>
          <FlatList ref={flatListRef} data={messages} renderItem={renderMessage} keyExtractor={item => item.id} contentContainerStyle={styles.messageList} showsVerticalScrollIndicator={false} />

          {loading && <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Theme.colors.primary} />
              <Text style={styles.loadingText}>{t("ChatAssistantScreen.Pantrix_AI_is_typing")}</Text>
            </View>}

          <View style={styles.inputArea}>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} placeholder={t("ChatAssistantScreen.placeholder_Ask_me_anything_abou")} placeholderTextColor={Theme.colors.textPlaceholder} value={inputText} onChangeText={setInputText} multiline />
              <TouchableOpacity style={[styles.sendBtnWrapper, !inputText.trim() && styles.disabledSend]} onPress={handleSend} disabled={!inputText.trim()} activeOpacity={0.85}>
                <LinearGradient colors={inputText.trim() ? Theme.gradients.primary : [Theme.colors.textPlaceholder, Theme.colors.textLight]} style={styles.sendBtnGrad} start={{
                x: 0,
                y: 0
              }} end={{
                x: 1,
                y: 1
              }}>
                  <Send size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  gradient: {
    flex: 1
  },
  flexContainer: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.xs
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  titleIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 18,
    color: Theme.colors.text
  },
  headerSubtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: Theme.colors.textMuted
  },
  messageList: {
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
    maxWidth: '85%'
  },
  userBubble: {
    alignSelf: 'flex-end'
  },
  aiBubble: {
    alignSelf: 'flex-start'
  },
  bubbleContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    ...Theme.shadows.xs
  },
  userContent: {
    backgroundColor: Theme.colors.primary,
    borderBottomRightRadius: 4,
    marginRight: 8
  },
  aiContent: {
    backgroundColor: Theme.colors.card,
    borderBottomLeftRadius: 4,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  messageText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 15,
    lineHeight: 22
  },
  userText: {
    color: Theme.colors.card
  },
  aiText: {
    color: Theme.colors.text
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
    gap: 8
  },
  loadingText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: Theme.colors.textMuted
  },
  inputArea: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.backgroundMid,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  input: {
    flex: 1,
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 15,
    color: Theme.colors.text,
    maxHeight: 100,
    paddingVertical: 8
  },
  sendBtnWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    marginLeft: 8
  },
  sendBtnGrad: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  disabledSend: {
    opacity: 0.6
  }
});
export default ChatAssistantScreen;
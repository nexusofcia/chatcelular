import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Message = {
  id: string;
  text: string;
  sentByMe: boolean;
  timestamp: number;
};

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { contact } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Set the header title to the contact name
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <View style={styles.headerTitle}>
          <Image source={{ uri: contact.avatar }} style={styles.headerAvatar} />
          <Text style={styles.headerText}>{contact.name}</Text>
        </View>
      ),
      headerLeft: () => (
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#4A90E2" />
        </TouchableOpacity>
      ),
    });
    
    loadUserData();
    loadMessages();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        setUserData(JSON.parse(userDataString));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadMessages = async () => {
    try {
      // Try to load existing messages for this contact
      const key = `messages_${contact.id}`;
      const storedMessages = await AsyncStorage.getItem(key);
      
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        // Generate sample messages for demo
        const sampleMessages = generateSampleMessages();
        await AsyncStorage.setItem(key, JSON.stringify(sampleMessages));
        setMessages(sampleMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleMessages = (): Message[] => {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    
    return [
      {
        id: '1',
        text: `Hi there! How are you doing?`,
        sentByMe: false,
        timestamp: now - oneMinute * 30,
      },
      {
        id: '2',
        text: 'Hey! I\'m doing well, thanks for asking. How about you?',
        sentByMe: true,
        timestamp: now - oneMinute * 25,
      },
      {
        id: '3',
        text: 'I\'m great! Just wanted to check in.',
        sentByMe: false,
        timestamp: now - oneMinute * 20,
      },
      {
        id: '4',
        text: 'Do you have any plans for the weekend?',
        sentByMe: false,
        timestamp: now - oneMinute * 15,
      },
      {
        id: '5',
        text: 'Not yet, still figuring things out. Maybe we could grab coffee?',
        sentByMe: true,
        timestamp: now - oneMinute * 5,
      },
    ];
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      text: newMessage,
      sentByMe: true,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setNewMessage('');

    // Save to AsyncStorage
    try {
      const key = `messages_${contact.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(updatedMessages));
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Simulate response after 1-3 seconds
      if (Math.random() > 0.3) { // 70% chance of response
        setTimeout(() => {
          const responses = [
            "Ok, I'll get back to you soon!",
            "Thanks for letting me know.",
            "Sounds good to me!",
            "I'll think about it and let you know.",
            "Great! Looking forward to it.",
            "Sorry, I'll be busy then.",
            "Perfect! See you soon.",
          ];
          
          const responseMsg: Message = {
            id: `msg_${Date.now()}`,
            text: responses[Math.floor(Math.random() * responses.length)],
            sentByMe: false,
            timestamp: Date.now(),
          };
          
          const updatedWithResponse = [...updatedMessages, responseMsg];
          setMessages(updatedWithResponse);
          
          // Save to AsyncStorage
          AsyncStorage.setItem(key, JSON.stringify(updatedWithResponse));
          
          // Scroll to bottom again
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }, 1000 + Math.random() * 2000);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sentByMe ? styles.sentMessage : styles.receivedMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.sentByMe ? styles.sentBubble : styles.receivedBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.sentByMe ? styles.sentText : styles.receivedText
        ]}>
          {item.text}
        </Text>
      </View>
      <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.messagesList}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={newMessage.trim() ? "#fff" : "#9CC3F0"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerButton: {
    paddingHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sentBubble: {
    backgroundColor: '#4A90E2',
  },
  receivedBubble: {
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
});
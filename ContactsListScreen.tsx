import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from 'sonner-native';

type Contact = {
  id: string;
  name: string;
  phoneNumber: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  avatar?: string;
};

export default function ContactsListScreen() {
  const navigation = useNavigation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
    loadContacts();
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

  const loadContacts = async () => {
    try {
      const storedContacts = await AsyncStorage.getItem('contacts');
      if (storedContacts) {
        setContacts(JSON.parse(storedContacts));
      } else {
        // Load sample contacts for demo
        const sampleContacts = generateSampleContacts();
        await AsyncStorage.setItem('contacts', JSON.stringify(sampleContacts));
        setContacts(sampleContacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const generateSampleContacts = (): Contact[] => {
    return [
      {
        id: '1',
        name: 'Alice Johnson',
        phoneNumber: '+1 555-1234',
        lastMessage: 'Hey, how are you doing?',
        lastMessageTime: '10:30 AM',
        unreadCount: 2,
        avatar: `https://api.a0.dev/assets/image?text=woman%20profile&aspect=1:1&seed=1`,
      },
      {
        id: '2',
        name: 'Bob Smith',
        phoneNumber: '+1 555-5678',
        lastMessage: 'See you tomorrow!',
        lastMessageTime: 'Yesterday',
        unreadCount: 0,
        avatar: `https://api.a0.dev/assets/image?text=man%20profile&aspect=1:1&seed=2`,
      },
      {
        id: '3',
        name: 'Carlos Rodriguez',
        phoneNumber: '+1 555-9012',
        lastMessage: 'Thanks for the help!',
        lastMessageTime: 'Yesterday',
        unreadCount: 1,
        avatar: `https://api.a0.dev/assets/image?text=man%20profile&aspect=1:1&seed=3`,
      },
    ];
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.includes(searchQuery)
  );

  const handleAddContact = async () => {
    if (!newContactPhone) {
      toast.error('Please enter a phone number');
      return;
    }

    if (!newContactName) {
      toast.error('Please enter a name');
      return;
    }

    setLoading(true);

    // Simulate API call to check if phone number exists
    setTimeout(async () => {
      try {
        // Check if contact already exists
        const exists = contacts.some(contact => 
          contact.phoneNumber === newContactPhone
        );

        if (exists) {
          setLoading(false);
          toast.error('This contact already exists in your list');
          return;
        }

        const newContact: Contact = {
          id: `contact_${Date.now()}`,
          name: newContactName,
          phoneNumber: newContactPhone,
          avatar: `https://api.a0.dev/assets/image?text=profile%20picture&aspect=1:1&seed=${Math.floor(Math.random() * 1000)}`,
        };

        const updatedContacts = [...contacts, newContact];
        await AsyncStorage.setItem('contacts', JSON.stringify(updatedContacts));
        setContacts(updatedContacts);
        
        setIsAddModalVisible(false);
        setNewContactPhone('');
        setNewContactName('');
        toast.success('Contact added successfully');
      } catch (error) {
        console.error('Error adding contact:', error);
        toast.error('Failed to add contact. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout", 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              navigation.reset({
                index: 0,
                routes: [{ name: 'PhoneAuth' }],
              });
            } catch (error) {
              console.error('Error logging out:', error);
              toast.error('Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const navigateToChat = (contact: Contact) => {
    navigation.navigate('ChatScreen', { contact });
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => navigateToChat(item)}
    >
      <Image
        source={{ uri: item.avatar }}
        style={styles.contactAvatar}
      />
      <View style={styles.contactInfo}>
        <View style={styles.contactHeader}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactTime}>{item.lastMessageTime}</Text>
        </View>
        <View style={styles.contactFooter}>
          <Text style={styles.contactMessage} numberOfLines={1}>
            {item.lastMessage || 'Tap to start chatting'}
          </Text>
          {item.unreadCount ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => setIsAddModalVisible(true)}>
            <Ionicons name="person-add" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts or messages"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {contacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={{ uri: 'https://api.a0.dev/assets/image?text=empty%20chat%20list%20illustration&aspect=1:1' }}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyTitle}>No Contacts Yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your first contact by tapping the "+" button above
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContactItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Contact</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, styles.modalInput]}
              placeholder="Contact Phone Number"
              value={newContactPhone}
              onChangeText={setNewContactPhone}
              keyboardType="phone-pad"
            />

            <TextInput
              style={[styles.input, styles.modalInput]}
              placeholder="Contact Name"
              value={newContactName}
              onChangeText={setNewContactName}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAddContact}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Add Contact</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactTime: {
    fontSize: 12,
    color: '#666',
  },
  contactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalInput: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CC3F0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
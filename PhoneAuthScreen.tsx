import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PhoneAuthScreen() {
  const navigation = useNavigation();
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); // 1: phone input, 2: code verification
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');

  const handleSendCode = async () => {              if (!phoneNumber || phoneNumber.length < 8) {
                  toast.error(`Please enter a valid phone number after selecting the country code ${countryCode}`);
                  return;
              }

    setLoading(true);              // Simulate sending verification code
              setTimeout(() => {
                setLoading(false);
                setStep(2);
                toast.success(`Verification code sent to ${countryCode} ${phoneNumber}!`);
              }, 1500);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      toast.error('Please enter the verification code');
      return;
    }

    if (step === 2 && !username.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    
    // Simulate verification and login
    setTimeout(async () => {
      try {
        // Mock successful authentication
        const userData = {
          phoneNumber,
          username,
          userId: `user_${Date.now()}`,
        };
        
        // Store user data
        await AsyncStorage.setItem('userToken', 'sample-token-123');
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        setLoading(false);
        toast.success('Successfully authenticated!');
        
        navigation.reset({
          index: 0,
          routes: [{ name: 'ContactsList' }],
        });
      } catch (error) {
        setLoading(false);
        toast.error('Authentication failed. Please try again.');
      }
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          <Image
            source={{ uri: 'https://api.a0.dev/assets/image?text=chat%20app%20messaging%20illustration&aspect=1:1' }}
            style={styles.logo}
          />
          
          <Text style={styles.title}>
            {step === 1 ? 'Enter your phone number' : 'Verify your number'}
          </Text>
          
          <Text style={styles.subtitle}>
            {step === 1 
              ? 'We\'ll send you a verification code to continue' 
              : 'Enter the code we sent to your phone'}
          </Text>

          {step === 1 ? (
            <View style={styles.inputContainer}>              <View style={styles.phoneInput}>
                <Picker
                  selectedValue={countryCode}
                  style={styles.countryCodePicker}
                  onValueChange={(itemValue) => setCountryCode(itemValue)}
                  mode="dropdown"
                >
                  <Picker.Item label="+1" value="+1" />
                  <Picker.Item label="(98)" value="98" />
                  <Picker.Item label="+44" value="+44" />
                </Picker>
                <TextInput
                  style={styles.input}
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
              
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Send Code</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter verification code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              
              <TextInput
                style={[styles.input, {marginTop: 12}]}
                placeholder="Your name"
                value={username}
                onChangeText={setUsername}
              />
              
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setStep(1)}
                  disabled={loading}
                >
                  <Ionicons name="arrow-back" size={24} color="#4A90E2" />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled, {flex: 1}]}
                  onPress={handleVerifyCode}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Verify & Continue</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 32,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  countryCodePicker: {
    width: 100,
    height: 50,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9CC3F0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginRight: 12,
  },
  backButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    marginLeft: 4,
  },
});
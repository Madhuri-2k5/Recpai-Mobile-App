import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { NutriColors } from '@/constants/nutri';
import { useAppFrame } from '@/hooks/use-app-frame';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { FlameIcon } from '@/components/dashboard/icons';

type Mode = 'login' | 'register';

export function AuthScreen() {
  const { scale } = useAppFrame();
  const { signIn } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (busy) return;
    setError('');

    if (!email.trim() || !password || (mode === 'register' && !name.trim())) {
      setError('Please fill in all fields.');
      return;
    }

    setBusy(true);
    try {
      const payload =
        mode === 'login'
          ? await api.login(email.trim(), password)
          : await api.register(name.trim(), email.trim(), password);
      if (payload.token && payload.user) {
        await signIn(payload.token, payload.user);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={scrollContent(scale)} showsVerticalScrollIndicator={false}>
        <View style={logoWrap(scale)}>
          <FlameIcon size={54 * scale} />
        </View>
        <Text style={brand(scale)}>
          Nutri<Text style={{ color: NutriColors.purple }}>AI</Text>
        </Text>
        <Text style={tagline(scale)}>
          {mode === 'login' ? 'Welcome back — log in to continue' : 'Create your account to get started'}
        </Text>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {mode === 'register' ? (
            <View style={inputWrap(scale)}>
              <Text style={inputLabel(scale)}>Name</Text>
              <TextInput
                style={input(scale)}
                placeholder="Your name"
                placeholderTextColor={NutriColors.textFaint}
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />
            </View>
          ) : null}

          <View style={inputWrap(scale)}>
            <Text style={inputLabel(scale)}>Email</Text>
            <TextInput
              style={input(scale)}
              placeholder="you@example.com"
              placeholderTextColor={NutriColors.textFaint}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={inputWrap(scale)}>
            <Text style={inputLabel(scale)}>Password</Text>
            <TextInput
              style={input(scale)}
              placeholder="••••••••"
              placeholderTextColor={NutriColors.textFaint}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {error ? <Text style={errorText(scale)}>{error}</Text> : null}

          <Pressable onPress={submit} disabled={busy} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
            <LinearGradient
              colors={['#B74FF5', '#753AFF']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={submitButton(scale)}>
              <Text style={submitText(scale)}>{busy ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            style={switchWrap(scale)}>
            <Text style={switchText(scale)}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={switchLink(scale)}>{mode === 'login' ? 'Sign Up' : 'Log In'}</Text>
            </Text>
          </Pressable>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: NutriColors.bg,
  } as ViewStyle,
};

const scrollContent = (scale: number): ViewStyle => ({
  flexGrow: 1,
  justifyContent: 'center',
  paddingHorizontal: 34 * scale,
  paddingVertical: 40 * scale,
});

const logoWrap = (scale: number): ViewStyle => ({
  alignSelf: 'center',
  width: 92 * scale,
  height: 92 * scale,
  borderRadius: 28 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(183, 79, 245, 0.14)',
  borderWidth: 1,
  borderColor: 'rgba(183, 79, 245, 0.4)',
});

const brand = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 40 * scale,
  fontWeight: '800',
  textAlign: 'center',
  marginTop: 18 * scale,
});

const tagline = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14.5 * scale,
  textAlign: 'center',
  marginTop: 8 * scale,
  marginBottom: 34 * scale,
});

const inputWrap = (scale: number): ViewStyle => ({
  marginBottom: 16 * scale,
});

const inputLabel = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
  fontWeight: '600',
  marginBottom: 8 * scale,
});

const input = (scale: number): TextStyle => ({
  backgroundColor: NutriColors.input,
  borderRadius: 15 * scale,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  paddingHorizontal: 16 * scale,
  paddingVertical: 14 * scale,
  color: '#FFFFFF',
  fontSize: 15.5 * scale,
});

const errorText = (scale: number): TextStyle => ({
  color: '#FF6B81',
  fontSize: 13.5 * scale,
  textAlign: 'center',
  marginTop: 4 * scale,
  marginBottom: 8 * scale,
});

const submitButton = (scale: number): ViewStyle => ({
  height: 60 * scale,
  borderRadius: 19 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 12 * scale,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.22)',
});

const submitText = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 17.5 * scale,
  fontWeight: '700',
});

const switchWrap = (scale: number): ViewStyle => ({
  alignItems: 'center',
  marginTop: 22 * scale,
});

const switchText = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14 * scale,
});

const switchLink = (scale: number): TextStyle => ({
  color: NutriColors.purple,
  fontWeight: '700',
});

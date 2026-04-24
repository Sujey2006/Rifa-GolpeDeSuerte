import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Text, Image, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebaseService";
import { useTheme } from "../../../navigation/ThemeContext";

const LoginScreen = () => {
    const { mainColor } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigation = useNavigation();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Por favor completa todos los campos');
            return;
        }
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            let errorMessage = 'Error al iniciar sesión';
            switch (error.code) {
                case 'auth/user-not-found': errorMessage = 'No existe la cuenta'; break;
                case 'auth/wrong-password': errorMessage = 'Contraseña incorrecta'; break;
                default: errorMessage = 'Por favor verifica tus datos';
            }
            setError(errorMessage);
        }
    };

    return (
        <LinearGradient colors={['#000', mainColor, '#f4f7f4']} style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
                <View style={styles.logoSection}>
                    <View style={styles.logoCircle}>
                        <Image source={require('../../../assets/Logo.png')} style={styles.logo} resizeMode="contain" />
                    </View>
                    <Text style={styles.appName}>Golpe de Suerte</Text>
                    <Text style={styles.appSubtitle}>Tu fortuna comienza aquí</Text>
                </View>

                <View style={styles.glassCard}>
                    <Text style={[styles.cardTitle, { color: mainColor }]}>Bienvenido</Text>

                    <View style={styles.inputWrapper}>
                        <Ionicons name="mail-outline" size={22} color={mainColor} style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInput}
                            placeholder="Correo electrónico"
                            placeholderTextColor="#999"
                            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={22} color={mainColor} style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInput}
                            placeholder="Contraseña"
                            placeholderTextColor="#999"
                            value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#999" />
                        </TouchableOpacity>
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                        <LinearGradient colors={[mainColor, '#000']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.btnGradient}>
                            <Text style={styles.btnText}>ENTRAR</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.linkText}>¿Nuevo por aquí? <Text style={[styles.linkTextBold, { color: mainColor }]}>Regístrate</Text></Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1, justifyContent: 'center', padding: 25 },
    logoSection: { alignItems: 'center', marginBottom: 35 },
    logoCircle: { width: 110, height: 110, backgroundColor: '#fff', borderRadius: 55, justifyContent: 'center', alignItems: 'center', elevation: 10 },
    logo: { width: 85, height: 85 },
    appName: { fontSize: 32, fontWeight: '900', color: '#fff', marginTop: 10 },
    appSubtitle: { fontSize: 15, color: '#fff', opacity: 0.85 },
    glassCard: { backgroundColor: 'rgba(255, 255, 255, 0.94)', borderRadius: 30, padding: 25, elevation: 15 },
    cardTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 15, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
    inputIcon: { marginRight: 10 },
    textInput: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#333' },
    loginBtn: { marginTop: 10, borderRadius: 15, overflow: 'hidden' },
    btnGradient: { paddingVertical: 16, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold', letterSpacing: 1 },
    registerLink: { marginTop: 20, alignItems: 'center' },
    linkText: { color: '#666', fontSize: 14 },
    linkTextBold: { fontWeight: 'bold' },
    errorText: { color: '#e74c3c', fontSize: 13, marginBottom: 15, textAlign: 'center', fontWeight: '600' }
});

export default LoginScreen;
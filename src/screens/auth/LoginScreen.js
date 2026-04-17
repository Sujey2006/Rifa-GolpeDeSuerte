import colors from "../../constants/colors";
import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Text, Image, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebaseService";

const LoginScreen = () => {
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
            console.error('Error al iniciar sesión:', error);
            let errorMessage = 'Error al iniciar sesión';
            switch (error.code) {
                case 'auth/user-not-found': errorMessage = 'No existe la cuenta'; break;
                case 'auth/wrong-password': errorMessage = 'Contraseña incorrecta'; break;
                case 'auth/invalid-email': errorMessage = 'Correo inválido'; break;
                default: errorMessage = 'Por favor verifica tus datos';
            }
            setError(errorMessage);
        }
    };

    return (
        <LinearGradient colors={['#164e24', '#2d8f3a', '#eaf7ea']} style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <View style={styles.logoSection}>
                    <View style={styles.logoCircle}>
                        <Image
                            source={require('../../../assets/Logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.appName}>Golpe de Suerte</Text>
                    <Text style={styles.appSubtitle}>Tu fortuna comienza aquí</Text>
                </View>

                <View style={styles.glassCard}>
                    <Text style={styles.cardTitle}>Bienvenido</Text>

                    <View style={styles.inputWrapper}>
                        <Ionicons name="mail-outline" size={22} color="#2d8f3a" style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInput}
                            placeholder="Correo electrónico"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={22} color="#2d8f3a" style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInput}
                            placeholder="Contraseña"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#999" />
                        </TouchableOpacity>
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                        <LinearGradient
                            colors={['#2d8f3a', '#164e24']}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                            style={styles.btnGradient}
                        >
                            <Text style={styles.btnText}>ENTRAR</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerLink}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.linkText}>¿Nuevo por aquí? <Text style={styles.linkTextBold}>Regístrate</Text></Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: 25,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 120,
        height: 120,
        backgroundColor: '#fff',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 15,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    logo: {
        width: 90,
        height: 90,
    },
    appName: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        marginTop: 15,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    appSubtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 30,
        padding: 25,
        elevation: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 10 },
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#164e24',
        marginBottom: 25,
        textAlign: 'center',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 15,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eee',
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: '#333',
    },
    loginBtn: {
        marginTop: 10,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
    },
    btnGradient: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    registerLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: '#666',
        fontSize: 15,
    },
    linkTextBold: {
        color: '#2d8f3a',
        fontWeight: 'bold',
    },
    errorText: {
        color: '#e74c3c',
        fontSize: 14,
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: '600',
    },
});

export default LoginScreen;

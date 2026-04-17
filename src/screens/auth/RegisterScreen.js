import React, { useState } from "react";
import colors from "../../constants/colors";
import { StyleSheet, TextInput, View, Text, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../services/firebaseService";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const RegisterScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigation = useNavigation();

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            setError('Todos los campos son obligatorios');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            setError('Mínimo 6 caracteres');
            return;
        }
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            Alert.alert('Éxito', 'Cuenta creada correctamente');
            // No navegamos manualmente, AppNavigator lo detectará
        } catch (error) {
            console.error(error);
            let errorMessage = 'Error al registrarse';
            if (error.code === 'auth/email-already-in-use') errorMessage = 'El correo ya está en uso';
            setError(errorMessage);
        }
    };

    return (
        <LinearGradient colors={['#164e24', '#2d8f3a', '#eaf7ea']} style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.headerSection}>
                        <Ionicons name="person-add-outline" size={60} color="#fff" />
                        <Text style={styles.title}>Crear Cuenta</Text>
                        <Text style={styles.subtitle}>Únete a Golpe de Suerte</Text>
                    </View>

                    <View style={styles.glassCard}>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={22} color="#2d8f3a" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Nombre y Apellido"
                                placeholderTextColor="#999"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

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

                        <View style={styles.inputWrapper}>
                            <Ionicons name="shield-checkmark-outline" size={22} color="#2d8f3a" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Confirmar contraseña"
                                placeholderTextColor="#999"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
                            <LinearGradient
                                colors={['#2d8f3a', '#164e24']}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 0}}
                                style={styles.btnGradient}
                            >
                                <Text style={styles.btnText}>REGISTRARSE</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.linkText}>¿Ya tienes cuenta? <Text style={styles.linkTextBold}>Inicia Sesión</Text></Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 25,
        paddingTop: 60,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 30,
        padding: 25,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
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
    registerBtn: {
        marginTop: 10,
        borderRadius: 15,
        overflow: 'hidden',
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
    loginLink: {
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

export default RegisterScreen;
// Login Screen
// Authentication form with validation

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';

export default function LoginScreen() {
    const { login, isLoading } = useAuth();

    // Form state
    const [serverUrl, setServerUrl] = useState('http://localhost:8069');
    const [database, setDatabase] = useState('odoo');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Validation state
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Validate a single field
    const validateField = (field, value) => {
        switch (field) {
            case 'serverUrl':
                if (!value.trim()) return 'La URL del servidor es obligatoria';
                if (!value.startsWith('http://') && !value.startsWith('https://')) {
                    return 'La URL debe empezar con http:// o https://';
                }
                return null;
            case 'database':
                if (!value.trim()) return 'El nombre de la base de datos es obligatorio';
                return null;
            case 'email':
                if (!value.trim()) return 'El email es obligatorio';
                if (!value.includes('@') && !value.includes('admin')) {
                    return 'Introduce un email válido';
                }
                return null;
            case 'password':
                if (!value.trim()) return 'La contraseña es obligatoria';
                if (value.length < 4) return 'La contraseña debe tener al menos 4 caracteres';
                return null;
            default:
                return null;
        }
    };

    // Validate all fields
    const validateAll = () => {
        const newErrors = {
            serverUrl: validateField('serverUrl', serverUrl),
            database: validateField('database', database),
            email: validateField('email', email),
            password: validateField('password', password),
        };
        setErrors(newErrors);
        setTouched({ serverUrl: true, database: true, email: true, password: true });
        return !Object.values(newErrors).some(error => error !== null);
    };

    // Handle field blur (mark as touched)
    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        setErrors(prev => ({ ...prev, [field]: validateField(field, eval(field)) }));
    };

    // Handle login
    const handleLogin = async () => {
        if (!validateAll()) {
            return;
        }

        try {
            await login(serverUrl, database, email, password);
        } catch (error) {
            Alert.alert(
                'Error de autenticación',
                error.message || 'No se pudo conectar con el servidor. Verifica tus credenciales.',
                [{ text: 'OK' }]
            );
        }
    };

    // Render input with label and error
    const renderInput = (label, field, value, setter, options = {}) => {
        const hasError = touched[field] && errors[field];

        return (
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                    style={[
                        styles.input,
                        hasError && styles.inputError,
                    ]}
                    value={value}
                    onChangeText={(text) => {
                        setter(text);
                        if (touched[field]) {
                            setErrors(prev => ({ ...prev, [field]: validateField(field, text) }));
                        }
                    }}
                    onBlur={() => handleBlur(field)}
                    placeholderTextColor={colors.textLight}
                    autoCapitalize="none"
                    autoCorrect={false}
                    {...options}
                />
                {hasError && (
                    <Text style={styles.errorText}>{errors[field]}</Text>
                )}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>⏱️</Text>
                    </View>
                    <Text style={styles.title}>Control de Asistencia</Text>
                    <Text style={styles.subtitle}>Inicia sesión con tu cuenta de Odoo</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {renderInput('Servidor Odoo', 'serverUrl', serverUrl, setServerUrl, {
                        placeholder: 'http://localhost:8069',
                        keyboardType: 'url',
                    })}

                    {renderInput('Base de datos', 'database', database, setDatabase, {
                        placeholder: 'odoo',
                    })}

                    {renderInput('Email / Usuario', 'email', email, setEmail, {
                        placeholder: 'tu@email.com',
                        keyboardType: 'email-address',
                    })}

                    {renderInput('Contraseña', 'password', password, setPassword, {
                        placeholder: '••••••••',
                        secureTextEntry: true,
                    })}

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.buttonText}>Iniciar Sesión</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Conecta con tu servidor Odoo Community
                    </Text>
                    <Text style={styles.footerNote}>
                        Las credenciales se almacenan de forma segura
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.xl,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        ...shadows.lg,
    },
    logoText: {
        fontSize: 40,
    },
    title: {
        ...typography.h1,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    form: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.md,
    },
    inputContainer: {
        marginBottom: spacing.md,
    },
    label: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: 16,
        color: colors.text,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    inputError: {
        borderColor: colors.error,
    },
    errorText: {
        color: colors.error,
        fontSize: 12,
        marginTop: spacing.xs,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        minHeight: 52,
        ...shadows.sm,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        ...typography.button,
        color: colors.textInverse,
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    footerText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    footerNote: {
        ...typography.caption,
        color: colors.textLight,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
});

// Home Screen
// Main attendance screen with check-in/check-out functionality

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import attendanceService from '../services/attendanceService';
import { formatTime, formatDate, calculateDuration, formatDuration } from '../utils/dateFormatter';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';

export default function HomeScreen({ navigation }) {
    const { employee, logout, isLoading: authLoading } = useAuth();

    const [currentAttendance, setCurrentAttendance] = useState(null);
    const [weeklySummary, setWeeklySummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every second (for elapsed time display)
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch current attendance status
    const fetchAttendanceStatus = useCallback(async () => {
        if (!employee?.id) {
            setError('No hay empleado asociado a esta cuenta');
            setIsLoading(false);
            return;
        }

        try {
            setError(null);
            const [attendance, weekly] = await Promise.all([
                attendanceService.getCurrentAttendance(employee.id),
                attendanceService.getWeeklySummary(employee.id),
            ]);
            setCurrentAttendance(attendance);
            setWeeklySummary(weekly);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [employee?.id]);

    useEffect(() => {
        fetchAttendanceStatus();
    }, [fetchAttendanceStatus]);

    // Pull to refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAttendanceStatus();
    }, [fetchAttendanceStatus]);

    // Handle check-in
    const handleCheckIn = async () => {
        if (!employee?.id) {
            Alert.alert('Error', 'No se encontró el empleado asociado.');
            return;
        }

        setIsActionLoading(true);
        try {
            await attendanceService.checkIn(employee.id);
            await fetchAttendanceStatus();
            Alert.alert('✅ Entrada registrada', 'Tu fichaje de entrada se ha registrado correctamente.');
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Handle check-out
    const handleCheckOut = async () => {
        if (!currentAttendance?.id) {
            Alert.alert('Error', 'No hay fichaje activo para cerrar.');
            return;
        }

        Alert.alert(
            'Confirmar salida',
            '¿Deseas registrar tu salida ahora?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        setIsActionLoading(true);
                        try {
                            await attendanceService.checkOut(currentAttendance.id);
                            await fetchAttendanceStatus();
                            Alert.alert('✅ Salida registrada', 'Tu fichaje de salida se ha registrado correctamente.');
                        } catch (err) {
                            Alert.alert('Error', err.message);
                        } finally {
                            setIsActionLoading(false);
                        }
                    },
                },
            ]
        );
    };

    // Handle logout
    const handleLogout = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar sesión',
                    style: 'destructive',
                    onPress: logout,
                },
            ]
        );
    };

    // Get elapsed time since check-in
    const getElapsedTime = () => {
        if (!currentAttendance?.check_in) return null;
        const checkIn = new Date(currentAttendance.check_in.replace(' ', 'T'));
        const diffMs = currentTime - checkIn;
        const hours = diffMs / (1000 * 60 * 60);
        return formatDuration(hours);
    };

    // Determine if currently checked in
    const isCheckedIn = currentAttendance !== null;

    if (isLoading || authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary]}
                />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hola,</Text>
                    <Text style={styles.employeeName}>{employee?.name || 'Usuario'}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            {/* Error message */}
            {error && (
                <View style={styles.errorCard}>
                    <Text style={styles.errorTitle}>⚠️ Error</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                </View>
            )}

            {/* Current Status Card */}
            <View style={[styles.statusCard, isCheckedIn ? styles.statusCardActive : styles.statusCardInactive]}>
                <View style={styles.statusHeader}>
                    <Text style={styles.statusLabel}>Estado actual</Text>
                    <View style={[styles.statusBadge, isCheckedIn ? styles.badgeActive : styles.badgeInactive]}>
                        <Text style={styles.badgeText}>
                            {isCheckedIn ? '🟢 Trabajando' : '⚪ Sin fichar'}
                        </Text>
                    </View>
                </View>

                {isCheckedIn ? (
                    <View style={styles.checkInInfo}>
                        <Text style={styles.checkInLabel}>Entrada registrada:</Text>
                        <Text style={styles.checkInTime}>{formatTime(currentAttendance.check_in)}</Text>
                        <Text style={styles.checkInDate}>{formatDate(currentAttendance.check_in)}</Text>
                        <View style={styles.elapsedContainer}>
                            <Text style={styles.elapsedLabel}>Tiempo transcurrido:</Text>
                            <Text style={styles.elapsedTime}>{getElapsedTime()}</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.noCheckInInfo}>
                        <Text style={styles.noCheckInText}>No tienes un fichaje activo</Text>
                        <Text style={styles.noCheckInSubtext}>Pulsa el botón para registrar tu entrada</Text>
                    </View>
                )}
            </View>

            {/* Action Button */}
            <TouchableOpacity
                style={[
                    styles.actionButton,
                    isCheckedIn ? styles.checkOutButton : styles.checkInButton,
                    isActionLoading && styles.buttonDisabled,
                ]}
                onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
                disabled={isActionLoading || !employee?.id}
                activeOpacity={0.8}
            >
                {isActionLoading ? (
                    <ActivityIndicator color={colors.white} size="large" />
                ) : (
                    <>
                        <Text style={styles.actionIcon}>{isCheckedIn ? '🚪' : '✅'}</Text>
                        <Text style={styles.actionText}>
                            {isCheckedIn ? 'Registrar Salida' : 'Registrar Entrada'}
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Weekly Summary */}
            {weeklySummary && (
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>📊 Resumen Semanal</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{formatDuration(weeklySummary.totalHours)}</Text>
                            <Text style={styles.summaryLabel}>Horas totales</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{weeklySummary.recordCount}</Text>
                            <Text style={styles.summaryLabel}>Fichajes</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Navigation to History */}
            <TouchableOpacity
                style={styles.historyButton}
                onPress={() => navigation.navigate('History')}
                activeOpacity={0.7}
            >
                <Text style={styles.historyButtonIcon}>📋</Text>
                <Text style={styles.historyButtonText}>Ver Historial Completo</Text>
                <Text style={styles.historyButtonArrow}>→</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    greeting: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    employeeName: {
        ...typography.h2,
        color: colors.text,
    },
    logoutButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surfaceAlt,
        borderRadius: borderRadius.md,
    },
    logoutText: {
        ...typography.bodySmall,
        color: colors.error,
        fontWeight: '600',
    },
    errorCard: {
        backgroundColor: '#FEF2F2',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.lg,
        borderLeftWidth: 4,
        borderLeftColor: colors.error,
    },
    errorTitle: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.error,
    },
    errorMessage: {
        ...typography.bodySmall,
        color: colors.error,
        marginTop: spacing.xs,
    },
    statusCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    statusCardActive: {
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: colors.secondary,
    },
    statusCardInactive: {
        backgroundColor: colors.surface,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    statusLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    badgeActive: {
        backgroundColor: colors.secondary,
    },
    badgeInactive: {
        backgroundColor: colors.surfaceAlt,
    },
    badgeText: {
        ...typography.caption,
        fontWeight: '600',
        color: colors.text,
    },
    checkInInfo: {
        alignItems: 'center',
    },
    checkInLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    checkInTime: {
        ...typography.h1,
        color: colors.secondaryDark,
        marginTop: spacing.xs,
    },
    checkInDate: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    elapsedContainer: {
        marginTop: spacing.md,
        alignItems: 'center',
    },
    elapsedLabel: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    elapsedTime: {
        ...typography.h3,
        color: colors.secondary,
        fontWeight: '700',
    },
    noCheckInInfo: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    noCheckInText: {
        ...typography.h3,
        color: colors.textSecondary,
    },
    noCheckInSubtext: {
        ...typography.bodySmall,
        color: colors.textLight,
        marginTop: spacing.xs,
    },
    actionButton: {
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        minHeight: 100,
        ...shadows.lg,
    },
    checkInButton: {
        backgroundColor: colors.primary,
    },
    checkOutButton: {
        backgroundColor: colors.error,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: spacing.xs,
    },
    actionText: {
        ...typography.h3,
        color: colors.textInverse,
    },
    summaryCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    summaryTitle: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        ...typography.h2,
        color: colors.primary,
    },
    summaryLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.border,
    },
    historyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        ...shadows.sm,
    },
    historyButtonIcon: {
        fontSize: 20,
        marginRight: spacing.sm,
    },
    historyButtonText: {
        ...typography.body,
        color: colors.text,
        flex: 1,
    },
    historyButtonArrow: {
        ...typography.body,
        color: colors.textLight,
    },
});

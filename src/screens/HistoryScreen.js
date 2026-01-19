// History Screen
// Displays attendance history with optional date filtering

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import attendanceService from '../services/attendanceService';
import { formatDate, formatTime, formatDuration } from '../utils/dateFormatter';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';

export default function HistoryScreen() {
    const { employee } = useAuth();

    const [attendances, setAttendances] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Date filter state (optional feature)
    const [filterDays, setFilterDays] = useState(30); // Last 30 days by default

    // Fetch attendance history
    const fetchHistory = useCallback(async () => {
        if (!employee?.id) {
            setError('No hay empleado asociado a esta cuenta');
            setIsLoading(false);
            return;
        }

        try {
            setError(null);
            const history = await attendanceService.getAttendanceHistory(employee.id, 100);
            setAttendances(history);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [employee?.id]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Pull to refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchHistory();
    }, [fetchHistory]);

    // Render single attendance item
    const renderAttendanceItem = ({ item, index }) => {
        const isOpen = !item.check_out;

        return (
            <View style={[styles.attendanceItem, index === 0 && styles.firstItem]}>
                {/* Date header */}
                <View style={styles.dateHeader}>
                    <Text style={styles.dateText}>{formatDate(item.check_in)}</Text>
                    {isOpen && (
                        <View style={styles.openBadge}>
                            <Text style={styles.openBadgeText}>En curso</Text>
                        </View>
                    )}
                </View>

                {/* Time details */}
                <View style={styles.timeRow}>
                    <View style={styles.timeBlock}>
                        <Text style={styles.timeLabel}>Entrada</Text>
                        <Text style={styles.timeValue}>{formatTime(item.check_in)}</Text>
                    </View>

                    <View style={styles.timeSeparator}>
                        <Text style={styles.separatorText}>→</Text>
                    </View>

                    <View style={styles.timeBlock}>
                        <Text style={styles.timeLabel}>Salida</Text>
                        <Text style={[styles.timeValue, isOpen && styles.timeValuePending]}>
                            {item.check_out ? formatTime(item.check_out) : '--:--'}
                        </Text>
                    </View>

                    <View style={styles.durationBlock}>
                        <Text style={styles.timeLabel}>Duración</Text>
                        <Text style={[styles.durationValue, isOpen && styles.durationPending]}>
                            {item.worked_hours ? formatDuration(item.worked_hours) : '--'}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    // Empty state component
    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Sin registros</Text>
            <Text style={styles.emptyText}>
                No hay fichajes registrados todavía.{'\n'}
                ¡Empieza fichando tu primera entrada!
            </Text>
        </View>
    );

    // Error state component
    const ErrorState = () => (
        <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Error al cargar</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchHistory}>
                <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
        </View>
    );

    // Calculate total hours
    const totalHours = attendances.reduce((sum, att) => sum + (att.worked_hours || 0), 0);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Summary header */}
            {attendances.length > 0 && (
                <View style={styles.summaryHeader}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{attendances.length}</Text>
                        <Text style={styles.summaryLabel}>Registros</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{formatDuration(totalHours)}</Text>
                        <Text style={styles.summaryLabel}>Total trabajado</Text>
                    </View>
                </View>
            )}

            {/* Error message */}
            {error ? (
                <ErrorState />
            ) : (
                <FlatList
                    data={attendances}
                    renderItem={renderAttendanceItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={[
                        styles.listContent,
                        attendances.length === 0 && styles.emptyList,
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                        />
                    }
                    ListEmptyComponent={EmptyState}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
    summaryHeader: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        ...typography.h3,
        color: colors.primary,
    },
    summaryLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: colors.border,
    },
    listContent: {
        padding: spacing.md,
    },
    emptyList: {
        flex: 1,
    },
    attendanceItem: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    firstItem: {
        marginTop: spacing.xs,
    },
    dateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    dateText: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.text,
    },
    openBadge: {
        backgroundColor: colors.secondary,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
    },
    openBadgeText: {
        ...typography.caption,
        color: colors.white,
        fontWeight: '600',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeBlock: {
        flex: 1,
    },
    timeLabel: {
        ...typography.caption,
        color: colors.textLight,
        marginBottom: 2,
    },
    timeValue: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text,
    },
    timeValuePending: {
        color: colors.textLight,
    },
    timeSeparator: {
        paddingHorizontal: spacing.sm,
    },
    separatorText: {
        ...typography.body,
        color: colors.textLight,
    },
    durationBlock: {
        alignItems: 'flex-end',
    },
    durationValue: {
        ...typography.body,
        fontWeight: '700',
        color: colors.primary,
    },
    durationPending: {
        color: colors.textLight,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    emptyTitle: {
        ...typography.h2,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    errorTitle: {
        ...typography.h2,
        color: colors.error,
        marginBottom: spacing.sm,
    },
    errorText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    retryText: {
        ...typography.button,
        color: colors.textInverse,
    },
});

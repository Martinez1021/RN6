// Theme and Styles
// Color palette and common styles for the app

export const colors = {
    // Primary palette - Modern purple gradient feel
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',

    // Secondary accents
    secondary: '#10B981',
    secondaryDark: '#059669',

    // Status colors
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Neutrals
    white: '#FFFFFF',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',

    // Text colors
    text: '#1E293B',
    textSecondary: '#64748B',
    textLight: '#94A3B8',
    textInverse: '#FFFFFF',

    // Borders
    border: '#E2E8F0',
    borderLight: '#F1F5F9',

    // Gradients (for manual implementation)
    gradientStart: '#6366F1',
    gradientEnd: '#8B5CF6',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 40,
        color: colors.text,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
        color: colors.text,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
        color: colors.text,
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        color: colors.text,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        color: colors.textSecondary,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        color: colors.textLight,
    },
    button: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
    },
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
};

export const commonStyles = {
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.md,
    },
    input: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: 16,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputFocused: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        ...typography.button,
        color: colors.textInverse,
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    buttonSecondaryText: {
        ...typography.button,
        color: colors.primary,
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        marginTop: spacing.xs,
    },
};

export default {
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
    commonStyles,
};

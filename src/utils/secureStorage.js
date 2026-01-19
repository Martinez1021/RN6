// Secure Storage Utility
// Uses expo-secure-store for native or localStorage for web

import { Platform } from 'react-native';

const SESSION_KEY = 'odoo_session';

// Helper to check if we're on web
const isWeb = Platform.OS === 'web';

// Dynamic import for SecureStore (only on native)
let SecureStore = null;
if (!isWeb) {
    SecureStore = require('expo-secure-store');
}

/**
 * Save session data securely
 * Uses SecureStore on native, localStorage on web
 */
export async function saveSession(sessionData) {
    try {
        const jsonValue = JSON.stringify(sessionData);

        if (isWeb) {
            localStorage.setItem(SESSION_KEY, jsonValue);
        } else {
            await SecureStore.setItemAsync(SESSION_KEY, jsonValue);
        }
        return true;
    } catch (error) {
        console.error('Error saving session:', error);
        return false;
    }
}

/**
 * Retrieve stored session data
 * @returns {Promise<Object|null>} Session data or null if not found
 */
export async function getSession() {
    try {
        let jsonValue;

        if (isWeb) {
            jsonValue = localStorage.getItem(SESSION_KEY);
        } else {
            jsonValue = await SecureStore.getItemAsync(SESSION_KEY);
        }

        return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error('Error reading session:', error);
        return null;
    }
}

/**
 * Clear session data (logout)
 */
export async function clearSession() {
    try {
        if (isWeb) {
            localStorage.removeItem(SESSION_KEY);
        } else {
            await SecureStore.deleteItemAsync(SESSION_KEY);
        }
        return true;
    } catch (error) {
        console.error('Error clearing session:', error);
        return false;
    }
}

/**
 * Check if a session exists
 */
export async function hasSession() {
    const session = await getSession();
    return session !== null && session.uid !== undefined;
}

export default {
    saveSession,
    getSession,
    clearSession,
    hasSession,
};

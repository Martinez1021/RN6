// Authentication Service
// Handles login, employee identification, and session management

import odooApi from './odooApi';
import { saveSession, getSession, clearSession } from '../utils/secureStorage';

/**
 * Authenticate user with Odoo
 * @param {string} url - Odoo server URL
 * @param {string} db - Database name
 * @param {string} email - User email/login
 * @param {string} password - User password
 * @returns {Promise<Object>} User and employee data
 */
export async function login(url, db, email, password) {
    // Configure API with server URL
    odooApi.configure(url, db);

    // Authenticate with Odoo
    const uid = await odooApi.authenticate(db, email, password);

    // Get employee associated with this user
    const employee = await getEmployeeByUserId(uid);

    // Save session securely
    await saveSession({
        url,
        db,
        uid,
        password,
        employeeId: employee?.id || null,
        employeeName: employee?.name || email,
    });

    return {
        uid,
        employee,
    };
}

/**
 * Get employee record linked to a user
 */
export async function getEmployeeByUserId(userId) {
    try {
        const employees = await odooApi.searchRead(
            'hr.employee',
            [['user_id', '=', userId]],
            ['id', 'name', 'department_id', 'job_id'],
            { limit: 1 }
        );

        if (employees && employees.length > 0) {
            return employees[0];
        }

        // If no employee linked, try to find by user's partner
        const users = await odooApi.searchRead(
            'res.users',
            [['id', '=', userId]],
            ['name', 'login'],
            { limit: 1 }
        );

        if (users && users.length > 0) {
            return {
                id: null,
                name: users[0].name,
                isUserOnly: true,
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching employee:', error);
        throw new Error('Could not retrieve employee information.');
    }
}

/**
 * Restore session from secure storage
 * @returns {Promise<Object|null>} Session data if valid, null otherwise
 */
export async function restoreSession() {
    try {
        const session = await getSession();

        if (!session || !session.url || !session.uid || !session.password) {
            return null;
        }

        // Reconfigure API with stored credentials
        odooApi.configure(session.url, session.db, session.uid, session.password);

        // Verify session is still valid by making a simple call
        try {
            const users = await odooApi.searchRead(
                'res.users',
                [['id', '=', session.uid]],
                ['id', 'name'],
                { limit: 1 }
            );

            if (!users || users.length === 0) {
                await clearSession();
                return null;
            }

            return session;
        } catch (error) {
            // Session expired or invalid
            await clearSession();
            return null;
        }
    } catch (error) {
        console.error('Error restoring session:', error);
        return null;
    }
}

/**
 * Logout user and clear session
 */
export async function logout() {
    odooApi.logout();
    await clearSession();
}

export default {
    login,
    logout,
    restoreSession,
    getEmployeeByUserId,
};

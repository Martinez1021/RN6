// Attendance Service
// Handles check-in, check-out, and attendance history

import odooApi from './odooApi';

/**
 * Get current open attendance (check-in without check-out)
 * @param {number} employeeId - Employee ID
 * @returns {Promise<Object|null>} Open attendance record or null
 */
export async function getCurrentAttendance(employeeId) {
    if (!employeeId) {
        throw new Error('Employee ID is required');
    }

    try {
        const attendances = await odooApi.searchRead(
            'hr.attendance',
            [
                ['employee_id', '=', employeeId],
                ['check_out', '=', false],
            ],
            ['id', 'check_in', 'employee_id'],
            { limit: 1, order: 'check_in desc' }
        );

        return attendances && attendances.length > 0 ? attendances[0] : null;
    } catch (error) {
        console.error('Error getting current attendance:', error);
        throw new Error('Could not retrieve attendance status.');
    }
}

/**
 * Register a check-in
 * @param {number} employeeId - Employee ID
 * @returns {Promise<number>} Created attendance ID
 */
export async function checkIn(employeeId) {
    if (!employeeId) {
        throw new Error('Employee ID is required');
    }

    try {
        // Check if there's already an open attendance
        const openAttendance = await getCurrentAttendance(employeeId);
        if (openAttendance) {
            throw new Error('You already have an active check-in. Please check out first.');
        }

        // Create new attendance record
        const attendanceId = await odooApi.create('hr.attendance', {
            employee_id: employeeId,
            check_in: new Date().toISOString().replace('T', ' ').substring(0, 19),
        });

        return attendanceId;
    } catch (error) {
        console.error('Error during check-in:', error);
        throw error;
    }
}

/**
 * Register a check-out
 * @param {number} attendanceId - Attendance record ID
 * @returns {Promise<boolean>} Success status
 */
export async function checkOut(attendanceId) {
    if (!attendanceId) {
        throw new Error('Attendance ID is required');
    }

    try {
        await odooApi.write('hr.attendance', [attendanceId], {
            check_out: new Date().toISOString().replace('T', ' ').substring(0, 19),
        });

        return true;
    } catch (error) {
        console.error('Error during check-out:', error);
        throw new Error('Could not register check-out. Please try again.');
    }
}

/**
 * Get attendance history for an employee
 * @param {number} employeeId - Employee ID
 * @param {number} limit - Max records to fetch
 * @param {Object} dateFilter - Optional date filter { from, to }
 * @returns {Promise<Array>} List of attendance records
 */
export async function getAttendanceHistory(employeeId, limit = 50, dateFilter = null) {
    if (!employeeId) {
        throw new Error('Employee ID is required');
    }

    try {
        let domain = [['employee_id', '=', employeeId]];

        // Add date filters if provided
        if (dateFilter) {
            if (dateFilter.from) {
                domain.push(['check_in', '>=', dateFilter.from]);
            }
            if (dateFilter.to) {
                domain.push(['check_in', '<=', dateFilter.to]);
            }
        }

        const attendances = await odooApi.searchRead(
            'hr.attendance',
            domain,
            ['id', 'check_in', 'check_out', 'worked_hours'],
            { limit, order: 'check_in desc' }
        );

        return attendances || [];
    } catch (error) {
        console.error('Error fetching attendance history:', error);
        throw new Error('Could not retrieve attendance history.');
    }
}

/**
 * Calculate weekly hours summary
 * @param {number} employeeId - Employee ID
 * @returns {Promise<Object>} Weekly summary with total hours
 */
export async function getWeeklySummary(employeeId) {
    if (!employeeId) {
        throw new Error('Employee ID is required');
    }

    try {
        // Get start of current week (Monday)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - daysToMonday);
        monday.setHours(0, 0, 0, 0);

        const weekStart = monday.toISOString().replace('T', ' ').substring(0, 19);

        const attendances = await odooApi.searchRead(
            'hr.attendance',
            [
                ['employee_id', '=', employeeId],
                ['check_in', '>=', weekStart],
            ],
            ['worked_hours', 'check_in', 'check_out'],
            { order: 'check_in asc' }
        );

        const totalHours = attendances.reduce((sum, att) => {
            return sum + (att.worked_hours || 0);
        }, 0);

        return {
            weekStart: monday.toISOString().substring(0, 10),
            totalHours: Math.round(totalHours * 100) / 100,
            recordCount: attendances.length,
            records: attendances,
        };
    } catch (error) {
        console.error('Error fetching weekly summary:', error);
        throw new Error('Could not retrieve weekly summary.');
    }
}

export default {
    getCurrentAttendance,
    checkIn,
    checkOut,
    getAttendanceHistory,
    getWeeklySummary,
};

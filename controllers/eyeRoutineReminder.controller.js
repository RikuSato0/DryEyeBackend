const eyeRoutineReminderRepo = require('../repositories/eyeroutinereminder.repository');
const {errorResponse, successResponse} = require("../utils/responseHandler");
const completionRepo = require('../repositories/eyeRoutineReminderCompletion.repository');
const moment = require('moment-timezone');

const {Types} = require("mongoose");
const ApiError = require("../utils/apiError");

class EyeRoutineReminderController {
    async saveReminder(req, res, next) {
        try {
            const {repeatReminder, time, instructions, type, startDate, endDate, timezone, title, selectedEye, isActive} = req.body;
            const userId = new Types.ObjectId(req.user.userId);
            const reminder = await eyeRoutineReminderRepo.saveRoutineReminder({ userId, repeatReminder, time, instructions, type, startDate, endDate, timezone, title, selectedEye, isActive });

            return successResponse(res, reminder, 'Eye Routine Reminder added successfully', 203, 200);
        } catch (err) {
            console.error('Error saving reminder:', err);
            return errorResponse(res, err.message, 400, err.messageCode);
        }
    }

    async getReminder(req, res, next) {
        try {
            const userId = req.user.userId;
            const {type, period, timezone: requestTz, date} = req.body;
            const filterType = (type && type !== 'all') ? type : undefined;
            const reminders = await eyeRoutineReminderRepo.getReminders(userId, filterType);

            // Lazy MISSED marking: yesterday and today's past times for this user/type
            for (const r of reminders) {
                if (type && type !== 'all' && r.type !== type) continue; // only requested type
                const tz = r.timezone;
                const nowTz = moment.tz(tz);
                const today = nowTz.format('YYYY-MM-DD');
                const yesterday = nowTz.clone().subtract(1, 'day').format('YYYY-MM-DD');

                // Bounds check with reminder start/end date in its timezone
                const startStr = moment.tz(r.startDate, tz).format('YYYY-MM-DD');
                const endStr = r.endDate ? moment.tz(r.endDate, tz).format('YYYY-MM-DD') : null;
                const inRange = (d) => (d >= startStr) && (!endStr || d <= endStr);

                // Yesterday missed
                const yDow = parseInt(nowTz.clone().subtract(1, 'day').format('E')); // 1..7
                const yMatches = (r.repeatReminder.includes(8) || r.repeatReminder.includes(yDow)) && inRange(yesterday);
                if (yMatches) {
                    await completionRepo.ensureMissedIfAbsent(r._id, r.userId, r.type, yesterday, r.time);
                }

                // Today missed if scheduled time already passed
                const tDow = parseInt(nowTz.format('E'));
                const tMatches = (r.repeatReminder.includes(8) || r.repeatReminder.includes(tDow)) && inRange(today);
                const nowTime = nowTz.format('HH:mm');
                if (tMatches && r.time < nowTime) {
                    await completionRepo.ensureMissedIfAbsent(r._id, r.userId, r.type, today, r.time);
                }
            }

            // Build response per period
            const outTz = requestTz || 'UTC';
            const result = [];
            const addItem = (r, dStr, status) => {
                // present time in requested timezone
                const scheduled = moment.tz(`${dStr} ${r.time}`, r.timezone).tz(outTz).format();
                result.push({
                    id: r._id,
                    type: r.type,
                    title: r.title,
                    instructions: r.instructions,
                    selectedEye: r.selectedEye,
                    repeatReminder: r.repeatReminder,
                    timezone: r.timezone,
                    time: scheduled,
                    startDate: moment(r.startDate).format('YYYY-MM-DD'),
                    endDate: r.endDate ? moment(r.endDate).format('YYYY-MM-DD') : null,
                    occurrenceDate: dStr,
                    status: status || null
                });
            };

            const nowReq = moment.tz(outTz);
            const todayReq = nowReq.format('YYYY-MM-DD');

            if (period === 'today') {
                for (const r of reminders) {
                    if (type && type !== 'all' && r.type !== type) continue;
                    const tz = r.timezone;
                    const nowTz = moment.tz(tz);
                    const dStr = nowTz.format('YYYY-MM-DD');
                    const startStr = moment.tz(r.startDate, tz).format('YYYY-MM-DD');
                    const endStr = r.endDate ? moment.tz(r.endDate, tz).format('YYYY-MM-DD') : null;
                    const inRange = (d) => (d >= startStr) && (!endStr || d <= endStr);
                    const dow = parseInt(nowTz.format('E'));
                    const active = (r.repeatReminder.includes(8) || r.repeatReminder.includes(dow)) && inRange(dStr);
                    if (!active) continue;
                    // check status for today
                    const doc = await completionRepo.findOne(r.userId, dStr, r.type, r.time);
                    let status = doc ? doc.status : null;
                    if (!status) {
                        const nowTime = nowTz.format('HH:mm');
                        status = r.time < nowTime ? 'MISSED' : 'PENDING';
                    }
                    addItem(r, dStr, status);
                }
                return successResponse(res, { reminders: result }, 'Eye Routine Reminder fetch successfully', 203, 200);
            }

            if (period === 'specific') {
                const requestedDate = date; // YYYY-MM-DD in requested tz
                if (!requestedDate) return successResponse(res, { reminders: [] }, 'Eye Routine Reminder fetch successfully', 203, 200);
                // Determine if requestedDate is past or future in requested tz
                const cmp = requestedDate.localeCompare(todayReq);
                for (const r of reminders) {
                    if (type && type !== 'all' && r.type !== type) continue;
                    const tz = r.timezone;
                    // Evaluate if reminder is active on that date in its timezone
                    const dTz = moment.tz(requestedDate, outTz).tz(tz);
                    const dStrTz = dTz.format('YYYY-MM-DD');
                    const dow = parseInt(dTz.format('E'));
                    const startStr = moment.tz(r.startDate, tz).format('YYYY-MM-DD');
                    const endStr = r.endDate ? moment.tz(r.endDate, tz).format('YYYY-MM-DD') : null;
                    const inRange = (d) => (d >= startStr) && (!endStr || d <= endStr);
                    const active = (r.repeatReminder.includes(8) || r.repeatReminder.includes(dow)) && inRange(dStrTz);
                    if (!active) continue;
                    let status = null;
                    if (cmp <= 0) {
                        // past or today -> show history status if exists, else MISSED
                        const doc = await completionRepo.findOne(r.userId, dStrTz, r.type, r.time);
                        status = doc ? doc.status : (requestedDate < todayReq ? 'MISSED' : 'PENDING');
                    }
                    addItem(r, dStrTz, status);
                }
                return successResponse(res, { reminders: result }, 'Eye Routine Reminder fetch successfully', 203, 200);
            }

            if (period === 'notification') {
                const upcoming = [];
                const history = [];
                for (const r of reminders) {
                    const tz = r.timezone;
                    const nowTz = moment.tz(tz);
                    const today = nowTz.format('YYYY-MM-DD');
                    const startStr = moment.tz(r.startDate, tz).format('YYYY-MM-DD');
                    const endStr = r.endDate ? moment.tz(r.endDate, tz).format('YYYY-MM-DD') : null;
                    const inRange = (d) => (d >= startStr) && (!endStr || d <= endStr);
                    const dowToday = parseInt(nowTz.format('E'));
                    if ((r.repeatReminder.includes(8) || r.repeatReminder.includes(dowToday)) && inRange(today)) {
                        const nowTime = nowTz.format('HH:mm');
                        if (r.time >= nowTime) addItem(r, today, 'UPCOMING'), upcoming.push(result.pop());
                    }
                    // last 2 days history
                    for (let i = 1; i <= 2; i++) {
                        const dTz = nowTz.clone().subtract(i, 'day');
                        const dStr = dTz.format('YYYY-MM-DD');
                        const dow = parseInt(dTz.format('E'));
                        if ((r.repeatReminder.includes(8) || r.repeatReminder.includes(dow)) && inRange(dStr)) {
                            const doc = await completionRepo.findOne(r.userId, dStr, r.type, r.time);
                            const status = doc ? doc.status : 'MISSED';
                            const idxBefore = result.length;
                            addItem(r, dStr, status);
                            history.push(result[idxBefore]);
                        }
                    }
                }
                return successResponse(res, { upcoming, history }, 'Eye Routine Reminder fetch successfully', 203, 200);
            }

            // default: return all reminders (no filtering)
            const data = reminders.map(r => ({
                ...r.toObject(),
                startDate: moment(r.startDate).format('YYYY-MM-DD'),
                endDate: r.endDate ? moment(r.endDate).format('YYYY-MM-DD') : null
            }));
            return successResponse(res, { reminders: data }, 'Eye Routine Reminder fetch successfully', 203, 200);
        } catch (err) {
            return errorResponse(res, err.message, 400, err.messageCode);
        }
    }

    async deleteReminder(req, res, next) {
        try {
            const userId = req.user.userId;
            const reminderId = req.params.id;

            await eyeRoutineReminderRepo.deleteReminder(userId, reminderId);
            await completionRepo.deleteMany(reminderId, userId);
            return successResponse(res, {}, 'Eye Routine Reminder deleted successfully', 203, 200);
        } catch (err) {
            return errorResponse(res, err.message, 400, err.messageCode);
        }
    }

    async updateCompleteStatus(req, res, next) {
        try {
            const userId = req.user.userId;
            const { id, occurrenceDate, scheduledTime, status } = req.body;
            if (!id || !occurrenceDate || !scheduledTime || !status) throw new ApiError(400, 'id, occurrenceDate, scheduledTime, status are required', 701);
            await completionRepo.upsertOccurrence(new Types.ObjectId(id), new Types.ObjectId(userId), undefined, occurrenceDate, scheduledTime, status);
            return successResponse(res, {}, 'Eye Routine Reminder updated successfully', 203, 200);
        } catch (err) {
            return errorResponse(res, err.message, 400, err.messageCode);
        }
    }
}

module.exports = new EyeRoutineReminderController();
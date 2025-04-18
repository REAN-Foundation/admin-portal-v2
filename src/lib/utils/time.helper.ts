import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';

///////////////////////////////////////////////////////////////////////////////

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);
dayjs.extend(weekOfYear);
dayjs.extend(dayOfYear);
dayjs.extend(weekday);
dayjs.extend(duration);
dayjs.extend(calendar);

//////////////////////////////////////////////////////////////////////////////////////////////////////

export const MINUTES_IN_HOUR = 60;
export const MINUTES_IN_DAY = 24 * MINUTES_IN_HOUR;
export const MINUTES_IN_WEEK = 7 * MINUTES_IN_DAY;
export const MINUTES_IN_MONTH = 30 * MINUTES_IN_DAY;
export const MINUTES_IN_YEAR = 365 * MINUTES_IN_DAY;
export const MINUTES_IN_QUARTER = 3 * MINUTES_IN_MONTH;

export enum DateStringFormat {
    YYYY_MM_DD = 'YYYY-MM-DD'
}

export enum LocaleIdentifier {
    EN_US = 'en-US',
    EN_GB = 'en-GB',
    FR_FR = 'fr-FR',
    DE_DE = 'de-DE',
    ES_ES = 'es-ES',
    HI_IN = 'hi-IN',
    JA_JP = 'ja-JP',
    ZH_CN = 'zh-CN',
    AR_SA = 'ar-SA',
    RU_RU = 'ru-RU',
}

export enum DurationType {
    Milisecond = 'Millisecond',
    Second     = 'Second',
    Minute     = 'Minute',
    Hour       = 'Hour',
    Day        = 'Day',
    Week       = 'Week',
    Month      = 'Month',
    Quarter    = 'Quarter',
    Year       = 'Year',
}

//////////////////////////////////////////////////////////////////////////////////////////////////////

export class TimeHelper {

    static timestamp = (date: Date): string => {
        return date.getTime().toString();
    };

    static getWeekday = (date: Date, short: boolean): string => {
        const idx = date.getDay();
        if (short) {
            const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
            return days[idx];
        }
        else {
            const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            return days[idx];
        }
    };

    static nowUtc(): Date {
        return dayjs.utc().toDate();
    }

    static startOfTodayUtc(): Date {
        return dayjs
            .utc()
            .startOf('day')
            .toDate();
    }

    static endOfTodayUtc(): Date {
        return dayjs
            .utc()
            .endOf('day')
            .toDate();
    }

    static startOfThisWeekUtc(): Date {
        return dayjs
            .utc()
            .startOf('week')
            .toDate();
    }

    static getWeekdayIndex(day: string): number {
        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const daysShort = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        let idx = days.indexOf(day);
        if (idx === -1) {
            idx = daysShort.indexOf(day);
        }
        return idx;
    }

    static sameTimeOfDayThisWeekUtc(day: string): Date {
        const idx = TimeHelper.getWeekdayIndex(day);
        if (idx === -1) {
            throw new Error(`Invalid day: ${day}`);
        }
        return dayjs
            .utc()
            .weekday(idx)
            .utc()
            .toDate();
    }

    static startOfDayThisWeekUtc(day: string): Date {
        const idx = TimeHelper.getWeekdayIndex(day);
        if (idx === -1) {
            throw new Error(`Invalid day: ${day}`);
        }
        const weekday = dayjs
            .utc()
            .weekday(idx)
            .startOf('day');

        const weekdayStr = weekday.format()
            .split('T')[0];

        const year = parseInt(weekdayStr.split('-')[0]);
        const month = parseInt(weekdayStr.split('-')[1]);
        const dt = parseInt(weekdayStr.split('-')[2]);

        const date = Date.UTC(year, month - 1, dt);
        return new Date(date);
    }

    static startOfThisMonthUtc(): Date {
        return dayjs
            .utc()
            .startOf('month')
            .toDate();
    }

    static startOfThisYearUtc(): Date {
        return dayjs
            .utc()
            .startOf('year')
            .toDate();
    }

    static getStartOfDay = (date: Date, timezoneOffsetMinutes: number) => {
        const startOfDayUtc = dayjs(date)
            .utc()
            .startOf('day');
        const startOfDay = startOfDayUtc
            .add(timezoneOffsetMinutes, 'minutes')
            .toDate();
        return startOfDay;
    };

    static getDayOfMonth = (date: Date): string => {
        const tokens = date.toISOString().split('T')[0];
        const day = tokens[0].split('-')[1];
        return day;
    };

    static getDayOfMonthFromISODateStr = (dateStr: string): string => {
        const day = dateStr.split('-')[2];
        return day;
    };

    static getMonth = (date: Date): string => {
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        const month = months[ date.getMonth() ];
        return month;
    };

    static getDateString = (date: Date, format: DateStringFormat): string => {

        if (format === DateStringFormat.YYYY_MM_DD) {
            return date.toISOString().split('T')[0];
        }
        return date.toISOString().split('T')[0];
    };

    static addDuration = (date: Date, durationValue: number, durationType: DurationType, utc = false): Date => {

        const date_ = utc === true ? dayjs(date).utc() : dayjs(date);
        let newDate_ = date_;

        if (durationType === DurationType.Milisecond) {
            newDate_ = date_.add(durationValue, 'milliseconds');
        }
        if (durationType === DurationType.Second) {
            newDate_ = date_.add(durationValue, 'seconds');
        }
        if (durationType === DurationType.Minute) {
            newDate_ = date_.add(durationValue, 'minutes');
        }
        if (durationType === DurationType.Hour) {
            newDate_ = date_.add(durationValue, 'hours');
        }
        if (durationType === DurationType.Day) {
            newDate_ = date_.add(durationValue, 'days');
        }
        if (durationType === DurationType.Week) {
            newDate_ = date_.add(durationValue, 'weeks');
        }
        if (durationType === DurationType.Month) {
            newDate_ = date_.add(durationValue, 'months');
        }
        if (durationType === DurationType.Year) {
            newDate_ = date_.add(durationValue, 'years');
        }

        const str = newDate_.format();
        return new Date(str);
    };

    static subtractDuration = (date: Date, durationValue: number, durationType: DurationType, utc = false): Date => {

        const date_ = utc === true ? dayjs(date).utc() : dayjs(date);
        let newDate_ = dayjs().utc();

        if (durationType === DurationType.Milisecond) {
            newDate_ = date_.subtract(durationValue, 'milliseconds');
        }
        if (durationType === DurationType.Second) {
            newDate_ = date_.subtract(durationValue, 'seconds');
        }
        if (durationType === DurationType.Minute) {
            newDate_ = date_.subtract(durationValue, 'minutes');
        }
        if (durationType === DurationType.Hour) {
            newDate_ = date_.subtract(durationValue, 'hours');
        }
        if (durationType === DurationType.Day) {
            newDate_ = date_.subtract(durationValue, 'days');
        }
        if (durationType === DurationType.Week) {
            newDate_ = date_.subtract(durationValue, 'weeks');
        }
        if (durationType === DurationType.Month) {
            newDate_ = date_.subtract(durationValue, 'months');
        }
        if (durationType === DurationType.Year) {
            newDate_ = date_.subtract(durationValue, 'years');
        }

        const str = newDate_.format();
        return new Date(str);
    };

    static isBefore = (first: Date, second: Date): boolean => {
        return dayjs(first).isBefore(dayjs(second));
    };

    static isAfter = (first: Date, second: Date): boolean => {
        return dayjs(first).isAfter(dayjs(second));
    };

    static durationFromString = (str: string, durationType: DurationType): number => {

        let durationInHours = 0;
        const tokens = str.toLowerCase().split(":");

        for (let i = 0; i < tokens.length; i++) {

            let x = tokens[i];

            if (x.includes("h")) {
                x = x.replace("h", "");
                const hours = parseInt(x);
                durationInHours += hours;
            }
            if (x.includes("d")) {
                x = x.replace("d", "");
                const days = parseInt(x);
                durationInHours += (days * 24);
            }
            if (x.includes("w")) {
                x = x.replace("w", "");
                const weeks = parseInt(x);
                durationInHours += (weeks * 24 * 7);
            }
            if (x.includes("m")) {
                x = x.replace("m", "");
                const months = parseInt(x);
                durationInHours += (months * 24 * 30);
            }
        }

        if (durationType === DurationType.Milisecond) {
            return durationInHours * 60 * 60 * 1000;
        }
        if (durationType === DurationType.Second) {
            return durationInHours * 60 * 60;
        }
        if (durationType === DurationType.Minute) {
            return durationInHours * 60;
        }
        if (durationType === DurationType.Hour) {
            return durationInHours;
        }
        if (durationType === DurationType.Day) {
            return durationInHours / 24.0;
        }
        if (durationType === DurationType.Week) {
            return durationInHours / (24.0 * 7);
        }
        if (durationType === DurationType.Month) {
            return durationInHours / (24.0 * 30);
        }
        if (durationType === DurationType.Year) {
            return durationInHours / (24.0 * 365);
        }
        return durationInHours;
    };

    static getTimezoneOffsets = (timezoneOffsetStr: string, durationType: DurationType): number => {

        let offsetTmp = timezoneOffsetStr;
        let offsetMinutes = 0;

        if (timezoneOffsetStr.includes('+')) {
            offsetTmp = offsetTmp.replace('+', '-');
        }
        else if (!timezoneOffsetStr.includes('-')) {
            offsetTmp = offsetTmp.replace(' ', '');
            offsetTmp = '-' + offsetTmp;
        }
        else if (timezoneOffsetStr.includes('-')) {
            offsetTmp = offsetTmp.replace('-', '+');
        }

        if (timezoneOffsetStr.includes(':')) {
            const tokens = offsetTmp.split(":");
            const offset_hours = parseInt(tokens[0]);
            let offset_minutes = parseInt(tokens[1]);
            if (offset_hours < 0) {
                offset_minutes = -1 * offset_minutes;
            }
            offsetMinutes = (offset_hours * 60) + offset_minutes;
        }
        else {
            const len = offsetTmp.length;
            const min = offsetTmp.substring(len - 2, len);
            const hr = offsetTmp.substring(0, len - 2);
            const offset_hours = parseInt(hr);
            let offset_minutes = parseInt(min);
            if (offset_hours < 0) {
                offset_minutes = -1 * offset_minutes;
            }
            offsetMinutes = (offset_hours * 60) + offset_minutes;
        }

        if (durationType === DurationType.Milisecond) {
            return offsetMinutes * 60 * 1000;
        }
        if (durationType === DurationType.Second) {
            return offsetMinutes * 60 ;
        }
        if (durationType === DurationType.Minute) {
            return offsetMinutes;
        }
        if (durationType === DurationType.Hour) {
            return offsetMinutes / 60.0;
        }
        if (durationType === DurationType.Day) {
            return offsetMinutes / (24.0 * 60);
        }
        if (durationType === DurationType.Week) {
            return offsetMinutes / (24.0 * 60 * 7);
        }
        if (durationType === DurationType.Month) {
            return offsetMinutes / (24.0 * 60 * 30);
        }
        if (durationType === DurationType.Year) {
            return offsetMinutes / (24.0 * 60 * 365);
        }
        return offsetMinutes;
    };

    static getTimezoneOffset = (timezoneOffsetStr: string, durationType: DurationType): number => {
        let offsetMinutes = 0;
    
        const offsetTmp = timezoneOffsetStr.trim();

        if (offsetTmp.includes(':')) {
            const tokens = offsetTmp.split(":");
            const offsetHours = parseInt(tokens[0]);
            let offsetMins = parseInt(tokens[1]);

            if (offsetHours < 0) {
                offsetMins = -Math.abs(offsetMins);
            }
    
            offsetMinutes = offsetHours * 60 + offsetMins;
        }
        else {
            const len = offsetTmp.length;
   
            const offsetHours = parseInt(offsetTmp.slice(0, len - 2));
            let offsetMins = parseInt(offsetTmp.slice(len - 2));
    
            if (offsetHours < 0) {
                offsetMins = -Math.abs(offsetMins);
            }
    
            offsetMinutes = offsetHours * 60 + offsetMins;
        }
    
        switch (durationType) {
            case DurationType.Milisecond:
                return offsetMinutes * 60 * 1000;
            case DurationType.Second:
                return offsetMinutes * 60;
            case DurationType.Minute:
                return offsetMinutes;
            case DurationType.Hour:
                return offsetMinutes / 60.0;
            case DurationType.Day:
                return offsetMinutes / (24.0 * 60);
            case DurationType.Week:
                return offsetMinutes / (24.0 * 60 * 7);
            case DurationType.Month:
                return offsetMinutes / (24.0 * 60 * 30);
            case DurationType.Year:
                return offsetMinutes / (24.0 * 60 * 365);
            default:
                return offsetMinutes;
        }
    };

    static strToUtc = (dateStr: string, timeZoneOffsetMinutes?: number): Date => {

        if (timeZoneOffsetMinutes !== undefined) {
            const d = new Date(dateStr + 'T00:00:00.000Z').getTime();
            const correction = d + (timeZoneOffsetMinutes * 60000);
            const corrected = (new Date()).setTime(correction);
            return new Date(corrected);
        }
        else {
            const d = new Date(dateStr + 'T00:00:00.000Z').getTime();
            const corrected = (new Date()).setTime(d);
            return new Date(corrected);
        }
    };

    static format = (date: Date, formatTemplate: string): string => {
        return dayjs(date).format(formatTemplate);
    };

    static startOf = (date: Date, durationType: DurationType): Date => {

        if (durationType === DurationType.Second) {
            return dayjs(date)
                .startOf('second')
                .toDate();
        }
        if (durationType === DurationType.Minute) {
            return dayjs(date)
                .startOf('minute')
                .toDate();
        }
        if (durationType === DurationType.Hour) {
            return dayjs(date)
                .startOf('hour')
                .toDate();
        }
        if (durationType === DurationType.Day) {
            return dayjs(date)
                .startOf('day')
                .toDate();
        }
        if (durationType === DurationType.Week) {
            return dayjs(date)
                .startOf('week')
                .toDate();
        }
        if (durationType === DurationType.Month) {
            return dayjs(date)
                .startOf('month')
                .toDate();
        }
        if (durationType === DurationType.Year) {
            return dayjs(date)
                .startOf('year')
                .toDate();
        }
        return date;
    };

    static endOf = (date: Date, durationType: DurationType): Date => {

        if (durationType === DurationType.Second) {
            return dayjs(date)
                .endOf('second')
                .toDate();
        }
        if (durationType === DurationType.Minute) {
            return dayjs(date)
                .endOf('minute')
                .toDate();
        }
        if (durationType === DurationType.Hour) {
            return dayjs(date)
                .endOf('hour')
                .toDate();
        }
        if (durationType === DurationType.Day) {
            return dayjs(date)
                .endOf('day')
                .toDate();
        }
        if (durationType === DurationType.Week) {
            return dayjs(date)
                .endOf('week')
                .toDate();
        }
        if (durationType === DurationType.Month) {
            return dayjs(date)
                .endOf('month')
                .toDate();
        }
        if (durationType === DurationType.Year) {
            return dayjs(date)
                .endOf('year')
                .toDate();
        }
        return date;
    };

    static daysInMonthContainingDate = (date: Date): number => {
        return dayjs(date).daysInMonth();
    };

    static getDateWithTimezone = (dateStr: string, timezoneOffset: string) => {
        const todayStr = dayjs.utc().format();
        const str = dateStr ? dateStr.split('T')[0] : todayStr.split('T')[0];
        const offsetMinutes = TimeHelper.getTimezoneOffsets(timezoneOffset, DurationType.Minute);
        return TimeHelper.strToUtc(str, offsetMinutes);
    };

    static dayDiff = (first: Date, second: Date|undefined) => {
        const diff = first.getTime() - second.getTime();
        const dayDiff = diff / (1000 * 60 * 60 * 24);
        return dayDiff;
    };

    static hourDiff = (first: Date, second: Date|undefined) => {
        const diff = first.getTime() - second.getTime();
        const hourDiff = diff / (1000 * 60 * 60);
        return hourDiff;
    };

    static minuteDiff = (first: Date, second: Date|undefined) => {
        const date1 = dayjs(first);
        const date2 = dayjs(second);
        const diffMillisec =  date1.diff(date2);
        const diff = diffMillisec / (1000 * 60);
        return diff;
    };

    static secDiff = (first: Date, second: Date|undefined) => {
        const date1 = dayjs(first);
        const date2 = dayjs(second);
        const diffMillisec =  date1.diff(date2);
        const diff = diffMillisec / (1000);
        return diff;
    };

    static formatDateToLocal_YYYY_MM_DD = (date : Date) => {
        // Logger.instance().log(`Date :: ${date}`);
        const mnth = ("0" + (date.getMonth() + 1)).slice(-2);
        const day = ("0" + date.getDate()).slice(-2);
        return [date.getFullYear(), mnth, day].join("-");
    };

    static formatDateToReadable(dateString: string, locale: LocaleIdentifier = LocaleIdentifier.EN_US): string {
        const date = new Date(dateString);
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: userTimeZone
        };
    
        return date.toLocaleDateString(locale, options);
    }
    

    static formatTimeTo_AM_PM(timeString) {
        const [hourString, minute] = timeString.split(":");
        const hour = +hourString % 24;
        return (hour % 12 || 12) + ":" + minute + (hour < 12 ? " AM" : " PM");
    }

    static timeDelay = ms => new Promise(res => setTimeout(res, ms));

    static getDateTimeStamp = (date: Date): string => {
        date = new Date(date.toISOString().split("T")[0]);
        return date.getTime().toString();
    };

    static isTimeZero(timestamp: string): boolean {
        const regex = /^(\d{4})-(\d{2})-(\d{2})T00:00:00/;
        const match = timestamp.match(regex);
        if (match) {
            const year = parseInt(match[1]);
            const month = parseInt(match[2]);
            const day = parseInt(match[3]);
            // Check if it's midnight
            return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31;
        }
        return false; // Invalid timestamp format
    }

        static addHours = (numOfHours: number, date = new Date()): Date => {
        date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
        return date;
    }

    static getYesterdayDate = (): string => {
        const today = new Date();
        today.setDate(today.getDate() - 1);
        return TimeHelper.getDateString(today, DateStringFormat.YYYY_MM_DD);
    };

}

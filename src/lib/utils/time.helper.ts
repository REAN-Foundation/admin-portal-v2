import {DateStringFormat} from '$lib/types/time.types'
export class TimeHelper {

    static addHours = (numOfHours: number, date = new Date()): Date => {
        date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
        return date;
    }

    static getDateString = (date: Date, format: DateStringFormat): string => {

        if (format === DateStringFormat.YYYY_MM_DD) {
            return date.toISOString().split('T')[0];
        }
        return date.toISOString().split('T')[0];
    };

    static getYesterdayDate = (): string => {
        const today = new Date();
        today.setDate(today.getDate() - 1);
        return TimeHelper.getDateString(today, DateStringFormat.YYYY_MM_DD);
    };
}

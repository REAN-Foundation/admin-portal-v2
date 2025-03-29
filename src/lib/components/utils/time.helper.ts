
export class TimeHelper {

    static addHours = (numOfHours: number, date = new Date()): Date => {
        date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
        return date;
    }
}

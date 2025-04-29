import type { RequestEvent } from '@sveltejs/kit';
import { serialize } from 'cookie';
import { TimeHelper } from './time.helper';

export class CookieUtils {

    // static setCookieHeader = (name: string, value: string, ageInHours: number) => {
    //     const date = TimeHelper.addHours(ageInHours);
    //     return serialize(name, value, {
    //         path: '/',
    //         httpOnly: true,
    //         sameSite: 'strict',
    //         secure: process.env.NODE_ENV === 'production',
    //         //maxAge: 60 * 60 * 24 * 7, // one week
    //         expires: date
    //     });
    // }

    // static removeCookieHeader = (name: string) => {
    //     return serialize(name, '', {
    //         path: '/',
    //         httpOnly: true,
    //         sameSite: 'strict',
    //         secure: process.env.NODE_ENV === 'production',
    //         //maxAge: 60 * 60 * 24 * 7, // one week
    //         expires: new Date('Thu, 01 Jan 1970 00:00:00 GMT')
    //     });
    // }

    static setCookieHeader = (
        event: RequestEvent,
        name: string,
        value: string,
        hours: number = 24 * 7) => {
        event.cookies.set(name, value, {
            maxAge: hours * 3600,
            expires: TimeHelper.addHours(hours),
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: false,
            path: '/'
        });
    }

    static removeCookieHeader = (event: RequestEvent, name: string) => {
        event.cookies.set(name, '', {
            expires: new Date('Thu, 01 Jan 1970 00:00:00 GMT'),
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: false,
            path: '/'
        });
    }


}

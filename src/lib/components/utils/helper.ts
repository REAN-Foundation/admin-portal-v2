export const MAX_ITEMS_PER_PAGE = 500;
export class Helper {

    static isEmail = (str: string): boolean => {

        const emailRegex = /^[-!#$%&'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
        if (!str)
            return false;

        if (str.length > 254)
            return false;

        const valid = emailRegex.test(str);
        if (!valid)
            return false;

        const parts = str.split("@");
        if (parts[0].length > 64)
            return false;

        const domainParts = parts[1].split(".");
        if (domainParts.some(function (part) { return part.length > 63; }))
            return false;

        return true;
    }

    static isOtp = (str: string): boolean => {
        if (str.length < 4 || str.length > 6) {
            return false;
        }
        for (let i = 0; i < str.length; i++) {
            const c = str[i];
            if (Helper.isDigit(c)) {
                continue;
            }
            else {
                return false;
            }
        }
        return true;
    }

    static isUrl = (str) => {
        if (!str) {
            return false;
        }
        try {
            new URL(str);
            return true;
        } catch (err) {
            return false;
        }
    }

    static formatDate = (date) => {
        const d = new Date(date);
        const month = ('00' + (d.getMonth() + 1).toString()).slice(-2);
        const day = ('00' + d.getDate().toString()).slice(-2);
        const year = d.getFullYear();
        return [year, month, day].join('-');
    };

    static isPhone = (str: string): boolean => {
        if (!str) {
            return false;
        }
        if (str.length < 6 || str.length > 11) {
            return false;
        }
        for (let i = 0; i < str.length; i++) {
            const c = str[i];
            if (Helper.isDigit(c) || c === '-') {
                continue;
            }
            else {
                return false;
            }
        }
        return true;
    }

    static isAlpha = (c) => {
        const alphas = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return alphas.indexOf(c) !== -1;
    };

    static isAlphaVowel = (c) => {
        const alphas = 'aeiouAEIOU';
        return alphas.indexOf(c) !== -1;
    };

    static isDigit = (c) => {
        const digits = '0123456789';
        return digits.indexOf(c) !== -1;
    };

    static isAlphaNum = (c) => {
        return Helper.isAlpha(c) || Helper.isDigit(c);
    };

    static hasAlpha = (str: string) => {
        for (const c of str) {
            if (Helper.isAlpha(c)) {
                return true;
            }
        }
        return false;
    };

}

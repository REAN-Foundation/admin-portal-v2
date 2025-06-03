import { error } from "@sveltejs/kit";
import chalk from "chalk";

export const post = async (
    url: string,
    bodyObj: string | any,
) => {
    try {
         const headers = {
            'Content-Type': 'application/json'
        };

        const body = JSON.stringify(bodyObj);
        console.log('body==>', body);

        const res = await fetch(url, {
            method: 'POST',
            body,
            headers
        });

        const response = await res.json();
        const message = response.Message;

        if (!res.ok) {
            if (res.status === 500) {
                throw error(500, { message: res.statusText });
            } else {
                console.log(chalk.red(`post_ response message: ${message}`));
                return response;
            }
        }
        console.log(chalk.green(`post_ response message: ${message}`));
        return response;
    } catch (err) {
        console.log(chalk.red(`post_ exception: ${err}`));
        throw error(500, { message: 'Internal Server Error' });
    }
};

export const get = async (url: string) => {
    try {
        // const headers = {
        //     'Content-Type': 'application/json'
        // };
        console.log('url in common', url);
        const res = await fetch(url);
        // {
        //     method: 'GET',
        //     headers
        // }
    // );

        const response = await res.json();
        console.log('response', response);
        const message = response.Message;

        if (!res.ok) {
            if (res.status === 500) {
                throw error(500, { message: res.statusText });
            } else {
                console.log(chalk.red(`get_ response message: ${message}`));
                return response;
            }
        }
        console.log(chalk.green(`get_ response message: ${message}`));
        return response;
    } catch (err) {
        console.log(chalk.red(`get_ exception: ${err}`));
        throw error(500, { message: 'Internal Server Error' });
    }
};

export const put = async (
    url: string,
    bodyObj: unknown,
) => {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        const body = JSON.stringify(bodyObj);
        console.log('Pre API call');
        console.log(bodyObj);

        const res = await fetch(url, {
            method: 'PUT',
            body,
            headers
        });

        const response = await res.json();
        console.log('Api called' + response);
        const message = response.Message;

        if (!res.ok) {
            if (res.status === 500) {
                throw error(500, { message: res.statusText });
            } else {
                console.log(chalk.red(`put_ response message: ${message}`));
                return response;
            }
        }
        console.log(chalk.green(`put_ response message: ${message}`));
        return response;
    } catch (err) {
        console.log(chalk.red(`put_ exception: ${err}`));
        throw error(500, { message: 'Internal Server Error' });
    }
};

export const delete_ = async (url: string) => {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };

        const res = await fetch(url, {
            method: 'DELETE',
            headers
        });

        const response = await res.json();
        console.log(response);
        const message = response.Message;

        if (!res.ok) {
            if (res.status === 500) {
                throw error(500, { message: res.statusText });
            } else {
                console.log(chalk.red(`delete_ response message: ${message}`));
                return response;
            }
        }
        console.log(chalk.green(`delete_ response message: ${message}`));
        return response;
    } catch (err) {
        console.log(chalk.red(`delete_ exception: ${err}`));
        throw error(500, { message: 'Internal Server Error' });
    }
};

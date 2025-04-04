export class ResponseHandler {
    static success(response: any): Response {
        return new Response(JSON.stringify(response), {
            status: response.HttpCode || 200, 
            headers: { 'Content-Type': 'application/json' },
        });
    }

    static handleError = (httpCode: number = 500,
        data?: any,
        error?: any): Response =>{
        console.error('Error:', error);

        return new Response(
            JSON.stringify({
                Status: 'failure',
                HttpCode: httpCode,
                Message: error instanceof Error ? error?.message : 'An error occurred while processing the request.',
                Data:data
            }),
            {
                status: httpCode,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}

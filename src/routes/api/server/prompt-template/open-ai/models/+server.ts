import { OPENAI_API_KEY, OPENAI_API_URL } from '$env/static/private';
import { json, type RequestEvent } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////////////

export async function GET(event: RequestEvent) {
    try {
        const sessionId = event.cookies.get('sessionId');
        
        if (!sessionId) {
            return json({
                Status: 'failure',
                HttpCode: 401,
                Message: 'Unauthorized'
            }, { status: 401 });
        }

        const openaiApiKey = OPENAI_API_KEY;
        const url = OPENAI_API_URL + `/models`
        
        if (!openaiApiKey) {
            console.error('OPENAI_API_KEY not found in environment variables');
            return json({
                Status: 'failure',
                HttpCode: 500,
                Message: 'OpenAI API key not configured'
            }, { status: 500 });
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();

        return json({
            Status: 'success',
            HttpCode: 200,
            Message: 'Models fetched successfully',
            Data: data
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching OpenAI models:', error);
        return json({
            Status: 'failure',
            HttpCode: 500,
            Message: error instanceof Error ? error.message : 'Failed to fetch models'
        }, { status: 500 });
    }
}
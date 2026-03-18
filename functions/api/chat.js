export async function onRequest(context) {
    const { request, env } = context;

    // Only allow POST requests
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const body = await request.json();

        // 1. Verify the Passkey
        if (body.passkey !== env.MY_SECRET_PASSKEY) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { 
                status: 401, 
                headers: { "Content-Type": "application/json" } 
            });
        }

        // 2. Forward the request to Azure DeepSeek
        // Note: Azure OpenAI uses 'api-key' in the header. Adjust if your specific DeepSeek endpoint requires 'Authorization: Bearer...'
        const azureResponse = await fetch(env.AZURE_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": env.AZURE_API_KEY
            },
            body: JSON.stringify({
                messages: body.messages,
                // Add any other parameters DeepSeek needs here (temperature, max_tokens, etc.)
            })
        });

        const azureData = await azureResponse.json();

        // 3. Return the response to the frontend
        return new Response(JSON.stringify(azureData), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

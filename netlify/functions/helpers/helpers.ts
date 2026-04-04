import type { HeadersToReturn, HeaderOptions, Cards, ErrorBodyTypes } from "../types/dataTypes";

// Retry function for external API requests
export const fetchWithRetry = async (url: string, options: RequestInit) => {
    for (let i = 0; i < 3; i++) {
        try {
            // Timeout controller
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);

            // attempts the actual request, sets result to response variable
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                // end attempt and skip to the next one
                throw new Error(`HTTP ${response.status}`);
            }

            // return when successful
            return response;

        } catch (err) {
            if (i === 2) {
                // if 3 attempts have been made, report error and end process
                throw err;
            }

            await new Promise(res => res);
        }
    }
    throw new Error("Request unsuccessful");
}

// Reusable function to populate response headers
export const getHeaders = (headerKeys: string[]) => {
    const headerOptions: HeaderOptions = {
        "allowOrigin": {
            key: "Access-Control-Allow-Origin",
            value: "*", // change to domain once finished testing and have one established
        },
        "allowHeaders": {
            key: "Access-Control-Allow-Headers",
            value: "Authorization, Content-Type"
        },
        "allowMethods": {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS"
        }
    }
    let headersToReturn: HeadersToReturn = {};
    headerKeys.forEach((headerKey: string) => {
        const { key, value } = headerOptions[headerKey];
        headersToReturn[key] = value;
    })
    return headersToReturn
}

// Reusable function to populate responses
export const responseObject = (statusCode: number, headerKeys: string[], body: Record<string, string | Cards | ErrorBodyTypes | unknown>) => {
    return {
        statusCode,
        headers: getHeaders(headerKeys),
        body: JSON.stringify(body)
    }
}
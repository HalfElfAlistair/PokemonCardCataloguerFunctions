export const fetchWithRetry = async (url: string, options: RequestInit) => {
    for (let i = 0; i < 3; i++) {
        try {
            // Timeout controller
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);

            // attempts the actual request sets result to response variable
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
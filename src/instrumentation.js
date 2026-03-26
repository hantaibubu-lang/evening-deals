export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { validateEnv } = await import('./lib/envCheck');
        validateEnv();
        await import('../sentry.server.config');
    }
    if (process.env.NEXT_RUNTIME === 'edge') {
        await import('../sentry.edge.config');
    }
}

export const onRequestError = async (err, request, context) => {
    const { captureRequestError } = await import('@sentry/nextjs');
    captureRequestError(err, request, context);
};

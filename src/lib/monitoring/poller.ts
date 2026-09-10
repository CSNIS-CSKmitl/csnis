import type { MonitoringProvider, NetworkSnapshot } from './types';
export function createPoller(provider: MonitoringProvider, handlers: {
    snapshot: (data: NetworkSnapshot) => void;
    error: (message: string) => void;
    busy: (value: boolean) => void;
}, interval = 5000) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    let paused = false, disposed = false, inFlight = false;
    const schedule = () => { if (!paused && !disposed)
        timer = setTimeout(() => void refresh(), interval); };
    async function refresh() {
        if (disposed || inFlight)
            return;
        clearTimeout(timer);
        inFlight = true;
        controller = new AbortController();
        handlers.busy(true);
        const timeout = setTimeout(() => controller?.abort(new Error('Monitoring request timed out.')), 10000);
        try {
            const data = await provider.getSnapshot(controller.signal);
            if (!disposed)
                handlers.snapshot(data);
        }
        catch (error) {
            if (!disposed)
                handlers.error(error instanceof Error ? error.message : 'Unable to refresh network data.');
        }
        finally {
            clearTimeout(timeout);
            inFlight = false;
            if (!disposed) {
                handlers.busy(false);
                schedule();
            }
        }
    }
    return { refresh, setPaused(value: boolean) { paused = value; clearTimeout(timer); if (!paused && !inFlight)
            void refresh(); }, dispose() { disposed = true; clearTimeout(timer); controller?.abort(); } };
}

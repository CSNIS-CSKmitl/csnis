import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
	id: string;
	type: ToastType;
	message: string;
	duration: number;
}

const DEFAULT_DURATION = 3200;

function createToastStore() {
	const { subscribe, update } = writable<ToastItem[]>([]);
	const timers = new Map<string, ReturnType<typeof setTimeout>>();

	function dismiss(id: string) {
		const timer = timers.get(id);
		if (timer) {
			clearTimeout(timer);
			timers.delete(id);
		}
		update((items) => items.filter((item) => item.id !== id));
	}

	function push(type: ToastType, message: string, duration = DEFAULT_DURATION): string {
		const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const item: ToastItem = { id, type, message, duration };

		update((items) => [...items.slice(-4), item]);

		if (duration > 0) {
			const timer = setTimeout(() => {
				dismiss(id);
			}, duration);
			timers.set(id, timer);
		}

		return id;
	}

	return {
		subscribe,
		dismiss,
		success: (message: string, duration?: number) => push('success', message, duration),
		error: (message: string, duration?: number) => push('error', message, duration),
		info: (message: string, duration?: number) => push('info', message, duration)
	};
}

export const toasts = createToastStore();
export const toast = {
	success: toasts.success,
	error: toasts.error,
	info: toasts.info,
	dismiss: toasts.dismiss
};

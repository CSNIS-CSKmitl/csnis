export interface Service {
    id: string;
    name: string;
    icon: 'terminal' | 'printer' | 'calendar';
    repository: string;
}
export const services: Service[] = [
    {
        id: 'init-d',
        name: 'init.d',
        icon: 'terminal',
        repository: 'https://init-d.cskmitl.com/',
    },
    {
        id: 'printer-server',
        name: 'Printer-server',
        icon: 'printer',
        repository: 'https://printer.cskmitl.com/',
    },
    {
        id: 'booking',
        name: 'Booking',
        icon: 'calendar',
        repository: 'https://booking.cskmitl.com/',
    },
];

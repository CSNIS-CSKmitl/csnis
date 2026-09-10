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
        repository: 'https://github.com/CSNIS-CSKmitl/init.d',
    },
    {
        id: 'printer-server',
        name: 'Printer-server',
        icon: 'printer',
        repository: 'https://github.com/CSNIS-CSKmitl/Printer-server',
    },
    {
        id: 'booking',
        name: 'Booking',
        icon: 'calendar',
        repository: 'https://github.com/CSNIS-CSKmitl/Booking',
    },
];

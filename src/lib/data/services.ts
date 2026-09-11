export interface Service {
    id: string;
    name: string;
    category: string;
    shortDesc: string;
    about: string;
    highlights: string[];
    icon: 'terminal' | 'printer' | 'calendar';
    repository: string;
    status: string;
}

export const services: Service[] = [
    {
        id: 'init-d',
        name: 'init.d',
        category: 'Infrastructure & Cloud Provisioning',
        shortDesc: 'ระบบยื่นคำขอและบริหารจัดการ Virtual Machine & Container สำหรับโครงงาน',
        about: 'แพลตฟอร์มส่วนกลางสำหรับนักศึกษาและคณาจารย์ภาควิชาวิทยาการคอมพิวเตอร์ (CS KMITL) เพื่อยื่นขอและบริหารจัดการ Virtual Machines (VMs) และ LXC Containers สำหรับใช้งานในโปรเจกต์การเรียนการสอน งานวิจัย และการทดสอบระบบ',
        highlights: [
            'ขอเครื่อง VM และ LXC Container ได้สะดวกรวดเร็ว',
            'ปรับแต่งทรัพยากร CPU, RAM, Disk, Port และ Subdomain ได้ตามต้องการ',
            'ระบบตรวจสอบสถานะคำขอ (Request Tracking) และผลอนุมัติแบบ Real-time'
        ],
        icon: 'terminal',
        repository: 'https://init-d.cskmitl.com/',
        status: 'พร้อมให้บริการ'
    },
    {
        id: 'printer-server',
        name: 'Printer-server',
        category: 'Central Network Printing',
        shortDesc: 'ระบบสั่งพิมพ์งานส่วนกลางผ่านเครือข่ายสำหรับนักศึกษา CS KMITL',
        about: 'บริการเครื่องพิมพ์ส่วนกลางผ่านเครือข่ายของภาควิชาวิทยาการคอมพิวเตอร์ เพื่อให้นักศึกษา CS KMITL สั่งพิมพ์งานผ่าน Web Browser ได้ทันทีจากทุกอุปกรณ์ผ่าน Wi-Fi ภาควิชา โดยไม่ต้องติดตั้งไดรเวอร์เครื่องพิมพ์',
        highlights: [
            'โควตาพิมพ์เอกสารฟรี 500 หน้า / คน / ภาคการศึกษา',
            'สั่งพิมพ์ผ่าน Web Browser รองรับไฟล์ PDF และเอกสารทั่วไป',
            'เชื่อมต่อง่ายจากโน้ตบุ๊ก แท็บเล็ต หรือสมาร์ตโฟนผ่านเครือข่ายภาควิชา'
        ],
        icon: 'printer',
        repository: 'https://printer.cskmitl.com/',
        status: 'พร้อมให้บริการ'
    },
    {
        id: 'booking',
        name: 'Booking',
        category: 'Lab & Resource Reservation',
        shortDesc: 'ระบบจองห้องปฏิบัติการ ห้องประชุม และทรัพยากรส่วนกลางของภาควิชา',
        about: 'ระบบบริหารจัดการและจองทรัพยากรส่วนกลางของภาควิชา CS KMITL ช่วยให้อาจารย์ บุคลากร และนักศึกษาสามารถตรวจสอบตารางเวลาว่าง และส่งคำขอจองห้องแล็บคอมพิวเตอร์ ห้องประชุม ตลอดจนอุปกรณ์เพื่องานวิจัยและกิจกรรมทางวิชาการ',
        highlights: [
            'ตรวจสอบตารางเวลาและสถานะห้องว่างแบบ Real-time',
            'จองห้องปฏิบัติการคอมพิวเตอร์ ห้องประชุม และอุปกรณ์กิจกรรม',
            'ระบบยืนยันคำขอและจัดการสิทธิ์การใช้งานอย่างเป็นระเบียบ'
        ],
        icon: 'calendar',
        repository: 'https://booking.cskmitl.com/',
        status: 'พร้อมให้บริการ'
    },
];

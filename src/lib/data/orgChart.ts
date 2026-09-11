export interface OrgNode {
  id: string;
  name: string;
  role: string;
  department: string;
  category: 'executive' | 'network' | 'systems' | 'services' | 'retired';
  badge: string;
  email: string;
  room: string;
  avatar?: string;
  responsibilities: string[];
  skills?: string[];
  isRetired?: boolean;
  retiredYear?: string;
  honoraryTitle?: string;
  children?: OrgNode[];
}

export interface OrgChartData {
  chart: OrgNode;
  retiredMembers: OrgNode[];
  lastUpdated?: string;
}

export const initialRetiredMembers: OrgNode[] = [
  {
    id: 'ret-advisor-1',
    name: 'รศ.ดร. ที่ปรึกษากิตติมศักดิ์',
    role: 'Emeritus Professor & Founding Advisor',
    department: 'Advisory Council',
    category: 'retired',
    badge: 'เกษียณอายุราชการ',
    email: 'emeritus-advisor@cskmitl.com',
    room: 'ห้องเกียรติยศ ภาควิชาวิทยาการคอมพิวเตอร์',
    isRetired: true,
    retiredYear: '2566 (2023)',
    honoraryTitle: 'ผู้ร่วมก่อตั้งโครงสร้างพื้นฐาน CSNIS',
    responsibilities: [
      'วางรากฐานนโยบายเครือข่ายและการให้บริการระบบสารสนเทศภาควิชา CS KMITL',
      'ริเริ่มโครงการศูนย์คอมพิวเตอร์และเซิร์ฟเวอร์ภาควิชาห้อง 713',
      'ที่ปรึกษาอาวุโสด้านความมั่นคงปลอดภัยไซเบอร์และจริยธรรมคอมพิวเตอร์'
    ],
    skills: ['Founding Architecture', 'IT Governance', 'Academic Oversight']
  },
  {
    id: 'ret-network-lead',
    name: 'อาจารย์อาวุโสด้านโครงสร้างเครือข่าย',
    role: 'Former Network Operations Director',
    department: 'Network & Security Division',
    category: 'retired',
    badge: 'เกษียณอายุราชการ',
    email: 'emeritus-network@cskmitl.com',
    room: 'พระจอมเกล้า 713',
    isRetired: true,
    retiredYear: '2565 (2022)',
    honoraryTitle: 'ผู้ออกแบบระบบ Core Fiber Optic',
    responsibilities: [
      'ออกแบบระบบสายเคเบิลใยแก้วนำแสง (Core Fiber Backbone) เชื่อมต่อห้องปฏิบัติการ',
      'วางระบบ L3 Core Switches และ VLAN แบ่งแยกทราฟฟิกเครือข่ายนักศึกษา',
      'ถ่ายทอดองค์ความรู้และฝึกอบรมทีมวิศวกรเครือข่ายรุ่นใหม่'
    ],
    skills: ['Optical Network', 'L3 Switching', 'Disaster Recovery Plan']
  },
  {
    id: 'ret-alumni-systems',
    name: 'อดีตหัวหน้าทีมวิศวกรรมคลาวด์',
    role: 'Former Cloud Systems Architect (Alumni Lead)',
    department: 'Systems & Virtualization Division',
    category: 'retired',
    badge: 'ศิษย์เก่า / Former Lead',
    email: 'alumni-syslead@cskmitl.com',
    room: 'ทำเนียบศิษย์เก่า CS KMITL',
    isRetired: true,
    retiredYear: '2567 (2024)',
    honoraryTitle: 'ผู้ริเริ่มแพลตฟอร์ม Proxmox & init.d',
    responsibilities: [
      'บุกเบิกระบบ Virtualization ด้วย Proxmox VE สำหรับโครงงานนักศึกษา',
      'พัฒนาสถาปัตยกรรมต้นแบบของระบบขอเครื่อง VM (init.d)',
      'สนับสนุนกิจกรรม Open Source และเซิร์ฟเวอร์ทดสอบการเรียนการสอน'
    ],
    skills: ['Proxmox Cluster', 'init.d Architecture', 'Linux Kernel', 'Ceph Storage']
  }
];

export const initialOrgChart: OrgNode = {
  id: 'exec-head',
  name: 'คณะกรรมการและอาจารย์ที่ปรึกษา',
  role: 'Faculty Advisor & Head of CSNIS',
  department: 'Executive Board',
  category: 'executive',
  badge: 'ฝ่ายบริหาร',
  email: 'csnis-advisors@cskmitl.com',
  room: 'ห้อง 713 อาคารพระจอมเกล้า (ECC)',
  isRetired: false,
  responsibilities: [
    'กำหนดทิศทางและนโยบายด้านระบบเครือข่ายและโครงสร้างพื้นฐานภาควิชา',
    'กำกับดูแลมาตรฐานความปลอดภัยและการเข้าถึงทรัพยากรคอมพิวเตอร์',
    'จัดสรรงบประมาณและการประสานงานกับสำนักบริการคอมพิวเตอร์ สจล.'
  ],
  skills: ['Infrastructure Policy', 'Strategic Planning', 'Resource Allocation'],
  children: [
    {
      id: 'div-network',
      name: 'หัวหน้าฝ่ายระบบเครือข่ายและความปลอดภัย',
      role: 'Network Operations Lead',
      department: 'Network & Security Division',
      category: 'network',
      badge: 'Core Network',
      email: 'network-lead@cskmitl.com',
      room: 'Server Room 713',
      isRetired: false,
      responsibilities: [
        'ควบคุมดูแล Edge Firewall (OPNsense) และ Core Routing ทั้งหมด',
        'วางแผนและแบ่งส่วนเครือข่าย (VLAN / Subnet Architecture)',
        'บริหารจัดการระบบกระจายสัญญาณ Wi-Fi 6 ในพื้นที่ภาควิชา'
      ],
      skills: ['OPNsense / pfSense', 'D-Link Smart Switches', 'VLAN / L3 Routing', 'Wi-Fi 6'],
      children: [
        {
          id: 'net-infra-eng',
          name: 'วิศวกรโครงสร้างเครือข่ายฮาร์ดแวร์',
          role: 'Network Infrastructure Engineer',
          department: 'Network & Security Division',
          category: 'network',
          badge: 'Hardware & Cable',
          email: 'net-hardware@cskmitl.com',
          room: 'Server Room 713',
          isRetired: false,
          responsibilities: [
            'ติดตั้ง จัดการ และตรวจสอบสถานะ Switch และ Access Points',
            'ดูแลการเชื่อมต่อสายสัญญาณไฟเบอร์ออปติกและสาย LAN ภายในตู้ Rack',
            'บำรุงรักษาระบบไฟสำรอง (UPS) และสิ่งอำนวยความสะดวกในห้องเซิร์ฟเวอร์'
          ],
          skills: ['Rack Management', 'Fiber Optic', 'Switch Stacking', 'UPS Monitoring']
        },
        {
          id: 'net-sec-monitoring',
          name: 'ผู้เชี่ยวชาญด้านความปลอดภัยและมอนิเตอร์',
          role: 'Security & Monitoring Specialist',
          department: 'Network & Security Division',
          category: 'network',
          badge: 'Security & NetOps',
          email: 'net-security@cskmitl.com',
          room: 'ห้อง 713',
          isRetired: false,
          responsibilities: [
            'วิเคราะห์ Network Traffic, Log และป้องกันการโจมตี (IDS/IPS)',
            'ดูแลระบบ Live Topology และ Real-time Device Telemetry',
            'บริหารจัดการ Port Security, Access Control Lists (ACLs) และ VPN'
          ],
          skills: ['Suricata IDS', 'NetFlow / sFlow', 'Grafana / Prometheus', 'WireGuard VPN']
        }
      ]
    },
    {
      id: 'div-systems',
      name: 'หัวหน้าฝ่ายระบบแม่ข่ายและคลาวด์',
      role: 'Systems & Cloud Infrastructure Lead',
      department: 'Systems & Virtualization Division',
      category: 'systems',
      badge: 'Cloud & VM',
      email: 'cloud-lead@cskmitl.com',
      room: 'Server Room 713',
      isRetired: false,
      responsibilities: [
        'บริหารจัดการ Proxmox VE Cluster และระบบเซิร์ฟเวอร์หลักของภาควิชา',
        'ออกแบบสถาปัตยกรรม High Availability (HA) และระบบกระจายโหลด',
        'ควบคุมนโยบายการสำรองข้อมูล (Backup) และแผนกู้คืนระบบฉุกเฉิน (Disaster Recovery)'
      ],
      skills: ['Proxmox VE', 'KVM / LXC Containers', 'High Availability', 'Ceph / ZFS Storage'],
      children: [
        {
          id: 'sys-provisioning',
          name: 'ผู้ดูแลระบบประมวลผล (init.d Backend)',
          role: 'Virtualization & Provisioning Admin',
          department: 'Systems & Virtualization Division',
          category: 'systems',
          badge: 'Compute Provisioning',
          email: 'initd-admin@cskmitl.com',
          room: 'ห้อง 713',
          isRetired: false,
          responsibilities: [
            'จัดสรรและอนุมัติทรัพยากร Virtual Machines สำหรับโปรเจกต์นักศึกษา',
            'บริหารจัดการ Linux Bridge, Network Tap และ SDN บนเซิร์ฟเวอร์',
            'ควบคุมขีดจำกัดทรัพยากร (Resource Quotas: CPU, RAM, Disk)'
          ],
          skills: ['Linux Kernel Tuning', 'Cloud-Init', 'Proxmox API', 'Resource Quotas']
        },
        {
          id: 'sys-storage-backup',
          name: 'วิศวกรระบบจัดเก็บข้อมูลและระบบปฏิบัติการ',
          role: 'Storage & OS Operations Specialist',
          department: 'Systems & Virtualization Division',
          category: 'systems',
          badge: 'Storage & OS',
          email: 'storage-ops@cskmitl.com',
          room: 'Server Room 713',
          isRetired: false,
          responsibilities: [
            'ดูแลระบบไฟล์เซิร์ฟเวอร์กลาง (NAS / NFS / ZFS Pools)',
            'จัดการอัปเดตความปลอดภัยระบบปฏิบัติการ Linux (Debian/Ubuntu Server)',
            'ตรวจสอบความถูกต้องของระบบสำรองข้อมูลอัตโนมัติประจำวัน'
          ],
          skills: ['ZFS / NFS Storage', 'Proxmox Backup Server', 'Debian Linux', 'Disaster Recovery']
        }
      ]
    },
    {
      id: 'div-services',
      name: 'หัวหน้าฝ่ายบริการดิจิทัลและแอปพลิเคชัน',
      role: 'Digital Services & Platform Lead',
      department: 'Digital Services Division',
      category: 'services',
      badge: 'Digital Services',
      email: 'services-lead@cskmitl.com',
      room: 'ห้อง 713',
      isRetired: false,
      responsibilities: [
        'บริหารจัดการแพลตฟอร์มบริการส่วนกลางของภาควิชา (init.d, Printer, Booking)',
        'พัฒนาระบบ CSNIS Portal และส่วนประสานงานผู้ใช้งาน (User Interface)',
        'จัดการระบบยืนยันตัวตนส่วนกลาง (SSO / LDAP / CS Account Authentication)'
      ],
      skills: ['Full-Stack Web', 'SvelteKit / TypeScript', 'Identity & Access (OAuth/LDAP)', 'API Gateway'],
      children: [
        {
          id: 'svc-printer-admin',
          name: 'ผู้ดูแลระบบการพิมพ์และเอกสารดิจิทัล',
          role: 'CS Print System Administrator',
          department: 'Digital Services Division',
          category: 'services',
          badge: 'Print Services',
          email: 'printer-support@cskmitl.com',
          room: 'ห้อง 713 / Print Room',
          isRetired: false,
          responsibilities: [
            'ควบคุมดูแล CUPS Print Server และระบบสั่งพิมพ์ผ่านเว็บ',
            'บริหารจัดการโควตาการพิมพ์ 500 แผ่น/คน และบัญชีนักศึกษา CS KMITL',
            'ตรวจเช็กสถานะกระดาษ หมึกพิมพ์ และการเชื่อมต่อเครือข่ายของเครื่องพิมพ์'
          ],
          skills: ['CUPS Print Server', 'Web Print UI', 'Quota Management', 'Hardware Maintenance']
        },
        {
          id: 'svc-booking-developer',
          name: 'นักพัฒนาระบบจองทรัพยากรและเว็บพอร์ทัล',
          role: 'Web Application & Booking Developer',
          department: 'Digital Services Division',
          category: 'services',
          badge: 'Booking & Portal',
          email: 'booking-dev@cskmitl.com',
          room: 'ห้อง 713',
          isRetired: false,
          responsibilities: [
            'พัฒนาระบบจองห้องปฏิบัติการคอมพิวเตอร์และอุปกรณ์การเรียนการสอน',
            'ปรับปรุงระบบแจ้งเตือนและปฏิทินเวลาว่างของห้องแล็บแบบ Real-time',
            'รวบรวมฟีดแบ็กจากผู้ใช้งานเพื่อนำมาพัฒนาฟีเจอร์ใหม่ๆ'
          ],
          skills: ['Svelte / React', 'Database Design (Postgres)', 'REST APIs', 'UI/UX Design']
        }
      ]
    }
  ]
};

export const defaultOrgChartData: OrgChartData = {
  chart: initialOrgChart,
  retiredMembers: initialRetiredMembers,
  lastUpdated: new Date().toISOString()
};

// Aliases for compatibility
export const csnisOrgChart = initialOrgChart;

// Utility functions for working with tree nodes
export function findNodeById(root: OrgNode, id: string): OrgNode | null {
  if (root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

export function findParentNode(root: OrgNode, childId: string): OrgNode | null {
  if (root.children) {
    for (const child of root.children) {
      if (child.id === childId) return root;
      const found = findParentNode(child, childId);
      if (found) return found;
    }
  }
  return null;
}

export function updateNodeInTree(root: OrgNode, updated: OrgNode): OrgNode {
  if (root.id === updated.id) {
    return { ...root, ...updated, children: updated.children ?? root.children };
  }
  if (root.children) {
    return {
      ...root,
      children: root.children.map((child) => updateNodeInTree(child, updated))
    };
  }
  return root;
}

export function deleteNodeFromTree(root: OrgNode, targetId: string): OrgNode {
  if (root.children) {
    return {
      ...root,
      children: root.children
        .filter((child) => child.id !== targetId)
        .map((child) => deleteNodeFromTree(child, targetId))
    };
  }
  return root;
}

export function addNodeToTree(root: OrgNode, parentId: string, newNode: OrgNode): OrgNode {
  if (root.id === parentId) {
    return {
      ...root,
      children: [...(root.children || []), newNode]
    };
  }
  if (root.children) {
    return {
      ...root,
      children: root.children.map((child) => addNodeToTree(child, parentId, newNode))
    };
  }
  return root;
}

export function flattenAllNodes(root: OrgNode): OrgNode[] {
  const result: OrgNode[] = [root];
  if (root.children) {
    for (const child of root.children) {
      result.push(...flattenAllNodes(child));
    }
  }
  return result;
}

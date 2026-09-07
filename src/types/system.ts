export interface SystemStats {
  cpu_usage: number;
  ram_used: number;
  ram_total: number;
  ram_usage_pct: number;
  disk_used: number;
  disk_total: number;
  disk_usage_pct: number;
  uptime: number;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu_usage: number;
  memory: number;
  disk_usage: number;
  status: string;
  parent_pid: number | null;
  exe_path: string;
}

export interface DiskNode {
  name: string;
  path: string;
  size: number;
  is_dir: boolean;
  children: DiskNode[] | null;
}

export interface NetworkInterface {
  name: string;
  ipv4: string;
  ipv6: string;
  mac: string;
  status: string;
}

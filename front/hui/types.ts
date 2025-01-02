// types.ts

export type ServerData = {
  active: boolean;
  status: {
    cpu_usage_percentage: number,
    total_memory_in_KB: number,
    used_memory_in_KB: number,
    total_disk_in_KB: number,
    used_disk_in_KB: number
  } | null
}

export type ServerWSResponse = {
  [id_server: number]: ServerData;
}


export type DrawerServerItem = {
  id_server: number;
  name: string;
}

export interface ServiceConfig{
  service_name: string
  period_sec: string
  type: string
  target? : string
  operator? : string
  url? : string
  method? : string
  desired_response? : string
}

export type ServerConfig = {
  id_server: number,
  name: string,
  ip: string,
  port: number,
  username: string,
  keyfile: string
}
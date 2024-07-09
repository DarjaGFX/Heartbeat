// types.ts

export interface ServiceData {
    timestamp: number;
    Active: boolean;
    latency?: number; // Optional field
  }
  
export interface ServiceDataSet {
    [serviceName: string]: ServiceData[];
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
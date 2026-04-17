import { BaseEntity } from "./interfaces/common/baseEntitiy";

export interface Route extends BaseEntity {
  name: string;
  clusterId: string;
  methods: string[];
  path: string;
}

export interface RouteConfigure {
  auth?: string;
  rateLimit?: string;
}

export interface RouteRequest {
  name: string;
  clusterId: string;
  methods: string[];
  path: string;
}

export interface RouteConfigureRequest {
  auth?: string;
  rateLimit?: string;
}

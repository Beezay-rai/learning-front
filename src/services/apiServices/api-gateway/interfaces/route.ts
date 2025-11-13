import { BaseEntity } from "./common/baseEntitiy";

export interface Route extends BaseEntity {
  name: string;
  clusterId: string;
  methods: string[];
  path: string;
}

export interface RouteRequest {
  name: string;
  clusterId: string;
  methods: string[];
  path: string;
}

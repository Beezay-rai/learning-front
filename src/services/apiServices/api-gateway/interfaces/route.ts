import { BaseEntity } from "./common/BaseEntitiy";

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

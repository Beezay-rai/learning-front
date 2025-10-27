export interface Route extends BaseEntity {
  name: string;
  clusterId: string;
  methods: string[];
  path: string;
  id: string;
}

export interface RouteRequest {
  name: string;
  clusterId: string;
  methods: string[];
  path: string;
}

import { BaseEntity } from "./common/BaseEntitiy";

export interface AddClusterDestination {
  name: string;
  destinationAddress: string;
}

export interface ClusterDestination extends BaseEntity {
  clusterId: string;
  name: string;
  destinationAddress: string;
}

export interface Cluster extends BaseEntity {
  name: string;
  clusterDestination: ClusterDestination[];
}

export interface ClusterRequest {
  name: string;
  clusterDestination: AddClusterDestination[];
}

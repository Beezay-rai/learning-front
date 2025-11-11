import { string } from "yup";
import { BaseEntity } from "./common/baseEntitiy";

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

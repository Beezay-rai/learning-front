import { string } from "yup";

export interface ClusterDestination {
  clusterId: string;
  name: string;
  destinationAddress: string;
  id: string;
  deleted_Status: boolean;
  deleted_date: string;
  deleted_By?: string | null;
  created_By?: string | null;
  created_date: string;
  updated_By?: string | null;
  updated_Date: string;
}

export interface Cluster {
  id: string;
  name: string;
  deleted_Status: boolean;
  deleted_date: string;
  deleted_By?: string | null;
  created_By?: string | null;
  created_date: string;
  updated_By?: string | null;
  updated_Date: string;
  clusterDestination: ClusterDestination[];
}

export interface AddClusterRequest {
  name: string;
  destinationAddress: Record<string, string>;
}

export interface BaseEntity {
  id: number;
  deleted_Status: boolean;
  deleted_date: string;
  deleted_By: string | null;
  created_By: string | null;
  created_date: string;
  updated_By: string | null;
  updated_Date: string;
}

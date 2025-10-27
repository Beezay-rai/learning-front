interface BaseEntity {
  id: number;
  deleted_Status: boolean;
  deleted_date: string; // ISO date string, use Date if parsed
  deleted_By: string | null;
  created_By: string | null;
  created_date: string; // ISO date string, use Date if parsed
  updated_By: string | null;
  updated_Date: string; // ISO date string, use Date if parsed
}

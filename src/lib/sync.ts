export interface ISyncLogMeta {
  entitiesFrom1C: number;
  entitiesCreated: number;
  entitiesUpdated: number;
  entitiesMarkedDeleted: number;
  entitiesIgnored: number;
}

export type SyncType =
  | "manufacturers"
  | "measurement-units"
  | "nomenclature"
  | "nomenclature-types"
  | "prices"
  | "stock";

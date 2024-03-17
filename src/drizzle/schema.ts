import type { AdapterAccount } from "@auth/core/adapters";
import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export type userRoleValues = "client" | "employee" | "admin";

export const userRole = pgEnum("user_role", ["client", "employee", "admin"]);

export const UserRoleMap = new Map<
  string,
  {
    label: string;
    value: userRoleValues;
  }
>([
  [
    "client",
    {
      label: "Клиент",
      value: "client",
    },
  ],
  [
    "employee",
    {
      label: "Сотрудник",
      value: "employee",
    },
  ],
  [
    "admin",
    {
      label: "Администратор",
      value: "admin",
    },
  ],
]);

export const users = pgTable("user", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  name: text("name"),
  phone: text("phone").unique(),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  role: userRole("role").default("client").notNull(),
  meta: json("meta"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const authToken = pgTable(
  "auth_token",
  {
    id: uuid("id").notNull().defaultRandom().primaryKey(),
    email: text("email"),
    phone: text("phone"),
    token: text("token").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (token) => ({
    unqEmail: unique().on(token.email, token.token),
    unqPhone: unique().on(token.phone, token.token),
  }),
);

export const measurementUnits = pgTable("measurement_unit", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  weight: real("weight"),
  numerator: real("numerator"),
  denominator: real("denominator"),
  nomenclatureId: uuid("nomenclature_id").references(() => nomenclatures.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  dataVersion: text("data_version"),
  deletionMark: boolean("deletion_mark").default(false).notNull(),
});

export const measurementUnitRelations = relations(
  measurementUnits,
  ({ one }) => {
    return {
      nomenclature: one(nomenclatures, {
        fields: [measurementUnits.nomenclatureId],
        references: [nomenclatures.id],
      }),
    };
  },
);

export const nomenclatureTypes = pgTable(
  "nomenclature_type",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    isFolder: boolean("is_folder").default(false).notNull(),
    parentId: uuid("parent_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    dataVersion: text("data_version"),
    deletionMark: boolean("deletion_mark").default(false).notNull(),
  },
  (nt) => {
    return {
      parentReference: foreignKey({
        columns: [nt.parentId],
        foreignColumns: [nt.id],
        name: "nomenclature_type_parent_id_fkey",
      }),
    };
  },
);

export const nomTypesRelations = relations(
  nomenclatureTypes,
  ({ one, many }) => {
    return {
      parent: one(nomenclatureTypes, {
        fields: [nomenclatureTypes.parentId],
        references: [nomenclatureTypes.id],
      }),
      children: many(nomenclatureTypes),
      nomenclatures: many(nomenclatures),
      measurementUnits: many(measurementUnits),
    };
  },
);

export const manufacturers = pgTable("manufacturer", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  dataVersion: text("data_version"),
  deletionMark: boolean("deletion_mark").default(false).notNull(),
});

export const manufacturerRelations = relations(manufacturers, ({ many }) => {
  return {
    nomenclatures: many(nomenclatures),
  };
});

export const nomenclatures = pgTable("nomenclature", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  isFolder: boolean("is_folder").default(false).notNull(),
  parentId: uuid("parent_id"),
  typeId: uuid("type_id").references(() => nomenclatureTypes.id),
  manufacturerId: uuid("manufacturer_id").references(() => manufacturers.id),
  baseUnitId: uuid("base_unit_id"),
  code: text("code"),
  isWeightGoods: boolean("is_weight_goods").default(false).notNull(),
  minimumWeight: real("minimum_weight"),
  price: integer("price"),
  priceDate: timestamp("price_date"),
  priceUpdatedAt: timestamp("price_updated_at"),
  stock: real("stock"),
  stockDate: timestamp("stock_date"),
  stockUpdatedAt: timestamp("stock_updated_at"),
  showOnSite: boolean("show_on_site").default(false).notNull(),
  minQuantityConsideredHigh: real("min_quantity_considered_high"),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  dataVersion: text("data_version"),
  deletionMark: boolean("deletion_mark").default(false).notNull(),
});

export const nomenclatureRelations = relations(
  nomenclatures,
  ({ one, many }) => {
    return {
      manufacturer: one(manufacturers, {
        fields: [nomenclatures.manufacturerId],
        references: [manufacturers.id],
      }),
      type: one(nomenclatureTypes, {
        fields: [nomenclatures.typeId],
        references: [nomenclatureTypes.id],
      }),
      measurementUnits: many(measurementUnits),
    };
  },
);

export const partners = pgTable("partner", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  isClient: boolean("is_client").default(false).notNull(),
  isSupplier: boolean("is_supplier").default(false).notNull(),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  dataVersion: text("data_version"),
  deletionMark: boolean("deletion_mark").default(false).notNull(),
});

export const syncLogs = pgTable("sync_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  metadata: json("metadata"),
  dataHash: text("data_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type NomenclatureTypeInsert = typeof nomenclatureTypes.$inferInsert;
export type NomenclatureInsert = typeof nomenclatures.$inferInsert;
export type ManufacturerInsert = typeof manufacturers.$inferInsert;
export type MeasurementUnitInsert = typeof measurementUnits.$inferInsert;
export type PartnerInsert = typeof partners.$inferInsert;
export type SyncLogInsert = typeof syncLogs.$inferInsert;
export type SyncLogSelect = typeof syncLogs.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;

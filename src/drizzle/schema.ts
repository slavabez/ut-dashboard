import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  json,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export type userRoleValues = "client" | "employee" | "manager" | "admin";

export const userRole = pgEnum("user_role", [
  "client",
  "employee",
  "manager",
  "admin",
]);

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
    "supervisor",
    {
      label: "Супервайзер",
      value: "manager",
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

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  stock: real("stock"),
  stockDate: timestamp("stock_date"),
  stockUpdatedAt: timestamp("stock_updated_at"),
  showOnSite: boolean("show_on_site").default(true).notNull(),
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
      prices: many(pricesToNomenclature),
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
  priceId: uuid("price_id").references(() => prices.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const prices = pgTable("price", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code"),
  currency: text("currency"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pricesRelations = relations(prices, ({ many }) => ({
  nomenclatureToPrices: many(pricesToNomenclature),
}));

export const pricesToNomenclature = pgTable(
  "price_to_nomenclature",
  {
    priceId: uuid("price_id")
      .notNull()
      .references(() => prices.id, {
        onDelete: "cascade",
      }),
    nomenclatureId: uuid("nomenclature_id")
      .notNull()
      .references(() => nomenclatures.id, {
        onDelete: "cascade",
      }),
    price: integer("price"),
    measureUnitId: uuid("measurement_unit_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => {
    return {
      pk: primaryKey({
        columns: [t.priceId, t.nomenclatureId],
      }),
    };
  },
);

export const pricesToNomenclatureRelations = relations(
  pricesToNomenclature,
  ({ one }) => ({
    price: one(prices, {
      fields: [pricesToNomenclature.priceId],
      references: [prices.id],
    }),
    nomenclature: one(nomenclatures, {
      fields: [pricesToNomenclature.nomenclatureId],
      references: [nomenclatures.id],
    }),
  }),
);

export type NomenclatureTypeInsert = typeof nomenclatureTypes.$inferInsert;
export type NomenclatureInsert = typeof nomenclatures.$inferInsert;
export type NomenclatureSelect = typeof nomenclatures.$inferSelect;
export type ManufacturerInsert = typeof manufacturers.$inferInsert;
export type MeasurementUnitInsert = typeof measurementUnits.$inferInsert;
export type PartnerInsert = typeof partners.$inferInsert;
export type SyncLogInsert = typeof syncLogs.$inferInsert;
export type SyncLogSelect = typeof syncLogs.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;
export type SettingsSelect = typeof siteSettings.$inferSelect;
export type PriceSelect = typeof prices.$inferSelect;
export type PriceInsert = typeof prices.$inferInsert;

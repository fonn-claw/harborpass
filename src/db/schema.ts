import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["staff", "manager", "guest"]);
export const slipStatusEnum = pgEnum("slip_status", [
  "available",
  "occupied",
  "departing_today",
  "maintenance",
]);
export const slipSizeEnum = pgEnum("slip_size", ["small", "medium", "large"]);
export const stayStatusEnum = pgEnum("stay_status", [
  "reserved",
  "checked_in",
  "checked_out",
]);
export const fuelTypeEnum = pgEnum("fuel_type", ["diesel", "gas"]);
export const amenityTypeEnum = pgEnum("amenity_type", [
  "shower",
  "fuel",
  "shore_power",
  "pump_out",
  "laundry",
]);

// Tables
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull(),
    phone: varchar("phone", { length: 20 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)]
);

export const slips = pgTable(
  "slips",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 10 }).notNull(),
    maxLoa: integer("max_loa").notNull(), // feet
    maxBeam: integer("max_beam").notNull(), // feet
    waterDepth: integer("water_depth").notNull(), // feet
    size: slipSizeEnum("size").notNull(),
    status: slipStatusEnum("status").default("available").notNull(),
    hasShorepower: boolean("has_shorepower").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("slips_name_idx").on(table.name)]
);

export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  vesselName: varchar("vessel_name", { length: 100 }).notNull(),
  vesselLoa: integer("vessel_loa").notNull(), // feet
  vesselBeam: integer("vessel_beam").notNull(), // feet
  vesselDraft: integer("vessel_draft").notNull(), // feet
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stays = pgTable("stays", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id")
    .references(() => guests.id)
    .notNull(),
  slipId: integer("slip_id").references(() => slips.id),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out"),
  expectedDeparture: timestamp("expected_departure").notNull(),
  status: stayStatusEnum("status").default("reserved").notNull(),
  gateCode: varchar("gate_code", { length: 6 }),
  wifiPassword: varchar("wifi_password", { length: 50 }),
  showerTokens: integer("shower_tokens").default(3).notNull(),
  showerTokensUsed: integer("shower_tokens_used").default(0).notNull(),
  nightlyRate: integer("nightly_rate").notNull(), // cents
  isPreBooked: boolean("is_pre_booked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const amenityUsage = pgTable("amenity_usage", {
  id: serial("id").primaryKey(),
  stayId: integer("stay_id")
    .references(() => stays.id)
    .notNull(),
  type: amenityTypeEnum("type").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 })
    .default("1")
    .notNull(),
  unitPrice: integer("unit_price").notNull(), // cents
  totalAmount: integer("total_amount").notNull(), // cents
  fuelType: fuelTypeEnum("fuel_type"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const charges = pgTable("charges", {
  id: serial("id").primaryKey(),
  stayId: integer("stay_id")
    .references(() => stays.id)
    .notNull(),
  description: varchar("description", { length: 200 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  amount: integer("amount").notNull(), // cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pricing = pgTable("pricing", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  rate: integer("rate").notNull(), // cents
  unit: varchar("unit", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({}) => ({}));

export const guestsRelations = relations(guests, ({ many }) => ({
  stays: many(stays),
}));

export const slipsRelations = relations(slips, ({ many }) => ({
  stays: many(stays),
}));

export const staysRelations = relations(stays, ({ one, many }) => ({
  guest: one(guests, {
    fields: [stays.guestId],
    references: [guests.id],
  }),
  slip: one(slips, {
    fields: [stays.slipId],
    references: [slips.id],
  }),
  amenityUsages: many(amenityUsage),
  charges: many(charges),
}));

export const amenityUsageRelations = relations(amenityUsage, ({ one }) => ({
  stay: one(stays, {
    fields: [amenityUsage.stayId],
    references: [stays.id],
  }),
}));

export const chargesRelations = relations(charges, ({ one }) => ({
  stay: one(stays, {
    fields: [charges.stayId],
    references: [stays.id],
  }),
}));

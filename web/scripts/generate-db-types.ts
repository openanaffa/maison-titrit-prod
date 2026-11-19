/**
 * Generates src/lib/supabase/database.types.ts from prisma/schema.postgres.prisma.
 *
 * Run from web/: `bun run db:types` (or from the repo root: `bun run db:types`).
 *
 * The Prisma schema is the single source of truth; the output follows the
 * Supabase `Database` shape (Row / Insert / Update / Relationships per table)
 * so createClient<Database> and the `Tables<>` helpers stay conventional.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, "..", "prisma", "schema.postgres.prisma");
const outPath = join(here, "..", "src", "lib", "supabase", "database.types.ts");

/** Prisma scalar -> TypeScript type as emitted by Supabase for Postgres. */
const scalars: Record<string, string> = {
	String: "string",
	Int: "number",
	Float: "number",
	BigInt: "number",
	Decimal: "number",
	Boolean: "boolean",
	DateTime: "string",
	Json: "Json",
	Bytes: "string",
};

type Field = {
	name: string;
	type: string;
	nullable: boolean;
	optionalOnInsert: boolean;
};

type Model = { name: string; fields: Field[] };

const schema = readFileSync(schemaPath, "utf8");
const models: Model[] = [];

for (const match of schema.matchAll(/model\s+(\w+)\s*\{([^}]*)\}/g)) {
	const name = match[1];
	const fields: Field[] = [];

	for (const raw of match[2].split("\n")) {
		const line = raw.trim();
		if (!line || line.startsWith("//")) continue;

		const field = line.match(/^(\w+)\s+(\w+)(\[\])?(\?)?(?:\s+(.*))?$/);
		if (!field) continue;

		const [, fieldName, prismaType, isArray, questionMark, attrs = ""] = field;
		if (isArray || !(prismaType in scalars)) continue; // relation field

		fields.push({
			name: fieldName,
			type: scalars[prismaType],
			nullable: Boolean(questionMark),
			// Prisma sets @default and @updatedAt values server-side, so Supabase
			// omits them from the required INSERT columns.
			optionalOnInsert: /@default\s*\(/.test(attrs) || /@updatedAt/.test(attrs),
		});
	}

	models.push({ name, fields });
}

if (models.length === 0) throw new Error(`No models found in ${schemaPath}`);

const nullable = (f: Field) => (f.nullable ? " | null" : "");
const rowFields = (f: Field) => `          ${f.name}: ${f.type}${nullable(f)}`;

const tables = models
	.map(({ name, fields }) => {
		const insert = fields
			.map(
				(f) =>
					`          ${f.name}${f.nullable || f.optionalOnInsert ? "?" : ""}: ${f.type}${nullable(f)}`,
			)
			.join("\n");
		const update = fields
			.map((f) => `          ${f.name}?: ${f.type}${nullable(f)}`)
			.join("\n");

		return `      ${name}: {\n        Row: {\n${fields.map(rowFields).join("\n")}\n        }\n        Insert: {\n${insert}\n        }\n        Update: {\n${update}\n        }\n        Relationships: []\n      }`;
	})
	.join("\n");

const output = `/**
 * GENERATED FILE — do not edit by hand.
 * Source: prisma/schema.postgres.prisma
 * Regenerate: bun run db:types  (from web/)
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
${tables}
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
`;

writeFileSync(outPath, output, "utf8");
console.log(
	`Generated ${outPath} from ${schemaPath} (${models.length} tables)`,
);

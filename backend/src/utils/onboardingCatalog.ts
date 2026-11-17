import { Types } from "mongoose";
import Profession, { IProfession } from "../models/professionModel";
import Interest, { IInterest } from "../models/interestModel";
import User from "../models/userModel";

interface CatalogDefinition {
  key: string;
  label: string;
  aliases?: string[];
}

export const DEFAULT_PROFESSIONS: CatalogDefinition[] = [
  { key: "investor", label: "Investor" },
  { key: "angel_investor", label: "Angel Investor" },
  { key: "venture_capitalist", label: "Venture Capitalist" },
  { key: "entrepreneur", label: "Entrepreneur" },
  { key: "startup_founder", label: "Startup Founder" },
  { key: "business_owner", label: "Business Owner" },
  { key: "co_founder", label: "Co-founder", aliases: ["cofounder", "co founder"] },
  { key: "business_executive", label: "Business Executive" },
  { key: "other", label: "Other" },
];

export const DEFAULT_INTERESTS: CatalogDefinition[] = [
  { key: "startup_investments", label: "Startup Investments" },
  { key: "funding_fundraising", label: "Funding and Fundraising", aliases: ["funding & fundraising"] },
  { key: "business_networking", label: "Business Networking" },
  { key: "startup_growth", label: "Startup Growth" },
  { key: "venture_capital", label: "Venture Capital" },
  { key: "mentorship", label: "Mentorship" },
  { key: "technology_innovation", label: "Technology and Innovation", aliases: ["technology & innovation"] },
  { key: "business_strategy", label: "Business Strategy" },
  { key: "market_research", label: "Market Research" },
  { key: "business_partnerships", label: "Business Partnerships" },
];

const normalizeKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s&/]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

const findDefinition = (
  definitions: CatalogDefinition[],
  input: string
): CatalogDefinition | undefined => {
  const key = normalizeKey(input);
  const label = input.trim().toLowerCase();

  return definitions.find(
    (definition) =>
      definition.key === key ||
      definition.label.toLowerCase() === label ||
      definition.aliases?.some((alias) => normalizeKey(alias) === key)
  );
};

export async function seedOnboardingCatalogs(): Promise<void> {
  await Promise.all([
    ...DEFAULT_PROFESSIONS.map((definition, index) =>
      Profession.updateOne(
        { key: definition.key },
        {
          $setOnInsert: {
            key: definition.key,
            label: definition.label,
            aliases: definition.aliases ?? [],
            isCustom: false,
            isActive: true,
            sortOrder: index,
          },
        },
        { upsert: true }
      )
    ),
    ...DEFAULT_INTERESTS.map((definition, index) =>
      Interest.updateOne(
        { key: definition.key },
        {
          $setOnInsert: {
            key: definition.key,
            label: definition.label,
            aliases: definition.aliases ?? [],
            isActive: true,
            sortOrder: index,
          },
        },
        { upsert: true }
      )
    ),
  ]);
}

export async function resolveProfession(
  input?: string
): Promise<IProfession | null> {
  const label = input?.trim();
  if (!label) return null;

  const definition = findDefinition(DEFAULT_PROFESSIONS, label);
  const key = definition?.key || `custom_${normalizeKey(label) || "profession"}`;
  const update = definition
    ? {
        $setOnInsert: {
          key,
          label: definition.label,
          aliases: definition.aliases ?? [],
          isCustom: false,
          isActive: true,
          sortOrder: DEFAULT_PROFESSIONS.indexOf(definition),
        },
      }
    : {
        $set: { label, isActive: true },
        $setOnInsert: {
          key,
          aliases: [],
          isCustom: true,
          sortOrder: DEFAULT_PROFESSIONS.length,
        },
      };

  const profession = await Profession.findOneAndUpdate({ key }, update, {
    new: true,
    upsert: true,
  }).lean();

  return profession as unknown as IProfession | null;
}

export async function resolveInterests(
  inputs: string[]
): Promise<IInterest[]> {
  const uniqueInputs = Array.from(
    new Set(inputs.map((input) => input.trim()).filter(Boolean))
  );

  const resolved = await Promise.all(
    uniqueInputs.map(async (input) => {
      const definition = findDefinition(DEFAULT_INTERESTS, input);
      const key =
        definition?.key || `custom_${normalizeKey(input) || "interest"}`;
      const update = definition
        ? {
            $setOnInsert: {
              key,
              label: definition.label,
              aliases: definition.aliases ?? [],
              isActive: true,
              sortOrder: DEFAULT_INTERESTS.indexOf(definition),
            },
          }
        : {
            $set: { label: input, isActive: true },
            $setOnInsert: {
              key,
              aliases: [],
              sortOrder: DEFAULT_INTERESTS.length,
            },
          };

      return Interest.findOneAndUpdate({ key }, update, {
        new: true,
        upsert: true,
      }).lean();
    })
  );

  const byId = new Map<string, IInterest>();
  resolved.forEach((interest) => {
    if (interest) {
      byId.set(
        (interest._id as Types.ObjectId).toString(),
        interest as unknown as IInterest
      );
    }
  });

  return Array.from(byId.values());
}

export async function migrateLegacyOnboardingData(): Promise<{
  scanned: number;
  updated: number;
}> {
  const users = await User.find({
    $or: [
      { profession: { $type: "string", $ne: "" } },
      { interests: { $exists: true, $ne: [] } },
    ],
  })
    .select("email profession interests professionRef interestRefs")
    .lean();

  let updated = 0;

  for (const user of users) {
    const update: Record<string, unknown> = {};
    const legacyProfession =
      typeof user.profession === "string" ? user.profession : "";
    const legacyInterests: string[] = Array.isArray(user.interests)
      ? (user.interests as unknown[]).filter(
          (item: unknown): item is string =>
            typeof item === "string" && item.trim() !== ""
        )
      : [];

    if (!user.professionRef && legacyProfession) {
      const profession = await resolveProfession(legacyProfession);
      if (profession) update.$set = { professionRef: profession._id };
    }

    if (legacyInterests.length > 0) {
      const interests = await resolveInterests(legacyInterests);
      if (interests.length > 0) {
        update.$addToSet = {
          interestRefs: { $each: interests.map((item) => item._id) },
        };
      }
    }

    if (Object.keys(update).length > 0) {
      await User.updateOne({ _id: user._id }, update);
      updated += 1;
    }
  }

  return { scanned: users.length, updated };
}

import "../config/env";
import "reflect-metadata";
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "../config/database";
import {
  migrateLegacyOnboardingData,
  seedOnboardingCatalogs,
} from "../utils/onboardingCatalog";

async function main(): Promise<void> {
  await connectToDatabase();
  await seedOnboardingCatalogs();
  const result = await migrateLegacyOnboardingData();
  console.log(
    `[onboarding] Scanned ${result.scanned} users; backfilled ${result.updated} users.`
  );
  await disconnectFromDatabase();
}

main().catch(async (error) => {
  console.error("[onboarding] Migration failed:", error);
  await disconnectFromDatabase().catch(() => undefined);
  process.exit(1);
});

import { getDb } from "../api/queries/connection";
import { services, cancelGuides } from "./schema";

const serviceData = [
  { name: "Netflix", category: "streaming", brandColor: "#E50914", cancelUrl: "https://www.netflix.com/cancelplan", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "15.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Spotify", category: "streaming", brandColor: "#1DB954", cancelUrl: "https://www.spotify.com/account/cancel", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "10.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Disney+", category: "streaming", brandColor: "#113CCF", cancelUrl: "https://www.disneyplus.com/account/cancel-subscription", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "7.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "YouTube Premium", category: "streaming", brandColor: "#FF0000", cancelUrl: "https://www.youtube.com/paid_memberships", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "12.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Apple TV+", category: "streaming", brandColor: "#000000", cancelUrl: "https://tv.apple.com/settings", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "6.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Amazon Prime", category: "shopping", brandColor: "#FF9900", cancelUrl: "https://www.amazon.co.uk/gp/primecentral", cancelDifficulty: "medium" as const, cancelMethod: "self_service" as const, typicalPrice: "8.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Adobe Creative Cloud", category: "software", brandColor: "#FF0000", cancelUrl: "https://account.adobe.com/plans", cancelDifficulty: "hard" as const, cancelMethod: "self_service" as const, typicalPrice: "51.98", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "ChatGPT Plus", category: "software", brandColor: "#10A37F", cancelUrl: "https://chat.openai.com/account", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "20.00", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Notion", category: "software", brandColor: "#000000", cancelUrl: "https://www.notion.so/settings/billing", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "8.00", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Figma", category: "software", brandColor: "#F24E1E", cancelUrl: "https://www.figma.com/account/billing", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "12.00", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Calm", category: "fitness", brandColor: "#7B68EE", cancelUrl: "https://www.calm.com/settings", cancelDifficulty: "medium" as const, cancelMethod: "self_service" as const, typicalPrice: "39.99", typicalCurrency: "GBP", typicalPeriod: "yearly" },
  { name: "Headspace", category: "fitness", brandColor: "#FF6B35", cancelUrl: "https://www.headspace.com/settings/account", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "9.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Peloton", category: "fitness", brandColor: "#181A1D", cancelUrl: "https://members.onepeloton.com/preferences/subscription", cancelDifficulty: "medium" as const, cancelMethod: "self_service" as const, typicalPrice: "12.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "HelloFresh", category: "food", brandColor: "#91C11E", cancelUrl: "https://www.hellofresh.co.uk/account/settings", cancelDifficulty: "medium" as const, cancelMethod: "self_service" as const, typicalPrice: "39.99", typicalCurrency: "GBP", typicalPeriod: "weekly" },
  { name: "Tinder", category: "dating", brandColor: "#FD3A73", cancelUrl: "https://tinder.com/settings", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "8.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Hulu", category: "streaming", brandColor: "#1CE783", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "7.99", typicalCurrency: "USD", typicalPeriod: "monthly" },
  { name: "HBO Max", category: "streaming", brandColor: "#991CE5", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "9.99", typicalCurrency: "USD", typicalPeriod: "monthly" },
  { name: "Apple Music", category: "streaming", brandColor: "#FA243C", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "10.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Canva", category: "software", brandColor: "#00C4CC", cancelUrl: "https://www.canva.com/account/billing", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "12.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Duolingo", category: "education", brandColor: "#58CC02", cancelUrl: "https://www.duolingo.com/settings/super", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "6.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Strava", category: "fitness", brandColor: "#FC4C02", cancelUrl: "https://www.strava.com/settings/premium", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "8.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Uber One", category: "food", brandColor: "#000000", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "5.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Bumble", category: "dating", brandColor: "#FFC107", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "8.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "Audible", category: "streaming", brandColor: "#F29111", cancelUrl: "https://www.audible.co.uk/account/cancellation", cancelDifficulty: "easy" as const, cancelMethod: "self_service" as const, typicalPrice: "7.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
  { name: "LinkedIn Premium", category: "software", brandColor: "#0077B5", cancelUrl: "https://www.linkedin.com/premium/settings", cancelDifficulty: "medium" as const, cancelMethod: "self_service" as const, typicalPrice: "29.99", typicalCurrency: "GBP", typicalPeriod: "monthly" },
];

async function seed() {
  const db = getDb();
  console.log("Seeding services...");
  await db.insert(services).values(serviceData);
  console.log(`Inserted ${serviceData.length} services`);

  const allServices = await db.select().from(services);
  const netflix = allServices.find((s) => s.name === "Netflix");
  if (netflix) {
    await db.insert(cancelGuides).values([
      { serviceId: netflix.id, stepNumber: 1, title: "Go to Account Settings", description: "Visit netflix.com and click on your profile icon in the top right. Select 'Account' from the dropdown menu.", tip: "Make sure you're logged into the correct profile." },
      { serviceId: netflix.id, stepNumber: 2, title: "Find Cancel Membership", description: "Under the 'Membership & Billing' section, click the 'Cancel Membership' link.", tip: "This is usually displayed as a grey button next to your plan details." },
      { serviceId: netflix.id, stepNumber: 3, title: "Confirm Cancellation", description: "Click the 'Finish Cancellation' button to complete the process.", tip: "You'll keep access until the end of your billing period." },
    ]);
    console.log("Inserted Netflix cancel guide");
  }

  console.log("Seed complete!");
}

seed().catch(console.error);

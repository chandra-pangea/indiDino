// Seeds demo users (+ wallets + carts), coin packages, product categories, and a product catalog.
import { PrismaClient } from '@prisma/client';
import { ProductCategorySlug } from '../src/common/enums';

const prisma = new PrismaClient();

// Entry point: wipe existing rows then insert a deterministic demo dataset.
async function main() {
  await resetDatabase();
  await seedUsers();
  await seedCoinPackages();
  const categories = await seedCategories();
  await seedProducts(categories);
  console.log('Seed complete.');
}

// Removes all rows in dependency order so the seed is idempotent across runs.
async function resetDatabase() {
  await prisma.walletTransaction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.coinPackage.deleteMany();
  await prisma.user.deleteMany();
}

// Creates demo users each with an empty wallet and cart.
async function seedUsers() {
  const demoUsers = [
    { id: 'user-aria', displayName: 'Aria Nightblade', email: 'aria@coinvault.gg' },
    { id: 'user-kael', displayName: 'Kael Stormrider', email: 'kael@coinvault.gg' },
    { id: 'user-mira', displayName: 'Mira Frostweave', email: 'mira@coinvault.gg' },
  ];

  for (const user of demoUsers) {
    await prisma.user.create({
      data: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        wallet: { create: { balanceCoins: 0 } },
        cart: { create: {} },
      },
    });
  }
}

// Creates the fixed coin packages ($20 / $50 / $100), credited 1:1 USD -> coins.
async function seedCoinPackages() {
  const packages = [
    { name: 'Starter Pack', priceCents: 2000, coins: 20, sortOrder: 1 },
    { name: 'Value Pack', priceCents: 5000, coins: 50, sortOrder: 2 },
    { name: 'Pro Pack', priceCents: 10000, coins: 100, sortOrder: 3 },
  ];
  await prisma.coinPackage.createMany({ data: packages });
}

// Creates the three product categories and returns them keyed by slug.
async function seedCategories() {
  const skin = await prisma.productCategory.create({ data: { name: 'Skins', slug: ProductCategorySlug.SKIN } });
  const emote = await prisma.productCategory.create({ data: { name: 'Emotes', slug: ProductCategorySlug.EMOTE } });
  const battlePass = await prisma.productCategory.create({ data: { name: 'Battle Passes', slug: ProductCategorySlug.BATTLE_PASS } });
  return { skin, emote, battlePass };
}

// Creates the product catalog across all three categories.
async function seedProducts(categories: Awaited<ReturnType<typeof seedCategories>>) {
  const products = [
    { sku: 'SKIN-DRAGON', name: 'Dragonlord Armor', description: 'Legendary dragon-scale armor skin.', categoryId: categories.skin.id, priceCoins: 45, imageUrl: 'https://placehold.co/400x300/6d28d9/fff?text=Dragonlord' },
    { sku: 'SKIN-NEON', name: 'Neon Assassin', description: 'Glowing cyberpunk assassin outfit.', categoryId: categories.skin.id, priceCoins: 30, imageUrl: 'https://placehold.co/400x300/db2777/fff?text=Neon+Assassin' },
    { sku: 'SKIN-FROST', name: 'Frostbite Warden', description: 'Icy warden skin with frost particle effects.', categoryId: categories.skin.id, priceCoins: 35, imageUrl: 'https://placehold.co/400x300/0ea5e9/fff?text=Frostbite' },
    { sku: 'EMOTE-DANCE', name: 'Victory Dance', description: 'Taunt your opponents with a victory dance.', categoryId: categories.emote.id, priceCoins: 10, imageUrl: 'https://placehold.co/400x300/f59e0b/fff?text=Victory+Dance' },
    { sku: 'EMOTE-WAVE', name: 'Friendly Wave', description: 'A cheerful wave emote.', categoryId: categories.emote.id, priceCoins: 8, imageUrl: 'https://placehold.co/400x300/10b981/fff?text=Wave' },
    { sku: 'EMOTE-RAGE', name: 'Rage Quit', description: 'Express your frustration in style.', categoryId: categories.emote.id, priceCoins: 12, imageUrl: 'https://placehold.co/400x300/ef4444/fff?text=Rage+Quit' },
    { sku: 'BP-SEASON-1', name: 'Season 1 Battle Pass', description: '100 tiers of seasonal rewards.', categoryId: categories.battlePass.id, priceCoins: 80, imageUrl: 'https://placehold.co/400x300/7c3aed/fff?text=Battle+Pass+S1' },
    { sku: 'BP-SEASON-1-PLUS', name: 'Season 1 Pass Plus', description: 'Battle Pass with 25 tiers pre-unlocked.', categoryId: categories.battlePass.id, priceCoins: 120, imageUrl: 'https://placehold.co/400x300/2563eb/fff?text=Pass+Plus' },
    { sku: 'BP-STARTER', name: 'Rookie Bundle', description: 'A starter bundle for new players.', categoryId: categories.battlePass.id, priceCoins: 25, imageUrl: 'https://placehold.co/400x300/059669/fff?text=Rookie+Bundle' },
  ];
  await prisma.product.createMany({ data: products });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Prisma seed script — tạo admin account đầu tiên.
 *
 * Chạy:  npx prisma db seed
 *
 * Cần đặt trong .env:
 *   ADMIN_SEED_EMAIL=admin@example.com
 *   ADMIN_SEED_PASSWORD=changeme_strong_password
 *
 * Nếu ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD không có trong .env,
 * script sẽ skip không tạo gì.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      "⚠  ADMIN_SEED_EMAIL or ADMIN_SEED_PASSWORD not set in .env — skipping admin seed.",
    );
    console.warn("   Set both variables, then run: npx prisma db seed");
    return;
  }

  // Kiểm tra xem đã có user chưa
  const existing = await db.user.findUnique({
    where: { email: adminEmail.toLowerCase() },
  });

  if (existing) {
    // Nếu user đã tồn tại nhưng không phải admin, nâng cấp lên admin
    if (existing.role !== "admin") {
      await db.user.update({
        where: { id: existing.id },
        data: { role: "admin" },
      });
      console.log(`✅ Promoted existing user "${adminEmail}" to admin.`);
    } else {
      console.log(`ℹ  Admin user "${adminEmail}" already exists, skipping.`);
    }
    return;
  }

  // Hash password và tạo admin
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await db.user.create({
    data: {
      email: adminEmail.toLowerCase().trim(),
      name: "Quản trị viên",
      passwordHash,
      role: "admin",
    },
  });

  console.log(`✅ Admin user created successfully:`);
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Role:     ${admin.role}`);
  console.log(`\n⚠  Remember to change this password after first login!`);
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

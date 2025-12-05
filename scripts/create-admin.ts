/**
 * Script to create an admin user with properly hashed password
 * Run with: npx ts-node scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@berlin-cleanup.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Admin';

  console.log('Creating admin user...');
  console.log('Email:', email);

  // Hash password with 12 rounds (matching your app's settings)
  const hashedPassword = await bcrypt.hash(password, 12);
  console.log('Hashed password:', hashedPassword);

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('\n⚠️  User already exists. Updating password...');

      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          name,
        },
      });

      console.log('✅ Admin user updated successfully!');
      console.log('User ID:', updatedUser.id);
      console.log('Email:', updatedUser.email);
      console.log('Role:', updatedUser.role);
    } else {
      // Create new user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'ADMIN',
          points: 0,
        },
      });

      console.log('✅ Admin user created successfully!');
      console.log('User ID:', user.id);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
    }

    console.log('\n📝 Login credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\n🔒 Hashed password (for manual DB entry):');
    console.log(hashedPassword);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

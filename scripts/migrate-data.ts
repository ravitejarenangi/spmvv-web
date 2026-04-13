import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ELECTRON_ROOT = path.resolve(__dirname, '../../Spmvv AI Assistant');

interface SqliteUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface JsonUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface FilesEntry {
  subject: string;
  code: string;
  path: string;
  text: string;
}

interface MetadataEntry {
  text: string;
  source: string;
}

async function migrateUsers(): Promise<void> {
  console.log('\n--- Migrating users ---');

  const usersMap = new Map<string, JsonUser>();

  // Read from SQLite users.db
  const dbPath = path.join(ELECTRON_ROOT, 'users.db');
  if (fs.existsSync(dbPath)) {
    const db = new Database(dbPath, { readonly: true });
    const rows = db.prepare('SELECT * FROM users').all() as SqliteUser[];
    db.close();
    for (const row of rows) {
      const key = row.email.toLowerCase();
      if (!usersMap.has(key)) {
        usersMap.set(key, { name: row.name, email: key, password: row.password, role: row.role });
      }
    }
    console.log(`  Read ${rows.length} users from users.db`);
  } else {
    console.log('  users.db not found, skipping');
  }

  // Read from users.json
  const jsonPath = path.join(ELECTRON_ROOT, 'backend', 'db', 'users.json');
  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const jsonUsers: JsonUser[] = JSON.parse(raw);
    for (const u of jsonUsers) {
      const key = u.email.toLowerCase();
      if (!usersMap.has(key)) {
        usersMap.set(key, { name: u.name, email: key, password: u.password, role: u.role });
      }
    }
    console.log(`  Read ${jsonUsers.length} users from users.json`);
  } else {
    console.log('  users.json not found, skipping');
  }

  // Fetch roles from DB
  const roles = await prisma.role.findMany();
  const roleMap = new Map(roles.map((r) => [r.name.toLowerCase(), r.id]));

  let migrated = 0;
  for (const [, user] of usersMap) {
    const roleName = user.role?.toLowerCase() ?? 'student';
    const roleId = roleMap.get(roleName) ?? roleMap.get('student');
    if (!roleId) {
      console.warn(`  WARNING: role "${roleName}" not found in DB, skipping user ${user.email}`);
      continue;
    }

    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: user.password,
        roleId,
        isActive: true,
      },
    });

    console.log(`  Migrated user: ${user.email} (${roleName})`);
    migrated++;
  }

  console.log(`  Total users migrated: ${migrated}`);
}

async function migrateDocuments(): Promise<void> {
  console.log('\n--- Migrating documents ---');

  const kbDir = path.join(process.cwd(), 'uploads', 'knowledge_base');
  const subjectDir = path.join(process.cwd(), 'uploads', 'subject_pdfs');
  fs.mkdirSync(kbDir, { recursive: true });
  fs.mkdirSync(subjectDir, { recursive: true });

  // Copy PDFs from backend/pdfs/ → uploads/knowledge_base/
  const pdfsSource = path.join(ELECTRON_ROOT, 'backend', 'pdfs');
  if (fs.existsSync(pdfsSource)) {
    const files = fs.readdirSync(pdfsSource).filter((f) => f.toLowerCase().endsWith('.pdf'));
    for (const filename of files) {
      const src = path.join(pdfsSource, filename);
      const dest = path.join(kbDir, filename);
      fs.copyFileSync(src, dest);

      await prisma.document.upsert({
        where: { filepath: `uploads/knowledge_base/${filename}` } as never,
        update: {},
        create: {
          filename,
          filepath: `uploads/knowledge_base/${filename}`,
          category: 'knowledge_base',
        },
      });

      console.log(`  Copied knowledge base PDF: ${filename}`);
    }
  } else {
    console.log('  backend/pdfs/ not found, skipping knowledge base PDFs');
  }

  // Read files.json and copy subject PDFs
  const filesJsonPath = path.join(ELECTRON_ROOT, 'backend', 'db', 'files.json');
  if (fs.existsSync(filesJsonPath)) {
    const raw = fs.readFileSync(filesJsonPath, 'utf-8');
    const entries: FilesEntry[] = JSON.parse(raw);

    for (const entry of entries) {
      const srcPath = path.join(ELECTRON_ROOT, 'backend', entry.path);
      const filename = path.basename(entry.path);
      const dest = path.join(subjectDir, filename);

      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, dest);
      } else {
        console.warn(`  WARNING: source file not found: ${srcPath}`);
      }

      await prisma.document.create({
        data: {
          filename,
          filepath: `uploads/subject_pdfs/${filename}`,
          category: 'subject_pdf',
          subject: entry.subject,
          code: entry.code,
          description: entry.text,
        },
      });

      console.log(`  Copied subject PDF: ${filename} (${entry.code})`);
    }
  } else {
    console.log('  files.json not found, skipping subject PDFs');
  }
}

async function migrateChunks(): Promise<void> {
  console.log('\n--- Migrating document chunks ---');

  const metaPath = path.join(ELECTRON_ROOT, 'backend', 'db', 'metadata.json');
  if (!fs.existsSync(metaPath)) {
    console.log('  metadata.json not found, skipping chunks');
    return;
  }

  const raw = fs.readFileSync(metaPath, 'utf-8');
  const entries: MetadataEntry[] = JSON.parse(raw);

  // Group chunks by source filename
  const grouped = new Map<string, string[]>();
  for (const entry of entries) {
    const source = path.basename(entry.source);
    if (!grouped.has(source)) grouped.set(source, []);
    grouped.get(source)!.push(entry.text);
  }

  for (const [source, chunks] of grouped) {
    // Find matching document by filename
    const doc = await prisma.document.findFirst({
      where: { filename: source },
    });

    if (!doc) {
      console.warn(`  WARNING: no document found for source "${source}", skipping ${chunks.length} chunks`);
      continue;
    }

    // Create chunks
    await prisma.documentChunk.createMany({
      data: chunks.map((content, chunkIndex) => ({
        documentId: doc.id,
        content,
        chunkIndex,
        // embedding is null — will be generated during re-ingestion
      })),
    });

    console.log(`  Created ${chunks.length} chunks for: ${source}`);
  }
}

async function main(): Promise<void> {
  console.log('Starting data migration from Electron app...');
  console.log(`ELECTRON_ROOT: ${ELECTRON_ROOT}`);

  await migrateUsers();
  await migrateDocuments();
  await migrateChunks();

  console.log('\nMigration complete.');
  console.log('Next step: trigger re-ingestion from the admin panel to generate embeddings for all chunks.');
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

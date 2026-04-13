import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSIONS = [
  'chat:access',
  'chat:history',
  'pdf:download',
  'pdf:restricted',
  'admin:dashboard',
  'admin:users',
  'admin:roles',
  'admin:documents',
  'admin:settings',
  'admin:ingest',
] as const;

type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  superadmin: [...PERMISSIONS],
  faculty: ['chat:access', 'chat:history', 'pdf:download', 'pdf:restricted'],
  student: ['chat:access', 'chat:history', 'pdf:download'],
};

const DEFAULT_SETTINGS: Array<{
  key: string;
  value: unknown;
  category: string;
  description: string;
}> = [
  {
    key: 'ollama_url',
    value: 'http://127.0.0.1:11434',
    category: 'ai',
    description: 'Ollama API base URL',
  },
  {
    key: 'embedding_model',
    value: 'nomic-embed-text',
    category: 'ai',
    description: 'Model used for generating embeddings',
  },
  {
    key: 'generation_model',
    value: 'mistral',
    category: 'ai',
    description: 'Model used for response generation',
  },
  {
    key: 'chunk_size',
    value: 500,
    category: 'rag',
    description: 'Number of characters per document chunk',
  },
  {
    key: 'chunk_overlap',
    value: 50,
    category: 'rag',
    description: 'Number of overlapping characters between chunks',
  },
  {
    key: 'top_k_retrieval',
    value: 10,
    category: 'rag',
    description: 'Number of chunks to retrieve before reranking',
  },
  {
    key: 'reranker_top_n',
    value: 5,
    category: 'rag',
    description: 'Number of chunks to keep after reranking',
  },
  {
    key: 'streaming_enabled',
    value: true,
    category: 'chat',
    description: 'Enable streaming responses in chat',
  },
  {
    key: 'system_prompt',
    value:
      'You are SPMVV EduBot, an AI assistant for Sri Padmavati Mahila Visvavidyalayam. Answer questions accurately based on the provided context about the university.',
    category: 'chat',
    description: 'System prompt prepended to all chat conversations',
  },
  {
    key: 'max_chat_sessions',
    value: 50,
    category: 'chat',
    description: 'Maximum number of chat sessions retained per user',
  },
  {
    key: 'pdf_search_keywords',
    value: ['syllabus', 'question paper', 'previous paper', 'model paper', 'exam'],
    category: 'rag',
    description: 'Keywords that trigger file/PDF search instead of semantic search',
  },
  {
    key: 'site_name',
    value: 'SPMVV EduBot',
    category: 'site',
    description: 'Display name for the application',
  },
  {
    key: 'welcome_text',
    value: 'Welcome to SPMVV EduBot — your AI-powered university assistant.',
    category: 'site',
    description: 'Welcome message shown on the login/home page',
  },
  {
    key: 'about_content',
    value:
      'SPMVV EduBot provides instant answers to queries about Sri Padmavati Mahila Visvavidyalayam using AI and the university knowledge base.',
    category: 'site',
    description: 'About text displayed in the application',
  },
  {
    key: 'registration_enabled',
    value: true,
    category: 'auth',
    description: 'Allow new users to self-register',
  },
  {
    key: 'default_role',
    value: 'student',
    category: 'auth',
    description: 'Role assigned to newly registered users',
  },
  {
    key: 'max_upload_size_mb',
    value: 50,
    category: 'documents',
    description: 'Maximum file upload size in megabytes',
  },
];

async function seed() {
  console.log('Seeding database...');

  // Upsert roles
  const roles: Record<string, { id: string }> = {};

  for (const [name, description] of [
    ['superadmin', 'Full system access with all permissions'],
    ['faculty', 'Faculty member with access to restricted content'],
    ['student', 'Student with standard access'],
  ] as const) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { description, isSystem: true },
      create: { name, description, isSystem: true },
    });
    roles[name] = role;
    console.log(`  Role upserted: ${name}`);
  }

  // Upsert permissions for each role
  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    const role = roles[roleName];
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permission: { roleId: role.id, permission } },
        update: { granted: true },
        create: { roleId: role.id, permission, granted: true },
      });
    }
    console.log(`  Permissions upserted for role: ${roleName} (${permissions.length})`);
  }

  // Upsert settings
  for (const setting of DEFAULT_SETTINGS) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value as never,
        category: setting.category,
        description: setting.description,
      },
    });
  }
  console.log(`  Settings upserted: ${DEFAULT_SETTINGS.length}`);

  // Upsert allowed domain
  await prisma.allowedDomain.upsert({
    where: { domain: 'gmail.com' },
    update: { isActive: true },
    create: { domain: 'gmail.com', isActive: true },
  });
  console.log('  Allowed domain upserted: gmail.com');

  // Upsert superadmin user
  const superadminEmail = process.env.SUPERADMIN_EMAIL ?? 'admin@gmail.com';
  const superadminPassword = process.env.SUPERADMIN_PASSWORD ?? 'changeme123';
  const superadminName = process.env.SUPERADMIN_NAME ?? 'Super Admin';

  const hashedPassword = await hash(superadminPassword, 12);
  const superadminRole = roles['superadmin'];

  await prisma.user.upsert({
    where: { email: superadminEmail },
    update: { name: superadminName, roleId: superadminRole.id, isActive: true },
    create: {
      email: superadminEmail,
      name: superadminName,
      password: hashedPassword,
      roleId: superadminRole.id,
      isActive: true,
    },
  });
  console.log(`  Superadmin upserted: ${superadminEmail}`);

  console.log('Seeding complete.');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

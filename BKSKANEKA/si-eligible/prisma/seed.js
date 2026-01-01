// prisma/seed.js
const dotenv = require('dotenv');
dotenv.config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

function parseDatabaseUrl(dbUrl) {
  const url = new URL(dbUrl);
  const params = Object.fromEntries(url.searchParams.entries());
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : undefined,
    user: url.username,
    password: url.password,
    database: url.pathname ? url.pathname.replace(/^\//, '') : undefined,
    params,
  };
}

(async () => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL is not set');

    const cfg = parseDatabaseUrl(dbUrl);

    const sslEnabled = cfg.params.ssl === 'true' || cfg.params.sslaccept || cfg.params.sslmode;
    const connectionOptions = {
      host: cfg.host,
      port: cfg.port || 3306,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      waitForConnections: true,
      // For TiDB Cloud use TLS; mysql2 accepts `ssl: true` or an object
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
    };

    const conn = await mysql.createConnection(connectionOptions);
    console.log('Connected to DB');

    // 1) Admin
    const hashed = bcrypt.hashSync('admin123', 10);
    const adminId = randomUUID();
    const [adminRows] = await conn.execute('SELECT id FROM `Admin` WHERE username = ?', ['admin']);
    if (!adminRows || adminRows.length === 0) {
      await conn.execute(
        'INSERT INTO `Admin` (`id`,`username`,`password`,`nama`,`role`,`email`,`createdAt`,`updatedAt`) VALUES (?,?,?,?,?,?,NOW(),NOW())',
        [adminId, 'admin', hashed, 'Administrator', 'admin', 'admin@smkn1kademangan.sch.id']
      );
      console.log('Inserted admin');
    } else {
      console.log('Admin already exists');
    }

    await conn.end();
    console.log('\nSeeding completed');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exitCode = 1;
  }
})();

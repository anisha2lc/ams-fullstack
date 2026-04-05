const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setup() {
  const rootClient = new Client({
    user: 'postgres',
    password: 'root',
    host: 'localhost',
    port: 5432,
    database: 'postgres'
  });

  try {
    await rootClient.connect();
    console.log('Connected to postgres db');
    const res = await rootClient.query("SELECT 1 FROM pg_database WHERE datname='ams'");
    if (res.rowCount === 0) {
      console.log('Database "ams" does not exist. Creating...');
      await rootClient.query('CREATE DATABASE ams');
      console.log('Database "ams" created successfully.');
    } else {
      console.log('Database "ams" already exists.');
    }
  } catch (err) {
    console.error('Error connecting to root postgres. Is postgres running with password root?', err);
    process.exit(1);
  } finally {
    await rootClient.end();
  }

  const amsClient = new Client({
    user: 'postgres',
    password: 'root',
    host: 'localhost',
    port: 5432,
    database: 'ams'
  });

  try {
    await amsClient.connect();
    console.log('Connected to ams db');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'server', 'src', 'config', 'schema.sql'), 'utf8');
    await amsClient.query(schemaSql);
    console.log('Schema executed successfully.');
  } catch (err) {
    console.error('Error executing schema:', err);
  } finally {
    await amsClient.end();
  }
}

setup();

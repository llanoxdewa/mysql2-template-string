# SQL Query Utility with MySQL2

This project provides a utility for constructing and executing parameterized SQL queries using the `mysql2/promise` package in a TypeScript environment. It includes classes and functions for creating, chaining, and executing SQL queries safely and efficiently.


## reference and inspiration come from here
```
https://www.npmjs.com/package/sql-template-strings
```

## Features

- **MySQL Connection Pool**: Reuses connections for better performance.
- **Parameterized Queries**: Prevents SQL injection by using parameterized queries.
- **Dynamic Query Construction**: Build and extend SQL queries dynamically using template literals.
- **Value Sanitization**: Cleans input values before executing queries.
- **Deprecated Functions**: Includes backward-compatible functionality with deprecation notices for migrating to the latest features.

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   ```
2. Install the required dependencies:
   ```bash
   npm install mysql2
   ```

## Configuration

The utility requires the following environment variables to establish a database connection:
- `SQL_HOST`: Hostname of the database.
- `SQL_USER`: Username for the database.
- `SQL_PASSWORD`: Password for the database.
- `SQL_DATABASE`: Name of the database.

Create a `.env` file in your project root with the required variables.

Example:
```env
SQL_HOST=localhost
SQL_USER=root
SQL_PASSWORD=password123
SQL_DATABASE=my_database
```

## Usage

### 1. Initialize MySQL Connection Pool

To initialize a connection pool:
```typescript
import { initMySqlPool } from './path-to-file';

const pool = initMySqlPool();
```

### 2. Execute a Basic Query

To execute a simple query:
```typescript
import { sql } from './path-to-file';

const query = sql`SELECT * FROM users WHERE id = ${1}`;
const result = await query.execute();
console.log(result);
```

### 3. Construct Dynamic Queries

To construct and chain queries dynamically:
```typescript
import { sql } from './path-to-file';

const query = sql`SELECT * FROM users`.chain(sql`WHERE age > ${25}`);
const result = await query.execute();
```

### 4. Generate Filter Queries

To generate queries with filters:
```typescript
import { genFilterQuery } from './path-to-file';

const filters = [
  ['age', '>', '25'],
  ['status', '=', 'active'],
];

const query = genFilterQuery(filters);
const result = await query.execute();
console.log(result);
```

### 5. Deprecated Function Usage

A deprecated function `SQL` is included for backward compatibility:
```typescript
import SQL from './path-to-file';

const result = await SQL`SELECT * FROM users WHERE id = ${1}`;
console.log(result);
```

## API Reference

### `initMySqlPool()`
Initializes a MySQL connection pool using environment variables.

### `SQLStatement`
Class representing a SQL query.
- **`query`**: Constructs the query string for Sequelize.
- **`text`**: Constructs the query string with positional parameters.
- **`execute()`**: Executes the query and returns the result.
- **`chain()`**: Chains additional queries or conditions.
- **`append()`**: Appends a query or condition (deprecated).

### `sql(strings, ...values)`
Creates a new `SQLStatement` for the given template literal and parameters.

### `genFilterQuery(filters)`
Generates a SQL `WHERE` clause from an array of filter conditions.


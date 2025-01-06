// Get the client
import mysql from "mysql2/promise";

export const initConnection = {
  host: process.env.SQL_HOST as string,
  user: process.env.SQL_USER as string,
  password: process.env.SQL_PASSWORD as string,
  database: process.env.SQL_DATABASE as string,
};

export const initMySqlPool = () => {
  return mysql.createPool(initConnection);
};

type SQLValues = any[];

export class SQLStatement {
  strings: string[];
  values: SQLValues;

  constructor(strings: string[], values: SQLValues) {
    this.strings = strings;
    this.values = values;
  }

  get cleanValues(): SQLValues {
    return this.values
      .filter((val: any) => {
        if (typeof val == "string") return !val.includes("#");
        return true;
      })
      .map((value: any) => this.valueCleaner(value));
  }

  valueCleaner(value: any) {
    if (typeof value == "string") {
      if (value.includes("_")) value = value.split("_").join(" ");
      return value;
    }
    return value;
  }

  /** Returns the SQL Statement for Sequelize */
  get query(): string {
    return this.query;
  }

  get text(): string {
    return this.strings.reduce((prev, curr, i) => prev + "$" + i + curr);
  }

  async execute() {
    const conn = await mysql.createConnection(initConnection);
    // console.log(this.sql, this.cleanValues)

    try {
      const [result, _] = await conn.execute(this.sql, this.cleanValues);
      return result;
    } catch (e) {
      // Logging.exception((e as Error).message);
      return undefined;
    } finally {
      conn.end();
    }
  }

  chain(extendQuery: SQLStatement | string) {
    if (extendQuery instanceof SQLStatement) {
      this.strings[this.strings.length - 1] += " " + extendQuery.strings[0];
      this.strings.push(...extendQuery.strings.slice(1));
      this.values.push(...extendQuery.values);
    } else {
      this.strings[this.strings.length - 1] += " " + extendQuery;
    }

    return this;
  }

  /**
   * @deprecated Use chain(query: SQLStatement) instead.
   */
  append(statement: SQLStatement | string): this {
    if (statement instanceof SQLStatement) {
      this.strings[this.strings.length - 1] += statement.strings[0];
      this.strings.push(...statement.strings.slice(0));
      const list = this.values;
      if (list) {
        list.push(...statement.values);
      }
    } else {
      // add space before next sql statement
      this.strings[this.strings.length - 1] += " " + statement;
    }
    return this;
  }

  get sql(): string {
    for (let i = 0; i < this.values.length; ++i) {
      const currentValue = this.values[i];
      if (typeof currentValue == "string" && currentValue.includes("#")) {
        this.strings[i] += currentValue.slice(1);
        this.strings[i] += this.strings[i + 1];
        this.values.splice(i, 1);
        this.strings.splice(i + 1, 1);
        --i;
      }
    }

    return this.strings.filter((c) => c != "!").join("?");
  }
}

export function sql(strings: TemplateStringsArray, ...values: SQLValues) {
  return new SQLStatement(strings.slice(0), values);
}

/**
 * @deprecated Use sql`...`.execute() instead.
 */
export default async function SQL(
  strings: TemplateStringsArray,
  ...values: SQLValues
) {
  const conn = await mysql.createConnection(initConnection);
  const query = new SQLStatement(strings.slice(0), values);

  try {
    const [result, _] = await conn.query(query.sql, query.cleanValues);
    return result;
  } catch (e) {
    // Logging.exception((e as Error).message);
    return undefined;
  } finally {
    conn.end();
  }
}

const cleanValue = (val: string) => val.split("_").join(" ");

export function genFilterQuery(queryFilter: string[][]): SQLStatement {
  const query = sql`WHERE`;
  const logic = [];

  for (let [field, oper, value] of queryFilter) {
    if (!!value) logic.push(`${field} ${oper} "${cleanValue(value)}"`);
  }

  if (logic.length > 0) return query.chain(logic.join(" AND "));

  return sql``;
}

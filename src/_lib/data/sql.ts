interface TableQuery {
  name: string;
  query: string;
}

export const tableQueries: TableQuery[] = [
  {
    name: "users",
    query: `CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      height_cm FLOAT,
      current_weight FLOAT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
  },
  {
    name: "workout_logs",
    query: `CREATE TABLE workout_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      userId UUID REFERENCES users(id) ON DELETE CASCADE,
      activity_type TEXT NOT NULL,
      duration_mins INTEGER,
      log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
  },
  {
    name: "calorie_logs",
    query: `CREATE TABLE calorie_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      userId UUID REFERENCES users(id) ON DELETE CASCADE,
      calories_consumed INTEGER,
      calories_burned INTEGER,
      log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
  },
  {
    name: "finance_categories",
    query: `CREATE TABLE finance_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      type TEXT NOT NULL
    );`,
  },
  {
    name: "transactions",
    query: `CREATE TABLE transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      category_id UUID REFERENCES finance_categories(id),
      amount DECIMAL(12, 2) NOT NULL,
      description TEXT,
      transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
  },
  {
    name: "study_tasks",
    query: `CREATE TABLE study_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      userId UUID REFERENCES users(id) ON DELETE CASCADE,
      subject TEXT,
      task_description TEXT,
      deadline TIMESTAMP,
      status TEXT DEFAULT 'pending'
    );`,
  },
  {
    name: "study_sessions",
    query: `CREATE TABLE study_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      userId UUID REFERENCES users(id) ON DELETE CASCADE,
      taskId UUID REFERENCES study_tasks(id) ON DELETE CASCADE,
      duration_seconds INTEGER,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
  },
];

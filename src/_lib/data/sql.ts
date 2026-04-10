interface TableQuery {
  name: string;
  query: string;
}

export const tableQueries: TableQuery[] = [
  {
    name: "users",
    query: `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name TEXT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      height_cm FLOAT,
      current_weight FLOAT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  },
  {
    name: "workout_logs",
    query: `CREATE TABLE IF NOT EXISTS workout_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      userId UUID REFERENCES users(id) ON DELETE CASCADE,
      activity_type TEXT NOT NULL,
      duration_mins INTEGER,
      calories_burned INTEGER DEFAULT 0,
      log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  },
  {
    name: "calorie_logs",
    query: `CREATE TABLE IF NOT EXISTS calorie_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      userId UUID REFERENCES users(id) ON DELETE CASCADE,
      meal_name TEXT,
      calories_consumed INTEGER,
      calories_burned INTEGER,
      log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  },
  {
    name: "finance_categories",
    query: `CREATE TABLE IF NOT EXISTS finance_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      type TEXT NOT NULL
    );`
  },
  {
    name: "transactions",
    query: `CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      userId UUID REFERENCES users(id) ON DELETE CASCADE,
      categoryId UUID REFERENCES finance_categories(id),
      amount DECIMAL(12, 2) NOT NULL,
      type TEXT NOT NULL DEFAULT 'expense',
      description TEXT,
      transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  },
  {
    name: "study_tasks",
    query: `CREATE TABLE IF NOT EXISTS study_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      userId UUID REFERENCES users(id) ON DELETE CASCADE,
      subject TEXT,
      task_description TEXT,
      title TEXT,
      priority TEXT DEFAULT 'medium',
      deadline TIMESTAMP,
      status TEXT DEFAULT 'pending'
    );`
  },
  {
    name: "study_sessions",
    query: `CREATE TABLE IF NOT EXISTS study_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      userId UUID REFERENCES users(id) ON DELETE CASCADE,
      taskId UUID REFERENCES study_tasks(id) ON DELETE CASCADE,
      subject TEXT,
      duration_seconds INTEGER,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  }
];
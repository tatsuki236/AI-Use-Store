const { Client } = require("pg");

const client = new Client({
  host: "db.swrphzgqjeixmymqyvrq.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "ZHZRi9vus$UdDkx",
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log("Connected");

  // 1. Create a SECURITY DEFINER function to check admin (bypasses RLS)
  await client.query(`
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS boolean AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      );
    $$ LANGUAGE sql SECURITY DEFINER STABLE;
  `);
  console.log("Created is_admin() function");

  // 2. Drop all existing policies that cause recursion
  const policies = [
    { table: "profiles", name: "Admins can view all profiles" },
    { table: "profiles", name: "Admins can update all profiles" },
    { table: "courses", name: "Admins can manage courses" },
    { table: "lessons", name: "Admins can view all lessons" },
    { table: "lessons", name: "Admins can manage lessons" },
    { table: "purchases", name: "Admins can view all purchases" },
    { table: "purchases", name: "Admins can update purchases" },
  ];

  for (const p of policies) {
    await client.query(`DROP POLICY IF EXISTS "${p.name}" ON public.${p.table}`);
    console.log(`Dropped: ${p.name}`);
  }

  // 3. Recreate policies using is_admin() function instead of subquery
  await client.query(`
    CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());
  `);

  await client.query(`
    CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (public.is_admin());
  `);

  await client.query(`
    CREATE POLICY "Admins can manage courses"
    ON public.courses FOR ALL
    USING (public.is_admin());
  `);

  await client.query(`
    CREATE POLICY "Admins can view all lessons"
    ON public.lessons FOR SELECT
    USING (public.is_admin());
  `);

  await client.query(`
    CREATE POLICY "Admins can manage lessons"
    ON public.lessons FOR ALL
    USING (public.is_admin());
  `);

  await client.query(`
    CREATE POLICY "Admins can view all purchases"
    ON public.purchases FOR SELECT
    USING (public.is_admin());
  `);

  await client.query(`
    CREATE POLICY "Admins can update purchases"
    ON public.purchases FOR UPDATE
    USING (public.is_admin());
  `);

  console.log("Recreated all policies with is_admin() function");

  // 4. Verify
  const { rows } = await client.query(`
    SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename
  `);
  console.log("\nCurrent policies:");
  rows.forEach((r) => console.log(`  ${r.tablename}: ${r.policyname}`));

  await client.end();
})();

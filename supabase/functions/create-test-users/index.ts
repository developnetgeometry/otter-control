import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestUser {
  email: string;
  password: string;
  full_name: string;
  employee_id: string;
  department_code: string;
  position: string;
  designation: string;
  employment_type: string;
  basic_salary: number;
  roles: string[];
  work_location?: string;
  state?: string;
}

const TEST_USERS: TestUser[] = [
  {
    email: 'admin@otms.test',
    password: 'Admin123!',
    full_name: 'System Administrator',
    employee_id: 'EMP001',
    department_code: 'HR',
    position: 'System Admin',
    designation: 'Administrator',
    employment_type: 'Permanent',
    basic_salary: 8000,
    roles: ['admin'],
    work_location: 'Head Office',
    state: 'Selangor',
  },
  {
    email: 'hr@otms.test',
    password: 'HR123!',
    full_name: 'HR Manager',
    employee_id: 'EMP002',
    department_code: 'HR',
    position: 'HR Manager',
    designation: 'Manager',
    employment_type: 'Permanent',
    basic_salary: 6000,
    roles: ['hr'],
    work_location: 'Head Office',
    state: 'Selangor',
  },
  {
    email: 'bod@otms.test',
    password: 'BOD123!',
    full_name: 'Board Director',
    employee_id: 'EMP003',
    department_code: 'FIN',
    position: 'Director',
    designation: 'Director',
    employment_type: 'Permanent',
    basic_salary: 12000,
    roles: ['bod'],
    work_location: 'Head Office',
    state: 'Selangor',
  },
  {
    email: 'supervisor@otms.test',
    password: 'Supervisor123!',
    full_name: 'Operations Supervisor',
    employee_id: 'EMP004',
    department_code: 'OPS',
    position: 'Supervisor',
    designation: 'Supervisor',
    employment_type: 'Permanent',
    basic_salary: 3500,
    roles: ['supervisor', 'employee'],
    work_location: 'Head Office',
    state: 'Selangor',
  },
  {
    email: 'employee.it@otms.test',
    password: 'Employee123!',
    full_name: 'IT Staff',
    employee_id: 'EMP005',
    department_code: 'IT',
    position: 'IT Support',
    designation: 'Executive',
    employment_type: 'Permanent',
    basic_salary: 2800,
    roles: ['employee'],
    work_location: 'Head Office',
    state: 'Selangor',
  },
  {
    email: 'employee.sales@otms.test',
    password: 'Employee123!',
    full_name: 'Sales Staff',
    employee_id: 'EMP006',
    department_code: 'SAL',
    position: 'Sales Executive',
    designation: 'Executive',
    employment_type: 'Permanent',
    basic_salary: 2500,
    roles: ['employee'],
    work_location: 'Head Office',
    state: 'Selangor',
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('Starting test user creation...');

    // Get all departments
    const { data: departments, error: deptError } = await supabaseAdmin
      .from('departments')
      .select('id, code');

    if (deptError) {
      throw new Error(`Failed to fetch departments: ${deptError.message}`);
    }

    const deptMap = new Map(departments.map((d) => [d.code, d.id]));
    console.log('Department mapping:', Object.fromEntries(deptMap));

    const results = [];
    let supervisorUserId: string | null = null;

    for (const testUser of TEST_USERS) {
      try {
        console.log(`Creating user: ${testUser.email}`);

        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true,
          user_metadata: {
            full_name: testUser.full_name,
          },
        });

        if (authError) {
          console.error(`Auth error for ${testUser.email}:`, authError);
          results.push({
            email: testUser.email,
            success: false,
            error: authError.message,
          });
          continue;
        }

        const userId = authData.user.id;
        console.log(`Created auth user ${testUser.email} with ID: ${userId}`);

        // Save supervisor ID for later assignment
        if (testUser.roles.includes('supervisor')) {
          supervisorUserId = userId;
        }

        // Create profile
        const departmentId = deptMap.get(testUser.department_code);
        if (!departmentId) {
          throw new Error(`Department not found for code: ${testUser.department_code}`);
        }

        const { error: profileError } = await supabaseAdmin.from('profiles').insert({
          id: userId,
          email: testUser.email,
          full_name: testUser.full_name,
          employee_id: testUser.employee_id,
          department_id: departmentId,
          position: testUser.position,
          designation: testUser.designation,
          employment_type: testUser.employment_type,
          basic_salary: testUser.basic_salary,
          work_location: testUser.work_location,
          state: testUser.state,
          status: 'active',
          joining_date: new Date().toISOString().split('T')[0],
        });

        if (profileError) {
          console.error(`Profile error for ${testUser.email}:`, profileError);
          results.push({
            email: testUser.email,
            success: false,
            error: profileError.message,
          });
          continue;
        }

        console.log(`Created profile for ${testUser.email}`);

        // Assign roles
        for (const role of testUser.roles) {
          const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
            user_id: userId,
            role: role,
          });

          if (roleError) {
            console.error(`Role error for ${testUser.email} (${role}):`, roleError);
          } else {
            console.log(`Assigned role ${role} to ${testUser.email}`);
          }
        }

        results.push({
          email: testUser.email,
          success: true,
          user_id: userId,
          roles: testUser.roles,
        });
      } catch (error: any) {
        console.error(`Error creating ${testUser.email}:`, error);
        results.push({
          email: testUser.email,
          success: false,
          error: error.message || String(error),
        });
      }
    }

    // Update employee profiles with supervisor
    if (supervisorUserId) {
      console.log(`Updating employees with supervisor ID: ${supervisorUserId}`);
      
      const employeeEmails = ['employee.it@otms.test', 'employee.sales@otms.test'];
      const { data: employeeProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .in('email', employeeEmails);

      if (employeeProfiles) {
        for (const profile of employeeProfiles) {
          await supabaseAdmin
            .from('profiles')
            .update({ supervisor_id: supervisorUserId })
            .eq('id', profile.id);
        }
        console.log('Updated employee supervisor assignments');
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    console.log(`Test user creation complete: ${successCount} succeeded, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: results.length,
          succeeded: successCount,
          failed: failCount,
        },
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

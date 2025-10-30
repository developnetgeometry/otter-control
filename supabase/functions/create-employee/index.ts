import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const employeeData = await req.json();
    const defaultPassword = employeeData.default_password || 'Temp@1234';
    console.log('Creating employee with data:', { email: employeeData.email, employee_id: employeeData.employee_id });

    // Step 1: Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: employeeData.email,
      email_confirm: true,
      user_metadata: {
        full_name: employeeData.full_name,
        employee_id: employeeData.employee_id
      }
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      throw authError;
    }

    console.log('Auth user created:', authUser.user.id);

    // Step 2: Create profile with the auth user's ID
    const profileData = {
      id: authUser.user.id,
      full_name: employeeData.full_name,
      employee_id: employeeData.employee_id,
      email: employeeData.email,
      department_id: employeeData.department_id || null,
      position: employeeData.position || null,
      designation: employeeData.designation || null,
      employment_type: employeeData.employment_type,
      basic_salary: employeeData.basic_salary || null,
      work_location: employeeData.work_location || null,
      state: employeeData.state || null,
      supervisor_id: employeeData.supervisor_id || null,
      joining_date: employeeData.joining_date || null,
      status: 'pending_activation'
    };

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Cleanup: delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw profileError;
    }

    console.log('Profile created successfully:', profile.id);

    // Step 3: Hash the default password using pgcrypto
    const { data: saltData, error: saltError } = await supabaseAdmin
      .rpc('gen_salt', { type: 'bf' });

    if (saltError) {
      console.error('Error generating salt:', saltError);
      // Cleanup
      await supabaseAdmin.from('profiles').delete().eq('id', authUser.user.id);
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error('Failed to generate password salt');
    }

    const { data: hashedPassword, error: hashError } = await supabaseAdmin
      .rpc('crypt', { password: defaultPassword, salt: saltData });

    if (hashError) {
      console.error('Error hashing password:', hashError);
      // Cleanup
      await supabaseAdmin.from('profiles').delete().eq('id', authUser.user.id);
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error('Failed to hash password');
    }

    // Step 4: Create entry in auth_user_credentials
    const { error: credError } = await supabaseAdmin
      .from('auth_user_credentials')
      .insert({
        employee_id: employeeData.employee_id,
        password_hash: hashedPassword,
        must_change_password: true,
        is_active: true
      });

    if (credError) {
      console.error('Error creating credentials:', credError);
      // Cleanup
      await supabaseAdmin.from('profiles').delete().eq('id', authUser.user.id);
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error('Failed to create employee credentials');
    }

    console.log('Employee credentials created successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        employee: profile,
        credentials: {
          employee_id: employeeData.employee_id,
          default_password: defaultPassword
        },
        message: 'Employee created successfully with login credentials.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in create-employee function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create employee',
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
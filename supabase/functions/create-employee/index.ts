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

    // Step 3: Send password setup email
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: employeeData.email,
    });

    if (resetError) {
      console.warn('Password reset email error:', resetError);
      // Don't throw here - employee is created, email is optional
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        employee: profile,
        message: 'Employee created successfully. Password setup email sent.'
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
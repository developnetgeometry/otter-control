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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { employee_id, password } = await req.json();

    if (!employee_id || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Employee ID and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Authentication attempt for Employee ID: ${employee_id}`);

    // Call the verification function
    const { data, error } = await supabaseAdmin.rpc('verify_employee_credentials', {
      _employee_id: employee_id,
      _password: password
    });

    if (error) {
      console.error('Verification error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if authentication was successful
    if (!data || data.length === 0 || !data[0].success) {
      console.log('Invalid credentials for Employee ID:', employee_id);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid Employee ID or Password' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const userInfo = data[0];
    console.log('Authentication successful for:', userInfo.full_name);

    // Check if user has roles, if not assign 'employee' role
    const { data: rolesData, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userInfo.user_id);

    let userRoles = userInfo.roles || [];

    if (!rolesError && (!rolesData || rolesData.length === 0)) {
      console.log('No roles found for user, assigning employee role');
      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userInfo.user_id, role: 'employee' });
      
      if (!insertError) {
        userRoles = ['employee'];
      }
    } else if (rolesData && rolesData.length > 0) {
      userRoles = rolesData.map(r => r.role);
    }

    // Create a session for the user using Supabase Auth
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${employee_id}@otms.internal`,
      options: {
        data: {
          employee_id: userInfo.employee_id,
          full_name: userInfo.full_name,
        }
      }
    });

    if (sessionError || !sessionData?.properties) {
      console.error('Session creation error:', sessionError);
      
      // Fallback: Return user info without session (client will handle)
      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: userInfo.user_id,
            employee_id: userInfo.employee_id,
            full_name: userInfo.full_name,
            roles: userRoles,
            must_change_password: userInfo.must_change_password
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Return success with session tokens
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userInfo.user_id,
          employee_id: userInfo.employee_id,
          full_name: userInfo.full_name,
          roles: userRoles,
          must_change_password: userInfo.must_change_password
        },
        session: sessionData.properties
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

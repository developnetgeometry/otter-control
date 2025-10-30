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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { current_password, new_password } = await req.json();

    if (!current_password || !new_password) {
      return new Response(
        JSON.stringify({ error: 'Current password and new password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (new_password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'New password must be at least 8 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Password change request for user: ${user.id}`);

    // Extract employee ID from email (format: EMPxxx@otms.internal)
    const email = user.email || '';
    const [empPart, domain] = email.toLowerCase().split('@');
    
    if (domain !== 'otms.internal') {
      console.error('Invalid email domain:', domain);
      return new Response(
        JSON.stringify({ error: 'Invalid account email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const employeeId = empPart.toUpperCase();
    console.log(`Extracted employee ID: ${employeeId}`);

    // Determine if credentials already exist for this employee
    let credentialsExist = false;
    try {
      const { data: existingCred, error: credFetchError } = await supabaseAdmin
        .from('auth_user_credentials')
        .select('id')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (credFetchError) {
        console.error('Error checking existing credentials:', credFetchError);
      }
      credentialsExist = !!existingCred;
    } catch (e) {
      console.error('Unexpected error while checking credentials existence:', e);
    }

    // If credentials exist, verify the current password; otherwise allow first-time set
    if (credentialsExist) {
      // Verify current password
      const { data: verifyData, error: verifyError } = await supabaseAdmin.rpc('verify_employee_credentials', {
        _employee_id: employeeId,
        _password: current_password
      });

      console.log('Verify RPC result:', { verifyError, verifyData });

      if (verifyError) {
        console.error('RPC error:', verifyError);
        return new Response(
          JSON.stringify({ error: 'Failed to verify password' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!verifyData || verifyData.length === 0 || !verifyData[0].success) {
        console.log('Password verification returned success=false');
        return new Response(
          JSON.stringify({ error: 'Current password is incorrect' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('No existing credentials found; allowing first-time password set.');
    }

    // Hash new password using pgcrypto
    const { data: hashData, error: hashError } = await supabaseAdmin.rpc('crypt', {
      password: new_password,
      salt: await generateSalt(supabaseAdmin)
    });

    if (hashError) {
      console.error('Password hashing error:', hashError);
      return new Response(
        JSON.stringify({ error: 'Failed to hash password' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update or insert password in auth_user_credentials
    if (credentialsExist) {
      const { error: updateError } = await supabaseAdmin
        .from('auth_user_credentials')
        .update({
          password_hash: hashData,
          must_change_password: false,
          last_password_change: new Date().toISOString()
        })
        .eq('employee_id', employeeId);

      if (updateError) {
        console.error('Password update error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update password' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('auth_user_credentials')
        .insert({
          employee_id: employeeId,
          password_hash: hashData,
          must_change_password: false,
          is_active: true,
          last_password_change: new Date().toISOString()
        });

      if (insertError) {
        console.error('Password insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to set password' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Activate profile after successful password change
    const { error: profileActivationError } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'active' })
      .eq('employee_id', employeeId);

    if (profileActivationError) {
      console.error('Error activating profile:', profileActivationError);
      // Don't fail the request, just log the error
    }

    console.log('Password changed successfully for:', employeeId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password changed successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function generateSalt(supabase: any): Promise<string> {
  const { data, error } = await supabase.rpc('gen_salt', { type: 'bf' });
  if (error) throw error;
  return data;
}

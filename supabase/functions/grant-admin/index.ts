import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('Authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, targetUserId } = await req.json()

    // Check if user is requesting to make themselves admin
    if (action === 'self-admin') {
      const allowedAdminEmail = Deno.env.get('ADMIN_EMAIL')
      
      if (!allowedAdminEmail) {
        console.error('ADMIN_EMAIL not configured')
        return new Response(
          JSON.stringify({ error: 'Admin email not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Only allow the configured admin email to self-grant admin
      if (user.email?.toLowerCase() !== allowedAdminEmail.toLowerCase()) {
        console.log(`Unauthorized admin setup attempt by: ${user.email}`)
        return new Response(
          JSON.stringify({ error: 'Only the configured admin email can self-grant admin access' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if user is already admin
      const { data: existingRole } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle()

      if (existingRole) {
        return new Response(
          JSON.stringify({ success: true, message: 'Already an admin' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Grant admin role using service role
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: user.id, role: 'admin' })

      if (insertError) {
        console.error('Error granting admin role:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to grant admin role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Admin role granted to: ${user.email}`)
      return new Response(
        JSON.stringify({ success: true, message: 'Admin role granted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is requesting to grant admin to another user
    if (action === 'grant-admin' && targetUserId) {
      // Check if current user is admin
      const { data: userRole } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle()

      if (!userRole) {
        return new Response(
          JSON.stringify({ error: 'Only admins can grant admin access to others' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Grant admin role to target user using service role
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: targetUserId, role: 'admin' })

      if (insertError) {
        console.error('Error granting admin role:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to grant admin role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Admin role granted to user: ${targetUserId} by ${user.email}`)
      return new Response(
        JSON.stringify({ success: true, message: 'Admin role granted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in grant-admin function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

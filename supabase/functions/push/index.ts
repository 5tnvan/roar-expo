// supabase/functions/push/index.ts
import { createClient } from 'jsr:@supabase/supabase-js@2'

console.log('Hello from Functions!')

interface Notification {
  id: string
  owner_id: string
  profile_id?: string
  capsule_id?: string
  capsule_views?: number
  capsule_shares?: number
  type: string
  created_at: string
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: Notification
  schema: 'public'
  old_record: null | Notification
}

const supabase = createClient(
  Deno.env.get('EXPO_PUBLIC_SUPABASE_URL')!,
  Deno.env.get('EXPO_SUPABASE_SERVICE_ROLE_KEY')!
)

// Helper: format seconds into minutes
function formatMinutes(seconds: number) {
  const totalMinutes = Math.max(1, Math.floor(seconds / 60))
  if (totalMinutes >= 1_000_000_000) return (totalMinutes / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'b mins'
  if (totalMinutes >= 1_000_000) return (totalMinutes / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm mins'
  if (totalMinutes >= 1_000) return (totalMinutes / 1_000).toFixed(1).replace(/\.0$/, '') + 'k mins'
  return totalMinutes + ' mins'
}

// Helper: build notification message, avatar, and deep link
async function getNotificationDetails(notif: Notification) {
  let handle = 'Someone'
  let avatar_url = ''
  let deep_link = ''

  if (notif.profile_id) {
    const { data: profile } = await supabase
      .from('profile')
      .select('handle, avatar_url')
      .eq('id', notif.profile_id)
      .single()
    handle = profile?.handle ?? handle
    avatar_url = profile?.avatar_url ?? ''
  }

  if (notif.capsule_id) {
    deep_link = `roarapp://capsule/${notif.capsule_id}`
  } else if (notif.profile_id) {
    deep_link = `roarapp://profile/${notif.profile_id}`
  }

  let message = ''
  switch (notif.type) {
    case 'notif_call_assistant':
      message = `@${handle} called your assistant`
      break
    case 'notif_call_msg': {
      const seconds = notif.capsule_calls ?? 0
      message = `A caller spent ${formatMinutes(seconds)} exploring your message`
      break
    }
    case 'notif_like':
      message = `Yay, @${handle} approved your message`
      break
    case 'notif_views': {
      const views = notif.capsule_views ?? 0
      message = `Your post crossed ${views} views`
      break
    }
    case 'notif_shares': {
      const shares = notif.capsule_shares ?? 0
      message = `Your post was shared ${shares} times`
      break
    }
    default:
      message = 'You have a new notification'
  }

  return { message, handle, avatar_url, deep_link }
}

// Deno.serve(() => new Response("Hello from push!"));

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json()

    // Only handle INSERT events
    if (payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'No action taken' }), { status: 200 })
    }

    // Fetch ALL push tokens for this user
    const { data: tokens, error: tokenError } = await supabase
      .from('user_push_tokens')
      .select('token')
      .eq('user_id', payload.record.owner_id)

    if (tokenError) {
      console.error('Error fetching tokens:', tokenError)
      return new Response(JSON.stringify({ error: tokenError.message }), { status: 500 })
    }

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ message: 'No push tokens found' }), { status: 200 })
    }

    // Build notification message & metadata
    const { message, handle, avatar_url, deep_link } = await getNotificationDetails(payload.record)

    // Prepare messages for all tokens
    const expoMessages = tokens.map((t) => ({
      to: t.token,
      sound: 'default',
      body: message,
      data: { handle, avatar_url, url: deep_link },
    }))

    // Send batched push notifications via Expo
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('EXPO_PUBLIC_ACCESS_TOKEN')}`,
      },
      body: JSON.stringify(expoMessages),
    }).then((r) => r.json())

    return new Response(JSON.stringify(res), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 })
  }
})

// 1️⃣ notif_call_assistant
// curl -X POST http://localhost:54321/functions/v1/push \
// -H "Content-Type: application/json" \
// -d '{
//   "type": "INSERT",
//   "table": "notifications",
//   "record": {
//     "id": "aaaa1111-aaaa-1111-aaaa-111111111111",
//     "owner_id": "9d70d9d1-948a-443d-83b7-6e54d2f691fc",
//     "profile_id": "7940654e-d601-4e68-8dbf-f64c382461c0",
//     "type": "notif_call_assistant",
//     "created_at": "2025-08-31T17:00:00Z"
//   },
//   "schema": "public",
//   "old_record": null
// }'

// 2️⃣ notif_call_msg (with capsule_calls seconds)
// curl -X POST http://localhost:54321/functions/v1/push \
// -H "Content-Type: application/json" \
// -d '{
//   "type": "INSERT",
//   "table": "notifications",
//   "record": {
//     "id": "bbbb2222-bbbb-2222-bbbb-222222222222",
//     "owner_id": "9d70d9d1-948a-443d-83b7-6e54d2f691fc",
//     "profile_id": "7940654e-d601-4e68-8dbf-f64c382461c0",
//     "capsule_calls": 350,
//     "type": "notif_call_msg",
//     "created_at": "2025-08-31T17:05:00Z"
//   },
//   "schema": "public",
//   "old_record": null
// }'

// 3️⃣ notif_likes
// curl -X POST http://localhost:54321/functions/v1/push \
// -H "Content-Type: application/json" \
// -d '{
//   "type": "INSERT",
//   "table": "notifications",
//   "record": {
//     "id": "cccc3333-cccc-3333-cccc-333333333333",
//     "owner_id": "9d70d9d1-948a-443d-83b7-6e54d2f691fc",
//     "profile_id": "7940654e-d601-4e68-8dbf-f64c382461c0",
//     "type": "notif_likes",
//     "created_at": "2025-08-31T17:10:00Z"
//   },
//   "schema": "public",
//   "old_record": null
// }'

// 4️⃣ notif_views (with capsule_views count)
// curl -X POST http://localhost:54321/functions/v1/push \
// -H "Content-Type: application/json" \
// -d '{
//   "type": "INSERT",
//   "table": "notifications",
//   "record": {
//     "id": "dddd4444-dddd-4444-dddd-444444444444",
//     "owner_id": "9d70d9d1-948a-443d-83b7-6e54d2f691fc",
//     "capsule_id": "b3907766-d3e3-4eb9-966a-e48cbb768ff7",
//     "capsule_views": 100,
//     "type": "notif_views",
//     "created_at": "2025-08-31T17:15:00Z"
//   },
//   "schema": "public",
//   "old_record": null
// }'

// 5️⃣ notif_shares (with capsule_shares count)
// curl -X POST http://localhost:54321/functions/v1/push \
// -H "Content-Type: application/json" \
// -d '{
//   "type": "INSERT",
//   "table": "notifications",
//   "record": {
//     "id": "eeee5555-eeee-5555-eeee-555555555555",
//     "owner_id": "9d70d9d1-948a-443d-83b7-6e54d2f691fc",
//     "capsule_id": "b3907766-d3e3-4eb9-966a-e48cbb768ff7",
//     "capsule_shares": 5,
//     "type": "notif_shares",
//     "created_at": "2025-08-31T17:20:00Z"
//   },
//   "schema": "public",
//   "old_record": null
// }'

// 6️⃣ Default / unknown type
// curl -X POST http://localhost:54321/functions/v1/push \
// -H "Content-Type: application/json" \
// -d '{
//   "type": "INSERT",
//   "table": "notifications",
//   "record": {
//     "id": "ffff6666-ffff-6666-ffff-666666666666",
//     "owner_id": "9d70d9d1-948a-443d-83b7-6e54d2f691fc",
//     "type": "notif_unknown",
//     "created_at": "2025-08-31T17:25:00Z"
//   },
//   "schema": "public",
//   "old_record": null
// }'
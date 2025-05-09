// pages/api/delete-user.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    console.error('Error deleting user:', error.message)
    return res.status(500).json({ error: 'Failed to delete user' })
  }

  return res.status(200).json({ success: true })
}

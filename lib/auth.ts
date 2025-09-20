import { supabase } from './supabase'

export type UserRole = 'user' | 'employee' | 'admin'

export interface Profile {
  id: string
  email: string
  name: string
  role: UserRole
  is_subscribed: boolean
  subscription_plan: string | null
  points: number
  commission_earned: number
  created_at: string
  updated_at: string
}

export async function signUp(email: string, password: string, name: string, role: UserRole = 'user') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role
      }
    }
  })

  if (error) throw error

  // Update profile with role after signup
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role, name })
      .eq('id', data.user.id)

    if (profileError) throw profileError

    // Create employee metadata if role is employee
    if (role === 'employee') {
      const couponCode = `SAVE20${name.toUpperCase().replace(/\s+/g, '').slice(0, 6)}`
      
      await supabase
        .from('employees_meta')
        .insert([{
          profile_id: data.user.id,
          coupon_code: couponCode
        }])

      await supabase
        .from('coupons')
        .insert([{
          code: couponCode,
          employee_profile_id: data.user.id,
          percent_off: 20,
          active: true
        }])
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(updates: Partial<Profile>) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}
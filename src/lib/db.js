/**
 * WowMe データアクセス層
 * Supabase が設定されていれば実DB、未設定ならモックデータにフォールバック
 */
import { supabase, isSupabaseReady } from './supabase'

// supabase が null のとき用のダミーレスポンス
const noop = { data: null, error: null }
const safe = (fn) => supabase ? fn() : Promise.resolve(noop)

// ─── Users ────────────────────────────────────────────────────────────────

export async function upsertUser(userData) {
  if (!isSupabaseReady()) return { data: userData, error: null }
  return supabase.from('users').upsert({
    id:       userData.id,
    name:     userData.name,
    email:    userData.email,
    picture:  userData.picture,
    role:     userData.role,
    is_admin: userData.isAdmin ?? false,
  }, { onConflict: 'id' }).select().single()
}

// ─── Talent Profiles ───────────────────────────────────────────────────────

export async function fetchTalentProfiles() {
  if (!isSupabaseReady()) return { data: [], error: null }
  return supabase
    .from('talent_profiles')
    .select('*')
    .eq('setup_complete', true)
    .order('created_at', { ascending: false })
}

export async function fetchTalentProfileByUserId(userId) {
  if (!isSupabaseReady()) return { data: null, error: null }
  return supabase
    .from('talent_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
}

export async function upsertTalentProfile(userId, profile) {
  if (!isSupabaseReady()) return { data: profile, error: null }

  // 既存レコード確認
  const { data: existing } = await supabase
    .from('talent_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  const payload = {
    user_id:        userId,
    display_name:   profile.displayName,
    bio:            profile.bio ?? '',
    category:       profile.category ?? '',
    tags:           profile.tags ?? [],
    price:          Number(profile.price) || 0,
    response_time:  profile.responseTime ?? 24,
    avatar_url:     profile.avatar ?? '',
    cover_url:      profile.cover ?? '',
    level:          profile.level ?? 1,
    total_orders:   profile.totalOrders ?? 0,
    rating:         profile.rating ?? 0,
    review_count:   profile.reviewCount ?? 0,
    available:      profile.available !== false,
    setup_complete: profile.setupComplete ?? false,
    updated_at:     new Date().toISOString(),
  }

  if (existing?.id) {
    return supabase.from('talent_profiles').update(payload).eq('id', existing.id).select().single()
  }
  return supabase.from('talent_profiles').insert(payload).select().single()
}

export async function updateTalentAvailability(userId, available) {
  if (!isSupabaseReady()) return { error: null }
  return supabase
    .from('talent_profiles')
    .update({ available, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
}

export async function deleteTalentProfile(userId) {
  if (!isSupabaseReady()) return { error: null }
  return supabase.from('talent_profiles').delete().eq('user_id', userId)
}

// ─── Storage: Avatar Upload ────────────────────────────────────────────────

export async function uploadAvatar(userId, file) {
  if (!isSupabaseReady()) return { url: null, error: null }
  const ext  = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) return { url: null, error }
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}

export async function uploadCover(userId, file) {
  if (!isSupabaseReady()) return { url: null, error: null }
  const ext  = file.name.split('.').pop()
  const path = `${userId}/cover.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) return { url: null, error }
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}

export async function uploadVideo(orderId, file) {
  if (!isSupabaseReady()) return { url: null, error: null }
  const ext  = file.name.split('.').pop()
  const path = `${orderId}/response.${ext}`
  const { error } = await supabase.storage.from('videos').upload(path, file, { upsert: true })
  if (error) return { url: null, error }
  const { data } = supabase.storage.from('videos').createSignedUrl(path, 60 * 60 * 24 * 7) // 7日間
  return { url: data?.signedUrl ?? null, error: null }
}

// ─── Orders (localStorage fallback) ───────────────────────────────────────

const LS_ORDERS_KEY = 'wowme_orders'

function lsLoadOrders() {
  try { return JSON.parse(localStorage.getItem(LS_ORDERS_KEY) || '[]') } catch { return [] }
}
function lsSaveOrders(list) {
  localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(list))
}

export async function createOrder(orderData) {
  if (!isSupabaseReady()) {
    const order = {
      id:             `local_${Date.now()}`,
      userId:         orderData.userId,
      talentProfileId: orderData.talentProfileId,
      talentName:     orderData.talentName ?? '',
      talentAvatar:   orderData.talentAvatar ?? '',
      talentCategory: orderData.talentCategory ?? '',
      occasion:       orderData.occasion,
      recipientName:  orderData.recipientName ?? '',
      message:        orderData.message,
      isGift:         orderData.isGift ?? false,
      price:          orderData.price,
      status:         'pending',
      createdAt:      new Date().toISOString(),
    }
    const existing = lsLoadOrders()
    lsSaveOrders([order, ...existing])
    return { data: order, error: null }
  }
  return supabase.from('orders').insert({
    user_id:                  orderData.userId,
    talent_profile_id:        orderData.talentProfileId,
    occasion:                 orderData.occasion,
    recipient_name:           orderData.recipientName ?? '',
    message:                  orderData.message,
    instructions:             orderData.instructions ?? '',
    is_gift:                  orderData.isGift ?? false,
    price:                    orderData.price,
    stripe_payment_intent_id: orderData.stripePaymentIntentId ?? null,
    status:                   'pending',
  }).select().single()
}

export async function fetchOrdersByUser(userId) {
  if (!isSupabaseReady()) {
    const all = lsLoadOrders()
    return { data: all.filter(o => o.userId === userId), error: null }
  }
  return supabase
    .from('orders')
    .select(`*, talent_profiles(display_name, avatar_url, category)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function fetchOrdersByTalent(talentProfileId) {
  if (!isSupabaseReady()) {
    const all = lsLoadOrders()
    return { data: all.filter(o => o.talentProfileId === talentProfileId), error: null }
  }
  return supabase
    .from('orders')
    .select(`*, users(name, picture)`)
    .eq('talent_profile_id', talentProfileId)
    .order('created_at', { ascending: false })
}

// localStorage モード用: userId でタレント注文を取得
export async function fetchOrdersByTalentUserId(userId) {
  const talentProfileId = `user_${userId}`
  if (!isSupabaseReady()) {
    const all = lsLoadOrders()
    return { data: all.filter(o => o.talentProfileId === talentProfileId), error: null }
  }
  // Supabase: talent_profiles.user_id 経由で取得
  const { data: profile } = await supabase
    .from('talent_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  if (!profile) return { data: [], error: null }
  return supabase
    .from('orders')
    .select(`*, users(name, picture)`)
    .eq('talent_profile_id', profile.id)
    .order('created_at', { ascending: false })
}

export async function fetchAllOrders() {
  if (!isSupabaseReady()) {
    const all = lsLoadOrders()
    return { data: all, error: null }
  }
  return supabase
    .from('orders')
    .select(`*, talent_profiles(display_name), users(name)`)
    .order('created_at', { ascending: false })
}

export async function updateOrderStatus(orderId, status, videoUrl = null) {
  if (!isSupabaseReady()) {
    const all = lsLoadOrders()
    const updated = all.map(o => {
      if (o.id !== orderId) return o
      const next = { ...o, status }
      if (videoUrl) next.videoUrl = videoUrl
      if (status === 'completed') next.completedAt = new Date().toISOString()
      return next
    })
    lsSaveOrders(updated)
    return { error: null }
  }
  const payload = { status }
  if (videoUrl) payload.video_url = videoUrl
  if (status === 'completed') payload.completed_at = new Date().toISOString()
  return supabase.from('orders').update(payload).eq('id', orderId)
}

// ─── DB行 → アプリ型への変換 ──────────────────────────────────────────────

export function dbTalentToApp(row) {
  if (!row) return null
  return {
    id:            row.id,
    userId:        row.user_id,
    name:          row.display_name,
    category:      row.category,
    bio:           row.bio,
    price:         row.price,
    responseTime:  row.response_time <= 24 ? '24時間以内'
                 : row.response_time <= 48 ? '48時間以内'
                 : row.response_time <= 72 ? '72時間以内'
                 : '1週間以内',
    avatar:        row.avatar_url,
    cover:         row.cover_url || row.avatar_url || '',
    tags:          row.tags ?? [],
    available:     row.available,
    level:         row.level,
    totalOrders:   row.total_orders,
    rating:        Number(row.rating),
    reviewCount:   row.review_count,
    setupComplete: row.setup_complete,
    featured:      false,
    completionRate: 100,
    isRegistered:  true,
    // TalentDetailPage 互換
    handle:        '',
    sampleVideos:  [],
    reviews:       [],
  }
}

// ─── ログイン時: Supabase からユーザーのタレントプロフィールをアプリ形式で取得 ─────
export async function fetchTalentProfileForLogin(userId) {
  if (!isSupabaseReady()) return null
  const { data } = await supabase
    .from('talent_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (!data || !data.setup_complete) return null
  return {
    displayName:  data.display_name,
    bio:          data.bio,
    category:     data.category,
    tags:         data.tags ?? [],
    price:        data.price,
    responseTime: data.response_time,
    avatar:       data.avatar_url,
    cover:        data.cover_url || data.avatar_url || '',
    level:        data.level,
    totalOrders:  data.total_orders,
    rating:       Number(data.rating),
    reviewCount:  data.review_count,
    available:    data.available,
    setupComplete: true,
  }
}

export function dbOrderToApp(row) {
  if (!row) return null
  // localStorage 形式はすでにアプリ型なのでそのまま返す
  if (row.id?.startsWith('local_')) return row
  // Supabase 行の変換
  return {
    id:              row.id,
    userId:          row.user_id,
    talentProfileId: row.talent_profile_id,
    talentName:      row.talent_profiles?.display_name ?? '',
    talentAvatar:    row.talent_profiles?.avatar_url ?? '',
    talentCategory:  row.talent_profiles?.category ?? '',
    occasion:        row.occasion,
    recipientName:   row.recipient_name,
    message:         row.message,
    isGift:          row.is_gift,
    price:           row.price,
    status:          row.status,
    videoUrl:        row.video_url,
    createdAt:       row.created_at,
    completedAt:     row.completed_at,
  }
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = 'mailto:soporte@mascotasegura.com'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  try {
    const payload = await req.json()
    // El webhook envía el registro actualizado en `record`
    const pet = payload.record

    // Solo notificar si hay un escaneo nuevo (lat/lng/timestamp existen)
    if (!pet || !pet.lastScan || !pet.lastScan.timestamp) {
      return new Response('No hay datos de escaneo', { status: 200 })
    }

    // Obtener las suscripciones del dueño de la mascota
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', pet.userId)

    if (error || !subs || subs.length === 0) {
      return new Response('El usuario no tiene suscripciones push', { status: 200 })
    }

    const mapUrl = pet.lastScan.lat && pet.lastScan.lng 
      ? `https://www.google.com/maps?q=${pet.lastScan.lat},${pet.lastScan.lng}` 
      : null;

    const notificationPayload = JSON.stringify({
      title: '¡Alerta! Tu mascota ha sido escaneada',
      body: `Alguien acaba de escanear la placa de ${pet.name}. ${mapUrl ? 'Toca aquí para ver la ubicación GPS.' : ''}`,
      icon: '/paw-print-fill.svg',
      data: { url: mapUrl || '/' }
    })

    // Enviar la notificación a todos los dispositivos del usuario
    const pushPromises = subs.map(sub => 
      webpush.sendNotification(sub.subscription, notificationPayload).catch(err => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // La suscripción expiró o fue eliminada, idealmente deberíamos borrarla de la base de datos aquí
          console.log('Suscripción expirada:', err)
        } else {
          console.error('Error enviando push:', err)
        }
      })
    )

    await Promise.all(pushPromises)

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

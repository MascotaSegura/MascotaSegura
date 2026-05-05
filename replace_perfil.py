import os

with open('perfil.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_init = """    const firebaseConfig = {
      apiKey: "AIzaSyAtT1yOk3Gmq_IiVlAhlPBQ0lJvFX7uNuQ",
      authDomain: "mascotaseguraapp.firebaseapp.com",
      databaseURL: "https://mascotaseguraapp-default-rtdb.firebaseio.com",
      projectId: "mascotaseguraapp",
      storageBucket: "mascotaseguraapp.firebasestorage.app",
      messagingSenderId: "1059886332390",
      appId: "1:1059886332390:web:720e972f74a1972351be27",
      measurementId: "G-2TS2XWGFB9"
    };
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const database = firebase.database();"""

new_init = """    const SUPABASE_URL = "https://vaztacfioinkkkxmimaw.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_WHwWYUn52u_73tvPN-PC4A_fDUTRNVD";
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);"""

content = content.replace(old_init, new_init)

old_fetch = """        database.ref('pets/' + petId).once('value').then((snapshot) => {
            const pet = snapshot.val();
            document.getElementById('loading-state').classList.add('hidden');

            if (!pet) {"""

new_fetch = """        supabase.from('pets').select('*').eq('id', petId).single().then(({ data: pet, error }) => {
            document.getElementById('loading-state').classList.add('hidden');

            if (error || !pet) {"""

content = content.replace(old_fetch, new_fetch)

old_scan1 = """            // Record scan timestamp immediately
            database.ref('pets/' + petId + '/lastScan').set({
                timestamp: new Date().toISOString()
            });"""

new_scan1 = """            // Record scan timestamp immediately
            supabase.from('pets').update({
                lastScan: { timestamp: new Date().toISOString() }
            }).eq('id', petId);"""

content = content.replace(old_scan1, new_scan1)

old_scan2 = """                        database.ref('pets/' + petId + '/lastScan').set({
                            timestamp: new Date().toISOString(),
                            lat: lat,
                            lng: lng
                        }).then(() => {"""

new_scan2 = """                        supabase.from('pets').update({
                            lastScan: {
                                timestamp: new Date().toISOString(),
                                lat: lat,
                                lng: lng
                            }
                        }).eq('id', petId).then(() => {"""

content = content.replace(old_scan2, new_scan2)

# Save the changes
with open('perfil.html', 'w', encoding='utf-8') as f:
    f.write(content)

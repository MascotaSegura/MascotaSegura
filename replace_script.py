import os

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace initialization
firebase_init = """const firebaseConfig = {
  apiKey: "AIzaSyAtT1yOk3Gmq_IiVlAhlPBQ0lJvFX7uNuQ",
  authDomain: "mascotaseguraapp.firebaseapp.com",
  databaseURL: "https://mascotaseguraapp-default-rtdb.firebaseio.com",
  projectId: "mascotaseguraapp",
  storageBucket: "mascotaseguraapp.firebasestorage.app",
  messagingSenderId: "1059886332390",
  appId: "1:1059886332390:web:720e972f74a1972351be27",
  measurementId: "G-2TS2XWGFB9"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();"""

supabase_init = """const SUPABASE_URL = "https://vaztacfioinkkkxmimaw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WHwWYUn52u_73tvPN-PC4A_fDUTRNVD";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);"""

content = content.replace(firebase_init, supabase_init)

# 2. Auth State Changed
content = content.replace("auth.onAuthStateChanged((user) => {", "supabase.auth.onAuthStateChange(async (event, session) => {\n        const user = session?.user;")

# 3. Pending pet insert
pending_pet_old = "database.ref('pets').push(pendingPet).then(() => {"
pending_pet_new = "supabase.from('pets').insert([pendingPet]).then(() => {"
content = content.replace(pending_pet_old, pending_pet_new)

# 4. cargarMisMascotas definition and fetch
old_cargar_mis = """    function cargarMisMascotas(uid) {
        const loading = document.getElementById('pets-loading');
        const empty = document.getElementById('pets-empty');
        const container = document.getElementById('pets-container');
        if(!container) return;
        database.ref('pets').orderByChild('userId').equalTo(uid).on('value', (snapshot) => {
            if (loading) loading.classList.add('hidden');
            if (!snapshot.exists()) {
                if (empty) empty.classList.remove('hidden');
                if (container) {
                    container.classList.add('hidden');
                    container.classList.remove('grid');
                }
                return;
            }
            if (empty) empty.classList.add('hidden');
            if (container) {
                container.classList.remove('hidden');
                container.classList.add('grid');
            }
            container.innerHTML = '';
            if (!window.notifiedScans) window.notifiedScans = new Set();
            snapshot.forEach((childSnapshot) => {
                const pet = childSnapshot.val();
                if (pet.lastScan && pet.lastScan.timestamp) {
                    const scanId = childSnapshot.key + '_' + pet.lastScan.timestamp;"""

new_cargar_mis = """    async function cargarMisMascotas(uid) {
        const loading = document.getElementById('pets-loading');
        const empty = document.getElementById('pets-empty');
        const container = document.getElementById('pets-container');
        if(!container) return;
        
        async function fetchPets() {
            const { data: pets, error } = await supabase.from('pets').select('*').eq('userId', uid);
            if (error) {
                if (loading) {
                    loading.innerHTML = '<span class="text-red-500 text-sm font-medium text-center">Error de sincronización con la base de datos. Verifica tu internet.</span>';
                }
                return;
            }
            if (loading) loading.classList.add('hidden');
            if (!pets || pets.length === 0) {
                if (empty) empty.classList.remove('hidden');
                if (container) {
                    container.classList.add('hidden');
                    container.classList.remove('grid');
                }
                return;
            }
            if (empty) empty.classList.add('hidden');
            if (container) {
                container.classList.remove('hidden');
                container.classList.add('grid');
            }
            container.innerHTML = '';
            if (!window.notifiedScans) window.notifiedScans = new Set();
            pets.forEach((pet) => {
                if (pet.lastScan && pet.lastScan.timestamp) {
                    const scanId = pet.id + '_' + pet.lastScan.timestamp;"""

content = content.replace(old_cargar_mis, new_cargar_mis)

# 5. fix card generation handlers
content = content.replace("card.querySelector('.btn-edit').addEventListener('click', () => window.editarMascota(childSnapshot.key));\n                card.querySelector('.btn-qr').addEventListener('click', () => window.mostrarQR(childSnapshot.key, petNameStr));", "card.querySelector('.btn-edit').addEventListener('click', () => window.editarMascota(pet.id));\n                card.querySelector('.btn-qr').addEventListener('click', () => window.mostrarQR(pet.id, petNameStr));")

# 6. fix end of fetch loop
old_fetch_end = """            });
        }, () => {
            if (loading) {
                loading.innerHTML = '<span class="text-red-500 text-sm font-medium text-center">Error de sincronización con la base de datos. Verifica tu internet.</span>';
            }
        });"""

new_fetch_end = """            });
        }
        await fetchPets();
        supabase.channel('public:pets:mis').on('postgres_changes', { event: '*', schema: 'public', table: 'pets', filter: `userId=eq.${uid}` }, () => fetchPets()).subscribe();"""

content = content.replace(old_fetch_end, new_fetch_end)

# 7. eliminarMascota
old_elim = """            primaryBtnAction: () => {
                database.ref('pets/' + petId).remove().then(() => {"""
new_elim = """            primaryBtnAction: async () => {
                await supabase.from('pets').delete().eq('id', petId);
                (() => {"""
content = content.replace(old_elim, new_elim)

# 8. logout
content = content.replace("await auth.signOut();", "await supabase.auth.signOut();")

# 9. Register
old_reg = """                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                if (userCredential.user) {
                    await userCredential.user.updateProfile({
                        displayName: fullname
                    });
                }"""
new_reg = """                const { data, error } = await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: { data: { full_name: fullname } }
                });
                if (error) throw error;"""
content = content.replace(old_reg, new_reg)
content = content.replace("if(error.code === 'auth/email-already-in-use')", "if(error.message.includes('already registered'))")
content = content.replace("if(error.code === 'auth/weak-password')", "if(error.message.includes('Password should be at least 6 characters'))")

# 10. Login
old_login = """await auth.signInWithEmailAndPassword(email, password);"""
new_login = """const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;"""
content = content.replace(old_login, new_login)

# 11. Recover
old_rec = """await auth.sendPasswordResetEmail(email);"""
new_rec = """const { error } = await supabase.auth.resetPasswordForEmail(email);
                if (error) throw error;"""
content = content.replace(old_rec, new_rec)

# 12. Generar Placa Edit Load
old_edit_load = """            database.ref('pets/' + editPetId).once('value').then(snapshot => {
                if (snapshot.exists()) {
                    const pet = snapshot.val();"""
new_edit_load = """            supabase.from('pets').select('*').eq('id', editPetId).single().then(({ data: pet }) => {
                if (pet) {"""
content = content.replace(old_edit_load, new_edit_load)

# 13. current user check in Generar Placa
old_cu = """const currentUser = auth.currentUser;"""
new_cu = """const { data: { user: currentUser } } = await supabase.auth.getUser();"""
content = content.replace(old_cu, new_cu)
content = content.replace("const userId = currentUser.uid;", "const userId = currentUser.id;")

# 14. Generar Placa Save Edit
old_save_edit = """                if (editPetId) {
                    await database.ref('pets/' + editPetId).update({
                        name, type, sex, sterilized, breed, medical, ownerName, ownerPhone, ownerAltPhone, photo: base64Photo
                    });"""
new_save_edit = """                if (editPetId) {
                    await supabase.from('pets').update({
                        name, type, sex, sterilized, breed, medical, ownerName, ownerPhone, ownerAltPhone, photo: base64Photo
                    }).eq('id', editPetId);"""
content = content.replace(old_save_edit, new_save_edit)

# 15. Generar Placa Save New
old_save_new = """                } else {
                    await database.ref('pets').push({
                        userId, name, type, sex, sterilized, breed, medical, ownerName, ownerPhone, ownerAltPhone, photo: base64Photo,
                        createdAt: new Date().toISOString()
                    });"""
new_save_new = """                } else {
                    await supabase.from('pets').insert([{
                        userId, name, type, sex, sterilized, breed, medical, ownerName, ownerPhone, ownerAltPhone, photo: base64Photo,
                        createdAt: new Date().toISOString()
                    }]);"""
content = content.replace(old_save_new, new_save_new)

# 16. cargarNotificaciones
old_notif = """function cargarNotificaciones(uid) {
    const loading = document.getElementById('notifications-loading');
    const empty = document.getElementById('notifications-empty');
    const container = document.getElementById('notifications-container');
    if(!container) return;

    database.ref('pets').orderByChild('userId').equalTo(uid).on('value', (snapshot) => {
        if(loading) loading.classList.add('hidden');
        
        if (!snapshot.exists()) {
            if(empty) empty.classList.remove('hidden');
            if(container) container.classList.add('hidden');
            return;
        }

        const notifs = [];
        snapshot.forEach((child) => {
            const pet = child.val();
            if (pet.lastScan && pet.lastScan.timestamp) {
                notifs.push({
                    petName: pet.name || 'Tu mascota',
                    petId: child.key,
                    photo: pet.photo || '',
                    time: new Date(pet.lastScan.timestamp),
                    lat: pet.lastScan.lat,
                    lng: pet.lastScan.lng
                });
            }
        });"""

new_notif = """async function cargarNotificaciones(uid) {
    const loading = document.getElementById('notifications-loading');
    const empty = document.getElementById('notifications-empty');
    const container = document.getElementById('notifications-container');
    if(!container) return;

    async function fetchNotifs() {
        const { data: pets, error } = await supabase.from('pets').select('*').eq('userId', uid);
        if (error) {
            console.error("Supabase Database Error: ", error);
            if(loading) loading.innerHTML = '<span class="text-red-500 text-sm font-medium text-center">Error de conexión con la base de datos. Verifica tu internet.</span>';
            return;
        }
        if(loading) loading.classList.add('hidden');
        
        if (!pets || pets.length === 0) {
            if(empty) empty.classList.remove('hidden');
            if(container) container.classList.add('hidden');
            return;
        }

        const notifs = [];
        pets.forEach((pet) => {
            if (pet.lastScan && pet.lastScan.timestamp) {
                notifs.push({
                    petName: pet.name || 'Tu mascota',
                    petId: pet.id,
                    photo: pet.photo || '',
                    time: new Date(pet.lastScan.timestamp),
                    lat: pet.lastScan.lat,
                    lng: pet.lastScan.lng
                });
            }
        });"""
content = content.replace(old_notif, new_notif)

old_notif_end = """        });
    }, (error) => {
        console.error("Firebase Database Error: ", error);
        if(loading) loading.innerHTML = '<span class="text-red-500 text-sm font-medium text-center">Error de conexión con la base de datos. Verifica tu internet.</span>';
    });
}"""

new_notif_end = """        });
    }
    await fetchNotifs();
    supabase.channel('public:pets:notifs').on('postgres_changes', { event: '*', schema: 'public', table: 'pets', filter: `userId=eq.${uid}` }, () => fetchNotifs()).subscribe();
}"""
content = content.replace(old_notif_end, new_notif_end)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

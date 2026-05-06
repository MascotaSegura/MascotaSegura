const SUPABASE_URL = "https://vaztacfioinkkkxmimaw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WHwWYUn52u_73tvPN-PC4A_fDUTRNVD";
const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('pet-photo');
    let base64Photo = null;
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const maxSize = 400;
                        let width = img.width;
                        let height = img.height;
                        if (width > height) {
                            if (width > maxSize) {
                                height *= maxSize / width;
                                width = maxSize;
                            }
                        } else {
                            if (height > maxSize) {
                                width *= maxSize / height;
                                height = maxSize;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                        base64Photo = canvas.toDataURL('image/jpeg', 0.8);

                        uploadArea.innerHTML = `<img src="${base64Photo}" class="w-full h-full object-cover rounded-full">`;

                        const previewPhotoContainer = document.getElementById('preview-photo-container');
                        const previewPhotoPlaceholder = document.getElementById('preview-photo-placeholder');
                        const previewPhoto = document.getElementById('preview-photo');
                        if (previewPhotoContainer && previewPhotoPlaceholder && previewPhoto) {
                            previewPhotoPlaceholder.classList.add('hidden');
                            previewPhotoContainer.classList.remove('hidden');
                            previewPhoto.src = base64Photo;
                        }
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const petNameInput = document.getElementById('pet-name');
    const petTypeInput = document.getElementById('pet-type');
    const petSexInput = document.getElementById('pet-sex');
    const previewName = document.getElementById('preview-name');
    const previewTags = document.getElementById('preview-tags');

    function updatePreview() {
        if (!previewName || !previewTags) return;
        const name = petNameInput.value.trim() || 'Nombre de mascota';
        const type = petTypeInput.options[petTypeInput.selectedIndex].text;
        const sex = petSexInput.options[petSexInput.selectedIndex].text;
        previewName.textContent = name;
        previewTags.innerHTML = `${sex} &bull; ${type}`;
    }

    if (petNameInput) petNameInput.addEventListener('input', updatePreview);
    if (petTypeInput) petTypeInput.addEventListener('change', updatePreview);
    if (petSexInput) petSexInput.addEventListener('change', updatePreview);

    function showModal(config) {
        const backdrop = document.createElement('div');
        backdrop.className = 'fixed inset-0 bg-brand/80 z-[200] flex items-center justify-center p-4 md:p-6 opacity-0 transition-opacity duration-200';
        const modal = document.createElement('div');
        modal.className = 'bg-white w-[92%] max-w-md rounded-[2.5rem] p-6 md:p-8 flex flex-col items-center scale-95 transition-transform duration-200 border-0 shadow-none';
        modal.innerHTML = `
            <div class="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6 shadow-none">
                <i class="ph-fill ${config.icon || 'ph-check-circle'} text-4xl ${config.isError ? 'text-red-500' : 'text-brand'}"></i>
            </div>
            <h3 class="text-2xl font-semibold text-brand text-center mb-3">${config.title}</h3>
            <p class="text-sm text-zinc-500 text-center mb-8 leading-relaxed">${config.text}</p>
            ${config.customHtml ? `<div class="w-full mb-8 flex justify-center">${config.customHtml}</div>` : ''}
            <div class="w-full flex flex-col gap-3">
                <button id="modal-primary-btn" class="w-full ${config.isError ? 'bg-red-500 hover:bg-red-600' : 'bg-brand hover:bg-brandHover'} text-white font-medium text-sm py-4 rounded-full transition-colors shadow-none border-0 appearance-none">
                    ${config.primaryBtnText || 'Entendido'}
                </button>
                ${config.secondaryBtnText ? `
                <button id="modal-secondary-btn" class="w-full bg-transparent text-zinc-500 font-medium text-sm py-3 rounded-full hover:text-brand transition-colors shadow-none border-0 appearance-none">
                    ${config.secondaryBtnText}
                </button>
                ` : ''}
            </div>
        `;
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        setTimeout(() => {
            backdrop.classList.remove('opacity-0');
            modal.classList.remove('scale-95');
        }, 10);
        const close = () => {
            backdrop.classList.add('opacity-0');
            modal.classList.add('scale-95');
            setTimeout(() => backdrop.remove(), 300);
        };
        document.getElementById('modal-primary-btn').addEventListener('click', () => {
            close();
            if (config.primaryBtnAction) config.primaryBtnAction();
        });
        if (config.secondaryBtnText) {
            document.getElementById('modal-secondary-btn').addEventListener('click', () => {
                close();
                if (config.secondaryBtnAction) config.secondaryBtnAction();
            });
        }
    }
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    });
    function clearValidations() {
        document.querySelectorAll('.border-red-500').forEach(el => {
            el.classList.remove('border-red-500', 'border-2');
            el.classList.add('border-0');
        });
    }
    function validateRequired(ids) {
        clearValidations();
        let isValid = true;
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.value.trim()) {
                el.classList.remove('border-0');
                el.classList.add('border-red-500', 'border-2');
                isValid = false;
            }
        });
        return isValid;
    }
    sbClient.auth.onAuthStateChange(async (event, session) => {
        const user = session?.user;
        const path = window.location.pathname;
        if (user) {
            if (sessionStorage.getItem('pendingPet')) {
                try {
                    const pendingPet = JSON.parse(sessionStorage.getItem('pendingPet'));
                    pendingPet.userId = user.id;
                    pendingPet.createdAt = new Date().toISOString();
                    sbClient.from('pets').insert([pendingPet]).then(({ error }) => {
                        if (error) {
                            console.error("Error al guardar pendingPet:", error);
                            return;
                        }
                        sessionStorage.removeItem('pendingPet');
                        showModal({
                            icon: 'ph-qr-code',
                            title: '¡Placa Generada!',
                            text: 'Se han guardado los datos de tu mascota exitosamente tras iniciar sesión.',
                            primaryBtnText: 'Ir a Mis Mascotas',
                            primaryBtnAction: () => window.location.href = "mis-mascotas.html"
                        });
                    }).catch(console.error);
                } catch (e) {
                    console.error('Error in pendingPet', e);
                }
            }
        }
        const navEntrar = document.getElementById('nav-entrar');
        const navRegistro = document.getElementById('nav-registro');
        const navSalir = document.getElementById('nav-salir');
        const mobileEntrar = document.getElementById('mobile-entrar');
        const mobileRegistro = document.getElementById('mobile-registro');
        const mobileSalir = document.getElementById('mobile-salir');
        if (user) {
            if (navEntrar) navEntrar.classList.add('!hidden');
            if (navRegistro) navRegistro.classList.add('!hidden');
            if (navSalir) navSalir.classList.remove('!hidden');
            if (mobileEntrar) mobileEntrar.classList.add('!hidden');
            if (mobileRegistro) mobileRegistro.classList.add('!hidden');
            if (mobileSalir) mobileSalir.classList.remove('!hidden');
            if (path.includes('entrar') || path.includes('registro') || path.includes('recuperar')) {
                window.location.href = 'mis-mascotas.html';
            }
            const protectedContent = document.getElementById('protected-content');
            if (protectedContent) protectedContent.classList.remove('hidden');
            if (path.includes('mis-mascotas')) {
                cargarMisMascotas(user.id);
            }
            if (path.includes('notificaciones')) {
                cargarNotificaciones(user.id);
            }
        } else {
            if (navEntrar) navEntrar.classList.remove('!hidden');
            if (navRegistro) navRegistro.classList.remove('!hidden');
            if (navSalir) navSalir.classList.add('!hidden');
            if (mobileEntrar) mobileEntrar.classList.remove('!hidden');
            if (mobileRegistro) mobileRegistro.classList.remove('!hidden');
            if (mobileSalir) mobileSalir.classList.add('!hidden');
            if (path.includes('mis-mascotas')) {
                window.location.href = 'entrar.html';
            }
        }
    });
    async function cargarMisMascotas(uid) {
        const loading = document.getElementById('pets-loading');
        const empty = document.getElementById('pets-empty');
        const container = document.getElementById('pets-container');
        if (!container) return;

        async function fetchPets() {
            const { data: pets, error } = await sbClient.from('pets').select('*').eq('userId', uid);
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
                    const scanId = pet.id + '_' + pet.lastScan.timestamp;
                    if (!window.notifiedScans.has(scanId)) {
                        window.notifiedScans.add(scanId);
                        const scanTime = new Date(pet.lastScan.timestamp).getTime();
                        const now = new Date().getTime();
                        if (now - scanTime < 5 * 60 * 1000) {
                            if ('Notification' in window && Notification.permission === 'granted') {
                                const mapUrl = `https://www.google.com/maps?q=${pet.lastScan.lat},${pet.lastScan.lng}`;
                                const notification = new Notification(`¡Alerta! ${pet.name || 'Tu mascota'} localizada`, {
                                    body: `Alguien acaba de escanear su placa. Toca aquí para abrir su ubicación GPS exacta en Google Maps.`,
                                    icon: 'paw-print-fill.svg',
                                    vibrate: [200, 100, 200, 100, 200]
                                });
                                notification.onclick = function () {
                                    window.open(mapUrl, '_blank');
                                    notification.close();
                                };
                            }
                        }
                    }
                }
                const card = document.createElement('div');
                card.className = 'w-full bg-white rounded-[2.5rem] p-6 sm:p-8 flex flex-col items-center gap-6 shadow-none border-0 relative';
                card.innerHTML = `
                    <button class="btn-edit absolute top-6 right-6 w-12 h-12 bg-surface rounded-full flex items-center justify-center text-zinc-400 hover:text-brand hover:bg-surfaceHover transition-colors shadow-none border-0 appearance-none" aria-label="Editar mascota">
                        <i class="ph-bold ph-pencil-simple text-xl pointer-events-none" aria-hidden="true"></i>
                    </button>
                    
                    <div class="pet-photo-container w-24 h-24 bg-surface rounded-full flex items-center justify-center shadow-none overflow-hidden mt-2">
                    </div>
                    
                    <div class="flex flex-col items-center mt-2">
                        <h3 class="pet-name-display text-2xl font-semibold text-brand"></h3>
                    </div>

                    <button class="btn-qr w-full bg-brand text-white font-medium text-base py-4 rounded-full hover:bg-brandHover transition-colors shadow-none border-0 flex items-center justify-center gap-2 appearance-none mt-4">
                        <i class="ph-bold ph-qr-code text-xl" aria-hidden="true"></i> Ver Placa QR
                    </button>
                `;

                const photoContainer = card.querySelector('.pet-photo-container');
                if (pet.photo) {
                    const img = document.createElement('img');
                    img.src = pet.photo;
                    img.alt = 'Foto de perfil';
                    img.className = 'w-full h-full object-cover';
                    photoContainer.appendChild(img);
                } else {
                    photoContainer.innerHTML = '<i class="ph-fill ph-dog text-4xl text-zinc-400" aria-hidden="true"></i>';
                }

                const petNameStr = pet.name || 'Sin nombre';
                card.querySelector('.pet-name-display').textContent = petNameStr;
                card.querySelector('.btn-edit').addEventListener('click', () => window.editarMascota(pet.id));
                card.querySelector('.btn-qr').addEventListener('click', () => window.mostrarQR(pet.id, petNameStr));
                container.appendChild(card);
            });
        }
        await fetchPets();
        sbClient.channel('public:pets:mis').on('postgres_changes', { event: '*', schema: 'public', table: 'pets', filter: `userId=eq.${uid}` }, () => fetchPets()).subscribe();
    }
    window.mostrarQR = function(petId, petName) {
        const urlPerfil = new URL('perfil.html?id=' + petId, window.location.href).href;
        const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(urlPerfil)}`;
        showModal({
            icon: 'ph-qr-code',
            title: `Placa de ${petName}`,
            text: 'Este es el código único. Quien lo escanee verá su perfil público para ayudarte a localizarlo.',
            customHtml: `<div class="bg-surface p-4 rounded-3xl"><img src="${qrImgUrl}" alt="QR de ${petName}" class="w-48 h-48 rounded-xl object-contain mix-blend-multiply"></div>`,
            primaryBtnText: 'Cerrar',
            secondaryBtnText: 'Abrir perfil público',
            secondaryBtnAction: () => {
                window.open(urlPerfil, '_blank');
            }
        });
    };

    window.editarMascota = function (petId) {
        window.location.href = `crear-placa.html?edit=${petId}`;
    };

    window.eliminarMascota = function (petId, petName) {
        showModal({
            icon: 'ph-warning-octagon',
            isError: true,
            title: '¿Eliminar Placa?',
            text: `¿Estás seguro de que deseas eliminar la placa de ${petName || 'esta mascota'}? Esta acción es irreversible y el código QR dejará de funcionar.`,
            primaryBtnText: 'Sí, eliminar',
            primaryBtnAction: async () => {
                const { error } = await sbClient.from('pets').delete().eq('id', petId);
                if (error) {
                    console.error("Error eliminando mascota:", error);
                    alert("Error al eliminar: " + error.message);
                    return;
                }
                if (window.location.pathname.includes('crear-placa')) {
                    window.location.href = 'mis-mascotas.html';
                }
            },
            secondaryBtnText: 'Cancelar'
        });
    };
    window.openScannerModal = function () {
        if (window.html5QrCodeScannerIsActive) return;
        window.html5QrCodeScannerIsActive = true;
        showModal({
            icon: 'ph-scan',
            title: 'Escanear Placa',
            text: 'Apunta la cámara al código QR de la mascota.',
            customHtml: '<div id="qr-reader" class="w-full h-64 rounded-2xl overflow-hidden bg-black flex items-center justify-center border-0 shadow-none"></div>',
            primaryBtnText: 'Cancelar Escaneo',
            primaryBtnAction: () => {
                if (window.html5QrCode) {
                    window.html5QrCode.stop().then(() => {
                        window.html5QrCode.clear();
                    }).catch(console.error);
                }
                window.html5QrCodeScannerIsActive = false;
            }
        });
        setTimeout(() => {
            if (typeof Html5Qrcode !== 'undefined') {
                window.html5QrCode = new Html5Qrcode("qr-reader");
                const config = { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 };
                window.html5QrCode.start({ facingMode: "environment" }, config, (decodedText) => {
                    window.html5QrCode.stop().then(() => {
                        window.html5QrCode.clear();
                        window.html5QrCodeScannerIsActive = false;
                        document.getElementById('modal-primary-btn').click();
                        setTimeout(() => {
                            if (decodedText.includes('perfil.html?id=')) {
                                window.location.href = decodedText;
                            } else {
                                showModal({
                                    icon: 'ph-check-circle',
                                    title: 'Placa Detectada',
                                    text: 'Contenido del código escaneado:',
                                    customHtml: `<div class="bg-surface p-4 rounded-xl w-full break-all text-center font-medium text-brand">` + decodedText + `</div>`,
                                    primaryBtnText: 'Entendido'
                                });
                            }
                        }, 400);
                    });
                }).catch((err) => {
                    window.html5QrCodeScannerIsActive = false;
                });
            } else {
                const qrContainer = document.getElementById('qr-reader');
                if (qrContainer) qrContainer.innerHTML = '<span class="text-sm text-red-500 font-medium px-4 text-center">Error al cargar la cámara.</span>';
                window.html5QrCodeScannerIsActive = false;
            }
        }, 500);
    };
    const handleLogout = async () => {
        try {
            const { error } = await sbClient.auth.signOut();
            if (error) throw error;
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error', error);
        }
    };
    const navSalirBtn = document.getElementById('nav-salir');
    const mobileSalirBtn = document.getElementById('mobile-salir');
    if (navSalirBtn) navSalirBtn.addEventListener('click', handleLogout);
    if (mobileSalirBtn) mobileSalirBtn.addEventListener('click', handleLogout);

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                if (mobileMenu.classList.contains('hidden')) {
                    icon.classList.remove('ph-x');
                    icon.classList.add('ph-list');
                } else {
                    icon.classList.remove('ph-list');
                    icon.classList.add('ph-x');
                }
            }
        });
    }
    const formRegistro = document.querySelector('#btn-registro')?.closest('form');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnRegistro = document.getElementById('btn-registro');
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const fullname = document.getElementById('fullname').value;
            const requiredFields = ['email', 'password', 'fullname'];
            if (!validateRequired(requiredFields)) {
                showModal({
                    isError: true,
                    icon: 'ph-warning-circle',
                    title: 'Faltan datos',
                    text: 'Por favor, llena los campos resaltados en rojo para poder crear tu cuenta.'
                });
                return;
            }
            try {
                if (btnRegistro) {
                    btnRegistro.innerText = "Cargando...";
                    btnRegistro.disabled = true;
                }
                const { data, error } = await sbClient.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullname } }
                });
                if (error) throw error;
                showModal({
                    icon: 'ph-party-confetti',
                    title: '¡Bienvenido!',
                    text: 'Tu cuenta ha sido creada exitosamente. Si se requiere confirmación, revisa tu correo electrónico.',
                    primaryBtnText: 'Empezar ahora',
                    primaryBtnAction: () => window.location.href = "mis-mascotas.html"
                });
            } catch (error) {
                let msg = error.message || 'Hubo un error al crear la cuenta. Inténtalo de nuevo.';
                if (msg.includes('already registered')) msg = 'Este correo ya está registrado.';
                if (msg.includes('Password should be at least')) msg = 'La contraseña debe tener al menos 6 caracteres.';
                if (msg.includes('rate limit')) msg = 'Límite de correos excedido en Supabase (3 por hora). Para solucionarlo, ve a tu panel de Supabase -> Authentication -> Providers -> Email -> Desactiva "Confirm email" y guarda los cambios.';

                showModal({
                    isError: true,
                    icon: 'ph-warning-octagon',
                    title: 'Hubo un problema',
                    text: msg
                });
                if (btnRegistro) {
                    btnRegistro.innerText = "Crear mi cuenta";
                    btnRegistro.disabled = false;
                }
            }
        });
    }
    const formEntrar = document.querySelector('#btn-entrar')?.closest('form');
    if (formEntrar) {
        formEntrar.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnEntrar = document.getElementById('btn-entrar');
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const requiredFields = ['email', 'password'];
            if (!validateRequired(requiredFields)) {
                showModal({
                    isError: true,
                    icon: 'ph-warning-circle',
                    title: 'Faltan datos',
                    text: 'Ingresa tu correo y contraseña en los campos resaltados en rojo para continuar.'
                });
                return;
            }
            try {
                if (btnEntrar) {
                    btnEntrar.innerText = "Cargando...";
                    btnEntrar.disabled = true;
                }
                const { error } = await sbClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                showModal({
                    icon: 'ph-hand-waving',
                    title: '¡Hola de nuevo!',
                    text: 'Hemos validado tus datos. Entrando a tu panel de control...',
                    primaryBtnText: 'Continuar',
                    primaryBtnAction: () => window.location.href = "mis-mascotas.html"
                });
            } catch (error) {
                let msg = error.message || 'Error al iniciar sesión.';
                if (msg.includes('Email not confirmed')) {
                    msg = 'Por favor, confirma tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.';
                } else if (msg.includes('Invalid login credentials')) {
                    msg = 'El correo o la contraseña son incorrectos.';
                }
                showModal({
                    isError: true,
                    icon: 'ph-shield-warning',
                    title: 'Acceso Denegado',
                    text: msg
                });
                if (btnEntrar) {
                    btnEntrar.innerText = "Entrar a mi cuenta";
                    btnEntrar.disabled = false;
                }
            }
        });
    }
    const formRecuperar = document.querySelector('#btn-recuperar')?.closest('form');
    if (formRecuperar) {
        formRecuperar.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnRecuperar = document.getElementById('btn-recuperar');
            const email = document.getElementById('email').value;
            if (!validateRequired(['email'])) {
                showModal({
                    isError: true,
                    icon: 'ph-warning-circle',
                    title: 'Correo requerido',
                    text: 'Por favor, ingresa el correo electrónico resaltado en rojo.'
                });
                return;
            }
            try {
                if (btnRecuperar) {
                    btnRecuperar.innerText = "Enviando...";
                    btnRecuperar.disabled = true;
                }
                const { error } = await sbClient.auth.resetPasswordForEmail(email);
                if (error) throw error;
                showModal({
                    icon: 'ph-paper-plane-tilt',
                    title: 'Enlace Enviado',
                    text: 'Revisa tu bandeja de entrada o la carpeta de spam para restablecer tu contraseña.',
                    primaryBtnText: 'Volver al inicio',
                    primaryBtnAction: () => window.location.href = "entrar.html"
                });
            } catch (error) {
                let msg = error.message || 'Ocurrió un error al intentar enviar el correo.';
                if (msg.includes('user-not-found') || msg.includes('User not found')) msg = 'No existe una cuenta con este correo.';
                if (msg.includes('rate limit')) msg = 'Has excedido el límite de intentos. Por favor, inténtalo más tarde.';
                showModal({
                    isError: true,
                    icon: 'ph-warning-octagon',
                    title: 'Error al enviar',
                    text: msg
                });
                if (btnRecuperar) {
                    btnRecuperar.innerText = "Enviar enlace";
                    btnRecuperar.disabled = false;
                }
            }
        });
    }
    const btnGenerarPlaca = document.getElementById('btn-generar-placa');
    if (btnGenerarPlaca) {
        const urlParams = new URLSearchParams(window.location.search);
        const editPetId = urlParams.get('edit');

        if (editPetId) {
            btnGenerarPlaca.innerText = "Guardar Cambios";
            const heading = document.querySelector('h1');
            const subhead = document.querySelector('h1 + p');
            if (heading) heading.innerText = "Editar Placa";
            if (subhead) subhead.innerText = "Actualiza los datos del perfil inteligente de tu mascota.";

            sbClient.from('pets').select('*').eq('id', editPetId).single().then(({ data: pet, error }) => {
                if (error) {
                    console.error("Error cargando mascota:", error);
                    return;
                }
                if (pet) {
                    const setValue = (id, val) => { if (document.getElementById(id)) document.getElementById(id).value = val || ''; };
                    setValue('pet-name', pet.name);
                    setValue('pet-type', pet.type || 'perro');
                    setValue('pet-sex', pet.sex || 'macho');
                    setValue('pet-sterilized', pet.sterilized || 'no');
                    setValue('pet-breed', pet.breed);
                    setValue('pet-medical', pet.medical);
                    setValue('owner-name', pet.ownerName);
                    setValue('owner-phone', pet.ownerPhone);
                    setValue('owner-alt-phone', pet.ownerAltPhone);

                    if (pet.photo) {
                        base64Photo = pet.photo;
                        const uploadArea = document.getElementById('upload-area');
                        if (uploadArea) {
                            uploadArea.innerHTML = `<img src="${base64Photo}" class="w-full h-full object-cover rounded-full">`;
                        }
                        const previewPhotoContainer = document.getElementById('preview-photo-container');
                        const previewPhotoPlaceholder = document.getElementById('preview-photo-placeholder');
                        const previewPhoto = document.getElementById('preview-photo');
                        if (previewPhotoContainer && previewPhotoPlaceholder && previewPhoto) {
                            previewPhotoPlaceholder.classList.add('hidden');
                            previewPhotoContainer.classList.remove('hidden');
                            previewPhoto.src = base64Photo;
                        }
                    }
                    if (typeof updatePreview === 'function') updatePreview();
                }
            });

            const form = document.getElementById('pet-form');
            if (form && !document.getElementById('btn-eliminar-placa')) {
                const deleteBtnContainer = document.createElement('div');
                deleteBtnContainer.className = 'mt-6 w-full flex justify-center';
                deleteBtnContainer.innerHTML = `
                    <button type="button" id="btn-eliminar-placa" class="text-red-500 font-medium text-sm hover:underline flex items-center gap-2 bg-transparent border-0 shadow-none appearance-none cursor-pointer">
                        <i class="ph-bold ph-trash text-lg"></i> Eliminar placa permanentemente
                    </button>
                `;
                form.appendChild(deleteBtnContainer);
                document.getElementById('btn-eliminar-placa').addEventListener('click', () => {
                    const nameInput = document.getElementById('pet-name');
                    window.eliminarMascota(editPetId, nameInput ? nameInput.value : '');
                });
            }
        }

        document.getElementById('pet-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('pet-name').value;
            const type = document.getElementById('pet-type').value;
            const sex = document.getElementById('pet-sex').value;
            const sterilized = document.getElementById('pet-sterilized').value;
            const breed = document.getElementById('pet-breed').value;
            const medical = document.getElementById('pet-medical').value;
            const ownerName = document.getElementById('owner-name').value;
            const ownerPhone = document.getElementById('owner-phone').value;
            const ownerAltPhone = document.getElementById('owner-alt-phone').value;
            const requiredFields = ['pet-name', 'owner-name', 'owner-phone'];
            if (!validateRequired(requiredFields)) {
                showModal({
                    isError: true,
                    icon: 'ph-warning-circle',
                    title: 'Campos requeridos',
                    text: 'Por favor completa los campos resaltados en rojo.'
                });
                return;
            }
            const { data: { user: currentUser } } = await sbClient.auth.getUser();
            if (!currentUser) {
                const petData = { name, type, sex, sterilized, breed, medical, ownerName, ownerPhone, ownerAltPhone, photo: base64Photo };
                sessionStorage.setItem('pendingPet', JSON.stringify(petData));
                showModal({
                    icon: 'ph-lock-key',
                    title: '¡Casi listo!',
                    text: 'Crea una cuenta gratuita para guardar y activar la placa inteligente de tu mascota. No perderás los datos que ingresaste.',
                    primaryBtnText: 'Crear mi cuenta',
                    primaryBtnAction: () => window.location.href = "registro.html",
                    secondaryBtnText: 'Ya tengo cuenta',
                    secondaryBtnAction: () => window.location.href = "entrar.html"
                });
                return;
            }
            try {
                btnGenerarPlaca.innerText = "Guardando...";
                btnGenerarPlaca.disabled = true;
                const userId = currentUser.id;

                if (editPetId) {
                    const { error } = await sbClient.from('pets').update({
                        name, type, sex, sterilized, breed, medical, ownerName, ownerPhone, ownerAltPhone, photo: base64Photo
                    }).eq('id', editPetId);
                    if (error) throw error;
                    showModal({
                        icon: 'ph-check-circle',
                        title: '¡Cambios Guardados!',
                        text: 'La placa de tu mascota ha sido actualizada exitosamente.',
                        primaryBtnText: 'Volver a Mis Mascotas',
                        primaryBtnAction: () => window.location.href = "mis-mascotas.html"
                    });
                } else {
                    const { error } = await sbClient.from('pets').insert([{
                        userId, name, type, sex, sterilized, breed, medical, ownerName, ownerPhone, ownerAltPhone, photo: base64Photo,
                        createdAt: new Date().toISOString()
                    }]);
                    if (error) throw error;
                    document.getElementById('pet-form').reset();
                    btnGenerarPlaca.innerText = "Generar Placa";
                    btnGenerarPlaca.disabled = false;
                    showModal({
                        icon: 'ph-qr-code',
                        title: '¡Placa Generada!',
                        text: 'El perfil de tu mascota ha sido creado con éxito. Ya puedes ver su código QR y gestionarlo.',
                        primaryBtnText: 'Ir a Mis Mascotas',
                        primaryBtnAction: () => window.location.href = "mis-mascotas.html"
                    });
                }
            } catch (error) {
                showModal({
                    isError: true,
                    icon: 'ph-warning-octagon',
                    title: 'Error al guardar',
                    text: 'No pudimos registrar la placa. Inténtalo de nuevo. Detalle: ' + error.message
                });
                btnGenerarPlaca.innerText = "Generar Placa";
                btnGenerarPlaca.disabled = false;
            }
        });
    }
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(console.error);
        });
    }

    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });
});


async function cargarNotificaciones(uid) {
    const loading = document.getElementById('notifications-loading');
    const empty = document.getElementById('notifications-empty');
    const container = document.getElementById('notifications-container');
    if (!container) return;

    async function fetchNotifs() {
        const { data: pets, error } = await sbClient.from('pets').select('*').eq('userId', uid);
        if (error) {
            console.error("Supabase Database Error: ", error);
            if (loading) loading.innerHTML = '<span class="text-red-500 text-sm font-medium text-center">Error de conexión con la base de datos. Verifica tu internet.</span>';
            return;
        }
        if (loading) loading.classList.add('hidden');

        if (!pets || pets.length === 0) {
            if (empty) empty.classList.remove('hidden');
            if (container) container.classList.add('hidden');
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
        });

        if (notifs.length === 0) {
            if (empty) empty.classList.remove('hidden');
            if (container) container.classList.add('hidden');
            return;
        }

        notifs.sort((a, b) => b.time - a.time);

        if (empty) empty.classList.add('hidden');
        if (container) {
            container.classList.remove('hidden');
            container.classList.add('flex');
            container.innerHTML = '';
        }

        notifs.forEach(n => {
            const card = document.createElement('div');
            card.className = 'w-full bg-white p-5 rounded-3xl flex items-center gap-4 shadow-none border-0';

            const timeStr = n.time.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

            card.innerHTML = `
                <div class="pet-photo-container w-14 h-14 bg-surface rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border-0"></div>
                <div class="flex-1">
                    <h4 class="text-brand font-semibold text-base mb-0.5">¡Placa escaneada!</h4>
                    <p class="text-sm text-zinc-500 leading-tight">Alguien escaneó la placa de <span class="pet-name-display font-semibold text-brand"></span> el ${timeStr}.</p>
                    <div class="map-btn-container"></div>
                </div>
            `;

            const photoContainer = card.querySelector('.pet-photo-container');
            if (n.photo) {
                const img = document.createElement('img');
                img.src = n.photo;
                img.alt = 'Foto de perfil';
                img.className = 'w-full h-full object-cover';
                photoContainer.appendChild(img);
            } else {
                photoContainer.innerHTML = '<i class="ph-fill ph-dog text-2xl text-zinc-400" aria-hidden="true"></i>';
            }

            card.querySelector('.pet-name-display').textContent = n.petName;

            const mapContainer = card.querySelector('.map-btn-container');
            if (n.lat && n.lng) {
                const btn = document.createElement('button');
                btn.className = 'mt-2 text-sm font-medium text-brand bg-surface hover:bg-surfaceHover px-4 py-2 rounded-full transition-colors inline-flex items-center gap-2 border-0 shadow-none';
                btn.innerHTML = '<i class="ph-bold ph-map-pin" aria-hidden="true"></i> Ver Ubicación GPS';
                btn.addEventListener('click', () => window.open(`https://www.google.com/maps?q=${n.lat},${n.lng}`, '_blank'));
                mapContainer.appendChild(btn);
            } else {
                const span = document.createElement('span');
                span.className = 'mt-2 inline-block text-xs font-medium text-zinc-400 bg-surface px-3 py-1.5 rounded-full';
                span.textContent = 'Sin GPS exacto';
                mapContainer.appendChild(span);
            }

            if (container) container.appendChild(card);
        });
    }
    await fetchNotifs();
    sbClient.channel('public:pets:notifs').on('postgres_changes', { event: '*', schema: 'public', table: 'pets', filter: `userId=eq.${uid}` }, () => fetchNotifs()).subscribe();
}

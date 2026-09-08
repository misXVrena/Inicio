// Esperamos a que todo el HTML cargue primero
document.addEventListener("DOMContentLoaded", function() {
    /*
   // Galerías con auto-scroll fluido y continuo (Carousel)
    const galeriaContainer = document.querySelector(".galeria-container");
    
    if (galeriaContainer) {
        // Clonamos el contenido varias veces para asegurar que cubra pantallas grandes
        const originalContent = galeriaContainer.innerHTML;
        galeriaContainer.innerHTML = originalContent + originalContent + originalContent + originalContent;
        
        let scrollAmount = 0;
        const speed = 0.5; // Velocidad ajustada
        let isPaused = false; // Variable para controlar la pausa

        function autoScroll() {
            if (!isPaused) {
                scrollAmount += speed;
                
                // Usamos una lógica diferente para el reinicio
                // Cuando el primer set completo de imágenes ha pasado, 
                // ajustamos el scroll para que parezca infinito suavemente
                // scrollWidth es el ancho total, dividimos por 4 porque clonamos 4 veces
                const singleSetWidth = galeriaContainer.scrollWidth / 4;
                
                if (scrollAmount >= singleSetWidth) {
                    // Restamos el ancho de un set, no lo ponemos a 0 bruscamente
                    // Esto mantiene la posición relativa exacta
                    scrollAmount -= singleSetWidth;
                }

                galeriaContainer.scrollLeft = scrollAmount;
            }
            requestAnimationFrame(autoScroll);
        }

        // Pausar al pasar el mouse
        galeriaContainer.addEventListener('mouseenter', () => {
            isPaused = true;
        });
        
        // Reanudar al quitar el mouse
        galeriaContainer.addEventListener('mouseleave', () => {
            isPaused = false;
        });

        // Iniciamos la animación
        requestAnimationFrame(autoScroll);
    }
    */
    // Configura la fecha de la fiesta (Mes en inglés, Día, Año Hora:Minutos:Segundos)
    // 9 de Mayo de 2026 a las 21:30 hrs
    const countdownDate = new Date("Oct 16, 2026 22:00:00").getTime();

    const x = setInterval(function() {
        // Obtenemos la fecha y hora actual
        const now = new Date().getTime();
        
        // Encontramos la distancia entre ahora y la fecha de la fiesta
        const distance = countdownDate - now;
        
        // Cálculos matemáticos para días, horas, minutos y segundos
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Elementos del HTML
        const daysElement = document.getElementById("days");
        const hoursElement = document.getElementById("hours");
        const minutesElement = document.getElementById("minutes");
        const secondsElement = document.getElementById("seconds");

        // Verificamos que los elementos existan antes de intentar cambiarles el texto
        if (daysElement && hoursElement && minutesElement && secondsElement) {
            daysElement.innerHTML = days < 10 ? "0" + days : days;
            hoursElement.innerHTML = hours < 10 ? "0" + hours : hours;
            minutesElement.innerHTML = minutes < 10 ? "0" + minutes : minutes;
            secondsElement.innerHTML = seconds < 10 ? "0" + seconds : seconds;
        }
        
        // Si el conteo termina, mostrar un mensaje
        if (distance < 0) {
            clearInterval(x);
            const countdownContainer = document.querySelector(".countdown");
            if (countdownContainer) {
                countdownContainer.innerHTML = "<h3 style='color: var(--accent-color); font-family: var(--font-title);'>¡LLEGÓ EL DÍA!</h3>";
            }
        }
    }, 1000);

    // ==========================================
    // LÓGICA DE SUBIDA A GOOGLE DRIVE (GAS)
    // ==========================================
    const uploadForm = document.getElementById("uploadForm");
    const photoInput = document.getElementById("photoInput");
    const fileStatus = document.getElementById("fileStatus");
    const uploadButton = document.getElementById("uploadButton");
    const loader = document.getElementById("loader");
    const successMessage = document.getElementById("successMessage");

    // REEMPLAZAR ESTA URL CON LA QUE OBTENGAS AL PUBLICAR EL SCRIPT DE GOOGLE
    const FLASK_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzh3Qd63wmRBn6XmtnZ4f2aGdI6IVBvhLvNPcqskpSqtWnzXshk41BP67Mx9E1GUYyj/exec";

    if (photoInput) {
        // Al seleccionar archivos
        photoInput.addEventListener("change", function(e) {
            const files = e.target.files;
            if (files.length > 0) {
                fileStatus.textContent = `Se seleccionaron ${files.length} archivo(s)`;
                uploadButton.style.display = "inline-block";
            } else {
                fileStatus.textContent = "";
                uploadButton.style.display = "none";
            }
        });

        // Al hacer clic en "Subir Ahora"
        uploadButton.addEventListener("click", function(e) {
            e.preventDefault(); // Evitar recarga de página

            if (FLASK_APPS_SCRIPT_URL === "LA_URL_DE_TU_WEB_APP_VA_ACA") {
                alert("¡Falta configurar la URL del script! Por favor contacta al administrador.");
                return;
            }

            const files = photoInput.files;
            if (files.length === 0) return;

            // Mostrar estado de carga
            uploadForm.style.display = "none";
            loader.style.display = "block";
            loader.textContent = "Subiendo fotos, por favor espera...";

            let uploadedCount = 0;
            let errorCount = 0;

            // Función para subir un solo archivo
            const uploadFile = (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = function(e) {
                        const rawLog = reader.result.split(',')[1];
                        const dataSend = { 
                            dataReq: { data: rawLog, name: file.name, type: file.type },
                            fname: "uploadFilesToGoogleDrive" 
                        };

                        fetch(FLASK_APPS_SCRIPT_URL, { 
                            method: "POST",
                            mode: "no-cors", // Importante para enviar a Google sin error de CORS
                            body: JSON.stringify(dataSend)
                        })
                        .then(res => resolve())
                        .catch(err => reject(err));
                    };
                });
            };

            // Convertimos la lista de archivos a un array para usar map
            const uploadPromises = Array.from(files).map(file => uploadFile(file));

            Promise.all(uploadPromises)
                .then(() => {
                    loader.style.display = "none";
                    successMessage.style.display = "block";
                })
                .catch((error) => {
                    console.error(error);
                    loader.style.display = "none";
                    uploadForm.style.display = "block";
                    alert("Ocurrió un error al subir alguna foto. Intenta de nuevo.");
                });
        });
    }

});
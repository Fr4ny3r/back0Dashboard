import { supabase } from './supabase.js';

// --- (1) DEFINICIÓN GLOBAL DE HEADERS ---
// Se define una sola vez para que todos los endpoints puedan usarla.
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Headers base para las respuestas JSON (combina Content-Type y CORS)
const JSON_HEADERS = {
    'Content-Type': 'application/json',
    ...CORS_HEADERS
};
// ------------------------------------------

async function handleRequest(request) {
    const url = new URL(request.url);

    // --- MANEJO DE OPTIONS (PRE-FLIGHT) ---
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204, // 204 No Content
            headers: CORS_HEADERS // Usamos la constante global
        });
    }

    // --- GET /api/egresos ---
    if (url.pathname === '/api/egresos' && request.method === 'GET') {
        const { data: egresos, error } = await supabase
            .from('egresos')
            .select('*');

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: JSON_HEADERS // Usamos el header combinado
            });
        }

        return new Response(JSON.stringify(egresos), {
            status: 200,
            headers: JSON_HEADERS // Usamos el header combinado
        });
    }
    
    // --- POST /api/egresos ---
    if (url.pathname === '/api/egresos' && request.method === 'POST') {
        try {
            const requestBody = await request.json();
            
            // Asumiendo que has quitado 'id' si es autogenerado:
            const { monto, descripcion, fecha } = requestBody; 

            // ----------------------------------------------------
            // El error 500 ocurre si el objeto de inserción es inválido
            // ----------------------------------------------------
            const { data, error } = await supabase
                .from('egresos')
                .insert([ { monto, descripcion, fecha } ])
                .select();

            if (error) {
                // Este es el manejador de error de la BD
                console.error("Error de Supabase:", error);
                // IMPORTANTE: Devolver 400 Bad Request si el usuario envió datos malos
                return new Response(JSON.stringify({ 
                    error: "Fallo al insertar datos", 
                    details: error.message 
                }), {
                    status: 400, // Error de cliente (Bad Request)
                    headers: JSON_HEADERS
                });
            }
            
            // Éxito
            return new Response(JSON.stringify(data), {
                status: 201, // Created
                headers: JSON_HEADERS
            });
            
        } catch (e) {
            // Maneja errores de request.json() o errores internos de Node/Worker
            console.error("Error Worker interno/JSON:", e);
            return new Response(JSON.stringify({ 
                error: "Error interno del Worker", 
                details: e.message 
            }), {
                status: 500,
                headers: JSON_HEADERS
            });
        }
    }

    return new Response('Ruta no encontrada', { status: 404, headers: JSON_HEADERS });
}

export default {
    fetch: handleRequest
}
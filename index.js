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
            // Asegúrate de que las propiedades del cuerpo coincidan con las de tu tabla.
            // Si ID es autogenerado por Supabase, NO lo incluyas en la inserción.
            const { monto, descripcion, fecha } = requestBody; 

            const { data, error } = await supabase
                .from('egresos')
                .insert([ { monto, descripcion, fecha } ]) // Quitamos 'id' si es autogenerado
                .select();

            if (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: JSON_HEADERS // Usamos el header combinado
                });
            }

            return new Response(JSON.stringify(data), {
                status: 201, // 201 Created
                headers: JSON_HEADERS // Usamos el header combinado
            });
            
        } catch (e) {
            // Maneja el error si request.json() falla o si hay otro error inesperado
            return new Response(JSON.stringify({ error: "Error al procesar la solicitud", details: e.message }), {
                status: 400, // 400 Bad Request
                headers: JSON_HEADERS
            });
        }
    }

    return new Response('Ruta no encontrada', { status: 404, headers: JSON_HEADERS });
}

export default {
    fetch: handleRequest
}
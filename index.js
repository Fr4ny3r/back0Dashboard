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
    
    if (url.pathname === '/' && request.method === 'POST') {
        try {
            const requestBody = await request.json();

            const { tipo, tableName } = requestBody; 

            // ----------------------------------------------------
            // El error 500 ocurre si el objeto de inserción es inválido
            // ----------------------------------------------------
        const { data, error } = await supabase
            .from(tableName)
            .insert([ { datos } ])
            .select();

        if (error) {
            // 🛑 ESTO ES LO CRÍTICO: Devolver el mensaje de error de la BD.
            return new Response(JSON.stringify({ 
                error: `Fallo al insertar en Supabase: ${tipo}`, 
                details: error.message, // <-- Asegúrate de incluir 'error.message'
                hint: error.hint || 'Revisa campos NOT NULL y tipos de datos.' ,
            }), {
                status: 400,
                headers: JSON_HEADERS
            });
        }
            
            // Éxito
            return new Response(JSON.stringify(data), {
                status: 201, // Created
                headers: JSON_HEADERS,
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
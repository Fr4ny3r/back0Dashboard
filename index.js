// (1) Inicializa Supabase aquí (o cualquier otra lógica de base de datos)
import { supabase } from './supabase.js';

// ... Definición de constantes y el cliente Supabase ...

async function handleRequest(request) {
    const url = new URL(request.url);

    if (url.pathname === '/api/egresos' && request.method === 'GET') {
        // Simulación de la obtención de datos (reemplaza con tu lógica Supabase)
        const { data: egresos, error } = await supabase
            .from('egresos')
            .select('*');

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // MUY IMPORTANTE: Configurar CORS
        const headers = { 
            'Content-Type': 'application/json',
            // Permite peticiones desde cualquier origen (necesario para React)
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        return new Response(JSON.stringify(egresos), {
            status: 200,
            headers: headers
        });
    }
    if (url.pathname === '/api/egresos' && request.method === 'POST') {
        const requestBody = await request.json();
        const { id, monto, descripcion, fecha } = requestBody;

        const { data, error } = await supabase
            .from('egresos')
            .insert([{ id : id, monto : monto, descripcion : descripcion, fecha : fecha }]);

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const headers = { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        return new Response(JSON.stringify(data), {
            status: 201,
            headers: headers
        });
    }

    // Manejar el pre-flight de CORS (si tu Worker recibe OPTIONS)
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    return new Response('Ruta no encontrada', { status: 404 });
}

export default {
    fetch: handleRequest
}
// Cole aqui suas credenciais do Supabase
// Você pode encontrá-las em seu painel do Supabase em: Project Settings > API

const SUPABASE_URL = 'https://gpyymzojstznujquvaxb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdweXltem9qc3R6bnVqcXV2YXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjc0MTksImV4cCI6MjA2ODYwMzQxOX0.VmTVelFe5M1xsI9qEd_LAjX9bLD4ra7w9PhmlWCnu4c';

// Inicializa o cliente Supabase
// O objeto global 'supabase' vem da CDN. Nós o usamos para criar nossa instância do cliente.
const supaClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

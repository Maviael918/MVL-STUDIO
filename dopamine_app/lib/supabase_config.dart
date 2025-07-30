import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Supabase Credentials
const String supabaseUrl = 'https://gpyymzojstznujquvaxb.supabase.co';
const String supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdweXltem9qc3R6bnVqcXV2YXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjc0MTksImV4cCI6MjA2ODYwMzQxOX0.VmTVelFe5M1xsI9qEd_LAjX9bLD4ra7w9PhmlWCnu4c';

// Supabase client instance
final supaClient = Supabase.instance.client;

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_config.dart';
import 'auth_page.dart'; // Importa a nova tela de autenticação
import 'home_page.dart'; // Importa a futura tela principal

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dopamine App',
      theme: ThemeData(
        primarySwatch: Colors.purple,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const AuthHandler(), // Usa um widget para tratar a autenticação
    );
  }
}

class AuthHandler extends StatelessWidget {
  const AuthHandler({super.key});

  @override
  Widget build(BuildContext context) {
    // Escuta o estado da autenticação e mostra a tela correta
    return StreamBuilder<AuthState>(
      stream: supaClient.auth.onAuthStateChange,
      builder: (context, snapshot) {
        if (snapshot.hasData && snapshot.data!.session != null) {
          // Se o usuário está logado, mostra a HomePage
          return const HomePage();
        } else {
          // Se não, mostra a AuthPage
          return const AuthPage();
        }
      },
    );
  }
}

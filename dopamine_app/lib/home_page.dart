import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_config.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool _isLoading = true;
  int _totalCredits = 0;
  List<Map<String, dynamic>> _currencies = [];
  List<Map<String, dynamic>> _debts = [];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final userId = supaClient.auth.currentUser!.id;

      // Fetch transactions to calculate balance
      final transactions = await supaClient
          .from('transactions')
          .select('type, points')
          .eq('user_id', userId);

      int currentBalance = 0;
      for (var tx in transactions) {
        if (tx['type'] == 'credit') {
          currentBalance += (tx['points'] as int);
        } else {
          currentBalance -= (tx['points'] as int);
        }
      }

      // Fetch available currencies and debts
      final currenciesData = await supaClient
          .from('currencies')
          .select()
          .eq('user_id', userId);
      final debtsData = await supaClient
          .from('debts')
          .select()
          .eq('user_id', userId);

      setState(() {
        _totalCredits = currentBalance;
        _currencies = currenciesData;
        _debts = debtsData;
        _isLoading = false;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Erro ao buscar dados: $e"), backgroundColor: Colors.red),
      );
      setState(() => _isLoading = false);
    }
  }

  Future<void> _addTransaction(String description, int points, String type) async {
    setState(() => _isLoading = true);
    try {
      await supaClient.from('transactions').insert({
        'user_id': supaClient.auth.currentUser!.id,
        'description': description,
        'points': points,
        'type': type,
      });
      // Refresh data after adding transaction
      await _fetchData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Erro ao registrar: $e"), backgroundColor: Colors.red),
      );
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Meu Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => supaClient.auth.signOut(),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchData,
              child: Column(
                children: [
                  // Summary Section
                  _buildSummarySection(),
                  // Action Lists
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.all(8.0),
                      children: [
                        _buildSectionHeader('Créditos (Ações Positivas)'),
                        ..._currencies.map((item) => _buildActionButton(
                              item['name'],
                              item['value'],
                              'credit',
                              Colors.green,
                            )),
                        const SizedBox(height: 20),
                        _buildSectionHeader('Dívidas (Infrações)'),
                        ..._debts.map((item) => _buildActionButton(
                              item['name'],
                              item['value'],
                              'debit',
                              Colors.red,
                            )),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSummarySection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          const Text('Saldo Total de Dopamina', style: TextStyle(fontSize: 18)),
          Text(
            '$_totalCredits',
            style: TextStyle(
              fontSize: 36,
              fontWeight: FontWeight.bold,
              color: _totalCredits >= 0 ? Colors.green : Colors.red,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildActionButton(String name, int value, String type, Color color) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4.0),
      child: ListTile(
        title: Text(name),
        trailing: Text(
          '${type == 'credit' ? '+' : '-'}$value',
          style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        onTap: () => _addTransaction(name, value, type),
      ),
    );
  }
}
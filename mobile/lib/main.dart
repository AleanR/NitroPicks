import 'package:flutter/material.dart';

////////////////////////////////////////////////////////////
/// APP ENTRY POINT
////////////////////////////////////////////////////////////

void main() {
  runApp(NitroPicksApp());
}

class NitroPicksApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'NitroPicks',
      theme: ThemeData.dark(),
      home: HomePage(),
    );
  }
}

////////////////////////////////////////////////////////////
/// HOME PAGE (Landing Screen)
////////////////////////////////////////////////////////////

class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.flash_on, color: Colors.amber, size: 60),

              SizedBox(height: 10),

              Text(
                "NitroPicks",
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
              ),

              SizedBox(height: 10),

              Text(
                "Make predictions, win points, compete with Knights",
                style: TextStyle(color: Colors.white70),
                textAlign: TextAlign.center,
              ),

              SizedBox(height: 40),

              /// NAVIGATE TO LOGIN
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.amber,
                  minimumSize: Size(double.infinity, 50),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => LoginPage()),
                  );
                },
                child: Text("Sign In", style: TextStyle(color: Colors.black)),
              ),

              SizedBox(height: 15),

              /// NAVIGATE TO REGISTER
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: Colors.amber),
                  minimumSize: Size(double.infinity, 50),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => RegisterPage()),
                  );
                },
                child: Text("Sign Up", style: TextStyle(color: Colors.amber)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

////////////////////////////////////////////////////////////
/// LOGIN PAGE
////////////////////////////////////////////////////////////

class LoginPage extends StatelessWidget {
  final TextEditingController email = TextEditingController();
  final TextEditingController password = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 40),
          child: Column(
            children: [
              /// HEADER
              buildHeader(),

              SizedBox(height: 25),

              /// LOGIN FORM
              buildCard(
                child: Column(
                  children: [
                    buildField("UCF Email", hint: "knights@ucf.edu"),
                    buildField("Password", obscure: true),

                    SizedBox(height: 20),

                    /// LOGIN BUTTON → GO TO MAIN APP
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber,
                        minimumSize: Size(double.infinity, 45),
                      ),
                      onPressed: () {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (context) => MainAppPage()),
                        );
                      },
                      child: Text("Sign In", style: TextStyle(color: Colors.black)),
                    ),

                    SizedBox(height: 15),

                    /// SWITCH TO REGISTER
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => RegisterPage()),
                        );
                      },
                      child: Text(
                        "Need an account? Sign up",
                        style: TextStyle(color: Colors.amber, fontSize: 13),
                      ),
                    ),

                    SizedBox(height: 20),

                    Divider(color: Colors.white24),

                    SizedBox(height: 10),

                    Text(
                      "Simulated betting for UCF games only...",
                      style: TextStyle(color: Colors.white38, fontSize: 11),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

////////////////////////////////////////////////////////////
/// REGISTER PAGE
////////////////////////////////////////////////////////////

class RegisterPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 40),
          child: Column(
            children: [
              buildHeader(),

              SizedBox(height: 25),

              buildCard(
                child: Column(
                  children: [
                    buildField("First Name"),
                    buildField("Last Name"),
                    buildField("Username"),
                    buildField("UCF ID"),
                    buildField("Major"),
                    buildField("UCF Email", hint: "knights@ucf.edu"),
                    buildField("Password", obscure: true),

                    SizedBox(height: 20),

                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber,
                        minimumSize: Size(double.infinity, 45),
                      ),
                      onPressed: () {},
                      child: Text("Sign Up", style: TextStyle(color: Colors.black)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

////////////////////////////////////////////////////////////
/// MAIN APP (BOTTOM NAVIGATION)
////////////////////////////////////////////////////////////

class MainAppPage extends StatefulWidget {
  @override
  _MainAppPageState createState() => _MainAppPageState();
}

class _MainAppPageState extends State<MainAppPage> {
  int _currentIndex = 0;

  final List<Widget> pages = [
    EventsPage(),
    BetsPage(),
    RewardsPage(),
    AccountPage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: pages[_currentIndex],

      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: Color(0xFF111827),
        selectedItemColor: Colors.amber,
        unselectedItemColor: Colors.white54,
        currentIndex: _currentIndex,

        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },

        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long), // 🔥 Events now looks like bets
            label: "Events",
          ),
          BottomNavigationBarItem(
            icon: Image.asset(
              'assets/icons/money_bag.png',
              width: 24,
              height: 24,
            ),
            label: "Bets",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.card_giftcard),
            label: "Rewards",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: "Account",
          ),
        ],
      ),
    );
  }
}

////////////////////////////////////////////////////////////
/// PAGE PLACEHOLDERS
////////////////////////////////////////////////////////////

class EventsPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text("Events Page", style: TextStyle(color: Colors.white)));
  }
}

class BetsPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text("Bets Page", style: TextStyle(color: Colors.white)));
  }
}

class RewardsPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text("Rewards Page", style: TextStyle(color: Colors.white)));
  }
}

class AccountPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text("Account Page", style: TextStyle(color: Colors.white)));
  }
}

////////////////////////////////////////////////////////////
/// REUSABLE COMPONENTS (VERY IMPORTANT FOR TEAM)
////////////////////////////////////////////////////////////

Widget buildHeader() {
  return Column(
    children: [
      Icon(Icons.flash_on, color: Colors.amber, size: 50),
      SizedBox(height: 10),
      Text("NitroPicks", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
      SizedBox(height: 5),
      Text(
        "Make predictions, win points, compete with Knights",
        style: TextStyle(color: Colors.white70, fontSize: 12),
        textAlign: TextAlign.center,
      ),
    ],
  );
}

Widget buildCard({required Widget child}) {
  return Container(
    padding: EdgeInsets.all(18),
    decoration: BoxDecoration(
      color: Color(0xFF111827),
      borderRadius: BorderRadius.circular(18),
    ),
    child: child,
  );
}

Widget buildField(String label, {String hint = "", bool obscure = false}) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SizedBox(height: 10),
      Text(label, style: TextStyle(color: Colors.white, fontSize: 13)),
      SizedBox(height: 5),
      TextField(
        obscureText: obscure,
        style: TextStyle(fontSize: 14),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(color: Colors.white38, fontSize: 13),
          filled: true,
          fillColor: Color(0xFF1F2937),
          contentPadding: EdgeInsets.symmetric(vertical: 10, horizontal: 12),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide.none,
          ),
        ),
      ),
    ],
  );
}
import 'package:flutter/material.dart';

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

//Home

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
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),

              SizedBox(height: 10),

              Text(
                "Make predictions, win points, compete with Knights",
                style: TextStyle(color: Colors.white70),
                textAlign: TextAlign.center,
              ),

              SizedBox(height: 40),

              // SIGN IN BUTTON
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

              // SIGN UP BUTTON
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


//Login

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

              // 🔥 LOGO + TITLE (same as register)
              Icon(Icons.flash_on, color: Colors.amber, size: 50),
              SizedBox(height: 10),

              Text(
                "NitroPicks",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),

              SizedBox(height: 5),

              Text(
                "Make predictions, win points, compete with Knights",
                style: TextStyle(color: Colors.white70, fontSize: 12),
                textAlign: TextAlign.center,
              ),

              SizedBox(height: 25),

              // 🔥 FORM CARD
              Container(
                padding: EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Color(0xFF111827),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Column(
                  children: [

                    // EMAIL
                    buildField("UCF Email", hint: "knights@ucf.edu"),

                    // PASSWORD
                    buildField("Password", obscure: true),

                    SizedBox(height: 20),

                    // SIGN IN BUTTON
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber,
                        minimumSize: Size(double.infinity, 45),
                      ),
                      onPressed: () {},
                      child: Text("Sign In", style: TextStyle(color: Colors.black)),
                    ),

                    SizedBox(height: 15),

                    // SWITCH TO SIGN UP
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

                    // 🔥 EXTRA TEXT (matches your website)
                    Divider(color: Colors.white24),

                    SizedBox(height: 10),

                    Text(
                      "Simulated betting for UCF games only. Use virtual points, compete with friends, climb leaderboards, and redeem rewards for campus perks.",
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

  Widget buildField(String label,
      {String hint = "", bool obscure = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: 10),
        Text(
          label,
          style: TextStyle(color: Colors.white, fontSize: 13),
        ),
        SizedBox(height: 5),

        TextField(
          obscureText: obscure,
          style: TextStyle(fontSize: 14),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: Colors.white38, fontSize: 13),
            filled: true,
            fillColor: Color(0xFF1F2937),
            contentPadding: EdgeInsets.symmetric(
                vertical: 10, horizontal: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide.none,
            ),
          ),
        ),
      ],
    );
  }
}

//Register

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

              // 🔥 LOGO + TITLE (NEW)
              Icon(Icons.flash_on, color: Colors.amber, size: 50),
              SizedBox(height: 10),

              Text(
                "NitroPicks",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),

              SizedBox(height: 5),

              Text(
                "Make predictions, win points, compete with Knights",
                style: TextStyle(color: Colors.white70, fontSize: 12),
                textAlign: TextAlign.center,
              ),

              SizedBox(height: 25),

              // 🔥 FORM CARD
              Container(
                padding: EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Color(0xFF111827),
                  borderRadius: BorderRadius.circular(18),
                ),
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
                        minimumSize: Size(double.infinity, 45), // smaller button
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

  Widget buildField(String label,
      {String hint = "", bool obscure = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: 10), // tighter spacing
        Text(
          label,
          style: TextStyle(color: Colors.white, fontSize: 13), // smaller label
        ),
        SizedBox(height: 5),

        TextField(
          obscureText: obscure,
          style: TextStyle(fontSize: 14), // smaller text
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: Colors.white38, fontSize: 13),
            filled: true,
            fillColor: Color(0xFF1F2937),
            contentPadding: EdgeInsets.symmetric(
                vertical: 10, horizontal: 12), // 🔥 smaller field height
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8), // slightly tighter
              borderSide: BorderSide.none,
            ),
          ),
        ),
      ],
    );
  }
}

//Shared Input Style

InputDecoration inputStyle(String hint) {
  return InputDecoration(
    hintText: hint,
    hintStyle: TextStyle(color: Colors.white38),
    filled: true,
    fillColor: Color(0xFF1F2937),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: BorderSide.none,
    ),
  );
}
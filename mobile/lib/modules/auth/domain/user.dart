class User {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String username;
  final String? major;
  final String? ucfId;
  final int? pointBalance;
  final bool isVerified;
  final bool isAdmin;

  const User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.username,
    this.major,
    this.ucfId,
    this.pointBalance,
    this.isVerified = false,
    this.isAdmin = false,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    final points = json['knightPoints'] ?? json['pointBalance'];
    return User(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      firstName: (json['firstname'] ?? '').toString(),
      lastName: (json['lastname'] ?? '').toString(),
      username: (json['username'] ?? '').toString(),
      major: json['major']?.toString(),
      ucfId: json['ucfID']?.toString(),
      pointBalance:
          points is num ? points.toInt() : int.tryParse('${points ?? ''}'),
      isVerified: json['isVerified'] == true,
      isAdmin: json['isAdmin'] == true,
    );
  }

  int get knightPoints => pointBalance ?? 0;

  String get displayName {
    if (firstName.trim().isNotEmpty) {
      return firstName.trim();
    }
    if (username.trim().isNotEmpty) {
      return username.trim();
    }
    return email.split('@').first;
  }

  User copyWith({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    String? username,
    String? major,
    String? ucfId,
    int? pointBalance,
    bool? isVerified,
    bool? isAdmin,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      username: username ?? this.username,
      major: major ?? this.major,
      ucfId: ucfId ?? this.ucfId,
      pointBalance: pointBalance ?? this.pointBalance,
      isVerified: isVerified ?? this.isVerified,
      isAdmin: isAdmin ?? this.isAdmin,
    );
  }
}

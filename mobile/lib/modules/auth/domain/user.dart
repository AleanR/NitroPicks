class User {
  final String id;
  final String email;
  final String? firstName;

  const User({
    required this.id,
    required this.email,
    this.firstName,
  });
}

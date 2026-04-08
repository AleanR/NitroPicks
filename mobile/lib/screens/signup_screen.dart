// lib/screens/signup_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../utils/ucf_majors.dart';
import '../widgets/np_button.dart';
import '../widgets/np_text_field.dart';
import '../widgets/step_indicator.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen>
    with SingleTickerProviderStateMixin {
  int _step = 0;

  // Controllers
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirmPassword = TextEditingController();
  final _ucfId = TextEditingController();

  // Only these trigger targeted rebuilds (not full-screen setState)
  final _passwordError = ValueNotifier<String?>('');
  final _passwordSuccess = ValueNotifier<String?>('');
  final _emailError = ValueNotifier<String?>('');
  final _majorNotifier = ValueNotifier<String?>(null);

  bool _isLoading = false;

  late AnimationController _cardCtrl;
  late Animation<double> _cardFade;
  late Animation<Offset> _cardSlide;

  // Pre-baked title style
  static final _titleStyle = GoogleFonts.dmSans(
    fontSize: 40,
    fontWeight: FontWeight.w800,
    color: AppColors.textPrimary,
    height: 1.1,
    letterSpacing: -1.5,
  );
  static final _linkStyle = GoogleFonts.dmSans(
    fontSize: 15,
    color: const Color(0xFF4A9EFF),
    fontWeight: FontWeight.w500,
  );

  @override
  void initState() {
    super.initState();

    _cardCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _cardFade = CurvedAnimation(parent: _cardCtrl, curve: Curves.easeOut);
    _cardSlide = Tween<Offset>(
      begin: const Offset(0.06, 0),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _cardCtrl, curve: Curves.easeOutCubic));
    _cardCtrl.forward();

    // Password validation — only touches ValueNotifiers, no setState
    _confirmPassword.addListener(_validatePasswords);
    _password.addListener(_validatePasswords);
  }

  void _validatePasswords() {
    final p = _password.text;
    final c = _confirmPassword.text;
    if (c.isEmpty) {
      _passwordError.value = null;
      _passwordSuccess.value = null;
      return;
    }
    if (p == c) {
      _passwordError.value = null;
      _passwordSuccess.value = 'Passwords match!';
    } else {
      _passwordError.value = 'Password must be same.';
      _passwordSuccess.value = null;
    }
  }

  @override
  void dispose() {
    _cardCtrl.dispose();
    _firstName.dispose();
    _lastName.dispose();
    _email.dispose();
    _password.dispose();
    _confirmPassword.dispose();
    _ucfId.dispose();
    _passwordError.dispose();
    _passwordSuccess.dispose();
    _emailError.dispose();
    _majorNotifier.dispose();
    super.dispose();
  }

  void _nextStep() async {
    if (_step == 0 && !_email.text.contains('@ucf.edu')) {
      _emailError.value = 'Must be a valid UCF email address';
      return;
    }
    _emailError.value = null;

    if (_step < 2) {
      await _cardCtrl.reverse();
      setState(() => _step++); // only setState needed: changes which step shows
      _cardCtrl.forward();
    } else {
      setState(() => _isLoading = true);
      await Future.delayed(const Duration(milliseconds: 800));
      if (mounted) {
        Navigator.pushReplacementNamed(
          context,
          '/welcome',
          arguments: _firstName.text.trim(),
        );
      }
    }
  }

  void _prevStep() {
    if (_step > 0) {
      _cardCtrl.reverse().then((_) {
        setState(() => _step--);
        _cardCtrl.forward();
      });
    } else {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: AppColors.bgDark,
        resizeToAvoidBottomInset: true,
        body: Stack(
          children: [
            const _SignupBackground(),
            SafeArea(
              child: GestureDetector(
                onTap: () => FocusScope.of(context).unfocus(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Back button
                    Padding(
                      padding: const EdgeInsets.fromLTRB(8, 8, 8, 0),
                      child: IconButton(
                        icon: const Icon(Icons.arrow_back_ios_new,
                            color: AppColors.textPrimary, size: 20),
                        onPressed: _prevStep,
                      ),
                    ),
                    // Title — static, never rebuilds
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 50, 24, 80),
                      child: Text('Create Your\nAccount', style: _titleStyle),
                    ),
                    // Scrollable form area
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                        child: Column(
                          children: [
                            // Card with step indicator + fields
                            FadeTransition(
                              opacity: _cardFade,
                              child: SlideTransition(
                                position: _cardSlide,
                                child: _buildCard(),
                              ),
                            ),
                            const SizedBox(height: 20),
                            // Button — reacts to field changes without rebuilding screen
                            _StepButton(
                              step: _step,
                              isLoading: _isLoading,
                              firstName: _firstName,
                              lastName: _lastName,
                              email: _email,
                              password: _password,
                              confirmPassword: _confirmPassword,
                              ucfId: _ucfId,
                              majorNotifier: _majorNotifier,
                              onPressed: _nextStep,
                            ),
                            const SizedBox(height: 16),
                            GestureDetector(
                              onTap: () => Navigator.pushReplacementNamed(
                                  context, '/signin'),
                              child: Text('Already have an account?',
                                  style: _linkStyle),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          StepIndicator(currentStep: _step, totalSteps: 3),
          const SizedBox(height: 28),
          // Step content — keyed so Flutter knows to swap, not morph
          KeyedSubtree(
            key: ValueKey(_step),
            child: _buildStepContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_step) {
      case 0:
        return _Step1(
          firstName: _firstName,
          lastName: _lastName,
          email: _email,
          emailError: _emailError,
        );
      case 1:
        return _Step2(
          password: _password,
          confirmPassword: _confirmPassword,
          passwordError: _passwordError,
          passwordSuccess: _passwordSuccess,
        );
      case 2:
        return _Step3(
          ucfId: _ucfId,
          majorNotifier: _majorNotifier,
        );
      default:
        return const SizedBox.shrink();
    }
  }
}

// ── Isolated step widgets — each manages only its own state ─────────────────

class _Step1 extends StatelessWidget {
  final TextEditingController firstName;
  final TextEditingController lastName;
  final TextEditingController email;
  final ValueNotifier<String?> emailError;

  const _Step1({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.emailError,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        NpTextField(
          label: 'First Name',
          controller: firstName,
          textCapitalization: TextCapitalization.words,
        ),
        const SizedBox(height: 20),
        NpTextField(
          label: 'Last Name',
          controller: lastName,
          textCapitalization: TextCapitalization.words,
        ),
        const SizedBox(height: 20),
        // Only this rebuilds when email error changes
        ValueListenableBuilder<String?>(
          valueListenable: emailError,
          builder: (_, err, __) => NpTextField(
            label: 'UCF Email',
            controller: email,
            keyboardType: TextInputType.emailAddress,
            errorText: err,
          ),
        ),
      ],
    );
  }
}

class _Step2 extends StatelessWidget {
  final TextEditingController password;
  final TextEditingController confirmPassword;
  final ValueNotifier<String?> passwordError;
  final ValueNotifier<String?> passwordSuccess;

  const _Step2({
    required this.password,
    required this.confirmPassword,
    required this.passwordError,
    required this.passwordSuccess,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        NpTextField(
          label: 'Password',
          controller: password,
          obscureText: true,
        ),
        const SizedBox(height: 20),
        // Only this rebuilds when password validation changes
        ValueListenableBuilder<String?>(
          valueListenable: passwordError,
          builder: (_, err, __) => ValueListenableBuilder<String?>(
            valueListenable: passwordSuccess,
            builder: (_, success, __) => NpTextField(
              label: 'Confirm Password',
              controller: confirmPassword,
              obscureText: true,
              errorText: err,
              successText: success,
            ),
          ),
        ),
      ],
    );
  }
}

class _Step3 extends StatelessWidget {
  final TextEditingController ucfId;
  final ValueNotifier<String?> majorNotifier;

  const _Step3({required this.ucfId, required this.majorNotifier});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        NpTextField(
          label: 'UCF ID',
          controller: ucfId,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        ),
        const SizedBox(height: 20),
        ValueListenableBuilder<String?>(
          valueListenable: majorNotifier,
          builder: (_, major, __) => NpDropdownField(
            label: 'Major',
            value: major,
            items: ucfMajors,
            onChanged: (v) => majorNotifier.value = v,
          ),
        ),
        const SizedBox(height: 8),
      ],
    );
  }
}

/// Button that reactively enables/disables based on field content
/// without triggering a full screen rebuild
class _StepButton extends StatelessWidget {
  final int step;
  final bool isLoading;
  final TextEditingController firstName;
  final TextEditingController lastName;
  final TextEditingController email;
  final TextEditingController password;
  final TextEditingController confirmPassword;
  final TextEditingController ucfId;
  final ValueNotifier<String?> majorNotifier;
  final VoidCallback onPressed;

  const _StepButton({
    required this.step,
    required this.isLoading,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.password,
    required this.confirmPassword,
    required this.ucfId,
    required this.majorNotifier,
    required this.onPressed,
  });

  bool _canProceed() {
    switch (step) {
      case 0:
        return firstName.text.trim().isNotEmpty &&
            lastName.text.trim().isNotEmpty &&
            email.text.trim().isNotEmpty;
      case 1:
        return password.text.length >= 6 &&
            password.text == confirmPassword.text;
      case 2:
        return ucfId.text.trim().isNotEmpty && majorNotifier.value != null;
      default:
        return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    // Listen to all relevant controllers for THIS step only
    final listenables = <Listenable>[majorNotifier];
    if (step == 0) {
      listenables.addAll([firstName, lastName, email]);
    } else if (step == 1) {
      listenables.addAll([password, confirmPassword]);
    } else if (step == 2) {
      listenables.add(ucfId);
    }

    return ListenableBuilder(
      listenable: Listenable.merge(listenables),
      builder: (_, __) {
        final enabled = _canProceed();
        return AnimatedOpacity(
          opacity: enabled ? 1.0 : 0.45,
          duration: const Duration(milliseconds: 200),
          child: NpButton(
            label: step == 2 ? 'Create Account' : 'Continue',
            variant: NpButtonVariant.primary,
            loading: isLoading,
            onPressed: enabled ? onPressed : null,
          ),
        );
      },
    );
  }
}

// ── Static background ────────────────────────────────────────────────────────

class _SignupBackground extends StatelessWidget {
  const _SignupBackground();

  @override
  Widget build(BuildContext context) {
    return const SizedBox.expand(
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0D1520),
              Color(0xFF12100A),
              Color(0xFF1A1200),
            ],
            stops: [0.0, 0.45, 1.0],
          ),
        ),
      ),
    );
  }
}
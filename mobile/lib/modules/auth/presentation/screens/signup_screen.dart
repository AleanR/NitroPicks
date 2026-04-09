import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../domain/ucf_majors.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/widgets/auth_shell.dart';
import '../../../../shared/widgets/np_button.dart';
import '../../../../shared/widgets/np_text_field.dart';
import '../../../../shared/widgets/step_indicator.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen>
    with SingleTickerProviderStateMixin {
  int _step = 0;

  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirmPassword = TextEditingController();
  final _ucfId = TextEditingController();

  final _passwordError = ValueNotifier<String?>('');
  final _passwordSuccess = ValueNotifier<String?>('');
  final _emailError = ValueNotifier<String?>('');
  final _majorNotifier = ValueNotifier<String?>(null);

  bool _isLoading = false;

  late AnimationController _cardCtrl;
  late Animation<double> _cardFade;
  late Animation<Offset> _cardSlide;

  static const _stepEyebrows = ['Profile', 'Security', 'Academics'];
  static const _stepTitles = [
    'Let’s build your account',
    'Lock in your login',
    'Finish your student profile',
  ];
  static const _stepSubtitles = [
    'Tell us who you are so we can personalize your NitroPicks experience.',
    'Choose a password you will use every time you come back.',
    'A few last details and you are ready to start making picks.',
  ];

  @override
  void initState() {
    super.initState();

    _cardCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 280),
    );
    _cardFade = CurvedAnimation(parent: _cardCtrl, curve: Curves.easeOut);
    _cardSlide = Tween<Offset>(
      begin: const Offset(0.04, 0.02),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _cardCtrl, curve: Curves.easeOutCubic));
    _cardCtrl.forward();

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
      _passwordSuccess.value = 'Passwords match.';
    } else {
      _passwordError.value = 'Passwords must match.';
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

  Future<void> _nextStep() async {
    if (_step == 0 && !_email.text.contains('@ucf.edu')) {
      _emailError.value = 'Must be a valid UCF email address.';
      return;
    }
    _emailError.value = null;

    if (_step < 2) {
      await _cardCtrl.reverse();
      setState(() => _step++);
      _cardCtrl.forward();
    } else {
      setState(() => _isLoading = true);
      await Future.delayed(const Duration(milliseconds: 800));
      if (mounted) {
        // Account created — go to "check your email" screen
        Navigator.pushReplacementNamed(
          context,
          '/verify-email-pending',
          arguments: _email.text.trim(),
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
        body: AuthScaffold(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AuthBackButton(onPressed: _prevStep),
              const SizedBox(height: 28),
              AuthHeader(
                eyebrow: _stepEyebrows[_step],
                title: _stepTitles[_step],
                subtitle: _stepSubtitles[_step],
              ),
              const SizedBox(height: 24),
              FadeTransition(
                opacity: _cardFade,
                child: SlideTransition(
                  position: _cardSlide,
                  child: _buildCard(),
                ),
              ),
              const SizedBox(height: 18),
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
              const SizedBox(height: 18),
              AuthFooterLink(
                prompt: 'Already have an account?',
                action: 'Sign in',
                onTap: () =>
                    Navigator.pushReplacementNamed(context, '/signin'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCard() {
    return AuthCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Step ${_step + 1} of 3',
                style: GoogleFonts.dmSans(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const Spacer(),
              Text(
                _stepEyebrows[_step],
                style: GoogleFonts.dmSans(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.goldLight,
                  letterSpacing: 0.7,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          StepIndicator(currentStep: _step, totalSteps: 3),
          const SizedBox(height: 26),
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
          hint: 'Reggie',
          controller: firstName,
          textCapitalization: TextCapitalization.words,
        ),
        const SizedBox(height: 18),
        NpTextField(
          label: 'Last Name',
          hint: 'Gaines',
          controller: lastName,
          textCapitalization: TextCapitalization.words,
        ),
        const SizedBox(height: 18),
        ValueListenableBuilder<String?>(
          valueListenable: emailError,
          builder: (_, err, __) => NpTextField(
            label: 'UCF Email',
            hint: 'knight@ucf.edu',
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
          hint: 'At least 6 characters',
          controller: password,
          obscureText: true,
        ),
        const SizedBox(height: 18),
        ValueListenableBuilder<String?>(
          valueListenable: passwordError,
          builder: (_, err, __) => ValueListenableBuilder<String?>(
            valueListenable: passwordSuccess,
            builder: (_, success, __) => NpTextField(
              label: 'Confirm Password',
              hint: 'Re-enter your password',
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
          hint: '1234567',
          controller: ucfId,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        ),
        const SizedBox(height: 18),
        ValueListenableBuilder<String?>(
          valueListenable: majorNotifier,
          builder: (_, major, __) => NpDropdownField(
            label: 'Major',
            value: major,
            items: ucfMajors,
            onChanged: (v) => majorNotifier.value = v,
          ),
        ),
      ],
    );
  }
}

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
        return NpButton(
          label: step == 2 ? 'Create Account' : 'Continue',
          variant: NpButtonVariant.primary,
          loading: isLoading,
          onPressed: enabled ? onPressed : null,
        );
      },
    );
  }
}

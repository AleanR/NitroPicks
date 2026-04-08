import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/auth_api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/auth_shell.dart';
import '../widgets/np_button.dart';
import '../widgets/np_text_field.dart';
import '../widgets/dev_bypass_button.dart'; // ✅ DEV

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _resetEmailController = TextEditingController();
  final _errorMessage = ValueNotifier<String?>('');
  final _authService = AuthApiService();

  bool _isLoading = false;
  bool _isResetMode = false;
  bool _resetSent = false;
  String? _resetMessage;
  String? _resetError;

  @override
  void initState() {
    super.initState();
    _emailController.addListener(_refresh);
    _passwordController.addListener(_refresh);
    _resetEmailController.addListener(_refresh);
  }

  void _refresh() {
    if (mounted) setState(() {});
  }

  bool get _isComplete {
    if (_isResetMode) {
      return _resetEmailController.text.trim().isNotEmpty;
    }
    return _emailController.text.trim().isNotEmpty &&
        _passwordController.text.isNotEmpty;
  }

  @override
  void dispose() {
    _emailController.removeListener(_refresh);
    _passwordController.removeListener(_refresh);
    _resetEmailController.removeListener(_refresh);
    _emailController.dispose();
    _passwordController.dispose();
    _resetEmailController.dispose();
    _errorMessage.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || !email.contains('@') || password.isEmpty) {
      _errorMessage.value =
          'Invalid email address or password. Please try again.';
      return;
    }

    _errorMessage.value = null;
    setState(() => _isLoading = true);

    try {
      final response =
          await _authService.login(email: email, password: password);

      if (!mounted) return;
      setState(() => _isLoading = false);

      final username =
          (response['firstname'] as String?)?.trim() ?? email.split('@').first;

      Navigator.pushReplacementNamed(
        context,
        '/welcome',
        arguments: username,
      );
    } on AuthException catch (_) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      _errorMessage.value =
          'Invalid email address or password. Please try again.';
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      _errorMessage.value = 'Unable to sign in right now. Please try again.';
    }
  }

  Future<void> _sendResetEmail() async {
    final email = _resetEmailController.text.trim();

    if (email.isEmpty || !email.contains('@')) {
      setState(() {
        _resetError = 'Please enter a valid email address.';
        _resetMessage = null;
      });
      return;
    }

    setState(() {
      _resetError = null;
      _resetMessage = null;
      _isLoading = true;
    });

    try {
      await _authService.forgotPassword(email: email);
      if (!mounted) return;
      setState(() {
        _resetSent = true;
        _resetMessage = 'If an account exists, we sent a code to your email.';
      });
    } on AuthException catch (_) {
      if (!mounted) return;
      setState(() {
        _resetSent = true;
        _resetMessage = 'If an account exists, we sent a code to your email.';
      });
    } catch (_) {
      if (mounted) {
        setState(() {
          _resetError = 'Unable to send reset instructions. Please try again.';
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showForgotPassword() {
    setState(() {
      _isResetMode = true;
      _resetSent = false;
      _resetMessage = null;
      _resetError = null;
      _resetEmailController.text = _emailController.text.trim();
      _errorMessage.value = null;
    });
  }

  void _backToSignIn() {
    setState(() {
      _isResetMode = false;
      _resetSent = false;
      _resetMessage = null;
      _resetError = null;
    });
  }

  void _goToSignUp() {
    Navigator.pushReplacementNamed(context, '/signup');
  }

  @override
  Widget build(BuildContext context) {
    final title = _isResetMode ? 'Reset your password' : 'Welcome back';
    final subtitle = _isResetMode
        ? 'Enter your UCF email and we will send you a reset code.'
        : 'Sign in to keep tracking campus picks, streaks, and game day wins.';

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: AppColors.bgDark,
        resizeToAvoidBottomInset: true,
        body: AuthScaffold(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AuthBackButton(
                onPressed: _isResetMode
                    ? _backToSignIn
                    : () => Navigator.pop(context),
              ),
              const SizedBox(height: 28),
              AuthHeader(
                eyebrow: _isResetMode ? 'Account Recovery' : 'Sign In',
                title: title,
                subtitle: subtitle,
              ),
              const SizedBox(height: 28),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 280),
                switchInCurve: Curves.easeOutCubic,
                switchOutCurve: Curves.easeInCubic,
                transitionBuilder: (child, animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: SlideTransition(
                      position: Tween<Offset>(
                        begin: const Offset(0.04, 0.02),
                        end: Offset.zero,
                      ).animate(animation),
                      child: child,
                    ),
                  );
                },
                child: _isResetMode
                    ? _buildForgotPasswordCard()
                    : _buildSignInCard(),
              ),
              const SizedBox(height: 16),
              ValueListenableBuilder<String?>(
                valueListenable: _errorMessage,
                builder: (context, error, child) {
                  if (error == null || error.isEmpty) {
                    return const SizedBox.shrink();
                  }
                  return AuthMessage(text: error, isError: true);
                },
              ),
              if (!_isResetMode || !_resetSent) const SizedBox(height: 18),
              if (_isResetMode) _buildResetActions() else _buildSignInActions(),
              const SizedBox(height: 18),
              AuthFooterLink(
                prompt: "Don't have an account?",
                action: 'Create one',
                onTap: _goToSignUp,
              ),
              // ✅ DEV ONLY — remove before release
              if (!_isResetMode) ...[
                const SizedBox(height: 16),
                const DevBypassButton(),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSignInCard() {
    return AuthCard(
      key: const ValueKey('sign-in-card'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionTitle(
            title: 'Your account',
            caption: 'Use your UCF email and password to continue.',
          ),
          const SizedBox(height: 22),
          NpTextField(
            label: 'UCF Email',
            hint: 'knight@ucf.edu',
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 18),
          NpTextField(
            label: 'Password',
            hint: 'Enter your password',
            controller: _passwordController,
            obscureText: true,
          ),
          const SizedBox(height: 14),
          Align(
            alignment: Alignment.centerRight,
            child: GestureDetector(
              onTap: _showForgotPassword,
              child: Text(
                'Forgot password?',
                style: GoogleFonts.dmSans(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.goldLight,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildForgotPasswordCard() {
    return AuthCard(
      key: const ValueKey('forgot-password-card'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(
            title: _resetSent ? 'Check your inbox' : 'Reset access',
            caption: _resetSent
                ? 'Your next step is waiting in email.'
                : 'We will email a secure code to help you get back in.',
          ),
          const SizedBox(height: 22),
          if (_resetSent)
            AuthMessage(text: _resetMessage ?? '')
          else ...[
            NpTextField(
              label: 'UCF Email',
              hint: 'knight@ucf.edu',
              controller: _resetEmailController,
              keyboardType: TextInputType.emailAddress,
            ),
            if (_resetError != null) ...[
              const SizedBox(height: 14),
              AuthMessage(text: _resetError!, isError: true),
            ],
          ],
        ],
      ),
    );
  }

  Widget _buildSignInActions() {
    return NpButton(
      label: 'Sign In',
      variant: NpButtonVariant.primary,
      loading: _isLoading,
      onPressed: (_isLoading || !_isComplete) ? null : _submit,
    );
  }

  Widget _buildResetActions() {
    if (_resetSent) {
      return NpButton(
        label: 'Back to Sign In',
        variant: NpButtonVariant.secondary,
        onPressed: _backToSignIn,
      );
    }

    return Column(
      children: [
        NpButton(
          label: 'Send Reset Code',
          variant: NpButtonVariant.primary,
          loading: _isLoading,
          onPressed: (_isLoading || !_isComplete) ? null : _sendResetEmail,
        ),
        const SizedBox(height: 12),
        NpButton(
          label: 'Back to Sign In',
          variant: NpButtonVariant.secondary,
          onPressed: _backToSignIn,
        ),
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final String caption;

  const _SectionTitle({required this.title, required this.caption});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: GoogleFonts.dmSans(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
            letterSpacing: -0.8,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          caption,
          style: GoogleFonts.dmSans(
            fontSize: 14,
            height: 1.5,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}

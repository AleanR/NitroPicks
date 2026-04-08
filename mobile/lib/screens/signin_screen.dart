import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/auth_api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/np_button.dart';
import '../widgets/np_text_field.dart';

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

  static final _titleStyle = GoogleFonts.dmSans(
    fontSize: 40,
    fontWeight: FontWeight.w800,
    color: AppColors.textPrimary,
    height: 1.1,
    letterSpacing: -1.5,
  );

  static final _forgotStyle = GoogleFonts.dmSans(
    fontSize: 13,
    color: const Color(0xFF2F80ED),
    fontWeight: FontWeight.w500,
  );

  static final _errorStyle = GoogleFonts.dmSans(
    fontSize: 13,
    color: const Color(0xFFFF4D4F),
    fontWeight: FontWeight.w500,
    height: 1.5,
  );

  static final _bottomLinkStyle = GoogleFonts.dmSans(
    fontSize: 15,
    color: const Color(0xFF2F80ED),
    fontWeight: FontWeight.w500,
  );

  static final _descriptionStyle = GoogleFonts.dmSans(
    fontSize: 14,
    color: AppColors.textMuted,
    height: 1.6,
  );

  static final _successStyle = GoogleFonts.dmSans(
    fontSize: 14,
    color: AppColors.open,
    height: 1.6,
  );

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

    if (email.isEmpty || !email.contains('@')) {
      _errorMessage.value =
          'Invalid email address or password.\nPlease try again.';
      return;
    }

    if (password.isEmpty) {
      _errorMessage.value =
          'Invalid email address or password.\nPlease try again.';
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
          'Invalid email address or password.\nPlease try again.';
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      _errorMessage.value = 'Unable to sign in. Please try again.';
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
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: AppColors.bgDark,
        resizeToAvoidBottomInset: true,
        body: Stack(
          children: [
            const _SignInBackground(),
            SafeArea(
              child: GestureDetector(
                onTap: () => FocusScope.of(context).unfocus(),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      IconButton(
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        icon: const Icon(
                          Icons.arrow_back_ios_new,
                          color: AppColors.textPrimary,
                          size: 18,
                        ),
                        onPressed: _isResetMode
                            ? _backToSignIn
                            : () => Navigator.pop(context),
                      ),
                      const SizedBox(height: 50),
                      Text('Hello', style: _titleStyle),
                      const SizedBox(height: 10),
                      Text('Sign in!', style: _titleStyle),
                      const SizedBox(height: 80),
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 300),
                        switchInCurve: Curves.easeOut,
                        switchOutCurve: Curves.easeIn,
                        transitionBuilder: (child, animation) {
                          final offsetAnimation = Tween<Offset>(
                            begin: const Offset(0.1, 0),
                            end: Offset.zero,
                          ).animate(animation);
                          return SlideTransition(
                            position: offsetAnimation,
                            child: FadeTransition(
                                opacity: animation, child: child),
                          );
                        },
                        child: _isResetMode
                            ? _buildForgotPasswordCard()
                            : _buildSignInCard(),
                      ),
                      const SizedBox(height: 12),
                      ValueListenableBuilder<String?>(
                        valueListenable: _errorMessage,
                        builder: (context, error, child) {
                          if (error == null || error.isEmpty) {
                            return const SizedBox(height: 34);
                          }

                          return SizedBox(
                            height: 34,
                            child: Center(
                              child: Text(
                                error,
                                textAlign: TextAlign.center,
                                style: _errorStyle,
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 8),
                      _isResetMode
                          ? _buildResetActions()
                          : NpButton(
                              label: 'Sign in',
                              variant: NpButtonVariant.primary,
                              loading: _isLoading,
                              onPressed:
                                  (_isLoading || !_isComplete) ? null : _submit,
                            ),
                      const SizedBox(height: 14),
                      Center(
                        child: GestureDetector(
                          onTap: _goToSignUp,
                          child: Text(
                            "Don't have an account?",
                            style: _bottomLinkStyle,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSignInCard() {
    return Container(
      key: const ValueKey('sign-in-card'),
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          NpTextField(
            label: 'UCF Email',
            hint: '',
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 16),
          NpTextField(
            label: 'Password',
            hint: '',
            controller: _passwordController,
            obscureText: true,
          ),
          const SizedBox(height: 10),
          Align(
            alignment: Alignment.centerRight,
            child: GestureDetector(
              onTap: _showForgotPassword,
              child: Text(
                'Forgot password?',
                style: _forgotStyle,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildForgotPasswordCard() {
    return Container(
      key: const ValueKey('forgot-password-card'),
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Forgot password', style: _titleStyle.copyWith(fontSize: 32)),
          const SizedBox(height: 12),
          Text(
            'Enter your UCF email and we’ll send a code to your email.',
            style: _descriptionStyle,
          ),
          const SizedBox(height: 24),
          if (_resetSent) ...[
            Text('Check your inbox', style: _titleStyle.copyWith(fontSize: 26)),
            const SizedBox(height: 12),
            Text(_resetMessage ?? '', style: _successStyle),
            const SizedBox(height: 28),
            NpButton(
              label: 'Back to sign in',
              variant: NpButtonVariant.secondary,
              onPressed: _backToSignIn,
            ),
          ] else ...[
            NpTextField(
              label: 'UCF Email',
              hint: '',
              controller: _resetEmailController,
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 10),
            if (_resetError != null) ...[
              Text(_resetError!, style: _errorStyle),
              const SizedBox(height: 12),
            ],
          ],
        ],
      ),
    );
  }

  Widget _buildResetActions() {
    if (_resetSent) {
      return const SizedBox.shrink();
    }

    return Column(
      children: [
        NpButton(
          label: 'Send code',
          variant: NpButtonVariant.primary,
          loading: _isLoading,
          onPressed: (_isLoading || !_isComplete) ? null : _sendResetEmail,
        ),
        const SizedBox(height: 12),
        NpButton(
          label: 'Back to sign in',
          variant: NpButtonVariant.secondary,
          onPressed: _backToSignIn,
        ),
      ],
    );
  }
}

class _SignInBackground extends StatelessWidget {
  const _SignInBackground();

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

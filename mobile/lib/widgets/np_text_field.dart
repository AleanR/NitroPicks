// lib/widgets/np_text_field.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

// Pre-baked static styles — created once at import time, never rebuilt
final _labelStyle = GoogleFonts.dmSans(
  fontSize: 15,
  fontWeight: FontWeight.w500,
  color: AppColors.textPrimary,
);
final _inputStyle = GoogleFonts.dmSans(
  fontSize: 16,
  color: AppColors.textPrimary,
  fontWeight: FontWeight.w400,
);
final _hintStyle = GoogleFonts.dmSans(
  fontSize: 16,
  color: AppColors.textMuted,
);
final _errorStyle = GoogleFonts.dmSans(
  fontSize: 13,
  color: const Color(0xFFEF4444),
);
final _successStyle = GoogleFonts.dmSans(
  fontSize: 13,
  color: AppColors.open,
);

class NpTextField extends StatefulWidget {
  final String label;
  final String? hint;
  final TextEditingController controller;
  final bool obscureText;
  final TextInputType keyboardType;
  final String? errorText;
  final String? successText;
  final List<TextInputFormatter>? inputFormatters;
  final ValueChanged<String>? onChanged;
  final bool readOnly;
  final VoidCallback? onTap;
  final TextCapitalization textCapitalization;

  const NpTextField({
    super.key,
    required this.label,
    this.hint,
    required this.controller,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.errorText,
    this.successText,
    this.inputFormatters,
    this.onChanged,
    this.readOnly = false,
    this.onTap,
    this.textCapitalization = TextCapitalization.none,
  });

  @override
  State<NpTextField> createState() => _NpTextFieldState();
}

class _NpTextFieldState extends State<NpTextField> {
  bool _obscure = true;
  bool _focused = false;
  final _focusNode = FocusNode();

  static const _fillColor = Color(0xFF1A2233);
  static const _radius = BorderRadius.all(Radius.circular(8));

  @override
  void initState() {
    super.initState();
    _obscure = widget.obscureText;
    _focusNode.addListener(_onFocusChange);
  }

  void _onFocusChange() {
    if (mounted) setState(() => _focused = _focusNode.hasFocus);
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    _focusNode.dispose();
    super.dispose();
  }

  Color get _borderColor {
    if (widget.errorText != null && widget.errorText!.isNotEmpty) {
      return const Color(0xFFEF4444);
    }
    if (_focused) return AppColors.gold.withValues(alpha: 0.6);
    return Colors.transparent;
  }

  @override
  Widget build(BuildContext context) {
    final hasError = widget.errorText != null && widget.errorText!.isNotEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: _labelStyle.copyWith(fontSize: 13), // 👈 smaller label
        ),
        const SizedBox(height: 6),

        Container(
          decoration: BoxDecoration(
            color: _fillColor,
            borderRadius: _radius,
            border: Border.all(color: _borderColor, width: 1.2),
          ),
          child: TextField(
            controller: widget.controller,
            focusNode: _focusNode,
            obscureText: widget.obscureText ? _obscure : false,
            keyboardType: widget.keyboardType,
            inputFormatters: widget.inputFormatters,
            onChanged: widget.onChanged,
            readOnly: widget.readOnly,
            onTap: widget.onTap,
            textCapitalization: widget.textCapitalization,
            style: _inputStyle.copyWith(fontSize: 14), // 👈 smaller input
            decoration: InputDecoration(
              hintText: widget.hint,
              hintStyle: _hintStyle.copyWith(fontSize: 14),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 12, // 👈 reduced height
              ),

              // 👇 make eye icon less dominant
              suffixIcon: widget.obscureText
                  ? Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: GestureDetector(
                        onTap: () => setState(() => _obscure = !_obscure),
                        child: Icon(
                          _obscure
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                          color: AppColors.textMuted.withValues(alpha: 0.6),
                          size: 18,
                        ),
                      ),
                    )
                  : null,
            ),
          ),
        ),

        if (hasError) ...[
          const SizedBox(height: 6),
          Text(widget.errorText!, style: _errorStyle),
        ],
        if (!hasError && widget.successText != null && widget.successText!.isNotEmpty) ...[
          const SizedBox(height: 6),
          Text(widget.successText!, style: _successStyle),
        ],
      ],
    );
  }
}

/// Dropdown field - opens bottom sheet
class NpDropdownField extends StatelessWidget {
  final String label;
  final String? value;
  final List<String> items;
  final ValueChanged<String?> onChanged;

  const NpDropdownField({
    super.key,
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(label, style: _labelStyle.copyWith(fontSize: 13)),
        const SizedBox(height: 6),
        GestureDetector(
          onTap: () => _showPicker(context),
          child: Container(
            height: 54,
            decoration: const BoxDecoration(
              color: Color(0xFF1C2333),
              borderRadius: BorderRadius.all(Radius.circular(10)),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    value ?? '',
                    style: value != null ? _inputStyle : _hintStyle,
                  ),
                ),
                const Icon(Icons.arrow_drop_down,
                    color: AppColors.textSecondary, size: 22),
              ],
            ),
          ),
        ),
      ],
    );
  }

  void _showPicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        height: 300,
        color: AppColors.surface,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'Select $label',
                style: _labelStyle,
              ),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: items.length,
                itemBuilder: (context, index) {
                  final item = items[index];
                  return ListTile(
                    title: Text(item, style: _inputStyle),
                    onTap: () {
                      onChanged(item);
                      Navigator.pop(context);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
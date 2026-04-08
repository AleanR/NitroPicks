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

  static const _fillColor = Color(0xFF1C2333);
  static const _radius = BorderRadius.all(Radius.circular(10));

  @override
  void initState() {
    super.initState();
    _obscure = widget.obscureText;
    _focusNode.addListener(_onFocusChange);
  }

  void _onFocusChange() {
    // setState only on THIS widget — never triggers parent rebuild
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
    if (widget.successText != null && widget.successText!.isNotEmpty) {
      return AppColors.open;
    }
    if (_focused) return AppColors.gold;
    return Colors.transparent;
  }

  @override
  Widget build(BuildContext context) {
    final hasError = widget.errorText != null && widget.errorText!.isNotEmpty;
    final hasSuccess =
        widget.successText != null && widget.successText!.isNotEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(widget.label, style: _labelStyle),
        const SizedBox(height: 8),
        // Plain Container — zero animation overhead
        Container(
          decoration: BoxDecoration(
            color: _fillColor,
            borderRadius: _radius,
            border: Border.all(color: _borderColor, width: 1.5),
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
            style: _inputStyle,
            decoration: InputDecoration(
              hintText: widget.hint,
              hintStyle: _hintStyle,
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              suffixIcon: widget.obscureText
                  ? GestureDetector(
                      onTap: () => setState(() => _obscure = !_obscure),
                      child: Icon(
                        _obscure
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                        color: AppColors.textMuted,
                        size: 20,
                      ),
                    )
                  : null,
            ),
          ),
        ),
        if (hasError) ...[
          const SizedBox(height: 6),
          Text(widget.errorText!, style: _errorStyle),
        ] else if (hasSuccess) ...[
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
        Text(label, style: _labelStyle),
        const SizedBox(height: 8),
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
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _MajorPickerSheet(
        items: items,
        selected: value,
        onSelect: (v) {
          onChanged(v);
          Navigator.pop(context);
        },
      ),
    );
  }
}

class _MajorPickerSheet extends StatefulWidget {
  final List<String> items;
  final String? selected;
  final ValueChanged<String> onSelect;

  const _MajorPickerSheet({
    required this.items,
    required this.selected,
    required this.onSelect,
  });

  @override
  State<_MajorPickerSheet> createState() => _MajorPickerSheetState();
}

class _MajorPickerSheetState extends State<_MajorPickerSheet> {
  late List<String> _filtered;
  final _search = TextEditingController();

  static final _majorStyle = GoogleFonts.dmSans(
      fontSize: 16, fontWeight: FontWeight.w600, color: Colors.black87);
  static final _majorSelectedStyle = GoogleFonts.dmSans(
      fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.gold);
  static final _headerStyle = GoogleFonts.dmSans(
      fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white);

  @override
  void initState() {
    super.initState();
    _filtered = widget.items;
    _search.addListener(_onSearch);
  }

  void _onSearch() {
    final q = _search.text.toLowerCase();
    setState(() {
      _filtered = q.isEmpty
          ? widget.items
          : widget.items.where((m) => m.toLowerCase().contains(q)).toList();
    });
  }

  @override
  void dispose() {
    _search.removeListener(_onSearch);
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 8),
          Container(
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
            color: Colors.grey[400],
            child: Text('Select your major', style: _headerStyle),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _search,
              decoration: InputDecoration(
                hintText: 'Search majors...',
                prefixIcon: const Icon(Icons.search, size: 20),
                filled: true,
                fillColor: Colors.grey[100],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
            ),
          ),
          Expanded(
            child: ListView.separated(
              cacheExtent: 500,
              padding: const EdgeInsets.only(bottom: 24),
              itemCount: _filtered.length,
              separatorBuilder: (_, __) =>
                  const Divider(height: 1, indent: 20, endIndent: 20),
              itemBuilder: (context, i) {
                final major = _filtered[i];
                final isSelected = major == widget.selected;
                return ListTile(
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 2),
                  title: Text(major,
                      style:
                          isSelected ? _majorSelectedStyle : _majorStyle),
                  trailing: isSelected
                      ? const Icon(Icons.check_circle,
                          color: AppColors.gold, size: 20)
                      : null,
                  onTap: () => widget.onSelect(major),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

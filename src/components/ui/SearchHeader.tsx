import { useEffect, useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';

type Props = {
  value: string;
  onChangeText: (s: string) => void;
  onCancel: () => void;
  placeholder?: string;
  cancelLabel?: string;
  autoFocus?: boolean;
};

export function SearchHeader({
  value,
  onChangeText,
  onCancel,
  placeholder,
  cancelLabel = 'ยกเลิก',
  autoFocus = true,
}: Props) {
  const { t } = useTheme();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!autoFocus) return;
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [autoFocus]);

  return (
    <View
      style={{
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
        backgroundColor: t.bg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View
        style={{
          flex: 1,
          height: 40,
          borderRadius: radii.md,
          backgroundColor: t.surfaceAlt,
          borderWidth: 1,
          borderColor: t.border,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          gap: 8,
        }}
      >
        <Icon.search size={16} color={t.inkSoft} />
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={t.inkMute}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          style={{
            flex: 1,
            color: t.ink,
            fontFamily: type.family,
            fontSize: 14,
            paddingVertical: 0,
          }}
        />
        {value.length > 0 ? (
          <Pressable
            onPress={() => onChangeText('')}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: t.borderStrong,
            }}
          >
            <Icon.x size={10} color={t.bg} stroke={2.5} />
          </Pressable>
        ) : null}
      </View>
      <Pressable onPress={onCancel} hitSlop={10} accessibilityRole="button">
        <Text style={{ color: t.brand, fontSize: 14, fontFamily: type.familyMedium }}>
          {cancelLabel}
        </Text>
      </Pressable>
    </View>
  );
}

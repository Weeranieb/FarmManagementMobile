import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { SheetShell } from '@/components/sheet';
import type { LanguageCode } from './hook';

type Props = {
  visible: boolean;
  selected: LanguageCode;
  onPick: (code: LanguageCode) => void;
  onClose: () => void;
};

export function LanguageSheet({ visible, selected, onPick, onClose }: Props) {
  const { t: tx } = useTranslation();
  const { t } = useTheme();

  const langs: { code: LanguageCode; native: string; alt: string }[] = [
    { code: 'th', native: tx('profile.language.th'), alt: 'Thai' },
    { code: 'en', native: tx('profile.language.en'), alt: tx('profile.language.enInOther') },
  ];

  const handlePick = (code: LanguageCode) => {
    onPick(code);
    setTimeout(onClose, 150);
  };

  return (
    <SheetShell visible={visible} onClose={onClose} heightPct={0.46}>
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 }}>
        <Text style={{ fontFamily: type.familyBold, fontSize: 18, color: t.ink }}>
          {tx('profile.language.title')}
        </Text>
        <Text style={{ fontFamily: type.family, fontSize: 12, color: t.inkSoft, marginTop: 4 }}>
          {tx('profile.language.subtitle')}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <Card padded={false}>
          {langs.map((l, i) => {
            const isSel = selected === l.code;
            const last = i === langs.length - 1;
            return (
              <Tappable
                key={l.code}
                feedback="opacity"
                onPress={() => handlePick(l.code)}
                android_ripple={{ color: t.surfaceAlt }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: last ? 0 : 1,
                  borderBottomColor: t.border,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: isSel ? t.brand : t.brandSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: isSel ? '#fff' : t.brandInk,
                      fontFamily: type.familyNumBold,
                      fontSize: 13,
                      letterSpacing: 0.5,
                    }}
                  >
                    {l.code.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: type.familySemi, fontSize: 16, color: t.ink }}>
                    {l.native}
                  </Text>
                  <Text
                    style={{
                      fontFamily: type.family,
                      fontSize: 12,
                      color: t.inkMute,
                      marginTop: 2,
                    }}
                  >
                    {l.alt}
                  </Text>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: isSel ? t.brand : 'transparent',
                    borderWidth: isSel ? 0 : 2,
                    borderColor: t.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSel ? <Icon.check size={16} color="#fff" stroke={2.4} /> : null}
                </View>
              </Tappable>
            );
          })}
        </Card>
      </View>
    </SheetShell>
  );
}

import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from '@expo-google-fonts/ibm-plex-sans';
import { useFonts } from 'expo-font';

// Thai fonts are loaded from local copies whose vertical metrics we patched
// (ascent 1116→1216, descent -534→-434, line-height sum unchanged at 1650).
// The stock @expo-google-fonts IBM Plex Sans Thai has its ascent exactly at the
// tallest Bold upper-mark ink (yMax 1116 == ascent 1116), so iOS clips the top
// of marks like สระอิ/วรรณยุกต์ on bold headings. The extra ascent headroom fixes
// the clip without changing overall line height. See assets/fonts/.
export function useAppFonts(): { loaded: boolean; error: Error | null } {
  const [loaded, error] = useFonts({
    IBMPlexSansThai_400Regular: require('../../assets/fonts/IBMPlexSansThai_400Regular.ttf'),
    IBMPlexSansThai_500Medium: require('../../assets/fonts/IBMPlexSansThai_500Medium.ttf'),
    IBMPlexSansThai_600SemiBold: require('../../assets/fonts/IBMPlexSansThai_600SemiBold.ttf'),
    IBMPlexSansThai_700Bold: require('../../assets/fonts/IBMPlexSansThai_700Bold.ttf'),
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
  });
  return { loaded, error };
}

"use client";

import { useAppStore } from "@/store/app-store";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const dictionaries = {
  en: {
    nav: {
      dashboard: "Dashboard",
      recovery: "Recovery Roadmap",
      medicines: "Medicines",
      scan: "AI Scan & Analyze",
      reports: "Health Reports",
      "ai-chat": "AI Assistant",
      insurance: "Insurance Helper",
      caregiver: "Caregiver",
      profile: "Profile",
      settings: "Settings",
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      loading: "Loading...",
      add: "Add",
      logout: "Log out",
      notifications: "Notifications",
      markAllRead: "Mark all read",
      caughtUp: "You're all caught up.",
    },
    dashboard: {
      greeting: "Hello",
      subtitle: "Wishing you a speedy and healthy recovery!",
    },
    settings: {
      title: "Settings",
      subtitle: "Customize Sehatva AI to fit your needs",
      appearance: "Appearance",
      appearanceDesc: "Switch between light and dark mode",
      language: "Language",
      languageDesc: "Choose your preferred language",
      textSize: "Text Size",
      textSizeDesc: "Adjust for comfortable reading",
      reminders: "Medicine Reminders",
      remindersDesc: "Get voice and push reminders for doses",
    },
    pages: {
      recoveryTitle: "Recovery Roadmap",
      recoverySubtitle: "Your personalized recovery journey",
      medicinesTitle: "Medicines",
      medicinesSubtitle: "Track your schedule and stock at a glance",
      caregiverTitle: "Caregiver",
      caregiverSubtitle: "Manage caregivers and emergency contacts",
      reportsTitle: "Health Reports",
      reportsSubtitle: "Paste a lab report and get an AI-generated explanation",
      insuranceTitle: "Insurance Helper",
      insuranceSubtitle: "Get AI help with documents, schemes, and claim checklists",
      aiChatTitle: "AI Assistant",
      aiChatSubtitle: "Your always-available health companion",
      scanTitle: "AI Scan & Analyze",
      scanSubtitle: "Scan prescriptions and medicine strips with AI",
      profileTitle: "Profile",
      profileSubtitle: "Your personal and medical details",
    },
    sos: {
      button: "SOS",
      title: "Emergency SOS",
      instructions: "Press and hold the button below to alert your caregivers and call for an ambulance.",
      hold: "Hold for 1-2 seconds",
      holding: "Keep holding...",
      sending: "Sending alert...",
      sent: "Alert sent! Caregivers have been notified.",
      callAmbulance: "Call Ambulance (108)",
      noCaregivers: "No caregivers on file yet.",
    },
  },
  hi: {
    nav: {
      dashboard: "डैशबोर्ड",
      recovery: "रिकवरी रोडमैप",
      medicines: "दवाइयाँ",
      scan: "एआई स्कैन",
      reports: "स्वास्थ्य रिपोर्ट",
      "ai-chat": "एआई सहायक",
      insurance: "बीमा सहायक",
      caregiver: "देखभालकर्ता",
      profile: "प्रोफ़ाइल",
      settings: "सेटिंग्स",
    },
    common: {
      save: "सेव करें",
      cancel: "रद्द करें",
      loading: "लोड हो रहा है...",
      add: "जोड़ें",
      logout: "लॉग आउट",
      notifications: "सूचनाएं",
      markAllRead: "सभी पढ़ा हुआ चिह्नित करें",
      caughtUp: "आप सब कुछ देख चुके हैं।",
    },
    dashboard: {
      greeting: "नमस्ते",
      subtitle: "आपकी जल्द और स्वस्थ रिकवरी की शुभकामनाएं!",
    },
    settings: {
      title: "सेटिंग्स",
      subtitle: "Sehatva AI को अपनी ज़रूरत के अनुसार बदलें",
      appearance: "दिखावट",
      appearanceDesc: "लाइट और डार्क मोड के बीच स्विच करें",
      language: "भाषा",
      languageDesc: "अपनी पसंदीदा भाषा चुनें",
      textSize: "टेक्स्ट साइज़",
      textSizeDesc: "आराम से पढ़ने के लिए समायोजित करें",
      reminders: "दवा रिमाइंडर",
      remindersDesc: "खुराक के लिए वॉइस और पुश रिमाइंडर पाएं",
    },
    pages: {
      recoveryTitle: "रिकवरी रोडमैप",
      recoverySubtitle: "आपकी व्यक्तिगत रिकवरी यात्रा",
      medicinesTitle: "दवाइयाँ",
      medicinesSubtitle: "अपना शेड्यूल और स्टॉक एक नज़र में देखें",
      caregiverTitle: "देखभालकर्ता",
      caregiverSubtitle: "देखभालकर्ता और आपातकालीन संपर्क प्रबंधित करें",
      reportsTitle: "स्वास्थ्य रिपोर्ट",
      reportsSubtitle: "लैब रिपोर्ट पेस्ट करें और एआई व्याख्या पाएं",
      insuranceTitle: "बीमा सहायक",
      insuranceSubtitle: "दस्तावेज़ों, योजनाओं और दावा सूची में एआई सहायता पाएं",
      aiChatTitle: "एआई सहायक",
      aiChatSubtitle: "आपका हमेशा उपलब्ध स्वास्थ्य साथी",
      scanTitle: "एआई स्कैन",
      scanSubtitle: "प्रिस्क्रिप्शन और दवा स्ट्रिप्स को एआई से स्कैन करें",
      profileTitle: "प्रोफ़ाइल",
      profileSubtitle: "आपकी व्यक्तिगत और चिकित्सा जानकारी",
    },
    sos: {
      button: "एसओएस",
      title: "आपातकालीन एसओएस",
      instructions: "अपने देखभालकर्ताओं को सूचित करने और एम्बुलेंस बुलाने के लिए नीचे दिए गए बटन को दबाकर रखें।",
      hold: "1-2 सेकंड दबाकर रखें",
      holding: "दबाकर रखें...",
      sending: "अलर्ट भेजा जा रहा है...",
      sent: "अलर्ट भेज दिया गया! देखभालकर्ताओं को सूचित कर दिया गया है।",
      callAmbulance: "एम्बुलेंस बुलाएं (108)",
      noCaregivers: "अभी तक कोई देखभालकर्ता नहीं जोड़ा गया।",
    },
  },
} satisfies Record<string, Record<string, Record<string, string>>>;

type Dict = typeof dictionaries.en;

function getNested(dict: Dict, path: string): string | undefined {
  const parts = path.split(".");
  let value: unknown = dict;
  for (const part of parts) {
    if (value && typeof value === "object" && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof value === "string" ? value : undefined;
}

/**
 * Translation hook. Usage: const { t } = useTranslation(); t("nav.dashboard")
 * Falls back to English, then to the raw key, so missing translations never
 * crash the UI or show "undefined".
 */
export function useTranslation() {
  const { language } = useAppStore();
  const dict = (dictionaries as Record<string, Dict>)[language] ?? dictionaries.en;

  function t(path: string): string {
    return getNested(dict, path) ?? getNested(dictionaries.en, path) ?? path;
  }

  return { t, language };
}

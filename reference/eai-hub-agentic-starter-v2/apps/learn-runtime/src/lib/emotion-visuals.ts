
import dynamicIconImports from 'lucide-react/dynamicIconImports';

type IconName = keyof typeof dynamicIconImports;

export const EMOTION_VISUALS: { [key: string]: { icon: IconName; colorClass: string; gradientClass: string } } = {
  stress: { 
    icon: "cloud-lightning", 
    colorClass: "bg-gradient-to-br from-orange-400 to-red-500",
    gradientClass: "from-orange-400 to-red-500"
  },
  verdriet: { 
    icon: "frown", 
    colorClass: "bg-gradient-to-br from-blue-400 to-blue-600",
    gradientClass: "from-blue-400 to-blue-600"
  },
  blij: { 
    icon: "smile", 
    colorClass: "bg-gradient-to-br from-green-400 to-emerald-500",
    gradientClass: "from-green-400 to-emerald-500"
  },
  error: { 
    icon: "shield-alert", 
    colorClass: "bg-gradient-to-br from-red-400 to-red-600",
    gradientClass: "from-red-400 to-red-600"
  },
  angst: { 
    icon: "shield-alert", 
    colorClass: "bg-gradient-to-br from-orange-400 to-orange-600",
    gradientClass: "from-orange-400 to-orange-600"
  },
  faalangst: { 
    icon: "shield-alert", 
    colorClass: "bg-gradient-to-br from-orange-500 to-red-500",
    gradientClass: "from-orange-500 to-red-500"
  },
  onmacht: { 
    icon: "battery-warning", 
    colorClass: "bg-gradient-to-br from-amber-400 to-orange-500",
    gradientClass: "from-amber-400 to-orange-500"
  },
  boosheid: { 
    icon: "cloud-off", 
    colorClass: "bg-gradient-to-br from-slate-400 to-slate-600",
    gradientClass: "from-slate-400 to-slate-600"
  },
  dankbaarheid: { 
    icon: "heart-handshake", 
    colorClass: "bg-gradient-to-br from-pink-400 to-rose-500",
    gradientClass: "from-pink-400 to-rose-500"
  },
  paniek: { 
    icon: "siren", 
    colorClass: "bg-gradient-to-br from-red-500 to-red-700",
    gradientClass: "from-red-500 to-red-700"
  },
  onzekerheid: { 
    icon: "glasses", 
    colorClass: "bg-gradient-to-br from-indigo-400 to-purple-500",
    gradientClass: "from-indigo-400 to-purple-500"
  },
};

export const getEmotionVisuals = (emotion: string | null): { icon: IconName; colorClass: string; gradientClass: string } => {
  if (!emotion) {
    return { 
      icon: "message-square", 
      colorClass: "bg-gradient-to-br from-zinc-100 to-zinc-200",
      gradientClass: "from-zinc-100 to-zinc-200"
    };
  }
  const lowerCaseEmotion = emotion.toLowerCase();
  const foundKey = Object.keys(EMOTION_VISUALS).find(key => lowerCaseEmotion.includes(key));
  
  if (foundKey) {
    return EMOTION_VISUALS[foundKey];
  }

  return { 
    icon: "shield-question", 
    colorClass: "bg-gradient-to-br from-gray-200 to-gray-300",
    gradientClass: "from-gray-200 to-gray-300"
  };
};

export const LABEL_VISUALS: { [key: string]: { accentColor: string } } = {
  Valideren: { accentColor: "#DBEAFE" }, // tailwind blue-100
  Reflectievraag: { accentColor: "#D1FAE5" }, // tailwind green-100
  Suggestie: { accentColor: "#F3E8FF" }, // tailwind purple-100
  Fout: { accentColor: "#FEE2E2" }, // tailwind red-100
};

export const getLabelVisuals = (label: string | null) => {
  const defaultVisual = { accentColor: "#EFF6FF" }; // tailwind blue-50 as a neutral default
  if (!label || !(label in LABEL_VISUALS)) {
    return defaultVisual;
  }
  return LABEL_VISUALS[label as keyof typeof LABEL_VISUALS];
};

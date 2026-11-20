// One consistent icon system for Marketcraft: clean line icons (Lucide, ISC licence)
// sitting on colourful gradient tiles. Replaces emojis in navigation, features and lessons.
import {
  Home, BookOpen, Lightbulb, Mic, Clapperboard, Video, Award, Handshake, FlaskConical, ShieldCheck,
  Brain, Bot, GraduationCap, Rocket, Smartphone, Target, Store, TrendingUp, Sparkles, Flame, Trophy,
  Megaphone, Palette, PiggyBank, Camera, Star, Mail, Search, CalendarDays, Users, PenLine, Leaf, Package,
  Scale, BarChart3, Tent, Lock, Puzzle, MessageCircleQuestion, RotateCcw, Zap, Medal, Gift, Heart, Eye,
  Map, Wrench, ListChecks, Repeat, Crown, Coins, Image, Share2, Wand2, Gauge, Compass, Volume2, VolumeX, X, ChevronDown, Check,
} from 'lucide-react';

export const ICONS = {
  home: Home, learn: BookOpen, ideas: Lightbulb, interviews: Mic, studio: Clapperboard, showcase: Video,
  certificates: Award, ambassador: Handshake, lab: FlaskConical, admin: ShieldCheck, brain: Brain, bot: Bot,
  grad: GraduationCap, rocket: Rocket, phone: Smartphone, target: Target, store: Store, trend: TrendingUp,
  sparkles: Sparkles, flame: Flame, trophy: Trophy, megaphone: Megaphone, palette: Palette, money: PiggyBank,
  camera: Camera, star: Star, mail: Mail, search: Search, calendar: CalendarDays, users: Users, pen: PenLine,
  leaf: Leaf, package: Package, scale: Scale, chart: BarChart3, tent: Tent, lock: Lock, puzzle: Puzzle,
  question: MessageCircleQuestion, review: RotateCcw, zap: Zap, medal: Medal, gift: Gift, heart: Heart, eye: Eye,
  map: Map, shield: ShieldCheck, tool: Wrench, checklist: ListChecks, repeat: Repeat, crown: Crown, coins: Coins, image: Image,
  share: Share2, wand: Wand2, gauge: Gauge, compass: Compass, volume: Volume2, mute: VolumeX, close: X, down: ChevronDown, check: Check,
};

// Gradient pairs: vivid but balanced, readable white icon on every one.
export const TONES = {
  violet: ['#8b5cf6', '#6366f1'],
  pink: ['#f472b6', '#e11d74'],
  orange: ['#fb923c', '#f43f5e'],
  amber: ['#fbbf24', '#f97316'],
  teal: ['#2dd4bf', '#0ea5e9'],
  blue: ['#60a5fa', '#4f46e5'],
  green: ['#4ade80', '#059669'],
  cyan: ['#22d3ee', '#6366f1'],
  red: ['#fb7185', '#dc2626'],
  lime: ['#a3e635', '#16a34a'],
};
export const TONE_ORDER = ['violet', 'pink', 'teal', 'orange', 'blue', 'green', 'amber', 'cyan', 'red', 'lime'];

export function Icon({ name, size = 20, strokeWidth = 2.1, ...rest }) {
  const C = ICONS[name] ?? Sparkles;
  return <C size={size} strokeWidth={strokeWidth} aria-hidden="true" focusable="false" {...rest} />;
}

/** A gradient tile with a white icon. size = tile size in px. */
export function IconTile({ name, tone = 'violet', size = 48, className = '', style }) {
  const [a, b] = TONES[tone] ?? TONES.violet;
  return (
    <span className={`icon-tile ${className}`} style={{ '--ia': a, '--ib': b, width: size, height: size, ...style }} aria-hidden="true">
      <Icon name={name} size={Math.round(size * 0.5)} />
    </span>
  );
}

// ---- semantic maps used across the app ---------------------------------------------------
export const BADGE_ICONS = {
  'first-lesson': ['learn', 'blue'], 'quiz-ace': ['target', 'pink'], 'first-pitch': ['studio', 'orange'], comeback: ['repeat', 'teal'],
  certified: ['certificates', 'amber'], distinction: ['trophy', 'amber'], ambassador: ['ambassador', 'violet'], 'brand-certified': ['star', 'pink'],
  lab: ['lab', 'cyan'], showcase: ['showcase', 'red'], 'idea-builder': ['ideas', 'amber'], 'streak-7': ['flame', 'orange'],
  swiper: ['phone', 'violet'], medal: ['medal', 'amber'], flashback: ['review', 'teal'], decider: ['compass', 'green'],
};
export const ROLE_ICONS = { kid: ['rocket', 'orange'], adult: ['store', 'teal'], professional: ['trend', 'violet'], admin: ['admin', 'blue'] };
export const CHANNEL_ICONS = { social: 'phone', 'digital-ad': 'target', outdoor: 'megaphone' };

const TOPIC_RULES = [
  [/price|pric|profit|money|cost|budget|break-even|discount/i, 'money'],
  [/photo|picture|image|camera|light/i, 'camera'],
  [/video|film|reel|youtube|abcd/i, 'studio'],
  [/story|hero|origin/i, 'pen'],
  [/review|rating|feedback|complain/i, 'star'],
  [/email|inbox|newsletter/i, 'mail'],
  [/social|post|instagram|hashtag|content|calendar/i, 'calendar'],
  [/customer|audience|fan|who|people|journey/i, 'users'],
  [/brand|logo|colou?r|font|voice/i, 'palette'],
  [/rule|law|ftc|honest|truth|legal|disclos|privacy|claim/i, 'scale'],
  [/search|seo|google|found/i, 'search'],
  [/event|market|fair|stall|sign/i, 'tent'],
  [/test|measure|track|number|data|result|experiment/i, 'chart'],
  [/scam|password|hack|secur|safe|protect/i, 'lock'],
  [/plan|launch|week|month/i, 'rocket'],
  [/partner|team|together/i, 'ambassador'],
  [/word|write|headline|copy|read|call to action|cta/i, 'pen'],
  [/green|eco|planet|recycl/i, 'leaf'],
  [/ship|deliver|order|refund|online/i, 'package'],
  [/service|help|effort|loyal|retention|keep/i, 'heart'],
];
/** Picks an icon for a lesson topic (heading first, then text). */
export function topicIcon(...texts) {
  for (const t of texts) {
    const hit = TOPIC_RULES.find(([re]) => re.test(t ?? ''));
    if (hit) return hit[1];
  }
  return 'sparkles';
}

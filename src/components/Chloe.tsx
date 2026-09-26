import { Image } from 'expo-image';
import { usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useInsets } from '@/lib/insets';
import { useDesktop } from '@/lib/layout';
import { chloe, haptics } from '@/services';
import { useChloe } from '@/store/chloe';
import { colors, radius, shadow, type } from '@/theme';
import { Icon } from './Icon';
import { EASE_OUT } from './Reveal';
import { T } from './Text';

const avatar = require('../../assets/photos/chloe.jpg');

const SUGGESTIONS = ['How do free nights work?', 'What does a free night cost me?', 'How do hosts get paid?'];
const GREETING = "Hi, I'm Chloe. Ask me anything about hostmenow: free nights, booking, invites or hosting.";

/** Where the launcher stays out of the way: onboarding and camera steps, and the Hostshare preview (it has its own help). */
const hiddenOn = (p: string) => p.startsWith('/onboarding') || p === '/id-failed' || p.startsWith('/preview');

/** Phone screens with something pinned to the bottom edge: lift the launcher above it. */
function bottomClearance(p: string) {
  if (p === '/explore' || p === '/trips' || p === '/you') return 92; // tab bar
  if (p.startsWith('/listing/')) return 104; // price and Book bar
  if (p.startsWith('/i/')) return 96; // Accept invite
  return 16;
}

function Dots() {
  const reduce = useReducedMotion();
  return (
    <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 6 }} accessibilityLabel="Chloe is typing">
      {[0, 1, 2].map((i) => (
        <Dot key={i} i={i} still={reduce} />
      ))}
    </View>
  );
}

function Dot({ i, still }: { i: number; still: boolean }) {
  const o = useSharedValue(0.3);
  useEffect(() => {
    if (still) return;
    o.set(withDelay(i * 160, withRepeat(withSequence(withTiming(1, { duration: 420 }), withTiming(0.3, { duration: 420 })), -1)));
  }, [i, o, still]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.light.inkSecondary }, a]} />;
}

function Bubble({ role, text }: { role: 'user' | 'assistant'; text: string }) {
  const mine = role === 'user';
  return (
    <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
      <T variant="callout" selectable style={{ color: mine ? colors.light.onInk : colors.light.ink, lineHeight: 21 }}>
        {text}
      </T>
    </View>
  );
}

/** Chloe: a small help chat, opened from a quiet round portrait in the corner. */
export function Chloe() {
  const pathname = usePathname();
  const desktop = useDesktop();
  const insets = useInsets();
  const reduce = useReducedMotion();
  const { open, messages, pending, hiddenBy, setOpen, push, setPending } = useChloe();
  const [draft, setDraft] = useState('');
  const list = useRef<ScrollView>(null);
  const input = useRef<TextInput>(null);

  const hidden = hiddenOn(pathname) || hiddenBy > 0;

  // The launcher arrives quietly, a moment after the page.
  const shown = useSharedValue(0);
  useEffect(() => {
    shown.set(hidden ? withTiming(0, { duration: 200 }) : withDelay(reduce ? 0 : 900, withTiming(1, { duration: 700, easing: EASE_OUT })));
  }, [hidden, reduce, shown]);
  const launcherStyle = useAnimatedStyle(() => ({ opacity: shown.value, transform: [{ scale: 0.92 + 0.08 * shown.value }] }));

  // The window rises from the corner.
  const panel = useSharedValue(0);
  useEffect(() => {
    panel.set(withTiming(open ? 1 : 0, { duration: reduce ? 0 : open ? 420 : 260, easing: EASE_OUT }));
    if (open) setTimeout(() => input.current?.focus(), desktop ? 300 : 450);
  }, [open, reduce, panel, desktop]);
  const panelStyle = useAnimatedStyle(() => ({
    opacity: panel.value,
    transform: [{ translateY: (desktop ? 16 : 40) * (1 - panel.value) }, { scale: desktop ? 0.97 + 0.03 * panel.value : 1 }],
  }));

  useEffect(() => {
    setTimeout(() => list.current?.scrollToEnd({ animated: true }), 60);
  }, [messages.length, pending]);

  if (hidden && !open) return null;

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || pending) return;
    haptics.tapLight();
    setDraft('');
    const next = [...messages, { role: 'user' as const, content: q }];
    push({ role: 'user', content: q });
    setPending(true);
    const r = await chloe.ask(next);
    setPending(false);
    push({
      role: 'assistant',
      content:
        'reply' in r
          ? r.reply
          : r.error === 'not_configured'
            ? "I'm not switched on yet. Check back soon."
            : 'Something went wrong on my end. Try again in a moment.',
    });
  };

  const bottom = desktop ? 24 : insets.bottom + bottomClearance(pathname);

  return (
    <>
      {!open ? (
        <Animated.View style={[{ position: 'absolute', right: desktop ? 24 : 16, bottom, zIndex: 40 }, launcherStyle]} pointerEvents={hidden ? 'none' : 'auto'}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ask Chloe, hostmenow help"
            onPress={() => {
              haptics.tapLight();
              setOpen(true);
            }}
            style={({ hovered }: { hovered?: boolean }) => [styles.launcher, shadow.sheet, hovered ? { transform: [{ scale: 1.04 }] } : null]}
          >
            <Image source={avatar} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          </Pressable>
        </Animated.View>
      ) : null}

      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[
          desktop
            ? { position: 'absolute', right: 24, bottom: 24, width: 380, height: 580, maxHeight: '85%' }
            : { position: 'absolute', left: 0, right: 0, bottom: 0, top: insets.top + 8 },
          { zIndex: 41 },
          panelStyle,
        ]}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.panel, shadow.sheet, !desktop && styles.panelPhone]}>
          <View style={styles.header}>
            <Image source={avatar} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <T variant="bodyStrong">Chloe</T>
              <T variant="caption" color="inkSecondary">hostmenow help</T>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={() => setOpen(false)} style={styles.close}>
              <View style={{ transform: [{ rotate: '45deg' }] }}>
                <Icon name="plus" size={20} color={colors.light.inkSecondary} />
              </View>
            </Pressable>
          </View>

          <ScrollView ref={list} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10 }} keyboardShouldPersistTaps="handled">
            <Bubble role="assistant" text={GREETING} />
            {messages.length === 0 ? (
              <View style={{ gap: 8, marginTop: 6 }}>
                {SUGGESTIONS.map((s) => (
                  <Pressable key={s} accessibilityRole="button" onPress={() => send(s)} style={styles.suggestion}>
                    <T variant="callout">{s}</T>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} text={m.content} />
            ))}
            {pending ? (
              <View style={[styles.bubble, styles.theirs]}>
                <Dots />
              </View>
            ) : null}
          </ScrollView>

          <View style={[styles.inputRow, { paddingBottom: desktop ? 12 : Math.max(insets.bottom, 12) }]}>
            <View style={styles.field}>
              <TextInput
                ref={input}
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={() => send(draft)}
                placeholder="Ask Chloe"
                placeholderTextColor={colors.light.inkSecondary}
                accessibilityLabel="Message Chloe"
                returnKeyType="send"
                style={[type.callout, styles.input]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Send"
                disabled={!draft.trim() || pending}
                onPress={() => send(draft)}
                style={[styles.send, { opacity: draft.trim() && !pending ? 1 : 0.3 }]}
              >
                <Icon name="arrow-right" size={16} color={colors.light.onInk} />
              </Pressable>
            </View>
            <T variant="caption" color="inkTertiary" align="center" style={{ fontSize: 11, lineHeight: 14, marginTop: 8 }}>
              Chloe is in beta and can get things wrong.
            </T>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  launcher: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden', borderWidth: 2, borderColor: colors.light.bg, backgroundColor: colors.light.bgSubtle },
  panel: { flex: 1, backgroundColor: colors.light.bg, borderRadius: radius.sheet, overflow: 'hidden' },
  panelPhone: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.line,
  },
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '86%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.light.bgSubtle, borderBottomLeftRadius: 6 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.light.ink, borderBottomRightRadius: 6 },
  suggestion: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.light.inkTertiary,
  },
  inputRow: { paddingHorizontal: 12, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.light.line },
  field: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, paddingLeft: 16, paddingRight: 5, borderRadius: radius.pill, backgroundColor: colors.light.bgSubtle },
  input: { flex: 1, color: colors.light.ink, paddingVertical: 0, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null) },
  send: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.light.ink, alignItems: 'center', justifyContent: 'center' },
});

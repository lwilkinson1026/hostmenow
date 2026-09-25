import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState, type ReactNode } from 'react';
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useInsets } from '@/lib/insets';
import { CONTENT_MAX, DESKTOP_GUTTER, useDesktop } from '@/lib/layout';

import { Avatar } from '@/components/Avatar';
import { BookingPanel, BookingSheet } from '@/components/BookingSheet';
import { CircleButton } from '@/components/CircleButton';
import { Hairline } from '@/components/Hairline';
import { Icon, type IconName } from '@/components/Icon';
import { PressScale } from '@/components/PressScale';
import { PriceLine } from '@/components/PriceLine';
import { EASE_OUT } from '@/components/Reveal';
import { Sheet, type SheetRef } from '@/components/Sheet';
import { Spinner } from '@/components/Spinner';
import { StaticMap } from '@/components/StaticMap';
import { WatchButton } from '@/components/WatchButton';
import { T } from '@/components/Text';
import { freeNightsAt, getListing, type Listing } from '@/data/mock';
import { plural } from '@/lib/dates';
import { money } from '@/lib/pricing';
import { haptics, identity, invites } from '@/services';
import { useApp, useFreeNights } from '@/store/app';
import { colors, radius } from '@/theme';

function Carousel({ listing, height }: { listing: Listing; height: number }) {
  const [w, setW] = useState(0);
  const [page, setPage] = useState(0);
  const scroller = useRef<ScrollView>(null);
  const n = listing.photos.length;
  return (
    <View style={{ height }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? (
        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={32}
          onScroll={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / w))}
        >
          {listing.photos.map((p) => (
            <Image
              key={p.alt}
              source={p.src}
              accessibilityLabel={p.alt}
              contentFit="cover"
              contentPosition={{ left: `${p.cropX}%`, top: '50%' }}
              transition={200}
              style={{ width: w, height }}
            />
          ))}
        </ScrollView>
      ) : null}
      {n > 1 ? (
        <View accessibilityLabel={`Photo ${page + 1} of ${n}`} style={styles.dots}>
          {listing.photos.map((p, i) => (
            <Pressable
              key={p.alt}
              accessibilityRole="button"
              accessibilityLabel={`Photo ${i + 1}`}
              hitSlop={8}
              onPress={() => scroller.current?.scrollTo({ x: i * w, animated: true })}
            >
              <View style={[styles.dot, { backgroundColor: i === page ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }]} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Desktop: a photo tile that eases into a slight zoom while the pointer rests on it. */
function HoverZoom({ style, children }: { style: object; children: ReactNode }) {
  const z = useSharedValue(0);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.035 * z.value }] }));
  return (
    <Pressable
      accessible={false}
      onHoverIn={() => z.set(withTiming(1, { duration: 900, easing: EASE_OUT }))}
      onHoverOut={() => z.set(withTiming(0, { duration: 700, easing: EASE_OUT }))}
      style={[style, { overflow: 'hidden' }]}
    >
      <Animated.View style={[{ flex: 1 }, a]}>{children}</Animated.View>
    </Pressable>
  );
}

/** Desktop: one large photo with up to four beside it, or one wide photo. */
function PhotoGrid({ listing, height }: { listing: Listing; height: number }) {
  const [first, ...rest] = listing.photos;
  const side = rest.slice(0, 4);
  const img = (p: Listing['photos'][number], style: object) => (
    <HoverZoom key={p.alt} style={style}>
      <Image
        source={p.src}
        accessibilityLabel={p.alt}
        contentFit="cover"
        contentPosition={{ left: `${p.cropX}%`, top: '50%' }}
        transition={200}
        style={{ width: '100%', height: '100%' }}
      />
    </HoverZoom>
  );
  const tile = (height - 8) / 2;
  return (
    <View style={{ height, flexDirection: 'row', gap: 8, borderRadius: radius.card, overflow: 'hidden' }}>
      {img(first, { flex: side.length ? 1 : undefined, width: side.length ? undefined : '100%', height })}
      {side.length ? (
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {side.map((p, i) =>
            img(p, {
              // Two across when there are 3 or 4; a lone last photo in an odd set spans the row.
              width: side.length > 2 && !(side.length === 3 && i === 2) ? 'calc(50% - 4px)' : '100%',
              height: side.length > 1 ? tile : height,
            }),
          )}
        </View>
      ) : null}
    </View>
  );
}

function Fact({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={{ flex: 1, gap: 6, alignItems: 'flex-start' }}>
      <Icon name={icon} />
      <T variant="callout">{label}</T>
    </View>
  );
}

function Link({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={6} style={{ alignSelf: 'flex-start', minHeight: 32, justifyContent: 'center' }}>
      <T variant="bodyStrong" style={{ textDecorationLine: 'underline' }}>{label}</T>
    </Pressable>
  );
}

/** D. Listing detail. */
export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listing = getListing(id);
  const insets = useInsets();
  const { height } = useWindowDimensions();
  const bank = useFreeNights();
  const free = listing ? freeNightsAt(listing, bank) > 0 : false;
  const { idStatus, membership, setIdStatus } = useApp();
  // Phones: the photo drifts at half speed as the page scrolls, and stretches when pulled down.
  const reduce = useReducedMotion();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const heroH = Math.round(height * 0.55);
  const hero = useAnimatedStyle(() => {
    if (reduce) return {};
    const y = scrollY.value;
    return y < 0
      ? { transform: [{ translateY: y / 2 }, { scale: interpolate(y, [-heroH, 0], [2, 1]) }] }
      : { transform: [{ translateY: y * 0.5 }] };
  });
  const desktop = useDesktop();
  const [expanded, setExpanded] = useState(false);
  const [info, setInfo] = useState<'amenities' | 'rules'>('amenities');

  const bookSheet = useRef<SheetRef>(null);
  const verifySheet = useRef<SheetRef>(null);
  const infoSheet = useRef<SheetRef>(null);

  if (!listing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <T color="inkSecondary">This home isn't open right now.</T>
      </View>
    );
  }

  const book = async () => {
    haptics.tapLight();
    if (membership === 'paused') {
      router.push({ pathname: '/onboarding/pay', params: { mode: 'resume' } });
      return;
    }
    if (idStatus === 'failed') {
      router.push('/id-failed');
      return;
    }
    if (idStatus === 'verifying') {
      verifySheet.current?.present();
      const s = await identity.checkStatus();
      setIdStatus(s);
      verifySheet.current?.dismiss();
      if (s === 'verified') setTimeout(() => bookSheet.current?.present(), 320);
      return;
    }
    bookSheet.current?.present();
  };

  /** Desktop books inline: the same checks as `book`, run when Pay is tapped. */
  const canPay = async () => {
    if (membership === 'paused') {
      router.push({ pathname: '/onboarding/pay', params: { mode: 'resume' } });
      return false;
    }
    if (idStatus === 'failed') {
      router.push('/id-failed');
      return false;
    }
    if (idStatus === 'verifying') {
      verifySheet.current?.present();
      const s = await identity.checkStatus();
      setIdStatus(s);
      verifySheet.current?.dismiss();
      return s === 'verified';
    }
    return true;
  };

  const showInfo = (k: 'amenities' | 'rules') => {
    setInfo(k);
    infoSheet.current?.present();
  };

  const half = Math.round(listing.retailNight / 2);

  const details = (
    <>
      <View style={{ gap: 4 }}>
        <T variant="title" accessibilityRole="header">{listing.name}</T>
        <T variant="callout" color="inkSecondary">{listing.region}</T>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar initials={listing.host[0]} />
        <T>Hosted by {listing.host}</T>
      </View>

      <Hairline />
      <View style={{ flexDirection: 'row' }}>
        <Fact icon="guests" label={plural(listing.guests, 'guest')} />
        <Fact icon="bed" label={plural(listing.bedrooms, 'bedroom')} />
        <Fact icon="bath" label={plural(listing.baths, 'bath')} />
      </View>

      <Hairline />
      <View style={{ gap: 6 }}>
        <T numberOfLines={expanded ? undefined : 3}>{listing.description}</T>
        {expanded ? null : <Link label="More" onPress={() => setExpanded(true)} />}
      </View>

      <Hairline />
      <View style={{ gap: 16 }}>
        <T variant="heading">What's here</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 20 }}>
          {listing.amenities.slice(0, 6).map((a) => (
            <View key={a.label} style={{ width: '33.33%', gap: 6, paddingRight: 12 }}>
              <Icon name={a.icon} />
              <T variant="callout">{a.label}</T>
            </View>
          ))}
        </View>
        {listing.amenities.length > 6 ? <Link label="All amenities" onPress={() => showInfo('amenities')} /> : null}
      </View>

      <Hairline />
      <View style={{ gap: 12 }}>
        <T variant="heading">Where you'll be</T>
        <StaticMap height={180} marker="area" />
        <T variant="caption" color="inkSecondary">Approximate area. Exact address after booking.</T>
      </View>

      <Hairline />
      <Pressable
        accessibilityRole="button"
        onPress={() => showInfo('rules')}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, gap: 12 }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="bodyStrong">House rules</T>
          <T variant="callout" color="inkSecondary">{listing.rulesSummary}</T>
        </View>
        <Icon name="chevron-right" size={20} color={colors.light.inkSecondary} />
      </Pressable>
    </>
  );

  const sheets = (
    <>
        <BookingSheet
          ref={bookSheet}
          listing={listing}
          onBooked={(b) => {
            bookSheet.current?.dismiss();
            router.push({ pathname: '/confirmed/[id]', params: { id: b.id } });
          }}
        />

        <Sheet ref={verifySheet} dismissible={false}>
          <View style={{ alignItems: 'center', gap: 14, paddingTop: 24, paddingBottom: 64 }}>
            <Spinner size={28} />
            <T variant="heading" align="center">One moment.</T>
            <T color="inkSecondary" align="center">We're still checking your ID.</T>
          </View>
        </Sheet>

        <Sheet ref={infoSheet}>
          <T variant="heading" style={{ marginBottom: 8 }}>{info === 'amenities' ? "What's here" : 'House rules'}</T>
          {(info === 'amenities' ? listing.amenities.map((a) => a.label) : listing.rules).map((line) => (
            <T key={line} style={styles.infoRow}>{line}</T>
          ))}
        </Sheet>
    </>
  );

  if (desktop) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.light.bg }}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={{ width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', paddingHorizontal: DESKTOP_GUTTER, paddingTop: 20, paddingBottom: 80 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Pressable
              accessibilityRole="link"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/explore'))}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 40 }}
            >
              <Icon name="chevron-left" size={18} />
              <T variant="calloutStrong">Explore</T>
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
              <WatchButton listingId={listing.id} variant="text" />
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  haptics.tapLight();
                  invites.shareListing(listing.id);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40 }}
              >
                <Icon name="share" size={16} />
                <T variant="calloutStrong" style={{ textDecorationLine: 'underline' }}>Share</T>
              </Pressable>
            </View>
          </View>
          <PhotoGrid listing={listing} height={Math.min(520, Math.max(360, Math.round(height * 0.5)))} />
          <View style={{ flexDirection: 'row', gap: 64, marginTop: 40, alignItems: 'flex-start' }}>
            <View style={{ flex: 1, gap: 20, maxWidth: 680 }}>{details}</View>
            <View style={[styles.aside, { position: 'sticky' } as object]}>
              <View style={{ marginBottom: 20 }}>
                <PriceLine listing={listing} free={free} />
              </View>
              <BookingPanel
                listing={listing}
                beforePay={canPay}
                onBooked={(b) => router.push({ pathname: '/confirmed/[id]', params: { id: b.id } })}
              />
            </View>
          </View>
        </ScrollView>
        {sheets}
      </View>
    );
  }


  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bg }}>
      <StatusBar style="light" />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 130 + insets.bottom }}
      >
        <View style={{ height: heroH, overflow: 'visible', zIndex: 0 }}>
          <Animated.View style={hero}>
            <Carousel listing={listing} height={heroH} />
          </Animated.View>
        </View>

        {/* Drawn over the photo, which slides beneath it. */}
        <View style={{ padding: 24, paddingBottom: 0, gap: 20, backgroundColor: colors.light.bg, zIndex: 1 }}>{details}</View>
      </Animated.ScrollView>

      <View style={[styles.floating, { top: insets.top - 5, left: 16 }]}>
        <CircleButton icon="chevron-left" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/explore'))} />
      </View>
      <View style={[styles.floating, { top: insets.top - 5, right: 16, flexDirection: 'row', gap: 10 }]}>
        <WatchButton listingId={listing.id} variant="circle" />
        <CircleButton
          icon="share"
          iconSize={18}
          label="Share"
          onPress={() => {
            haptics.tapLight();
            invites.shareListing(listing.id);
          }}
        />
      </View>

      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {free ? (
          <View>
            <T variant="bodyStrong" color="accent">Free</T>
            <T variant="callout" color="inkSecondary">cleaning {money(listing.cleaning)}</T>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <T color="inkTertiary" style={{ textDecorationLine: 'line-through' }}>{money(listing.retailNight)}</T>
            <T>
              <T variant="bodyStrong">{money(half)}</T> night
            </T>
          </View>
        )}
        <PressScale accessibilityRole="button" onPress={book} style={styles.cta}>
          <T variant="bodyStrong" color="onInk">{free ? 'Stay free' : 'Book'}</T>
        </PressScale>
      </View>

      {sheets}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { position: 'absolute', left: 0, right: 0, bottom: 16, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  floating: { position: 'absolute' },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.light.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.light.line,
    paddingTop: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cta: {
    height: 56,
    paddingHorizontal: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.light.ink,
    justifyContent: 'center',
  },
  aside: { width: 400, top: 24, paddingLeft: 40, paddingRight: 24, paddingVertical: 8, borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.light.line },
  infoRow: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.light.line },
});

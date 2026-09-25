import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { PrimaryButton, TextButton } from '@/components/Buttons';
import { NavHeader } from '@/components/NavHeader';
import { Spinner } from '@/components/Spinner';
import { T } from '@/components/Text';
import { useInsets } from '@/lib/insets';
import { useColumn, useDesktop } from '@/lib/layout';
import { agents, haptics } from '@/services';
import { MCP_SERVER_URL, MCP_TOOLS } from '@/services/agents';
import { useApp, type AgentPerms } from '@/store/app';
import { colors, radius } from '@/theme';

const mono = Platform.select({
  ios: 'Menlo',
  default: 'ui-monospace, SFMono-Regular, Menlo, monospace',
});

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Copy ${label.toLowerCase()}`}
      hitSlop={8}
      onPress={async () => {
        await Clipboard.setStringAsync(value);
        haptics.tapLight();
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      style={{ minHeight: 44, justifyContent: 'center' }}
    >
      <T variant="calloutStrong">{copied ? 'Copied' : 'Copy'}</T>
    </Pressable>
  );
}

/** A value to paste somewhere: label, the value in mono, and Copy. */
function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="caption" color="inkSecondary">
          {label}
        </T>
        <T variant="callout" selectable style={{ fontFamily: mono }}>
          {value}
        </T>
      </View>
      <CopyButton label={label} value={value} />
    </View>
  );
}

function Toggle({ label, help, value, onChange }: { label: string; help: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <T>{label}</T>
        <T variant="caption" color="inkSecondary">
          {help}
        </T>
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={(v) => {
          haptics.tapLight();
          onChange(v);
        }}
        trackColor={{ true: colors.light.ink, false: colors.light.line }}
        thumbColor="#FFFFFF"
        {...({ activeThumbColor: '#FFFFFF' } as object)}
      />
    </View>
  );
}

const PERMS: { k: keyof AgentPerms; label: string; help: string }[] = [
  {
    k: 'bookFree',
    label: 'Book with free nights',
    help: 'Stays that use nights from your bank.',
  },
  {
    k: 'bookPaid',
    label: 'Book half-price stays',
    help: 'Charged to your card on file.',
  },
  {
    k: 'askFirst',
    label: 'Ask me before it books',
    help: "We'll send you a notification to approve each booking.",
  },
];

/** Connect your bot: an MCP server so a member's AI agent can search and book for them. */
export default function Agent() {
  const insets = useInsets();
  const desktop = useDesktop();
  const column = useColumn(640);
  const { agent, setAgent, setAgentPerm } = useApp();
  /** The full key, only in this screen's memory and only right after it's created. */
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Once a key exists and nothing has connected yet, wait for the agent's first handshake.
  useEffect(() => {
    if (!agent.keyLast4 || agent.client) return;
    let live = true;
    agents.waitForConnection().then(({ client }) => {
      if (!live) return;
      haptics.success();
      setAgent({ client });
    });
    return () => {
      live = false;
    };
  }, [agent.keyLast4, agent.client, setAgent]);

  const create = async () => {
    setBusy(true);
    const k = await agents.createKey();
    setBusy(false);
    haptics.success();
    setFreshKey(k.key);
    setAgent({ keyLast4: k.last4, client: null });
  };

  const disconnect = async () => {
    setBusy(true);
    await agents.revokeKey();
    setBusy(false);
    setFreshKey(null);
    setAgent({ keyLast4: null, client: null });
  };

  const config = JSON.stringify(
    {
      mcpServers: {
        hostmenow: {
          url: MCP_SERVER_URL,
          headers: { Authorization: `Bearer ${freshKey ?? 'YOUR_KEY'}` },
        },
      },
    },
    null,
    2,
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bg }}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          {
            paddingTop: desktop ? 24 : insets.top - 5,
            paddingHorizontal: 24,
            paddingBottom: 48,
          },
          column,
        ]}
      >
        <NavHeader />
        <T variant="display" style={{ marginTop: 32 }}>
          Connect your bot.
        </T>
        <T color="inkSecondary" style={{ marginTop: 14 }}>
          Let your AI agent find and book stays for you. It works with Grok, Claude, ChatGPT and any agent that supports MCP.
        </T>

        {!agent.keyLast4 ? (
          <PrimaryButton
            style={[{ marginTop: 32 }, desktop ? { maxWidth: 360 } : null]}
            label="Create a connection key"
            loading={busy}
            onPress={create}
          />
        ) : (
          <>
            <View style={[styles.status, { marginTop: 32 }]}>
              {agent.client ? (
                <>
                  <View style={styles.dot} />
                  <T variant="bodyStrong" style={{ flex: 1 }}>
                    {agent.client} is connected
                  </T>
                </>
              ) : (
                <>
                  <Spinner size={16} />
                  <T variant="bodyStrong" style={{ flex: 1 }}>
                    Waiting for your bot
                  </T>
                </>
              )}
            </View>

            <View style={styles.list}>
              <CopyField label="Server" value={MCP_SERVER_URL} />
              {freshKey ? (
                <CopyField label="Key" value={freshKey} />
              ) : (
                <View style={styles.row}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <T variant="caption" color="inkSecondary">
                      Key
                    </T>
                    <T variant="callout" style={{ fontFamily: mono }}>
                      hmn_····{agent.keyLast4}
                    </T>
                  </View>
                </View>
              )}
            </View>
            {freshKey ? (
              <>
                <T variant="caption" color="inkSecondary" style={{ marginTop: 10 }}>
                  We'll show this key once. Add the server and key in your agent's MCP or connector settings.
                </T>
                <View style={styles.code}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <T variant="caption" color="inkSecondary">
                      For agents that take a config file
                    </T>
                    <CopyButton label="config" value={config} />
                  </View>
                  <T variant="caption" selectable style={{ fontFamily: mono, color: colors.light.ink }}>
                    {config}
                  </T>
                </View>
              </>
            ) : null}
          </>
        )}

        <T variant="calloutStrong" color="inkSecondary" style={{ marginTop: 48 }}>
          What your bot can do
        </T>
        <View style={styles.list}>
          {PERMS.map((p) => (
            <Toggle key={p.k} label={p.label} help={p.help} value={agent.perms[p.k]} onChange={(v) => setAgentPerm(p.k, v)} />
          ))}
        </View>
        <T variant="caption" color="inkSecondary" style={{ marginTop: 10 }}>
          Your bot follows the same rules you do: nights 5 days out, free nights first, and each home's house rules.
        </T>

        <T variant="calloutStrong" color="inkSecondary" style={{ marginTop: 48 }}>
          Tools it sees
        </T>
        <View style={styles.list}>
          {MCP_TOOLS.map((t) => (
            <View key={t.name} style={styles.row}>
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="callout" style={{ fontFamily: mono }}>
                  {t.name}
                </T>
                <T variant="caption" color="inkSecondary">
                  {t.about}
                </T>
              </View>
            </View>
          ))}
        </View>

        {agent.keyLast4 ? (
          <TextButton style={{ alignSelf: 'flex-start', marginTop: 24 }} label="Disconnect" color="danger" loading={busy} onPress={disconnect} />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.light.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.line,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 24,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3E8E5A' },
  code: {
    marginTop: 16,
    padding: 16,
    borderRadius: radius.card,
    backgroundColor: colors.light.bgSubtle,
  },
});

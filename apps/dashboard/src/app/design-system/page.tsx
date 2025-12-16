'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  Input,
  Badge,
  Container,
  Avatar,
  Icon,
  ChatBubble,
  StreamingText,
  FeatureCard,
  StatCard,
  IntegrationLogo,
} from '@/components/ui';
import type { IconName } from '@/components/ui';

const iconNames: IconName[] = [
  'sparkles',
  'brain',
  'message',
  'send',
  'bot',
  'user',
  'check',
  'x',
  'menu',
  'arrow-right',
  'arrow-left',
  'chevron-down',
  'chevron-up',
  'globe',
  'lightning',
  'shield',
  'clock',
  'database',
  'code',
  'settings',
  'search',
  'star',
  'heart',
  'play',
  'pause',
  'refresh',
  'external-link',
  'copy',
  'telegram',
  'lark',
  'memory',
  'analytics',
  'integration',
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function DesignSystemPage() {
  const [streamingDemo, setStreamingDemo] = useState(false);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12">
      <Container>
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 mb-4"
          >
            <Icon name="arrow-left" size="xs" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Design System
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
            A comprehensive collection of reusable components for the J.A.R.V.I.S platform.
            Built with React, TypeScript, and Tailwind CSS.
          </p>
        </div>

        <Section title="Buttons">
          <SubSection title="Variants">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </SubSection>

          <SubSection title="Sizes">
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </SubSection>

          <SubSection title="With Icons">
            <div className="flex flex-wrap gap-4">
              <Button leftIcon={<Icon name="sparkles" size="xs" />}>With Left Icon</Button>
              <Button rightIcon={<Icon name="arrow-right" size="xs" />}>With Right Icon</Button>
              <Button isLoading>Loading</Button>
            </div>
          </SubSection>
        </Section>

        <Section title="Cards">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default">
              <h3 className="font-semibold mb-2">Default Card</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Standard card with border and background.
              </p>
            </Card>
            <Card variant="glass">
              <h3 className="font-semibold mb-2">Glass Card</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Glassmorphism effect with backdrop blur.
              </p>
            </Card>
            <Card variant="elevated">
              <h3 className="font-semibold mb-2">Elevated Card</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Card with shadow elevation.
              </p>
            </Card>
            <Card variant="bordered">
              <h3 className="font-semibold mb-2">Bordered Card</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Transparent with prominent border.
              </p>
            </Card>
            <Card variant="gradient">
              <h3 className="font-semibold mb-2">Gradient Card</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Subtle gradient background.
              </p>
            </Card>
            <Card variant="glass" hover>
              <h3 className="font-semibold mb-2">Hover Effect</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Card with hover animation.
              </p>
            </Card>
          </div>
        </Section>

        <Section title="Inputs">
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
            <Input label="Default Input" placeholder="Enter text..." />
            <Input
              label="With Icon"
              placeholder="Search..."
              leftIcon={<Icon name="search" size="sm" />}
            />
            <Input label="With Error" placeholder="Email" error="Invalid email address" />
            <Input label="With Hint" placeholder="Username" hint="Must be 3-20 characters" />
            <Input label="Disabled" placeholder="Disabled input" disabled />
          </div>
        </Section>

        <Section title="Badges">
          <SubSection title="Variants">
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </SubSection>

          <SubSection title="With Dot">
            <div className="flex flex-wrap gap-3">
              <Badge variant="success" dot>
                Online
              </Badge>
              <Badge variant="danger" dot>
                Offline
              </Badge>
              <Badge variant="warning" dot>
                Away
              </Badge>
            </div>
          </SubSection>

          <SubSection title="Sizes">
            <div className="flex flex-wrap items-center gap-3">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>
          </SubSection>
        </Section>

        <Section title="Avatars">
          <SubSection title="Sizes">
            <div className="flex items-end gap-4">
              <Avatar name="Minh" size="xs" />
              <Avatar name="Lan" size="sm" />
              <Avatar name="Duc" size="md" />
              <Avatar name="Hoa" size="lg" />
              <Avatar name="Nam" size="xl" />
            </div>
          </SubSection>

          <SubSection title="With Status">
            <div className="flex items-center gap-4">
              <Avatar name="Online User" status="online" />
              <Avatar name="Offline User" status="offline" />
              <Avatar name="Busy User" status="busy" />
              <Avatar name="Away User" status="away" />
            </div>
          </SubSection>
        </Section>

        <Section title="Icons">
          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
            {iconNames.map((name) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:border-primary-500 transition-colors"
                title={name}
              >
                <Icon name={name} size="md" className="text-neutral-600 dark:text-neutral-300" />
                <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate w-full text-center">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Chat Components">
          <SubSection title="Chat Bubbles">
            <div className="max-w-lg space-y-4 bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <ChatBubble
                variant="user"
                message="Hello! Can you help me with a task?"
                avatar={{ name: 'User' }}
                timestamp="10:30 AM"
              />
              <ChatBubble
                variant="assistant"
                message="Of course! I'd be happy to help. What do you need assistance with?"
                avatar={{ name: 'AI' }}
                timestamp="10:30 AM"
              />
              <ChatBubble variant="system" message="Conversation started" />
              <ChatBubble variant="assistant" message="" isTyping avatar={{ name: 'AI' }} />
            </div>
          </SubSection>

          <SubSection title="Streaming Text">
            <Card variant="glass" className="max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Streaming Demo</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStreamingDemo(!streamingDemo)}
                >
                  {streamingDemo ? 'Reset' : 'Start'}
                </Button>
              </div>
              <div className="min-h-[60px] text-neutral-700 dark:text-neutral-300">
                {streamingDemo ? (
                  <StreamingText
                    text="Hello! I'm J.A.R.V.I.S, your AI-powered Vietnamese executive assistant. I can help you extract tasks, remember decisions, and search through your conversation history."
                    speed={30}
                    onComplete={() => console.log('Streaming complete')}
                  />
                ) : (
                  <span className="text-neutral-400">Click Start to see streaming animation</span>
                )}
              </div>
            </Card>
          </SubSection>
        </Section>

        <Section title="Feature Cards">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="memory"
              title="Long-term Memory"
              description="Remember everything across sessions with persistent context storage."
              badge="mem0"
            />
            <FeatureCard
              icon="sparkles"
              title="AI Extraction"
              description="Automatically extract tasks, deadlines, and decisions from conversations."
            />
            <FeatureCard
              icon="lightning"
              title="Fast Response"
              description="Sub-3 second response times with Gemini Flash technology."
              badge="Fast"
            />
          </div>
        </Section>

        <Section title="Stat Cards">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Total Users"
              value={1234}
              icon="user"
              change={{ value: 12, type: 'increase' }}
            />
            <StatCard
              label="Messages"
              value="45.2K"
              icon="message"
              change={{ value: 8, type: 'increase' }}
            />
            <StatCard
              label="Response Time"
              value="1.2"
              suffix="sec"
              icon="clock"
              change={{ value: 5, type: 'decrease' }}
            />
            <StatCard label="Accuracy" value={95} suffix="%" icon="check" />
          </div>
        </Section>

        <Section title="Integration Logos">
          <div className="flex flex-wrap gap-8">
            <IntegrationLogo type="telegram" size="lg" showLabel />
            <IntegrationLogo type="lark" size="lg" showLabel />
            <IntegrationLogo type="gemini" size="lg" showLabel />
            <IntegrationLogo type="openai" size="lg" showLabel />
            <IntegrationLogo type="postgresql" size="lg" showLabel />
          </div>
        </Section>

        <Section title="Color Palette">
          <div className="space-y-6">
            <SubSection title="Primary (AI Purple)">
              <div className="flex flex-wrap gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div
                    key={shade}
                    className={`w-16 h-16 rounded-lg flex items-end justify-center pb-1 text-xs font-medium ${
                      shade >= 500 ? 'text-white' : 'text-neutral-900'
                    }`}
                    style={{ backgroundColor: `var(--color-primary-${shade})` }}
                  >
                    {shade}
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Neutral">
              <div className="flex flex-wrap gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                  <div
                    key={shade}
                    className={`w-16 h-16 rounded-lg flex items-end justify-center pb-1 text-xs font-medium ${
                      shade >= 500 ? 'text-white' : 'text-neutral-900'
                    }`}
                    style={{ backgroundColor: `var(--color-neutral-${shade})` }}
                  >
                    {shade}
                  </div>
                ))}
              </div>
            </SubSection>
          </div>
        </Section>

        <Section title="Typography">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                Heading Font: Space Grotesk
              </p>
              <h1 className="text-5xl font-bold text-neutral-900 dark:text-white">
                Heading 1
              </h1>
              <h2 className="text-4xl font-bold text-neutral-900 dark:text-white">
                Heading 2
              </h2>
              <h3 className="text-3xl font-bold text-neutral-900 dark:text-white">
                Heading 3
              </h3>
              <h4 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                Heading 4
              </h4>
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                Body Font: DM Sans
              </p>
              <p className="text-lg text-neutral-700 dark:text-neutral-300">
                Large body text - The quick brown fox jumps over the lazy dog.
              </p>
              <p className="text-base text-neutral-700 dark:text-neutral-300">
                Regular body text - The quick brown fox jumps over the lazy dog.
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Small body text - The quick brown fox jumps over the lazy dog.
              </p>
            </div>
          </div>
        </Section>
      </Container>
    </main>
  );
}

import { Building2, Cpu, HeartPulse, Scale } from 'lucide-react';

export const STREAMS = [
  {
    name: 'Engineering',
    slug: 'engineering',
    description: 'Explore top private and government engineering colleges.',
    icon: Cpu,
  },
  {
    name: 'Polytechnic',
    slug: 'polytechnic',
    description: 'Browse diploma and polytechnic colleges with the same filters and details flow.',
    icon: Building2,
  },
  {
    name: 'Medical',
    slug: 'medical',
    description: 'Explore medical colleges with the same filters, details, maps, and nearby places flow.',
    icon: HeartPulse,
  },
  {
    name: 'Law',
    slug: 'law',
    description: 'Browse law colleges with the same filters, details, maps, and nearby places flow.',
    icon: Scale,
  },
];

export const getStreamBySlug = (slug = '') =>
  STREAMS.find((stream) => stream.slug === slug.trim().toLowerCase());

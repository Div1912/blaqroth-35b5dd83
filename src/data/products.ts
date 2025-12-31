import { Product, Category, Collection } from '@/types';

import woolCoatImg from '@/assets/products/wool-coat.jpg';
import woolCoatImg2 from '@/assets/products/wool-coat-2.jpg';
import woolCoatCharcoalImg from '@/assets/products/wool-coat-charcoal.jpg';
import blazerImg from '@/assets/products/blazer.jpg';
import blazerIvoryImg from '@/assets/products/blazer-ivory.jpg';
import silkShirtImg from '@/assets/products/silk-shirt.jpg';
import silkShirtCreamImg from '@/assets/products/silk-shirt-cream.jpg';
import trousersImg from '@/assets/products/trousers.jpg';
import turtleneckImg from '@/assets/products/turtleneck.jpg';
import turtleneckCamelImg from '@/assets/products/turtleneck-camel.jpg';
import leatherBeltImg from '@/assets/products/leather-belt.jpg';
import leatherBagImg from '@/assets/products/leather-bag.jpg';
import leatherBagCognacImg from '@/assets/products/leather-bag-cognac.jpg';
import jerseyTopImg from '@/assets/products/jersey-top.jpg';

import noirCollectionImg from '@/assets/collections/noir-collection.jpg';
import eclipseCollectionImg from '@/assets/collections/eclipse-collection.jpg';
import gildedCollectionImg from '@/assets/collections/gilded-collection.jpg';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Outerwear',
    slug: 'outerwear',
    image: woolCoatImg,
    description: 'Refined layers for the modern silhouette',
  },
  {
    id: '2',
    name: 'Tops',
    slug: 'tops',
    image: silkShirtImg,
    description: 'Essential foundations',
  },
  {
    id: '3',
    name: 'Bottoms',
    slug: 'bottoms',
    image: trousersImg,
    description: 'Tailored precision',
  },
  {
    id: '4',
    name: 'Accessories',
    slug: 'accessories',
    image: leatherBagImg,
    description: 'Finishing details',
  },
];

export const collections: Collection[] = [
  {
    id: '1',
    name: 'NOIR COLLECTION',
    slug: 'noir',
    description: 'A meditation on darkness. Pure black expressions that transcend seasons.',
    color: '#0a0a0a',
    image: noirCollectionImg,
    products: [],
  },
  {
    id: '2',
    name: 'ECLIPSE',
    slug: 'eclipse',
    description: 'Where shadow meets light. Tonal explorations in charcoal and ivory.',
    color: '#2a2a2a',
    image: eclipseCollectionImg,
    products: [],
  },
  {
    id: '3',
    name: 'GILDED',
    slug: 'gilded',
    description: 'Subtle metallic accents. Understated luxury for those who know.',
    color: '#c9a962',
    image: gildedCollectionImg,
    products: [],
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Oversized Wool Coat',
    price: 89900,
    description: 'A statement piece crafted from Italian wool. Relaxed silhouette with structured shoulders. Fully lined with signature hardware.',
    category: 'outerwear',
    collection: 'noir',
    images: [woolCoatImg, woolCoatImg2, woolCoatCharcoalImg],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Obsidian', hex: '#0a0a0a', image: woolCoatImg },
      { name: 'Charcoal', hex: '#2a2a2a', image: woolCoatCharcoalImg },
    ],
    inStock: true,
    featured: true,
    isNew: true,
  },
  {
    id: '2',
    name: 'Structured Blazer',
    price: 64900,
    description: 'Precision tailoring meets contemporary edge. Single-breasted construction with peak lapels and a slightly cropped length.',
    category: 'outerwear',
    collection: 'eclipse',
    images: [blazerImg, blazerIvoryImg],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Obsidian', hex: '#0a0a0a', image: blazerImg },
      { name: 'Ivory', hex: '#f5f5f0', image: blazerIvoryImg },
    ],
    inStock: true,
    featured: true,
  },
  {
    id: '3',
    name: 'Silk Blend Shirt',
    price: 29900,
    description: 'Fluid elegance in a refined silk-cotton blend. Relaxed fit with mother-of-pearl buttons.',
    category: 'tops',
    collection: 'noir',
    images: [silkShirtImg, silkShirtCreamImg],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Obsidian', hex: '#0a0a0a', image: silkShirtImg },
      { name: 'Cream', hex: '#f8f4e8', image: silkShirtCreamImg },
    ],
    inStock: true,
    featured: true,
  },
  {
    id: '4',
    name: 'Wide Leg Trousers',
    price: 34900,
    description: 'Flowing silhouette in premium wool crepe. High-rise with a clean front and side pockets.',
    category: 'bottoms',
    collection: 'eclipse',
    images: [trousersImg],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Charcoal', hex: '#2a2a2a', image: trousersImg },
      { name: 'Obsidian', hex: '#0a0a0a', image: trousersImg },
    ],
    inStock: true,
  },
  {
    id: '5',
    name: 'Cashmere Turtleneck',
    price: 39900,
    description: 'Pure Mongolian cashmere in a timeless silhouette. Slim fit with ribbed cuffs and hem.',
    category: 'tops',
    collection: 'noir',
    images: [turtleneckImg, turtleneckCamelImg],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Obsidian', hex: '#0a0a0a', image: turtleneckImg },
      { name: 'Camel', hex: '#c19a6b', image: turtleneckCamelImg },
    ],
    inStock: true,
    featured: true,
  },
  {
    id: '6',
    name: 'Leather Belt',
    price: 14900,
    description: 'Full-grain Italian leather with custom matte hardware. 3cm width.',
    category: 'accessories',
    collection: 'gilded',
    images: [leatherBeltImg],
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Obsidian', hex: '#0a0a0a', image: leatherBeltImg },
    ],
    inStock: true,
  },
  {
    id: '7',
    name: 'Minimal Leather Bag',
    price: 59900,
    description: 'Architectural form in supple calfskin. Unlined interior with magnetic closure.',
    category: 'accessories',
    collection: 'gilded',
    images: [leatherBagImg, leatherBagCognacImg],
    sizes: ['One Size'],
    colors: [
      { name: 'Obsidian', hex: '#0a0a0a', image: leatherBagImg },
      { name: 'Cognac', hex: '#8b4513', image: leatherBagCognacImg },
    ],
    inStock: true,
    featured: true,
    isNew: true,
  },
  {
    id: '8',
    name: 'Draped Jersey Top',
    price: 19900,
    description: 'Asymmetric draping in heavyweight jersey. Oversized fit with raw edges.',
    category: 'tops',
    collection: 'noir',
    images: [jerseyTopImg],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Obsidian', hex: '#0a0a0a', image: jerseyTopImg },
      { name: 'Slate', hex: '#4a4a4a', image: jerseyTopImg },
    ],
    inStock: true,
  },
];

export const featuredProducts = products.filter((p) => p.featured);
export const newProducts = products.filter((p) => p.isNew);

import { apiClient } from './client';

export interface ProductPrice {
  currency: string;
  amount_minor: number;
  formatted: string;
}

export interface ProductVariant {
  id: number | string;
  sku: string;
  attributes: Record<string, string>;
  is_default: boolean;
  in_stock: boolean;
  price?: ProductPrice;
  stock_count?: number;
}

export interface Product {
  id: number | string;
  sku: string;
  slug: string;
  status: 'active' | 'draft' | 'archived';
  is_featured: boolean;
  name: string;
  description: string;
  category_id?: number | null;
  brand_id?: number | null;
  price?: ProductPrice | null;
  discount_badge?: string | null;
  variants: ProductVariant[];
  created_at?: string;
}

export interface InventoryItem {
  product_id: number | string;
  product_name: string;
  variant_id: number | string;
  variant_sku: string;
  attributes: Record<string, string>;
  stock_count: number;
  low_stock_threshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface OrderItem {
  id: number | string;
  product_name: string;
  variant_sku: string;
  quantity: number;
  price: ProductPrice;
}

export interface Order {
  id: string;
  order_number: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  amount_minor: number;
  currency: string;
  formatted_amount: string;
  items: OrderItem[];
  created_at: string;
  tracking_number?: string;
}

export interface AnalyticsOverview {
  total_revenue: ProductPrice;
  active_orders_count: number;
  total_products_count: number;
  low_stock_count: number;
  revenue_trend: { date: string; amount: number }[];
  order_status_distribution: { status: string; count: number }[];
  top_products: { id: string | number; name: string; sales_count: number; revenue_formatted: string }[];
}

export interface BrandingSettings {
  store_name: string;
  logo_url?: string;
  primary_color: string;
  theme_template_id: string;
  theme_templates_available: { id: string; name: string; description: string; niche: string }[];
}

// ==========================================
// IN-MEMORY MOCK STORE FOR PERSISTENCE
// ==========================================

let mockProducts: Product[] = [
  {
    id: 1,
    sku: 'GOLD-RING-01',
    slug: '18k-gold-eternity-ring',
    status: 'active',
    is_featured: true,
    name: '18k Gold Eternity Ring',
    description: 'A timeless eternity ring crafted in premium 18k solid yellow gold, micro-pave set with brilliant conflict-free diamonds.',
    category_id: 1,
    brand_id: 1,
    price: { currency: 'USD', amount_minor: 125000, formatted: '1,250.00 USD' },
    discount_badge: '-10%',
    variants: [
      {
        id: 101,
        sku: 'GOLD-RING-01-SZ6',
        attributes: { size: '6' },
        is_default: true,
        in_stock: true,
        price: { currency: 'USD', amount_minor: 125000, formatted: '1,250.00 USD' },
        stock_count: 15,
      },
      {
        id: 102,
        sku: 'GOLD-RING-01-SZ7',
        attributes: { size: '7' },
        is_default: false,
        in_stock: true,
        price: { currency: 'USD', amount_minor: 125000, formatted: '1,250.00 USD' },
        stock_count: 8,
      },
      {
        id: 103,
        sku: 'GOLD-RING-01-SZ8',
        attributes: { size: '8' },
        is_default: false,
        in_stock: false,
        price: { currency: 'USD', amount_minor: 125000, formatted: '1,250.00 USD' },
        stock_count: 0,
      },
    ],
    created_at: '2026-08-01',
  },
  {
    id: 2,
    sku: 'SILV-NECK-02',
    slug: 'sterling-silver-pendant',
    status: 'active',
    is_featured: false,
    name: 'Sterling Silver Moon Pendant',
    description: 'Fine 925 sterling silver chain featuring a handcrafted celestial moon crescent pendant. Tarnish resistant.',
    category_id: 2,
    brand_id: 1,
    price: { currency: 'USD', amount_minor: 15000, formatted: '150.00 USD' },
    discount_badge: null,
    variants: [
      {
        id: 201,
        sku: 'SILV-NECK-02-OS',
        attributes: { length: '18 inches' },
        is_default: true,
        in_stock: true,
        price: { currency: 'USD', amount_minor: 15000, formatted: '150.00 USD' },
        stock_count: 3,
      },
    ],
    created_at: '2026-08-05',
  },
  {
    id: 3,
    sku: 'PLAT-STUD-03',
    slug: 'platinum-diamond-studs',
    status: 'draft',
    is_featured: false,
    name: 'Platinum Diamond Studs',
    description: 'Minimalist classic diamond stud earrings set in pure platinum 950 settings. Ideal for everyday luxury.',
    category_id: 3,
    brand_id: 2,
    price: { currency: 'USD', amount_minor: 220000, formatted: '2,200.00 USD' },
    discount_badge: null,
    variants: [
      {
        id: 301,
        sku: 'PLAT-STUD-03-05CT',
        attributes: { weight: '0.5 carat' },
        is_default: true,
        in_stock: true,
        price: { currency: 'USD', amount_minor: 220000, formatted: '2,200.00 USD' },
        stock_count: 5,
      },
    ],
    created_at: '2026-08-10',
  },
];

let mockOrders: Order[] = [
  {
    id: 'o-001',
    order_number: 'TS-2026-0001',
    customer: {
      name: 'Amina Diop',
      email: 'amina.diop@email.test',
      phone: '+221 77 123 4567',
    },
    status: 'processing',
    amount_minor: 140000,
    currency: 'USD',
    formatted_amount: '1,400.00 USD',
    items: [
      {
        id: 'oi-001',
        product_name: '18k Gold Eternity Ring',
        variant_sku: 'GOLD-RING-01-SZ6',
        quantity: 1,
        price: { currency: 'USD', amount_minor: 125000, formatted: '1,250.00 USD' },
      },
      {
        id: 'oi-002',
        product_name: 'Sterling Silver Moon Pendant',
        variant_sku: 'SILV-NECK-02-OS',
        quantity: 1,
        price: { currency: 'USD', amount_minor: 15000, formatted: '150.00 USD' },
      },
    ],
    created_at: '2026-08-19 14:32:00',
  },
  {
    id: 'o-002',
    order_number: 'TS-2026-0002',
    customer: {
      name: 'Sarih Al-Mutairi',
      email: 'sarih.mutairi@gulf.test',
    },
    status: 'shipped',
    amount_minor: 320000,
    currency: 'USD',
    formatted_amount: '3,200.00 USD',
    items: [
      {
        id: 'oi-003',
        product_name: '18k Gold Eternity Ring',
        variant_sku: 'GOLD-RING-01-SZ7',
        quantity: 2,
        price: { currency: 'USD', amount_minor: 125000, formatted: '1,250.00 USD' },
      },
    ],
    created_at: '2026-08-18 09:15:00',
    tracking_number: 'TRK-9821873-US',
  },
  {
    id: 'o-003',
    order_number: 'TS-2026-0003',
    customer: {
      name: 'John Doe',
      email: 'john.doe@email.test',
      phone: '+1 555 987 6543',
    },
    status: 'pending',
    amount_minor: 8900,
    currency: 'USD',
    formatted_amount: '89.00 USD',
    items: [
      {
        id: 'oi-004',
        product_name: 'Sterling Silver Moon Pendant',
        variant_sku: 'SILV-NECK-02-OS',
        quantity: 1,
        price: { currency: 'USD', amount_minor: 8900, formatted: '89.00 USD' },
      },
    ],
    created_at: '2026-08-19 22:45:00',
  },
];

let mockBranding: BrandingSettings = {
  store_name: 'Acme Jewelers',
  logo_url: '',
  primary_color: '#4f46e5',
  theme_template_id: 'aurumeclat',
  theme_templates_available: [
    { id: 'aurumeclat', name: 'Aurum Eclat', description: 'Luxury jewelry, watches and fine accessories template.', niche: 'Luxury Goods' },
    { id: 'homeluxe', name: 'Home Luxe', description: 'Upscale home interior, furniture and decor template.', niche: 'Home Decor' },
    { id: 'freshcart', name: 'Fresh Cart', description: 'Clean layout tailored for groceries and organic food.', niche: 'Groceries' },
    { id: 'futurex', name: 'Future X', description: 'Dark high-tech layout for modern gadgets and consumer tech.', niche: 'Electronics' },
  ],
};

let isBackendOffline = false;

// ==========================================
// SELLER SERVICE ACTIONS IMPLEMENTATION
// ==========================================

export const sellerService = {
  // --- Analytics Overview ---
  async getAnalytics(): Promise<AnalyticsOverview> {
    // Delay simulate
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // Derived values
    const lowStockCount = mockProducts.reduce((acc, p) => {
      const lowVariants = p.variants.filter((v) => (v.stock_count ?? 0) > 0 && (v.stock_count ?? 0) <= 3);
      return acc + lowVariants.length;
    }, 0);

    const activeOrders = mockOrders.filter(o => o.status === 'pending' || o.status === 'processing');

    return {
      total_revenue: { currency: 'USD', amount_minor: 845000, formatted: '8,450.00 USD' },
      active_orders_count: activeOrders.length,
      total_products_count: mockProducts.length,
      low_stock_count: lowStockCount,
      revenue_trend: [
        { date: 'Aug 14', amount: 1200 },
        { date: 'Aug 15', amount: 1500 },
        { date: 'Aug 16', amount: 800 },
        { date: 'Aug 17', amount: 2200 },
        { date: 'Aug 18', amount: 1400 },
        { date: 'Aug 19', amount: 1350 },
      ],
      order_status_distribution: [
        { status: 'pending', count: mockOrders.filter(o => o.status === 'pending').length },
        { status: 'processing', count: mockOrders.filter(o => o.status === 'processing').length },
        { status: 'shipped', count: mockOrders.filter(o => o.status === 'shipped').length },
        { status: 'delivered', count: mockOrders.filter(o => o.status === 'delivered').length },
      ],
      top_products: [
        { id: 1, name: '18k Gold Eternity Ring', sales_count: 12, revenue_formatted: '$15,000.00' },
        { id: 2, name: 'Sterling Silver Moon Pendant', sales_count: 5, revenue_formatted: '$750.00' },
      ],
    };
  },

  // --- Product Management ---
  // READ: calls actual backend products index endpoint where suitable
  async getProductsList(params?: { category_id?: number; search?: string }): Promise<{ products: Product[]; total: number }> {
    // If backend is already known to be offline, directly fallback to local store without requesting
    if (isBackendOffline) {
      let filtered = [...mockProducts];
      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search));
      }
      if (params?.category_id) {
        filtered = filtered.filter(p => p.category_id === params.category_id);
      }
      return { products: filtered, total: filtered.length };
    }

    try {
      // Attempt backend API call. If it fails, fall back to local mock data.
      const response = await apiClient.get('/products', {
        params: {
          'filter.category_id': params?.category_id,
          search: params?.search,
        },
      });
      
      interface ApiVariant {
        id: number | string;
        sku: string;
        attributes?: Record<string, string>;
        is_default?: boolean;
        in_stock?: boolean;
        price?: ProductPrice;
      }

      interface ApiProductItem {
        id: number | string;
        sku?: string;
        slug?: string;
        status?: 'active' | 'draft' | 'archived';
        is_featured?: boolean;
        name?: string;
        description?: string;
        category_id?: number | null;
        brand_id?: number | null;
        price?: ProductPrice | null;
        discount_badge?: string | null;
        variants?: ApiVariant[];
      }

      // Parse presented data from backend presenter format to UI model
      const backendData = (response.data?.data || []) as ApiProductItem[];
      const products: Product[] = backendData.map((item) => ({
        id: item.id,
        sku: item.sku || `SKU-${item.id}`,
        slug: item.slug || '',
        status: item.status || 'active',
        is_featured: !!item.is_featured,
        name: item.name || '',
        description: item.description || '',
        category_id: item.category_id,
        brand_id: item.brand_id,
        price: item.price,
        discount_badge: item.discount_badge,
        variants: (item.variants || []).map((v) => ({
          id: v.id,
          sku: v.sku,
          attributes: v.attributes || {},
          is_default: !!v.is_default,
          in_stock: !!v.in_stock,
          price: v.price,
          stock_count: v.in_stock ? 10 : 0, // Fallback stock count
        })),
      }));

      // Merge backend products with any locally created products that aren't on backend yet
      const combined = [...mockProducts.filter(mp => !products.some(p => p.id === mp.id)), ...products];
      
      return {
        products: combined,
        total: combined.length,
      };
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      
      if (isNetworkError) {
        if (!isBackendOffline) {
          isBackendOffline = true;
          console.warn('Backend API server is offline/unreachable. Dashboard is falling back to local state store for this session.');
        }
      } else {
        // Genuine server status error
        console.error('Backend products API call failed with server error:', e);
      }

      let filtered = [...mockProducts];
      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search));
      }
      if (params?.category_id) {
        filtered = filtered.filter(p => p.category_id === params.category_id);
      }
      return { products: filtered, total: filtered.length };
    }
  },

  // WRITE mock implementations
  async createProduct(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newProduct: Product = {
      ...productData,
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    mockProducts = [newProduct, ...mockProducts];
    return newProduct;
  },

  async updateProduct(id: number | string, productData: Partial<Product>): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let updatedProduct: Product | null = null;
    mockProducts = mockProducts.map((p) => {
      if (p.id === id) {
        updatedProduct = { ...p, ...productData };
        return updatedProduct;
      }
      return p;
    });
    if (!updatedProduct) {
      throw new Error(`Product not found with id ${id}`);
    }
    return updatedProduct;
  },

  async deleteProduct(id: number | string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const initialLength = mockProducts.length;
    mockProducts = mockProducts.filter((p) => p.id !== id);
    return mockProducts.length < initialLength;
  },

  // --- Inventory Management ---
  async getInventoryList(): Promise<InventoryItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const list: InventoryItem[] = [];
    
    mockProducts.forEach((p) => {
      p.variants.forEach((v) => {
        const stock = v.stock_count ?? 0;
        let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
        if (stock === 0) status = 'out_of_stock';
        else if (stock <= 3) status = 'low_stock';

        list.push({
          product_id: p.id,
          product_name: p.name,
          variant_id: v.id,
          variant_sku: v.sku,
          attributes: v.attributes,
          stock_count: stock,
          low_stock_threshold: 3,
          status,
        });
      });
    });

    return list;
  },

  async updateStock(variantId: number | string, newCount: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    let updated = false;
    mockProducts = mockProducts.map((p) => {
      const updatedVariants = p.variants.map((v) => {
        if (v.id === variantId) {
          updated = true;
          return {
            ...v,
            stock_count: newCount,
            in_stock: newCount > 0,
          };
        }
        return v;
      });
      return { ...p, variants: updatedVariants };
    });

    return updated;
  },

  // --- Order Management ---
  async getOrdersList(statusFilter?: string): Promise<Order[]> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (statusFilter && statusFilter !== 'all') {
      return mockOrders.filter(o => o.status === statusFilter);
    }
    return mockOrders;
  },

  async updateOrderStatus(orderId: string, status: Order['status'], trackingNumber?: string): Promise<Order> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    let updatedOrder: Order | null = null;
    mockOrders = mockOrders.map((o) => {
      if (o.id === orderId) {
        updatedOrder = {
          ...o,
          status,
          tracking_number: trackingNumber || o.tracking_number,
        };
        return updatedOrder;
      }
      return o;
    });

    if (!updatedOrder) {
      throw new Error(`Order not found with ID ${orderId}`);
    }

    return updatedOrder;
  },

  // --- Branding Settings ---
  async getBrandingSettings(): Promise<BrandingSettings> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { ...mockBranding };
  },

  async saveBrandingSettings(settings: Partial<BrandingSettings>): Promise<BrandingSettings> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    mockBranding = {
      ...mockBranding,
      ...settings,
    };
    return { ...mockBranding };
  },
};

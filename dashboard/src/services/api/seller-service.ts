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

export interface ApiVariant {
  id: number | string;
  sku: string;
  attributes?: Record<string, string>;
  is_default?: boolean;
  in_stock?: boolean;
  price?: ProductPrice;
}

export interface ApiProductItem {
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

export interface ApiOrderItem {
  id: number | string;
  product_name: string;
  variant_sku: string;
  quantity: number;
  price: { currency: string; amount_minor: number; formatted?: string };
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

const mockRevenueTrend = [
  { date: 'Aug 14', amount: 1200 },
  { date: 'Aug 15', amount: 1500 },
  { date: 'Aug 16', amount: 800 },
  { date: 'Aug 17', amount: 2200 },
  { date: 'Aug 18', amount: 1400 },
  { date: 'Aug 19', amount: 1350 },
];

const mockOrderStatusDistribution = [
  { status: 'pending', count: 3 },
  { status: 'processing', count: 5 },
  { status: 'shipped', count: 2 },
  { status: 'delivered', count: 12 },
];

const mockTopProducts = [
  { id: 1, name: '18k Gold Eternity Ring', sales_count: 12, revenue_formatted: '$15,000.00' },
  { id: 2, name: 'Sterling Silver Moon Pendant', sales_count: 5, revenue_formatted: '$750.00' },
];

export const sellerService = {
  // --- Analytics Overview ---
  async getAnalytics(): Promise<AnalyticsOverview> {
    if (isBackendOffline) {
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
        revenue_trend: mockRevenueTrend,
        order_status_distribution: mockOrderStatusDistribution,
        top_products: mockTopProducts,
      };
    }

    try {
      const response = await apiClient.get('/seller/analytics/summary');
      const data = response.data;

      const revenueRow = data.revenue_by_currency?.[0] || { currency: 'USD', amount_minor: 0 };
      const totalRevenue: ProductPrice = {
        currency: revenueRow.currency,
        amount_minor: revenueRow.amount_minor,
        formatted: `${(revenueRow.amount_minor / 100).toFixed(2)} ${revenueRow.currency}`,
      };

      const { products } = await this.getProductsList();
      const lowStockCount = products.reduce((acc, p) => {
        const lowVariants = p.variants.filter((v) => (v.stock_count ?? 0) > 0 && (v.stock_count ?? 0) <= 3);
        return acc + lowVariants.length;
      }, 0);

      const topProducts = ((data.top_products || []) as { product_variant_id?: string | number; product_name?: string; quantity_sold?: number; revenue_minor?: number }[]).map((tp, index) => ({
        id: tp.product_variant_id || index,
        name: tp.product_name || 'Product Variant',
        sales_count: tp.quantity_sold || 0,
        revenue_formatted: `${(tp.revenue_minor || 0 / 100).toFixed(2)} ${revenueRow.currency}`,
      }));

      return {
        total_revenue: totalRevenue,
        active_orders_count: data.orders_count || 0,
        total_products_count: products.length,
        low_stock_count: lowStockCount,
        revenue_trend: mockRevenueTrend,
        order_status_distribution: mockOrderStatusDistribution,
        top_products: topProducts.length > 0 ? topProducts : mockTopProducts,
      };
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        isBackendOffline = true;
        console.warn('Backend is offline. Falling back to local mock analytics.');
      } else {
        console.error('Failed to fetch seller analytics summary:', e);
      }

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
        revenue_trend: mockRevenueTrend,
        order_status_distribution: mockOrderStatusDistribution,
        top_products: mockTopProducts,
      };
    }
  },

  // --- Product Management ---
  async getProductsList(params?: { category_id?: number; search?: string }): Promise<{ products: Product[]; total: number }> {
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
      const response = await apiClient.get('/products', {
        params: {
          'filter.category_id': params?.category_id,
          search: params?.search,
        },
      });

      // Using global ApiVariant and ApiProductItem interfaces

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
          stock_count: v.in_stock ? 10 : 0,
        })),
      }));

      const combined = [...mockProducts.filter(mp => !products.some(p => String(p.id) === String(mp.id))), ...products];
      return { products: combined, total: combined.length };
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        if (!isBackendOffline) {
          isBackendOffline = true;
          console.warn('Backend is offline. Falling back to local mock products list.');
        }
      } else {
        console.error('Failed to retrieve products list:', e);
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

  async createProduct(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const payload = {
      sku: productData.sku,
      slug: productData.slug,
      status: productData.status,
      is_featured: productData.is_featured,
      category_id: productData.category_id || null,
      brand_id: productData.brand_id || null,
      translations: [
        {
          locale: 'en',
          name: productData.name,
          description: productData.description,
        }
      ],
      variants: productData.variants.map((v) => ({
        sku: v.sku,
        attributes: v.attributes || {},
        is_default: v.is_default,
        prices: [
          {
            currency: v.price?.currency || 'USD',
            amount_minor: v.price?.amount_minor || 0,
          }
        ],
        inventory: {
          quantity_available: v.stock_count ?? 0,
        }
      })),
    };

    if (isBackendOffline) {
      const newProduct: Product = {
        ...productData,
        id: `p-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString().split('T')[0],
      };
      mockProducts = [newProduct, ...mockProducts];
      return newProduct;
    }

    try {
      const response = await apiClient.post('/products', payload);
      const item = response.data as ApiProductItem;
      return {
        id: item.id,
        sku: item.sku || '',
        slug: item.slug || '',
        status: item.status || 'active',
        is_featured: !!item.is_featured,
        name: item.name || '',
        description: item.description || '',
        category_id: item.category_id,
        brand_id: item.brand_id,
        price: item.price,
        discount_badge: item.discount_badge,
        variants: ((item.variants || []) as ApiVariant[]).map((v) => ({
          id: v.id,
          sku: v.sku,
          attributes: v.attributes || {},
          is_default: !!v.is_default,
          in_stock: !!v.in_stock,
          price: v.price,
          stock_count: v.in_stock ? 10 : 0,
        })),
      };
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        isBackendOffline = true;
        console.warn('Backend is offline. Falling back to local mock product creation.');
        const newProduct: Product = {
          ...productData,
          id: `p-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString().split('T')[0],
        };
        mockProducts = [newProduct, ...mockProducts];
        return newProduct;
      }
      throw e;
    }
  },

  async updateProduct(id: number | string, productData: Partial<Product>): Promise<Product> {
    const payload: Record<string, unknown> = {};
    if (productData.sku) payload.sku = productData.sku;
    if (productData.slug) payload.slug = productData.slug;
    if (productData.status) payload.status = productData.status;
    if (productData.is_featured !== undefined) payload.is_featured = productData.is_featured;
    if (productData.category_id !== undefined) payload.category_id = productData.category_id;
    if (productData.brand_id !== undefined) payload.brand_id = productData.brand_id;
    if (productData.name || productData.description) {
      payload.translations = [
        {
          locale: 'en',
          name: productData.name || '',
          description: productData.description || '',
        }
      ];
    }

    if (isBackendOffline) {
      let updatedProduct: Product | null = null;
      mockProducts = mockProducts.map((p) => {
        if (String(p.id) === String(id)) {
          updatedProduct = { ...p, ...productData };
          return updatedProduct;
        }
        return p;
      });
      if (!updatedProduct) throw new Error(`Product not found with id ${id}`);
      return updatedProduct;
    }

    try {
      const response = await apiClient.put(`/products/${id}`, payload);
      const item = response.data as ApiProductItem;
      return {
        id: item.id,
        sku: item.sku || '',
        slug: item.slug || '',
        status: item.status || 'active',
        is_featured: !!item.is_featured,
        name: item.name || '',
        description: item.description || '',
        category_id: item.category_id,
        brand_id: item.brand_id,
        price: item.price,
        discount_badge: item.discount_badge,
        variants: ((item.variants || []) as ApiVariant[]).map((v) => ({
          id: v.id,
          sku: v.sku,
          attributes: v.attributes || {},
          is_default: !!v.is_default,
          in_stock: !!v.in_stock,
          price: v.price,
          stock_count: v.in_stock ? 10 : 0,
        })),
      };
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        isBackendOffline = true;
        console.warn('Backend is offline. Falling back to local mock product update.');
        let updatedProduct: Product | null = null;
        mockProducts = mockProducts.map((p) => {
          if (String(p.id) === String(id)) {
            updatedProduct = { ...p, ...productData };
            return updatedProduct;
          }
          return p;
        });
        if (!updatedProduct) throw new Error(`Product not found with id ${id}`);
        return updatedProduct;
      }
      throw e;
    }
  },

  async deleteProduct(id: number | string): Promise<boolean> {
    if (isBackendOffline) {
      const initialLength = mockProducts.length;
      mockProducts = mockProducts.filter((p) => String(p.id) !== String(id));
      return mockProducts.length < initialLength;
    }

    try {
      await apiClient.delete(`/products/${id}`);
      mockProducts = mockProducts.filter((p) => String(p.id) !== String(id));
      return true;
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        isBackendOffline = true;
        console.warn('Backend is offline. Falling back to local mock product deletion.');
        const initialLength = mockProducts.length;
        mockProducts = mockProducts.filter((p) => String(p.id) !== String(id));
        return mockProducts.length < initialLength;
      }
      throw e;
    }
  },

  // --- Inventory Management ---
  async getInventoryList(): Promise<InventoryItem[]> {
    const { products } = await this.getProductsList();
    const list: InventoryItem[] = [];
    
    products.forEach((p) => {
      p.variants.forEach((v) => {
        const stock = v.stock_count ?? (v.in_stock ? 10 : 0);
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
    if (isBackendOffline) {
      let updated = false;
      mockProducts = mockProducts.map((p) => {
        const updatedVariants = p.variants.map((v) => {
          if (String(v.id) === String(variantId)) {
            updated = true;
            return { ...v, stock_count: newCount, in_stock: newCount > 0 };
          }
          return v;
        });
        return { ...p, variants: updatedVariants };
      });
      return updated;
    }

    try {
      await apiClient.patch(`/inventory/${variantId}`, {
        quantity_available: newCount,
      });
      return true;
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        isBackendOffline = true;
        console.warn('Backend is offline. Falling back to local mock inventory adjustment.');
        let updated = false;
        mockProducts = mockProducts.map((p) => {
          const updatedVariants = p.variants.map((v) => {
            if (String(v.id) === String(variantId)) {
              updated = true;
              return { ...v, stock_count: newCount, in_stock: newCount > 0 };
            }
            return v;
          });
          return { ...p, variants: updatedVariants };
        });
        return updated;
      }
      throw e;
    }
  },

  // --- Order Management ---
  async getOrdersList(statusFilter?: string): Promise<Order[]> {
    if (isBackendOffline) {
      if (statusFilter && statusFilter !== 'all') {
        return mockOrders.filter(o => o.status === statusFilter);
      }
      return mockOrders;
    }

    try {
      const response = await apiClient.get('/seller/orders', {
        params: {
          status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
        },
      });

      interface ApiOrderItem {
        id: number | string;
        product_name: string;
        variant_sku: string;
        quantity: number;
        price: { currency: string; amount_minor: number; formatted?: string };
      }

      interface ApiOrder {
        id: string | number;
        order_number: string;
        customer: { name: string; email: string; phone?: string };
        status: 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';
        total_minor: number;
        currency: string;
        items?: ApiOrderItem[];
        placed_at: string;
      }

      const backendOrders = (response.data?.data || []) as ApiOrder[];
      return backendOrders.map((o) => {
        const statusMap: Record<string, Order['status']> = {
          pending: 'pending',
          paid: 'processing',
          fulfilled: 'delivered',
          cancelled: 'cancelled',
          refunded: 'cancelled',
        };

        const totalMinor = o.total_minor;
        const formattedAmount = (totalMinor / 100).toFixed(2) + ' ' + o.currency;

        return {
          id: String(o.id),
          order_number: o.order_number,
          customer: {
            name: o.customer?.name || 'Shopper Client',
            email: o.customer?.email || '',
            phone: o.customer?.phone || '',
          },
          status: statusMap[o.status] || 'pending',
          amount_minor: totalMinor,
          currency: o.currency,
          formatted_amount: formattedAmount,
          items: (o.items || []).map((item) => ({
            id: item.id,
            product_name: item.product_name,
            variant_sku: item.variant_sku,
            quantity: item.quantity,
            price: {
              currency: item.price?.currency || o.currency,
              amount_minor: item.price?.amount_minor || 0,
              formatted: item.price?.formatted || `${((item.price?.amount_minor || 0) / 100).toFixed(2)} ${item.price?.currency || o.currency}`,
            },
          })),
          created_at: o.placed_at,
        };
      });
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        isBackendOffline = true;
        console.warn('Backend is offline. Falling back to local mock orders list.');
      } else {
        console.error('Failed to retrieve seller orders:', e);
      }
      
      if (statusFilter && statusFilter !== 'all') {
        return mockOrders.filter(o => o.status === statusFilter);
      }
      return mockOrders;
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status'], trackingNumber?: string): Promise<Order> {
    if (isBackendOffline) {
      let updatedOrder: Order | null = null;
      mockOrders = mockOrders.map((o) => {
        if (o.id === orderId) {
          updatedOrder = { ...o, status, tracking_number: trackingNumber || o.tracking_number };
          return updatedOrder;
        }
        return o;
      });
      if (!updatedOrder) throw new Error(`Order not found with ID ${orderId}`);
      return updatedOrder;
    }

    try {
      const statusMap: Record<Order['status'], string> = {
        pending: 'pending',
        processing: 'paid',
        shipped: 'fulfilled',
        delivered: 'fulfilled',
        cancelled: 'cancelled',
      };

      const backendStatus = statusMap[status] || 'pending';

      const response = await apiClient.patch(`/seller/orders/${orderId}/status`, {
        status: backendStatus,
        note: trackingNumber ? `Tracking Ref: ${trackingNumber}` : undefined,
      });

      const o = response.data;
      const responseStatusMap: Record<string, Order['status']> = {
        pending: 'pending',
        paid: 'processing',
        fulfilled: 'delivered',
        cancelled: 'cancelled',
        refunded: 'cancelled',
      };

      return {
        id: String(o.id),
        order_number: o.order_number,
        customer: {
          name: o.customer?.name || 'Shopper Client',
          email: o.customer?.email || '',
          phone: o.customer?.phone || '',
        },
        status: responseStatusMap[o.status] || 'pending',
        amount_minor: o.total_minor,
        currency: o.currency,
        formatted_amount: `${(o.total_minor / 100).toFixed(2)} ${o.currency}`,
        items: ((o.items || []) as ApiOrderItem[]).map((item) => ({
          id: item.id,
          product_name: item.product_name,
          variant_sku: item.variant_sku,
          quantity: item.quantity,
          price: {
            currency: item.price?.currency || o.currency,
            amount_minor: item.price?.amount_minor || 0,
            formatted: item.price?.formatted || `${((item.price?.amount_minor || 0) / 100).toFixed(2)} ${item.price?.currency || o.currency}`,
          },
        })),
        created_at: o.placed_at,
        tracking_number: trackingNumber,
      };
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        isBackendOffline = true;
        console.warn('Backend is offline. Falling back to local mock order status update.');
        let updatedOrder: Order | null = null;
        mockOrders = mockOrders.map((o) => {
          if (o.id === orderId) {
            updatedOrder = { ...o, status, tracking_number: trackingNumber || o.tracking_number };
            return updatedOrder;
          }
          return o;
        });
        if (!updatedOrder) throw new Error(`Order not found with ID ${orderId}`);
        return updatedOrder;
      }
      throw e;
    }
  },

  // --- Branding Settings ---
  async getBrandingSettings(): Promise<BrandingSettings> {
    if (isBackendOffline) {
      return { ...mockBranding };
    }

    try {
      const response = await apiClient.get('/settings');
      const data = response.data;
      return {
        store_name: data.name || '',
        logo_url: data.branding?.logo_url || '',
        primary_color: data.branding?.primary_color || '#4f46e5',
        theme_template_id: data.branding?.theme || 'aurumeclat',
        theme_templates_available: mockBranding.theme_templates_available,
      };
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        isBackendOffline = true;
        console.warn('Backend is offline. Falling back to local mock branding settings.');
      } else {
        console.error('Failed to retrieve branding settings:', e);
      }
      return { ...mockBranding };
    }
  },

  async saveBrandingSettings(settings: Partial<BrandingSettings>): Promise<BrandingSettings> {
    if (isBackendOffline) {
      mockBranding = { ...mockBranding, ...settings };
      return { ...mockBranding };
    }

    try {
      const payload = {
        branding: {
          logo_url: settings.logo_url || undefined,
          theme: settings.theme_template_id || undefined,
          primary_color: settings.primary_color || undefined,
        }
      };

      const response = await apiClient.patch('/settings', payload);
      const data = response.data;
      return {
        store_name: data.name || '',
        logo_url: data.branding?.logo_url || '',
        primary_color: data.branding?.primary_color || '#4f46e5',
        theme_template_id: data.branding?.theme || 'aurumeclat',
        theme_templates_available: mockBranding.theme_templates_available,
      };
    } catch (e) {
      const err = e as { response?: unknown; request?: unknown };
      const isNetworkError = !err.response && err.request;
      if (isNetworkError) {
        isBackendOffline = true;
        console.warn('Backend is offline. Saving updates to local mock branding settings.');
        mockBranding = { ...mockBranding, ...settings };
        return { ...mockBranding };
      }
      throw e;
    }
  },
};

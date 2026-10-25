import React, { useState, useEffect, useMemo } from 'react';
import {
  Coffee,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  RotateCcw,
  Download,
  Plus,
  CheckCircle2,
  ClipboardList,
  Flame,
  Minus,
  AlertOctagon,
  Scale,
  Sparkles,
  X
} from 'lucide-react';

export interface Ingredient {
  id: string;
  name: string;
  category: 'Coffee Beans' | 'Dairy & Plant Milk' | 'Syrups & Flavor' | 'Packaging' | 'Bakery & Food';
  packCost: number; // e.g. AED 115
  packSize: number; // e.g. 1000
  unit: 'g' | 'ml' | 'unit';
  unitCost: number; // calculated packCost / packSize
  openingStock: number;
  receivedStock: number;
  posDepleted: number;
  wasteDepleted: number;
  onHandStock: number; // openingStock + receivedStock - posDepleted - wasteDepleted
  parLevel: number;
  physicalCount: number; // Verified physical count
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
}

export interface Modifier {
  id: string;
  name: string;
  priceDelta: number;
  ingredientDeltas: {
    ingredientId: string;
    quantity: number; // positive to add, negative to substitute out
  }[];
}

export interface Product {
  id: string;
  name: string;
  category: 'Espresso Bar' | 'Specialty Milk' | 'Cold Beverages' | 'Bakery & Food';
  sellingPrice: number;
  recipe: RecipeIngredient[];
  applicableModifierIds?: string[];
  description?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  basePrice: number;
  appliedModifierIds: string[];
  totalItemPrice: number;
  totalItemCogs: number;
}

export interface SaleTransaction {
  id: string;
  timestamp: string;
  items: {
    productName: string;
    modifiers: string[];
    price: number;
    cogs: number;
  }[];
  totalRevenue: number;
  totalCogs: number;
  grossMargin: number;
}

export interface WasteEntry {
  id: string;
  timestamp: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  reason: 'Morning Grinder Dial-in Calibration' | 'Steam Pitcher Purge Residue' | 'Bake-off Spoilage / Over-browning' | 'Packaging Damage';
  cost: number;
  loggedBy: string;
}

const STORAGE_KEY = 'mm_cafe_inventory_data_v3';
const CURRENCY = 'AED';

const AVAILABLE_MODIFIERS: Modifier[] = [
  {
    id: 'mod-extra-shot',
    name: 'Extra Espresso Shot (+9g)',
    priceDelta: 5.0,
    ingredientDeltas: [{ ingredientId: 'ing-1', quantity: 9 }],
  },
  {
    id: 'mod-oat-swap',
    name: 'Oat Milk Sub (swap whole milk)',
    priceDelta: 4.0,
    ingredientDeltas: [
      { ingredientId: 'ing-3', quantity: -160 },
      { ingredientId: 'ing-4', quantity: 160 },
    ],
  },
  {
    id: 'mod-vanilla-pump',
    name: 'Vanilla Syrup Pump (+15ml)',
    priceDelta: 3.0,
    ingredientDeltas: [{ ingredientId: 'ing-6', quantity: 15 }],
  },
  {
    id: 'mod-condensed-pump',
    name: 'Condensed Milk Sweetener (+20g)',
    priceDelta: 3.0,
    ingredientDeltas: [{ ingredientId: 'ing-5', quantity: 20 }],
  },
];

const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-1',
    name: 'Specialty Espresso Beans (Ethiopia/Brazil Blend)',
    category: 'Coffee Beans',
    packCost: 115,
    packSize: 1000,
    unit: 'g',
    unitCost: 0.115,
    openingStock: 8000,
    receivedStock: 4000,
    posDepleted: 1530,
    wasteDepleted: 220,
    onHandStock: 10250, // 8000 + 4000 - 1530 - 220
    parLevel: 4000,
    physicalCount: 10020, // Discrepancy shows grinder dose drift (+1.2g per double shot)
  },
  {
    id: 'ing-2',
    name: 'Single Origin Filter Beans (Geisha Natural)',
    category: 'Coffee Beans',
    packCost: 220,
    packSize: 1000,
    unit: 'g',
    unitCost: 0.22,
    openingStock: 2500,
    receivedStock: 1000,
    posDepleted: 260,
    wasteDepleted: 0,
    onHandStock: 3240,
    parLevel: 1500,
    physicalCount: 3220,
  },
  {
    id: 'ing-3',
    name: 'Fresh Barista Whole Milk (3.8% Fat)',
    category: 'Dairy & Plant Milk',
    packCost: 6.5,
    packSize: 1000,
    unit: 'ml',
    unitCost: 0.0065,
    openingStock: 24000,
    receivedStock: 18000,
    posDepleted: 9500,
    wasteDepleted: 950,
    onHandStock: 31550,
    parLevel: 15000,
    physicalCount: 30400, // Discrepancy from pitcher purge residue and steam-wand flush
  },
  {
    id: 'ing-4',
    name: 'Oat Milk (Barista Edition)',
    category: 'Dairy & Plant Milk',
    packCost: 14,
    packSize: 1000,
    unit: 'ml',
    unitCost: 0.014,
    openingStock: 12000,
    receivedStock: 6000,
    posDepleted: 2760,
    wasteDepleted: 0,
    onHandStock: 15240,
    parLevel: 6000,
    physicalCount: 15000,
  },
  {
    id: 'ing-5',
    name: 'Sweetened Condensed Milk',
    category: 'Syrups & Flavor',
    packCost: 11,
    packSize: 395,
    unit: 'g',
    unitCost: 0.0278,
    openingStock: 2400,
    receivedStock: 1200,
    posDepleted: 490,
    wasteDepleted: 0,
    onHandStock: 3110,
    parLevel: 1200,
    physicalCount: 3060,
  },
  {
    id: 'ing-6',
    name: 'Organic Madagascar Vanilla Syrup',
    category: 'Syrups & Flavor',
    packCost: 68,
    packSize: 750,
    unit: 'ml',
    unitCost: 0.0907,
    openingStock: 1500,
    receivedStock: 750,
    posDepleted: 160,
    wasteDepleted: 0,
    onHandStock: 2090,
    parLevel: 750,
    physicalCount: 2060,
  },
  {
    id: 'ing-7',
    name: 'Uji Ceremonial Matcha Powder',
    category: 'Syrups & Flavor',
    packCost: 185,
    packSize: 100,
    unit: 'g',
    unitCost: 1.85,
    openingStock: 300,
    receivedStock: 200,
    posDepleted: 36,
    wasteDepleted: 0,
    onHandStock: 464,
    parLevel: 150,
    physicalCount: 456,
  },
  {
    id: 'ing-8',
    name: 'Double-Wall Hot Cup 8oz & Compostable Lid',
    category: 'Packaging',
    packCost: 195,
    packSize: 500,
    unit: 'unit',
    unitCost: 0.39,
    openingStock: 1200,
    receivedStock: 500,
    posDepleted: 175,
    wasteDepleted: 0,
    onHandStock: 1525,
    parLevel: 600,
    physicalCount: 1520,
  },
  {
    id: 'ing-9',
    name: 'Double-Wall Hot Cup 12oz & Compostable Lid',
    category: 'Packaging',
    packCost: 220,
    packSize: 500,
    unit: 'unit',
    unitCost: 0.44,
    openingStock: 1500,
    receivedStock: 500,
    posDepleted: 215,
    wasteDepleted: 0,
    onHandStock: 1785,
    parLevel: 600,
    physicalCount: 1780,
  },
  {
    id: 'ing-10',
    name: 'Clear Cold Cup 16oz, Lid & Straw',
    category: 'Packaging',
    packCost: 245,
    packSize: 500,
    unit: 'unit',
    unitCost: 0.49,
    openingStock: 1400,
    receivedStock: 500,
    posDepleted: 205,
    wasteDepleted: 0,
    onHandStock: 1695,
    parLevel: 600,
    physicalCount: 1688,
  },
  {
    id: 'ing-11',
    name: 'Artisan Butter Croissant (French Frozen Bake-off)',
    category: 'Bakery & Food',
    packCost: 110,
    packSize: 24,
    unit: 'unit',
    unitCost: 4.583,
    openingStock: 48,
    receivedStock: 48,
    posDepleted: 12,
    wasteDepleted: 2,
    onHandStock: 82,
    parLevel: 30,
    physicalCount: 79,
  },
  {
    id: 'ing-12',
    name: 'Artisan Sourdough Slice',
    category: 'Bakery & Food',
    packCost: 28,
    packSize: 14,
    unit: 'unit',
    unitCost: 2.0,
    openingStock: 42,
    receivedStock: 28,
    posDepleted: 14,
    wasteDepleted: 0,
    onHandStock: 56,
    parLevel: 28,
    physicalCount: 54,
  },
  {
    id: 'ing-13',
    name: 'Fresh Ready-to-Eat Hass Avocado',
    category: 'Bakery & Food',
    packCost: 48,
    packSize: 10,
    unit: 'unit',
    unitCost: 4.8,
    openingStock: 25,
    receivedStock: 20,
    posDepleted: 7,
    wasteDepleted: 0,
    onHandStock: 38,
    parLevel: 15,
    physicalCount: 35,
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Espresso (Double Shot)',
    category: 'Espresso Bar',
    sellingPrice: 18,
    recipe: [{ ingredientId: 'ing-1', quantity: 18 }],
    applicableModifierIds: ['mod-extra-shot', 'mod-vanilla-pump'],
    description: '18g specialty espresso blend extracted at 9 bars.',
  },
  {
    id: 'prod-2',
    name: 'Flat White (6oz)',
    category: 'Specialty Milk',
    sellingPrice: 24,
    recipe: [
      { ingredientId: 'ing-1', quantity: 18 },
      { ingredientId: 'ing-3', quantity: 160 },
      { ingredientId: 'ing-8', quantity: 1 },
    ],
    applicableModifierIds: ['mod-extra-shot', 'mod-oat-swap', 'mod-vanilla-pump'],
    description: 'Double espresso with microfoam steamed whole milk.',
  },
  {
    id: 'prod-3',
    name: 'Iced Spanish Latte (16oz)',
    category: 'Cold Beverages',
    sellingPrice: 28,
    recipe: [
      { ingredientId: 'ing-1', quantity: 18 },
      { ingredientId: 'ing-3', quantity: 180 },
      { ingredientId: 'ing-5', quantity: 35 },
      { ingredientId: 'ing-10', quantity: 1 },
    ],
    applicableModifierIds: ['mod-extra-shot', 'mod-oat-swap', 'mod-condensed-pump'],
    description: 'Signature iced espresso with sweetened condensed milk.',
  },
  {
    id: 'prod-4',
    name: 'Iced Oat Vanilla Latte (16oz)',
    category: 'Cold Beverages',
    sellingPrice: 32,
    recipe: [
      { ingredientId: 'ing-1', quantity: 18 },
      { ingredientId: 'ing-4', quantity: 200 },
      { ingredientId: 'ing-6', quantity: 20 },
      { ingredientId: 'ing-10', quantity: 1 },
    ],
    applicableModifierIds: ['mod-extra-shot', 'mod-vanilla-pump'],
    description: 'Double shot over ice with barista oat milk and organic vanilla.',
  },
  {
    id: 'prod-5',
    name: 'Ceremonial Matcha Latte (Hot 12oz)',
    category: 'Specialty Milk',
    sellingPrice: 30,
    recipe: [
      { ingredientId: 'ing-7', quantity: 4 },
      { ingredientId: 'ing-4', quantity: 240 },
      { ingredientId: 'ing-9', quantity: 1 },
    ],
    applicableModifierIds: ['mod-vanilla-pump'],
    description: 'Whisked Uji ceremonial grade matcha with steamed oat milk.',
  },
  {
    id: 'prod-6',
    name: 'Single Origin V60 Filter (Geisha)',
    category: 'Espresso Bar',
    sellingPrice: 38,
    recipe: [
      { ingredientId: 'ing-2', quantity: 20 },
      { ingredientId: 'ing-9', quantity: 1 },
    ],
    applicableModifierIds: [],
    description: 'Hand-poured Geisha natural with jasmine and bergamot notes.',
  },
  {
    id: 'prod-7',
    name: 'French Butter Croissant',
    category: 'Bakery & Food',
    sellingPrice: 16,
    recipe: [{ ingredientId: 'ing-11', quantity: 1 }],
    applicableModifierIds: [],
    description: 'Flaky pure French butter croissant baked fresh daily.',
  },
  {
    id: 'prod-8',
    name: 'Artisan Avocado Toast',
    category: 'Bakery & Food',
    sellingPrice: 36,
    recipe: [
      { ingredientId: 'ing-12', quantity: 2 },
      { ingredientId: 'ing-13', quantity: 1 },
    ],
    applicableModifierIds: [],
    description: 'Toasted organic sourdough topped with crushed Hass avocado.',
  },
];

const INITIAL_WASTE_LOG: WasteEntry[] = [
  {
    id: 'WST-101',
    timestamp: '07:15 AM',
    ingredientId: 'ing-1',
    ingredientName: 'Specialty Espresso Beans',
    quantity: 220,
    unit: 'g',
    reason: 'Morning Grinder Dial-in Calibration',
    cost: 25.30,
    loggedBy: 'Head Barista (Zayn)',
  },
  {
    id: 'WST-102',
    timestamp: '11:45 AM',
    ingredientId: 'ing-3',
    ingredientName: 'Fresh Barista Whole Milk',
    quantity: 950,
    unit: 'ml',
    reason: 'Steam Pitcher Purge Residue',
    cost: 6.18,
    loggedBy: 'Barista (Sara)',
  },
  {
    id: 'WST-103',
    timestamp: '02:30 PM',
    ingredientId: 'ing-11',
    ingredientName: 'Artisan Butter Croissant',
    quantity: 2,
    unit: 'unit',
    reason: 'Bake-off Spoilage / Over-browning',
    cost: 9.17,
    loggedBy: 'Shift Supervisor (Karim)',
  },
];

export default function CafeInventoryApp() {
  const [activeTab, setActiveTab] = useState<'recipes' | 'inventory' | 'pos' | 'reconciliation' | 'waste'>('recipes');
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [wasteLog, setWasteLog] = useState<WasteEntry[]>(INITIAL_WASTE_LOG);
  const [salesLog, setSalesLog] = useState<SaleTransaction[]>([]);
  const [activeTicket, setActiveTicket] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Selected product to inspect in BOM view
  const [selectedProductId, setSelectedProductId] = useState<string | null>(INITIAL_PRODUCTS[1].id);

  // Modal States (Eliminating native alert/confirm quirks)
  const [restockIngredientId, setRestockIngredientId] = useState<string | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<number>(5);

  const [isLoggingWaste, setIsLoggingWaste] = useState<boolean>(false);
  const [wasteIngredientId, setWasteIngredientId] = useState<string>('ing-1');
  const [wasteQty, setWasteQty] = useState<number>(180);
  const [wasteReason, setWasteReason] = useState<WasteEntry['reason']>('Morning Grinder Dial-in Calibration');
  const [wasteErrorMessage, setWasteErrorMessage] = useState<string | null>(null);

  const [shortageErrors, setShortageErrors] = useState<string[] | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState<boolean>(false);

  // Load persisted state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.ingredients && parsed.products) {
          setIngredients(parsed.ingredients);
          setProducts(parsed.products);
          if (parsed.salesLog) setSalesLog(parsed.salesLog);
          if (parsed.wasteLog) setWasteLog(parsed.wasteLog);
        }
      }
    } catch (e) {
      console.warn('Unable to load cached inventory data, defaulting to verified baseline.', e);
    }
  }, []);

  // Save to local storage
  const persistState = (
    newIngs: Ingredient[],
    newProds: Product[],
    newSales: SaleTransaction[],
    newWaste: WasteEntry[]
  ) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ingredients: newIngs,
        products: newProds,
        salesLog: newSales,
        wasteLog: newWaste,
      }));
    } catch (e) {
      console.warn('Failed to persist inventory state', e);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Helper map for fast ingredient lookup
  const ingredientMap = useMemo(() => {
    const map = new Map<string, Ingredient>();
    ingredients.forEach(i => map.set(i.id, i));
    return map;
  }, [ingredients]);

  const modifierMap = useMemo(() => {
    const map = new Map<string, Modifier>();
    AVAILABLE_MODIFIERS.forEach(m => map.set(m.id, m));
    return map;
  }, []);

  // Compute Base Recipe Cost (COGS)
  const computeProductCogs = (product: Product): number => {
    return product.recipe.reduce((total, item) => {
      const ing = ingredientMap.get(item.ingredientId);
      if (!ing) return total;
      return total + (item.quantity * ing.unitCost);
    }, 0);
  };

  // Compute dynamic COGS including applied modifiers
  const computeItemWithModifiersCogs = (productId: string, modifierIds: string[]): number => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return 0;
    let total = computeProductCogs(prod);

    modifierIds.forEach(modId => {
      const mod = modifierMap.get(modId);
      if (mod) {
        mod.ingredientDeltas.forEach(delta => {
          const ing = ingredientMap.get(delta.ingredientId);
          if (ing) {
            total += delta.quantity * ing.unitCost;
          }
        });
      }
    });

    return Math.max(0, total);
  };

  // Aggregate telemetry metrics
  const summaryMetrics = useMemo(() => {
    let totalMenuPrice = 0;
    let totalMenuCogs = 0;
    products.forEach(p => {
      totalMenuPrice += p.sellingPrice;
      totalMenuCogs += computeProductCogs(p);
    });

    const avgFoodCostPct = totalMenuPrice > 0 ? (totalMenuCogs / totalMenuPrice) * 100 : 0;
    const avgGrossMarginPct = 100 - avgFoodCostPct;

    const totalInventoryValuation = ingredients.reduce((sum, ing) => {
      return sum + (ing.onHandStock * ing.unitCost);
    }, 0);

    const totalPosRevenue = salesLog.reduce((sum, sale) => sum + sale.totalRevenue, 0);
    const totalPosCogs = salesLog.reduce((sum, sale) => sum + sale.totalCogs, 0);
    const totalPosProfit = totalPosRevenue - totalPosCogs;
    const totalWasteCost = wasteLog.reduce((sum, w) => sum + w.cost, 0);

    return {
      avgFoodCostPct,
      avgGrossMarginPct,
      totalInventoryValuation,
      totalPosRevenue,
      totalPosCogs,
      totalPosProfit,
      totalWasteCost,
      totalTransactions: salesLog.length,
    };
  }, [products, ingredients, salesLog, wasteLog, ingredientMap]);

  // POS Till: Add item to active ticket
  const addItemToTicket = (product: Product) => {
    const newItem: CartItem = {
      id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      productName: product.name,
      basePrice: product.sellingPrice,
      appliedModifierIds: [],
      totalItemPrice: product.sellingPrice,
      totalItemCogs: computeProductCogs(product),
    };
    setActiveTicket(prev => [...prev, newItem]);
  };

  // Toggle modifier on a specific ticket line
  const toggleModifierOnLine = (lineId: string, modifierId: string) => {
    setActiveTicket(prev => prev.map(item => {
      if (item.id !== lineId) return item;
      const hasMod = item.appliedModifierIds.includes(modifierId);
      const nextMods = hasMod
        ? item.appliedModifierIds.filter(id => id !== modifierId)
        : [...item.appliedModifierIds, modifierId];

      const mod = modifierMap.get(modifierId);
      const priceDelta = mod ? (hasMod ? -mod.priceDelta : mod.priceDelta) : 0;
      const nextPrice = item.totalItemPrice + priceDelta;
      const nextCogs = computeItemWithModifiersCogs(item.productId, nextMods);

      return {
        ...item,
        appliedModifierIds: nextMods,
        totalItemPrice: Math.max(0, nextPrice),
        totalItemCogs: nextCogs,
      };
    }));
  };

  const removeLineFromTicket = (lineId: string) => {
    setActiveTicket(prev => prev.filter(item => item.id !== lineId));
  };

  const clearTicket = () => setActiveTicket([]);

  // Process POS Sale: Exact Raw Material Depletion
  const processSale = () => {
    if (activeTicket.length === 0) return;

    // Calculate total required ingredient quantities across all lines & modifiers
    const requiredUsage: Record<string, number> = {};

    activeTicket.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) return;

      // Base recipe
      prod.recipe.forEach(r => {
        requiredUsage[r.ingredientId] = (requiredUsage[r.ingredientId] || 0) + r.quantity;
      });

      // Modifiers
      item.appliedModifierIds.forEach(modId => {
        const mod = modifierMap.get(modId);
        if (mod) {
          mod.ingredientDeltas.forEach(delta => {
            requiredUsage[delta.ingredientId] = (requiredUsage[delta.ingredientId] || 0) + delta.quantity;
          });
        }
      });
    });

    // Shortage validation without crude browser alerts
    const shortages: string[] = [];
    Object.entries(requiredUsage).forEach(([ingId, requiredQty]) => {
      const ing = ingredientMap.get(ingId);
      if (ing && ing.onHandStock < requiredQty) {
        shortages.push(`${ing.name} (Requires: ${requiredQty}${ing.unit}, Available: ${ing.onHandStock}${ing.unit})`);
      }
    });

    if (shortages.length > 0) {
      setShortageErrors(shortages);
      return;
    }

    // Deplete inventory and accumulate posDepleted
    const updatedIngredients = ingredients.map(ing => {
      const used = requiredUsage[ing.id] || 0;
      const newPosDepleted = ing.posDepleted + used;
      const newOnHand = Math.max(0, (ing.openingStock + ing.receivedStock) - newPosDepleted - ing.wasteDepleted);
      return {
        ...ing,
        posDepleted: newPosDepleted,
        onHandStock: newOnHand,
      };
    });

    let totalRevenue = 0;
    let totalCogs = 0;
    const saleItems = activeTicket.map(item => {
      totalRevenue += item.totalItemPrice;
      totalCogs += item.totalItemCogs;
      return {
        productName: item.productName,
        modifiers: item.appliedModifierIds.map(mId => modifierMap.get(mId)?.name || mId),
        price: item.totalItemPrice,
        cogs: item.totalItemCogs,
      };
    });

    const newTxn: SaleTransaction = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      items: saleItems,
      totalRevenue,
      totalCogs,
      grossMargin: totalRevenue - totalCogs,
    };

    const updatedSales = [newTxn, ...salesLog];
    setIngredients(updatedIngredients);
    setSalesLog(updatedSales);
    setActiveTicket([]);
    persistState(updatedIngredients, products, updatedSales, wasteLog);
    showNotification(`Sale recorded: ${CURRENCY} ${totalRevenue.toFixed(2)}. Raw stock decremented in ledger.`);
  };

  // Simulate High-Volume Morning Rush
  const simulateMorningRush = () => {
    const rushBatch = [
      { prodId: 'prod-2', count: 16, mods: ['mod-oat-swap'] },
      { prodId: 'prod-3', count: 14, mods: ['mod-extra-shot'] },
      { prodId: 'prod-7', count: 12, mods: [] },
      { prodId: 'prod-4', count: 8, mods: [] },
      { prodId: 'prod-1', count: 6, mods: ['mod-extra-shot'] },
      { prodId: 'prod-8', count: 5, mods: [] },
      { prodId: 'prod-5', count: 4, mods: ['mod-vanilla-pump'] },
      { prodId: 'prod-6', count: 3, mods: [] },
    ];

    const requiredUsage: Record<string, number> = {};
    let totalRev = 0;
    let totalC = 0;
    const itemsList: SaleTransaction['items'] = [];

    rushBatch.forEach(({ prodId, count, mods }) => {
      const prod = products.find(p => p.id === prodId);
      if (!prod) return;

      for (let i = 0; i < count; i++) {
        prod.recipe.forEach(r => {
          requiredUsage[r.ingredientId] = (requiredUsage[r.ingredientId] || 0) + r.quantity;
        });

        let itemPrice = prod.sellingPrice;
        mods.forEach(mId => {
          const mod = modifierMap.get(mId);
          if (mod) {
            itemPrice += mod.priceDelta;
            mod.ingredientDeltas.forEach(delta => {
              requiredUsage[delta.ingredientId] = (requiredUsage[delta.ingredientId] || 0) + delta.quantity;
            });
          }
        });

        const itemCogs = computeItemWithModifiersCogs(prod.id, mods);
        totalRev += itemPrice;
        totalC += itemCogs;
        itemsList.push({
          productName: prod.name,
          modifiers: mods.map(mId => modifierMap.get(mId)?.name || mId),
          price: itemPrice,
          cogs: itemCogs,
        });
      }
    });

    const updatedIngredients = ingredients.map(ing => {
      const used = requiredUsage[ing.id] || 0;
      const newPosDepleted = ing.posDepleted + used;
      const newOnHand = Math.max(0, (ing.openingStock + ing.receivedStock) - newPosDepleted - ing.wasteDepleted);
      return {
        ...ing,
        posDepleted: newPosDepleted,
        onHandStock: newOnHand,
      };
    });

    const newTxn: SaleTransaction = {
      id: `RUSH-${Date.now().toString().slice(-4)}`,
      timestamp: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Morning Rush - 68 Items)`,
      items: itemsList,
      totalRevenue: totalRev,
      totalCogs: totalC,
      grossMargin: totalRev - totalC,
    };

    const updatedSales = [newTxn, ...salesLog];
    setIngredients(updatedIngredients);
    setSalesLog(updatedSales);
    persistState(updatedIngredients, products, updatedSales, wasteLog);
    showNotification(`Simulated 68-order morning rush (+${CURRENCY} ${totalRev.toFixed(2)} sales). Theoretical usage applied.`);
  };

  // Restock Supplier Delivery
  const handleRestock = () => {
    if (!restockIngredientId) return;
    const ing = ingredientMap.get(restockIngredientId);
    if (!ing) return;

    const addedQty = Math.max(1, restockQuantity) * ing.packSize;
    const updated = ingredients.map(i => {
      if (i.id === restockIngredientId) {
        const newReceived = i.receivedStock + addedQty;
        const newOnHand = (i.openingStock + newReceived) - i.posDepleted - i.wasteDepleted;
        return {
          ...i,
          receivedStock: newReceived,
          onHandStock: newOnHand,
          physicalCount: i.physicalCount + addedQty,
        };
      }
      return i;
    });

    setIngredients(updated);
    persistState(updated, products, salesLog, wasteLog);
    showNotification(`Restocked ${restockQuantity} packs of ${ing.name} (+${addedQty.toLocaleString()} ${ing.unit}).`);
    setRestockIngredientId(null);
  };

  // Record Authorized Operational Waste / Dial-in
  const handleLogWaste = () => {
    const ing = ingredientMap.get(wasteIngredientId);
    if (!ing) return;

    if (wasteQty <= 0 || isNaN(wasteQty)) {
      setWasteErrorMessage('Please enter a valid positive quantity.');
      return;
    }

    if (ing.onHandStock < wasteQty) {
      setWasteErrorMessage(`Quantity exceeds current on-hand stock (${ing.onHandStock.toLocaleString()} ${ing.unit}).`);
      return;
    }

    setWasteErrorMessage(null);
    const cost = wasteQty * ing.unitCost;
    const newEntry: WasteEntry = {
      id: `WST-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ingredientId: ing.id,
      ingredientName: ing.name,
      quantity: wasteQty,
      unit: ing.unit,
      reason: wasteReason,
      cost,
      loggedBy: 'Shift Supervisor',
    };

    const updatedIngredients = ingredients.map(i => {
      if (i.id === wasteIngredientId) {
        const newWaste = i.wasteDepleted + wasteQty;
        const newOnHand = Math.max(0, (i.openingStock + i.receivedStock) - i.posDepleted - newWaste);
        return {
          ...i,
          wasteDepleted: newWaste,
          onHandStock: newOnHand,
        };
      }
      return i;
    });

    const updatedWaste = [newEntry, ...wasteLog];
    setIngredients(updatedIngredients);
    setWasteLog(updatedWaste);
    setIsLoggingWaste(false);
    persistState(updatedIngredients, products, salesLog, updatedWaste);
    showNotification(`Logged waste: ${wasteQty.toLocaleString()} ${ing.unit} ${ing.name} (${CURRENCY} ${cost.toFixed(2)}).`);
  };

  // Update physical count in reconciliation with NaN guard
  const updatePhysicalCount = (ingredientId: string, val: number) => {
    const sanitizedVal = isNaN(val) ? 0 : Math.max(0, val);
    const updated = ingredients.map(i => {
      if (i.id === ingredientId) {
        return { ...i, physicalCount: sanitizedVal };
      }
      return i;
    });
    setIngredients(updated);
    persistState(updated, products, salesLog, wasteLog);
  };

  // Reset to default baseline via modal
  const executeResetToDefault = () => {
    setIngredients(INITIAL_INGREDIENTS);
    setProducts(INITIAL_PRODUCTS);
    setWasteLog(INITIAL_WASTE_LOG);
    setSalesLog([]);
    setActiveTicket([]);
    localStorage.removeItem(STORAGE_KEY);
    setIsConfirmingReset(false);
    showNotification('Operational baseline restored.');
  };

  // Export full CSV audit pack
  const exportAuditSchedule = () => {
    const headers = [
      'Audit Schedule Section',
      'Item / SKU',
      'Category',
      'Menu Price (AED)',
      'Recipe COGS (AED)',
      'Food Cost %',
      'Opening Stock',
      'Receipts',
      'POS Depletion',
      'Authorized Waste',
      'Theoretical Closing Stock',
      'Physical Weekly Count',
      'Unreconciled Variance (Units)',
      'Residual Exposure (AED)',
      'Root-Cause Classification',
    ];

    const rows: string[][] = [];

    // Section 1: Recipes
    products.forEach(p => {
      const cogs = computeProductCogs(p);
      const foodCostPct = (cogs / p.sellingPrice) * 100;
      rows.push([
        'Menu Recipe & BOM Costing',
        p.name,
        p.category,
        p.sellingPrice.toFixed(2),
        cogs.toFixed(2),
        `${foodCostPct.toFixed(1)}%`,
        '', '', '', '', '', '', '', '',
        foodCostPct > 35 ? 'High Cost Flag' : 'Healthy Margin Anchor',
      ]);
    });

    // Section 2: Inventory Reconciliation (TvA)
    ingredients.forEach(i => {
      const varianceUnits = i.physicalCount - i.onHandStock;
      const varianceVal = varianceUnits * i.unitCost;

      let diagnosis = 'Balanced';
      if (varianceUnits < 0) {
        if (i.category === 'Coffee Beans') diagnosis = 'Residual Grinder Drift / Remake Bypass';
        else if (i.category === 'Dairy & Plant Milk') diagnosis = 'Excess Pitcher Discard / Spoiled Milk';
        else if (i.category === 'Bakery & Food') diagnosis = 'Unlogged Stale Pastry Discard';
        else diagnosis = 'Unrecorded Staff Drinks / Till Bypass';
      }

      rows.push([
        'Inventory TvA Audit Schedule',
        i.name,
        i.category,
        '', '', '',
        `${i.openingStock.toLocaleString()} ${i.unit}`,
        `${i.receivedStock.toLocaleString()} ${i.unit}`,
        `${i.posDepleted.toLocaleString()} ${i.unit}`,
        `${i.wasteDepleted.toLocaleString()} ${i.unit}`,
        `${i.onHandStock.toLocaleString()} ${i.unit}`,
        `${i.physicalCount.toLocaleString()} ${i.unit}`,
        `${varianceUnits.toFixed(0)} ${i.unit}`,
        varianceVal.toFixed(2),
        diagnosis,
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Cafe_Inventory_TvA_Audit_Schedule_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Exported complete multi-tab audit schedule.');
  };

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const selectedProductCogs = computeProductCogs(selectedProduct);
  const selectedFoodCostPct = selectedProduct.sellingPrice > 0 ? (selectedProductCogs / selectedProduct.sellingPrice) * 100 : 0;
  const selectedMargin = selectedProduct.sellingPrice - selectedProductCogs;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-[#c7964c]/40 bg-[#181512] px-5 py-4 text-sm font-medium text-white shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5 text-[#c7964c]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Stock Shortage Error Modal */}
      {shortageErrors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#d9381e]/40 bg-white p-6 shadow-2xl dark:bg-[#1a1714]">
            <div className="flex items-center justify-between border-b border-[color:var(--line-soft)] pb-3">
              <div className="flex items-center gap-2 text-[#d9381e]">
                <AlertOctagon className="h-5 w-5" />
                <h3 className="text-sm font-black uppercase tracking-wider">Stock Shortage Detected</h3>
              </div>
              <button
                onClick={() => setShortageErrors(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[color:var(--text-secondary)]">
              This order cannot be fulfilled because required ingredient quantities exceed current on-hand warehouse stock:
            </p>
            <div className="mt-3 space-y-2 rounded-2xl bg-[#d9381e]/5 p-3.5 text-xs text-[#d9381e]">
              {shortageErrors.map((err, idx) => (
                <div key={idx} className="font-mono text-[11px] font-semibold">• {err}</div>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShortageErrors(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-[color:var(--text-secondary)]"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setShortageErrors(null);
                  setActiveTab('inventory');
                }}
                className="rounded-xl bg-[#181511] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#8d6035] dark:bg-white dark:text-[#181511]"
              >
                Go to Stock & Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isConfirmingReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-[color:var(--line-soft)] bg-white p-6 shadow-2xl dark:bg-[#1a1714]">
            <h3 className="text-base font-black text-[#181511] dark:text-white">Reset Operational Baseline?</h3>
            <p className="mt-2 text-xs leading-relaxed text-[color:var(--text-secondary)]">
              This restores all recipes, ingredient inventory balances, waste logs, and sales journals back to the verified baseline dataset.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmingReset(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-[color:var(--text-secondary)] hover:text-[#181511]"
              >
                Cancel
              </button>
              <button
                onClick={executeResetToDefault}
                className="rounded-xl bg-[#d9381e] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#b02a15]"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Metric Ribbons */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-[color:var(--line-soft)] bg-white/60 p-4 backdrop-blur-sm dark:bg-white/5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
            <span>Avg Food Cost</span>
            <Flame className="h-4 w-4 text-[#c7964c]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#181511] dark:text-white">
            {summaryMetrics.avgFoodCostPct.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] font-medium text-[#107c41]">
            Benchmark: 22% - 30%
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--line-soft)] bg-white/60 p-4 backdrop-blur-sm dark:bg-white/5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
            <span>Gross Margin</span>
            <TrendingUp className="h-4 w-4 text-[#107c41]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#107c41]">
            {summaryMetrics.avgGrossMarginPct.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] font-medium text-[color:var(--text-secondary)]">
            Healthy Cafe Baseline
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--line-soft)] bg-white/60 p-4 backdrop-blur-sm dark:bg-white/5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
            <span>Stock Value</span>
            <Package className="h-4 w-4 text-[#8d6035]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#181511] dark:text-white">
            {CURRENCY} {summaryMetrics.totalInventoryValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="mt-1 text-[11px] font-medium text-[color:var(--text-secondary)]">
            {ingredients.length} active SKUs
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--line-soft)] bg-white/60 p-4 backdrop-blur-sm dark:bg-white/5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
            <span>POS Sales Rung</span>
            <DollarSign className="h-4 w-4 text-[#c7964c]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#181511] dark:text-white">
            {CURRENCY} {summaryMetrics.totalPosRevenue.toFixed(0)}
          </div>
          <div className="mt-1 text-[11px] font-medium text-[#c7964c]">
            {summaryMetrics.totalTransactions} transactions
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--line-soft)] bg-white/60 p-4 backdrop-blur-sm dark:bg-white/5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
            <span>Gross Profit</span>
            <TrendingUp className="h-4 w-4 text-[#107c41]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#107c41]">
            {CURRENCY} {summaryMetrics.totalPosProfit.toFixed(0)}
          </div>
          <div className="mt-1 text-[11px] font-medium text-[color:var(--text-secondary)]">
            COGS: {CURRENCY} {summaryMetrics.totalPosCogs.toFixed(0)}
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--line-soft)] bg-white/60 p-4 backdrop-blur-sm dark:bg-white/5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
            <span>Logged Waste</span>
            <AlertOctagon className="h-4 w-4 text-[#d9381e]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#d9381e]">
            {CURRENCY} {summaryMetrics.totalWasteCost.toFixed(1)}
          </div>
          <div className="mt-1 text-[11px] font-medium text-[color:var(--text-secondary)]">
            {wasteLog.length} authorized logs
          </div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--line-soft)] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'recipes'
                ? 'bg-[#181511] text-white shadow-md dark:bg-white dark:text-[#181511]'
                : 'bg-white/70 text-[color:var(--text-secondary)] hover:bg-white hover:text-[#181511] dark:bg-white/5 dark:hover:bg-white/10'
            }`}
          >
            <Coffee className="h-4 w-4" />
            <span>Recipes & Costing</span>
            <span className="rounded-full bg-[#c7964c]/20 px-2 py-0.5 text-[10px] text-[#c7964c]">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'inventory'
                ? 'bg-[#181511] text-white shadow-md dark:bg-white dark:text-[#181511]'
                : 'bg-white/70 text-[color:var(--text-secondary)] hover:bg-white hover:text-[#181511] dark:bg-white/5 dark:hover:bg-white/10'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Raw Ingredients & Stock</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-700 dark:bg-white/10 dark:text-white">
              {ingredients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'pos'
                ? 'bg-[#181511] text-white shadow-md dark:bg-white dark:text-[#181511]'
                : 'bg-white/70 text-[color:var(--text-secondary)] hover:bg-white hover:text-[#181511] dark:bg-white/5 dark:hover:bg-white/10'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Live POS Till & Modifiers</span>
            {activeTicket.length > 0 && (
              <span className="rounded-full bg-[#107c41] px-2 py-0.5 text-[10px] text-white">
                {activeTicket.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('waste')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'waste'
                ? 'bg-[#181511] text-white shadow-md dark:bg-white dark:text-[#181511]'
                : 'bg-white/70 text-[color:var(--text-secondary)] hover:bg-white hover:text-[#181511] dark:bg-white/5 dark:hover:bg-white/10'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>Operating Waste & Purge Log</span>
          </button>

          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'reconciliation'
                ? 'bg-[#181511] text-white shadow-md dark:bg-white dark:text-[#181511]'
                : 'bg-white/70 text-[color:var(--text-secondary)] hover:bg-white hover:text-[#181511] dark:bg-white/5 dark:hover:bg-white/10'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>TvA Stock Audit & Variance</span>
          </button>
        </div>

        {/* Global Utilities */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportAuditSchedule}
            className="flex items-center gap-2 rounded-xl border border-[color:var(--line-soft)] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#181511] shadow-sm transition hover:bg-white dark:bg-white/10 dark:text-white"
            title="Download full CSV schedule"
          >
            <Download className="h-3.5 w-3.5 text-[#c7964c]" />
            <span>Export Audit Pack</span>
          </button>
          <button
            onClick={() => setIsConfirmingReset(true)}
            className="flex items-center gap-2 rounded-xl border border-[color:var(--line-soft)] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[color:var(--text-secondary)] shadow-sm transition hover:text-[#d9381e] dark:bg-white/10"
            title="Reset to verified baseline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RECIPES & PRODUCT COSTING                                          */}
      {/* ========================================================================= */}
      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#181511] dark:text-white">
                Menu Items ({products.length})
              </h3>
              <span className="text-xs text-[color:var(--text-secondary)]">Select to inspect BOM</span>
            </div>

            <div className="space-y-2.5">
              {products.map(p => {
                const cogs = computeProductCogs(p);
                const foodCostPct = (cogs / p.sellingPrice) * 100;
                const margin = p.sellingPrice - cogs;
                const isSelected = p.id === selectedProductId;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? 'border-[#c7964c] bg-white shadow-lg ring-2 ring-[#c7964c]/20 dark:bg-white/10'
                        : 'border-[color:var(--line-soft)] bg-white/50 hover:border-slate-400 hover:bg-white dark:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#181511] dark:text-white">{p.name}</h4>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-white/10 dark:text-white/80">
                            {p.category}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[color:var(--text-secondary)]">{p.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-[#181511] dark:text-white">
                          {CURRENCY} {p.sellingPrice.toFixed(2)}
                        </div>
                        <div className="text-[11px] font-semibold text-[color:var(--text-secondary)]">
                          COGS: {CURRENCY} {cogs.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[color:var(--line-soft)] pt-2.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[color:var(--text-secondary)]">Food Cost:</span>
                        <span className={`font-black ${
                          foodCostPct <= 25 ? 'text-[#107c41]' : foodCostPct <= 35 ? 'text-[#c7964c]' : 'text-[#d9381e]'
                        }`}>
                          {foodCostPct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[color:var(--text-secondary)]">Gross Margin:</span>
                        <span className="font-black text-[#107c41]">
                          +{CURRENCY} {margin.toFixed(2)} ({((margin / p.sellingPrice) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-[color:var(--line-soft)] bg-white/70 p-6 shadow-sm backdrop-blur-md dark:bg-white/5">
              <div className="flex flex-col gap-4 border-b border-[color:var(--line-soft)] pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="rounded-full bg-[#c7964c]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#a66c1c] dark:text-[#f4c98b]">
                    Recipe Bill of Materials (BOM)
                  </span>
                  <h3 className="mt-2 text-2xl font-black text-[#181511] dark:text-white">
                    {selectedProduct.name}
                  </h3>
                  <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3.5 dark:bg-white/5">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
                      Menu Price
                    </div>
                    <div className="text-xl font-black text-[#181511] dark:text-white">
                      {CURRENCY} {selectedProduct.sellingPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
                      Recipe Cost
                    </div>
                    <div className="text-xl font-black text-[#c7964c]">
                      {CURRENCY} {selectedProductCogs.toFixed(2)}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
                      Food Cost %
                    </div>
                    <div className={`text-xl font-black ${
                      selectedFoodCostPct <= 25 ? 'text-[#107c41]' : selectedFoodCostPct <= 35 ? 'text-[#c7964c]' : 'text-[#d9381e]'
                    }`}>
                      {selectedFoodCostPct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipe Ingredients Breakdown */}
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">
                  Ingredient Breakdown & Portioning
                </h4>

                <div className="mt-3 overflow-hidden rounded-2xl border border-[color:var(--line-soft)]">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[color:var(--line-soft)] bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-secondary)] dark:bg-white/5">
                      <tr>
                        <th className="px-4 py-3">Ingredient</th>
                        <th className="px-3 py-3">Portion / Usage</th>
                        <th className="px-3 py-3">Unit Cost</th>
                        <th className="px-3 py-3 text-right">Line Cost</th>
                        <th className="px-3 py-3 text-right">% of COGS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--line-soft)]">
                      {selectedProduct.recipe.map((item, idx) => {
                        const ing = ingredientMap.get(item.ingredientId);
                        if (!ing) return null;
                        const lineCost = item.quantity * ing.unitCost;
                        const costShare = selectedProductCogs > 0 ? (lineCost / selectedProductCogs) * 100 : 0;

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                            <td className="px-4 py-3 font-semibold text-[#181511] dark:text-white">
                              {ing.name}
                              <span className="block text-[10px] font-normal text-[color:var(--text-secondary)]">
                                {ing.category}
                              </span>
                            </td>
                            <td className="px-3 py-3 font-mono font-medium">
                              {item.quantity} {ing.unit}
                            </td>
                            <td className="px-3 py-3 font-mono text-[color:var(--text-secondary)]">
                              {CURRENCY} {ing.unitCost.toFixed(4)}/{ing.unit}
                            </td>
                            <td className="px-3 py-3 text-right font-mono font-bold text-[#181511] dark:text-white">
                              {CURRENCY} {lineCost.toFixed(3)}
                            </td>
                            <td className="px-3 py-3 text-right font-mono font-bold text-[#c7964c]">
                              {costShare.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="border-t border-[color:var(--line-soft)] bg-slate-50/80 font-bold dark:bg-white/5">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right uppercase tracking-wider text-[color:var(--text-secondary)]">
                          Total Unit Recipe Cost
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-sm text-[#181511] dark:text-white">
                          {CURRENCY} {selectedProductCogs.toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-sm text-[#c7964c]">
                          100.0%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Supported Modifiers */}
              {selectedProduct.applicableModifierIds && selectedProduct.applicableModifierIds.length > 0 && (
                <div className="mt-6 border-t border-[color:var(--line-soft)] pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">
                    Supported POS Modifiers & Recipe Sub-Rules
                  </h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedProduct.applicableModifierIds.map(mId => {
                      const mod = modifierMap.get(mId);
                      if (!mod) return null;
                      return (
                        <span key={mId} className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--line-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-[#181511] shadow-sm dark:bg-white/10 dark:text-white">
                          <span>{mod.name}</span>
                          <span className="font-bold text-[#107c41]">+{CURRENCY} {mod.priceDelta.toFixed(0)}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Operational Reality Analysis */}
              <div className="mt-6 rounded-2xl border border-[#c7964c]/20 bg-[#c7964c]/5 p-4 text-xs leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-[#a66c1c] dark:text-[#f4c98b]">
                  <Sparkles className="h-4 w-4" />
                  <span>Operational Reality vs. Financial Reporting</span>
                </div>
                <p className="mt-2 text-[color:var(--text-secondary)]">
                  Notice that packaging (cups, lids, straws) contributes <span className="font-bold text-[#181511] dark:text-white">AED {(selectedProduct.recipe.filter(r => ingredientMap.get(r.ingredientId)?.category === 'Packaging').reduce((sum, r) => sum + (r.quantity * (ingredientMap.get(r.ingredientId)?.unitCost || 0)), 0)).toFixed(2)}</span> to this beverage. In specialty coffee, packaging often exceeds the raw cost of the espresso beans. When baristas re-cup a spilled drink without ringing a waste ticket, it doubles packaging leakage silently.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RAW INGREDIENTS & STOCK CONTROL                                    */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-[#181511] dark:text-white">
                Raw Materials & Master Inventory ({ingredients.length} SKUs)
              </h3>
              <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
                On-hand stock is synchronized with the perpetual inventory ledger.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#107c41]">
                <span className="h-2 w-2 rounded-full bg-[#107c41]" /> In Stock
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#c7964c]">
                <span className="h-2 w-2 rounded-full bg-[#c7964c]" /> Near Par
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#d9381e]">
                <span className="h-2 w-2 rounded-full bg-[#d9381e]" /> Critical Low
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[color:var(--line-soft)] bg-white/70 shadow-sm backdrop-blur-md dark:bg-white/5">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[color:var(--line-soft)] bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-secondary)] dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3.5">Raw Material / SKU</th>
                  <th className="px-3 py-3.5">Category</th>
                  <th className="px-3 py-3.5">Pack Size & Cost</th>
                  <th className="px-3 py-3.5">Unit Cost</th>
                  <th className="px-3 py-3.5">On-Hand Stock</th>
                  <th className="px-3 py-3.5">Par Level</th>
                  <th className="px-3 py-3.5">Valuation</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--line-soft)]">
                {ingredients.map(ing => {
                  const valuation = ing.onHandStock * ing.unitCost;
                  const isLow = ing.onHandStock <= ing.parLevel;
                  const isCritical = ing.onHandStock <= ing.parLevel * 0.5;

                  return (
                    <tr key={ing.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                      <td className="px-4 py-3 font-bold text-[#181511] dark:text-white">
                        {ing.name}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-white/10 dark:text-white/80">
                          {ing.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-[color:var(--text-secondary)]">
                        {CURRENCY} {ing.packCost.toFixed(2)} / {ing.packSize.toLocaleString()}{ing.unit}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-[#181511] dark:text-white">
                        {CURRENCY} {ing.unitCost.toFixed(4)}/{ing.unit}
                      </td>
                      <td className="px-3 py-3 font-mono font-black text-sm">
                        {ing.onHandStock.toLocaleString()} {ing.unit}
                      </td>
                      <td className="px-3 py-3 font-mono text-[color:var(--text-secondary)]">
                        {ing.parLevel.toLocaleString()} {ing.unit}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-[#c7964c]">
                        {CURRENCY} {valuation.toFixed(2)}
                      </td>
                      <td className="px-3 py-3">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#d9381e]/15 px-2.5 py-0.5 text-[10px] font-black text-[#d9381e]">
                            CRITICAL
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#c7964c]/15 px-2.5 py-0.5 text-[10px] font-black text-[#a66c1c] dark:text-[#f4c98b]">
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#107c41]/15 px-2.5 py-0.5 text-[10px] font-black text-[#107c41]">
                            HEALTHY
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setRestockIngredientId(ing.id);
                            setRestockQuantity(5);
                          }}
                          className="rounded-xl border border-[color:var(--line-soft)] bg-white px-3 py-1 text-[11px] font-bold text-[#181511] shadow-sm transition hover:bg-slate-100 dark:bg-white/10 dark:text-white"
                        >
                          + Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Restock Delivery Modal */}
          {restockIngredientId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-3xl border border-[color:var(--line-soft)] bg-white p-6 shadow-2xl dark:bg-[#1a1714]">
                <h3 className="text-base font-black text-[#181511] dark:text-white">
                  Receive Supplier Delivery
                </h3>
                <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
                  {ingredientMap.get(restockIngredientId)?.name}
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[color:var(--text-secondary)]">
                      Number of Wholesale Packs ({ingredientMap.get(restockIngredientId)?.packSize} {ingredientMap.get(restockIngredientId)?.unit}/pack)
                    </label>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() => setRestockQuantity(Math.max(1, restockQuantity - 1))}
                        className="rounded-xl border border-slate-300 p-2 hover:bg-slate-100 dark:border-white/20"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={restockQuantity}
                        onChange={e => setRestockQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-center text-lg font-bold dark:border-white/20 dark:bg-white/5"
                      />
                      <button
                        onClick={() => setRestockQuantity(restockQuantity + 1)}
                        className="rounded-xl border border-slate-300 p-2 hover:bg-slate-100 dark:border-white/20"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3.5 text-xs dark:bg-white/5">
                    <div className="flex justify-between">
                      <span className="text-[color:var(--text-secondary)]">Total Units Added:</span>
                      <span className="font-bold text-[#181511] dark:text-white">
                        {(restockQuantity * (ingredientMap.get(restockIngredientId)?.packSize || 0)).toLocaleString()} {ingredientMap.get(restockIngredientId)?.unit}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <span className="text-[color:var(--text-secondary)]">Invoice Total:</span>
                      <span className="font-bold text-[#c7964c]">
                        {CURRENCY} {(restockQuantity * (ingredientMap.get(restockIngredientId)?.packCost || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setRestockIngredientId(null)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-[color:var(--text-secondary)] hover:text-[#181511]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRestock}
                    className="rounded-xl bg-[#181511] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#8d6035] dark:bg-white dark:text-[#181511]"
                  >
                    Confirm Delivery
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: POS TILL, MODIFIERS & REAL-TIME DEPLETION                           */}
      {/* ========================================================================= */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* POS Menu Grid */}
          <div className="space-y-4 lg:col-span-7 xl:col-span-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#181511] dark:text-white">
                  Barista Touch Terminal
                </h3>
                <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
                  Tap items to build tickets. Modifiers dynamically recalculate recipe depletion.
                </p>
              </div>

              <button
                onClick={simulateMorningRush}
                className="flex items-center gap-2 rounded-2xl border border-[#c7964c] bg-[#c7964c]/10 px-4 py-2 text-xs font-bold text-[#8d6035] shadow-sm transition hover:bg-[#c7964c]/20 dark:text-[#f4c98b]"
              >
                <Flame className="h-4 w-4 text-[#d9381e]" />
                <span>Simulate Morning Rush (68 items)</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {products.map(p => {
                const cogs = computeProductCogs(p);
                const margin = p.sellingPrice - cogs;

                return (
                  <button
                    key={p.id}
                    onClick={() => addItemToTicket(p)}
                    className="relative flex flex-col justify-between rounded-2xl border border-[color:var(--line-soft)] bg-white/70 p-4 text-left shadow-sm transition-all hover:scale-[1.02] hover:border-[#c7964c] hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div>
                      <span className="text-[10px] font-semibold text-[color:var(--text-secondary)]">
                        {p.category}
                      </span>
                      <h4 className="mt-1 font-bold text-[#181511] dark:text-white">
                        {p.name}
                      </h4>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between border-t border-[color:var(--line-soft)] pt-2.5">
                      <span className="text-sm font-black text-[#181511] dark:text-white">
                        {CURRENCY} {p.sellingPrice.toFixed(0)}
                      </span>
                      <span className="text-[10px] font-bold text-[#107c41]">
                        +{CURRENCY} {margin.toFixed(1)} margin
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sales Journal */}
            <div className="mt-8 rounded-3xl border border-[color:var(--line-soft)] bg-white/60 p-5 backdrop-blur-md dark:bg-white/5">
              <div className="flex items-center justify-between border-b border-[color:var(--line-soft)] pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">
                  Live Sales Journal Stream
                </h4>
                <span className="text-xs font-semibold text-[#107c41]">
                  Total Rung: {CURRENCY} {summaryMetrics.totalPosRevenue.toFixed(2)}
                </span>
              </div>

              {salesLog.length === 0 ? (
                <div className="py-8 text-center text-xs text-[color:var(--text-secondary)]">
                  No sales recorded yet. Ring up an order above or click "Simulate Morning Rush".
                </div>
              ) : (
                <div className="mt-3 max-h-60 divide-y divide-[color:var(--line-soft)] overflow-y-auto">
                  {salesLog.map(sale => (
                    <div key={sale.id} className="flex items-center justify-between py-2.5 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#181511] dark:text-white">{sale.id}</span>
                          <span className="text-[10px] text-[color:var(--text-secondary)]">{sale.timestamp}</span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-[color:var(--text-secondary)]">
                          {sale.items.map((i, idx) => (
                            <span key={idx}>
                              {i.productName}
                              {i.modifiers.length > 0 && ` (+${i.modifiers.join(', ')})`}
                              {idx < sale.items.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-[#181511] dark:text-white">
                          +{CURRENCY} {sale.totalRevenue.toFixed(2)}
                        </div>
                        <div className="text-[10px] font-bold text-[#107c41]">
                          Margin: +{CURRENCY} {sale.grossMargin.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Ticket & Modifiers Inspector */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-28 rounded-3xl border border-[color:var(--line-soft)] bg-white p-6 shadow-xl dark:bg-[#181512]">
              <div className="flex items-center justify-between border-b border-[color:var(--line-soft)] pb-4">
                <div>
                  <h3 className="text-base font-black text-[#181511] dark:text-white">Active Ticket</h3>
                  <span className="text-xs text-[color:var(--text-secondary)]">Till #01 • Counter POS</span>
                </div>
                {activeTicket.length > 0 && (
                  <button
                    onClick={clearTicket}
                    className="text-xs font-semibold text-[#d9381e] hover:underline"
                  >
                    Clear Ticket
                  </button>
                )}
              </div>

              {/* Cart Ticket Items */}
              <div className="mt-4 min-h-[160px] max-h-[340px] divide-y divide-[color:var(--line-soft)] overflow-y-auto">
                {activeTicket.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center text-center text-xs text-[color:var(--text-secondary)]">
                    <Coffee className="h-8 w-8 text-slate-300 dark:text-white/20" />
                    <p className="mt-2 font-medium">Ticket is empty</p>
                    <p className="text-[11px]">Tap menu items on the left to ring up</p>
                  </div>
                ) : (
                  activeTicket.map((lineItem) => {
                    const prod = products.find(p => p.id === lineItem.productId);
                    const applicableMods = prod?.applicableModifierIds || [];

                    return (
                      <div key={lineItem.id} className="py-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-bold text-[#181511] dark:text-white text-xs">
                              {lineItem.productName}
                            </h5>
                            <span className="font-mono text-[11px] text-[color:var(--text-secondary)]">
                              Base: {CURRENCY} {lineItem.basePrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-[#181511] dark:text-white">
                              {CURRENCY} {lineItem.totalItemPrice.toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeLineFromTicket(lineItem.id)}
                              className="text-xs text-slate-400 hover:text-[#d9381e]"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Modifiers selector for this line */}
                        {applicableMods.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {applicableMods.map(mId => {
                              const mod = modifierMap.get(mId);
                              if (!mod) return null;
                              const isApplied = lineItem.appliedModifierIds.includes(mId);

                              return (
                                <button
                                  key={mId}
                                  onClick={() => toggleModifierOnLine(lineItem.id, mId)}
                                  className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-all ${
                                    isApplied
                                      ? 'bg-[#107c41] text-white'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-white/80'
                                  }`}
                                >
                                  {isApplied ? '✓ ' : '+ '}
                                  {mod.name.split(' (')[0]} (+{CURRENCY} {mod.priceDelta.toFixed(0)})
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Ticket Totals & Checkout */}
              {activeTicket.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-[color:var(--line-soft)] pt-4 text-xs">
                  {(() => {
                    const totalRev = activeTicket.reduce((sum, item) => sum + item.totalItemPrice, 0);
                    const totalCogs = activeTicket.reduce((sum, item) => sum + item.totalItemCogs, 0);
                    const margin = totalRev - totalCogs;
                    const foodCostPct = totalRev > 0 ? (totalCogs / totalRev) * 100 : 0;

                    return (
                      <>
                        <div className="flex justify-between text-[color:var(--text-secondary)]">
                          <span>Subtotal ({activeTicket.length} items)</span>
                          <span className="font-mono font-bold text-[#181511] dark:text-white">
                            {CURRENCY} {totalRev.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[color:var(--text-secondary)]">
                          <span>Theoretical BOM COGS</span>
                          <span className="font-mono">{CURRENCY} {totalCogs.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[color:var(--text-secondary)]">
                          <span>Order Contribution Margin</span>
                          <span className="font-mono font-bold text-[#107c41]">
                            +{CURRENCY} {margin.toFixed(2)} ({100 - Math.round(foodCostPct)}%)
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-[color:var(--line-soft)] pt-2 text-sm font-black text-[#181511] dark:text-white">
                          <span>Total to Charge</span>
                          <span className="font-mono">{CURRENCY} {totalRev.toFixed(2)}</span>
                        </div>

                        <button
                          onClick={processSale}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#181511] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl transition-all hover:bg-[#8d6035] active:scale-[0.99] dark:bg-white dark:text-[#181511]"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Charge & Deplete Stock</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: OPERATING WASTE & PURGE LOG                                        */}
      {/* ========================================================================= */}
      {activeTab === 'waste' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-[#181511] dark:text-white">
                Operational Waste & Technical Purge Log
              </h3>
              <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
                Authorizes operational losses (grinder dial-in, pitcher foam purges) so they are not misdiagnosed as theft.
              </p>
            </div>

            <button
              onClick={() => {
                setWasteErrorMessage(null);
                setIsLoggingWaste(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#181511] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#8d6035] dark:bg-white dark:text-[#181511]"
            >
              <Plus className="h-4 w-4" />
              <span>Log Dial-in / Operating Waste</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[color:var(--line-soft)] bg-white/70 shadow-sm backdrop-blur-md dark:bg-white/5">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[color:var(--line-soft)] bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-secondary)] dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3.5">Log ID & Time</th>
                  <th className="px-3 py-3.5">Raw Material</th>
                  <th className="px-3 py-3.5">Quantity Purged</th>
                  <th className="px-3 py-3.5">Cost Impact</th>
                  <th className="px-3 py-3.5">Operational Reason</th>
                  <th className="px-4 py-3.5 text-right">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--line-soft)]">
                {wasteLog.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                    <td className="px-4 py-3 font-mono font-bold text-[#181511] dark:text-white">
                      {entry.id}
                      <span className="block text-[10px] font-normal text-[color:var(--text-secondary)]">
                        {entry.timestamp}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-semibold text-[#181511] dark:text-white">
                      {entry.ingredientName}
                    </td>
                    <td className="px-3 py-3 font-mono font-bold text-[#d9381e]">
                      {entry.quantity.toLocaleString()} {entry.unit}
                    </td>
                    <td className="px-3 py-3 font-mono font-bold text-[#181511] dark:text-white">
                      {CURRENCY} {entry.cost.toFixed(2)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700 dark:bg-white/10 dark:text-white/80">
                        {entry.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[color:var(--text-secondary)] font-medium">
                      {entry.loggedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-[color:var(--line-soft)] bg-slate-50 font-bold dark:bg-white/5">
                <tr>
                  <td colSpan={3} className="px-4 py-3.5 text-right uppercase tracking-wider text-[color:var(--text-secondary)]">
                    Total Authorized Operational Waste
                  </td>
                  <td colSpan={3} className="px-3 py-3.5 font-mono text-sm font-black text-[#d9381e]">
                    {CURRENCY} {summaryMetrics.totalWasteCost.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Waste Modal */}
          {isLoggingWaste && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-3xl border border-[color:var(--line-soft)] bg-white p-6 shadow-2xl dark:bg-[#1a1714]">
                <h3 className="text-base font-black text-[#181511] dark:text-white">
                  Record Operational Waste / Technical Purge
                </h3>
                <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
                  Classifies technical process losses out of unexplained shrinkage.
                </p>

                {wasteErrorMessage && (
                  <div className="mt-3 rounded-xl bg-[#d9381e]/10 p-3 text-xs font-semibold text-[#d9381e]">
                    {wasteErrorMessage}
                  </div>
                )}

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[color:var(--text-secondary)]">
                      Select Ingredient
                    </label>
                    <select
                      value={wasteIngredientId}
                      onChange={e => {
                        setWasteIngredientId(e.target.value);
                        setWasteErrorMessage(null);
                      }}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-white/20 dark:bg-white/5"
                    >
                      {ingredients.map(i => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.onHandStock.toLocaleString()} {i.unit} in stock)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[color:var(--text-secondary)]">
                      Purged Quantity ({ingredientMap.get(wasteIngredientId)?.unit})
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={wasteQty}
                      onChange={e => {
                        setWasteQty(parseFloat(e.target.value) || 0);
                        setWasteErrorMessage(null);
                      }}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 p-2 text-sm font-mono font-bold dark:border-white/20 dark:bg-white/5"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[color:var(--text-secondary)]">
                      Operational Cause
                    </label>
                    <select
                      value={wasteReason}
                      onChange={e => setWasteReason(e.target.value as WasteEntry['reason'])}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-white/20 dark:bg-white/5"
                    >
                      <option value="Morning Grinder Dial-in Calibration">Morning Grinder Dial-in Calibration</option>
                      <option value="Steam Pitcher Purge Residue">Steam Pitcher Purge Residue</option>
                      <option value="Bake-off Spoilage / Over-browning">Bake-off Spoilage / Over-browning</option>
                      <option value="Packaging Damage">Packaging Damage</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsLoggingWaste(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-[color:var(--text-secondary)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogWaste}
                    className="rounded-xl bg-[#181511] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#8d6035] dark:bg-white dark:text-[#181511]"
                  >
                    Confirm & Deduct Stock
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: THEORETICAL VS ACTUAL (TvA) AUDIT RECONCILIATION                   */}
      {/* ========================================================================= */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-[#181511] dark:text-white">
                Theoretical vs. Actual (TvA) Stock Reconciliation
              </h3>
              <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
                Formula: Theoretical Closing Stock = (Opening + Receipts) - POS Depletion - Authorized Waste.
              </p>
            </div>

            <div className="rounded-2xl border border-[#c7964c]/30 bg-[#c7964c]/10 px-4 py-2 text-xs font-bold text-[#8d6035] dark:text-[#f4c98b]">
              Continuous Inventory Telemetry
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[color:var(--line-soft)] bg-white/70 shadow-sm backdrop-blur-md dark:bg-white/5">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[color:var(--line-soft)] bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-secondary)] dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3.5">Raw Material</th>
                  <th className="px-3 py-3.5">Opening + Receipts</th>
                  <th className="px-3 py-3.5">POS Usage</th>
                  <th className="px-3 py-3.5">Authorized Waste</th>
                  <th className="px-3 py-3.5">Theoretical Closing</th>
                  <th className="px-3 py-3.5">Physical Weekly Count</th>
                  <th className="px-3 py-3.5">Unreconciled Variance</th>
                  <th className="px-3 py-3.5">Residual Loss</th>
                  <th className="px-4 py-3.5">Diagnostic Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--line-soft)]">
                {ingredients.map(ing => {
                  const totalAvailable = ing.openingStock + ing.receivedStock;
                  const varianceUnits = ing.physicalCount - ing.onHandStock;
                  const varianceValue = varianceUnits * ing.unitCost;

                  let diagnosis = 'Reconciled';
                  let diagnosisType: 'neutral' | 'portion' | 'waste' | 'till' = 'neutral';

                  if (varianceUnits < 0) {
                    if (ing.category === 'Coffee Beans') {
                      diagnosis = 'Grinder Dosing Drift (Baristas throwing ~19.5g vs 18g recipe spec)';
                      diagnosisType = 'portion';
                    } else if (ing.category === 'Dairy & Plant Milk') {
                      diagnosis = 'Unrecorded Steam Residue / Remake Purges';
                      diagnosisType = 'waste';
                    } else if (ing.category === 'Bakery & Food') {
                      diagnosis = 'Dropped / Broken Pastries without Waste Ticket';
                      diagnosisType = 'waste';
                    } else if (ing.category === 'Packaging') {
                      diagnosis = 'Damaged Sleeves & Spilled Cup Re-cupping';
                      diagnosisType = 'waste';
                    } else {
                      diagnosis = 'Unrecorded Staff Drinks / Till Bypass';
                      diagnosisType = 'till';
                    }
                  } else if (varianceUnits > 0) {
                    diagnosis = 'Under-portioning / Customer Short-dosing';
                    diagnosisType = 'portion';
                  }

                  return (
                    <tr key={ing.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                      <td className="px-4 py-3 font-bold text-[#181511] dark:text-white">
                        {ing.name}
                        <span className="block text-[10px] font-normal text-[color:var(--text-secondary)]">
                          {ing.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-[color:var(--text-secondary)]">
                        {totalAvailable.toLocaleString()} {ing.unit}
                      </td>
                      <td className="px-3 py-3 font-mono text-[color:var(--text-secondary)]">
                        {ing.posDepleted.toLocaleString()} {ing.unit}
                      </td>
                      <td className="px-3 py-3 font-mono text-[#d9381e]">
                        {ing.wasteDepleted.toLocaleString()} {ing.unit}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-[#181511] dark:text-white">
                        {ing.onHandStock.toLocaleString()} {ing.unit}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={ing.physicalCount}
                            onChange={e => updatePhysicalCount(ing.id, parseFloat(e.target.value))}
                            className="w-24 rounded-lg border border-slate-300 px-2 py-1 font-mono text-xs font-bold dark:border-white/20 dark:bg-white/5"
                          />
                          <span className="text-[11px] text-[color:var(--text-secondary)]">{ing.unit}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono font-bold">
                        <span className={varianceUnits < 0 ? 'text-[#d9381e]' : varianceUnits > 0 ? 'text-[#c7964c]' : 'text-[#107c41]'}>
                          {varianceUnits > 0 ? `+${varianceUnits.toLocaleString()}` : varianceUnits.toLocaleString()} {ing.unit}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono font-bold">
                        <span className={varianceValue < 0 ? 'text-[#d9381e]' : varianceValue > 0 ? 'text-[#c7964c]' : 'text-[#107c41]'}>
                          {varianceValue < 0 ? `-${CURRENCY} ${Math.abs(varianceValue).toFixed(2)}` : varianceValue > 0 ? `+${CURRENCY} ${varianceValue.toFixed(2)}` : `${CURRENCY} 0.00`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-medium ${
                          diagnosisType === 'portion'
                            ? 'bg-[#c7964c]/15 text-[#8d6035] dark:text-[#f4c98b]'
                            : diagnosisType === 'waste'
                            ? 'bg-[#d9381e]/15 text-[#d9381e]'
                            : diagnosisType === 'till'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        }`}>
                          {diagnosis}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t border-[color:var(--line-soft)] bg-slate-50 font-bold dark:bg-white/5">
                {(() => {
                  const totalResidualVariance = ingredients.reduce((sum, ing) => {
                    const variance = ing.physicalCount - ing.onHandStock;
                    return sum + (variance * ing.unitCost);
                  }, 0);

                  return (
                    <tr>
                      <td colSpan={7} className="px-4 py-3.5 text-right uppercase tracking-wider text-[color:var(--text-secondary)]">
                        Net Unreconciled Residual Variance Exposure (Shrinkage)
                      </td>
                      <td colSpan={2} className="px-3 py-3.5 font-mono text-sm font-black text-[#d9381e]">
                        {totalResidualVariance < 0 ? `-${CURRENCY} ${Math.abs(totalResidualVariance).toFixed(2)}` : `+${CURRENCY} ${totalResidualVariance.toFixed(2)}`}
                      </td>
                    </tr>
                  );
                })()}
              </tfoot>
            </table>
          </div>

          {/* Operational Reality Analysis Panels */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-[color:var(--line-soft)] bg-white/70 p-6 shadow-sm backdrop-blur-md dark:bg-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#181511] dark:text-white">
                Physical Reality vs. Automated Telemetry
              </h4>
              <p className="mt-3 text-xs leading-relaxed text-[color:var(--text-secondary)]">
                A POS system registers a pure, mathematical world: whenever a Flat White is sold, exactly 18g of beans and 160ml of milk are deducted. In the trench, physical grinders heat up during morning rushes, coarsening grind size and increasing dose weight to 20.2g without the barista noticing. Steaming pitchers are routinely purged and leftover foam is dumped down the drain. Automated code cannot solve physical steam residue; only volumetric scale dosing and pitcher rinsers can bridge this gap.
              </p>
            </div>

            <div className="rounded-3xl border border-[color:var(--line-soft)] bg-white/70 p-6 shadow-sm backdrop-blur-md dark:bg-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#181511] dark:text-white">
                Frontline Incentives vs. Executive Oversight
              </h4>
              <p className="mt-3 text-xs leading-relaxed text-[color:var(--text-secondary)]">
                When leadership sees unrecorded food cost leakage, it suspects theft or lax control. To the frontline barista during a 100-person morning rush, bypassing the till for a VIP regular or remake is a pragmatic coping mechanism to maintain queue throughput and customer satisfaction scores. Mandating double-signature waste logs during rush hour merely creates compliance theater—baristas falsify the log at end-of-day.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { formatPrice } from '@/lib/formatCurrency';

interface ShopFiltersProps {
  categories: Array<{ id: string; slug: string; name: string }> | undefined;
  selectedCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice: number;
  sortBy: 'newest' | 'price-asc' | 'price-desc';
  onSortChange: (sort: 'newest' | 'price-asc' | 'price-desc') => void;
  onClearAll: () => void;
  activeFiltersCount: number;
}

export function ShopFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  maxPrice,
  sortBy,
  onSortChange,
  onClearAll,
  activeFiltersCount,
}: ShopFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground block mb-3">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'glass-gold' : 'glass'}
            size="sm"
            onClick={() => onCategoryChange(null)}
          >
            All
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? 'glass-gold' : 'glass'}
              size="sm"
              onClick={() => onCategoryChange(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground block mb-3">
          Price Range
        </label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
            min={0}
            max={maxPrice}
            step={100}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground block mb-3">
          Sort By
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={sortBy === 'newest' ? 'glass-gold' : 'glass'}
            size="sm"
            onClick={() => onSortChange('newest')}
          >
            Newest
          </Button>
          <Button
            variant={sortBy === 'price-asc' ? 'glass-gold' : 'glass'}
            size="sm"
            onClick={() => onSortChange('price-asc')}
          >
            Price: Low to High
          </Button>
          <Button
            variant={sortBy === 'price-desc' ? 'glass-gold' : 'glass'}
            size="sm"
            onClick={() => onSortChange('price-desc')}
          >
            Price: High to Low
          </Button>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="ghost" className="w-full" onClick={onClearAll}>
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Trigger */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="glass" className="w-full flex items-center justify-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters & Sort
              {activeFiltersCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px]">
            <SheetHeader>
              <SheetTitle className="font-display text-2xl">Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>
    </>
  );
}

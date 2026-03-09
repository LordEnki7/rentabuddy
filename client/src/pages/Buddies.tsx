import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Filter, User, ShieldCheck, BadgeCheck, ScanEye, Users, X } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLocation } from "wouter";

const ACTIVITIES = ["Hiking", "Coffee", "Museums", "Events", "Gaming", "Travel", "Sports", "Dining", "Movies", "Shopping"];
const RATING_OPTIONS = [
  { value: "0", label: "Any Rating" },
  { value: "3", label: "3+ Stars" },
  { value: "3.5", label: "3.5+ Stars" },
  { value: "4", label: "4+ Stars" },
  { value: "4.5", label: "4.5+ Stars" },
];
const SORT_OPTIONS = [
  { value: "default", label: "Recommended" },
  { value: "rating-desc", label: "Highest Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default function Buddies() {
  const [, setLocation] = useLocation();
  const [priceRange, setPriceRange] = useState([100]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState("0");
  const [sortBy, setSortBy] = useState("default");

  const filters = useMemo(() => ({
    city: searchQuery || undefined,
    maxRate: priceRange[0],
    activities: selectedActivities.length > 0 ? selectedActivities : undefined,
    minRating: parseFloat(minRating) > 0 ? parseFloat(minRating) : undefined,
  }), [searchQuery, priceRange, selectedActivities, minRating]);

  const { data, isLoading } = useQuery({
    queryKey: ["buddies", filters],
    queryFn: () => api.getBuddies(filters),
  });

  const toggleActivity = useCallback((activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setPriceRange([100]);
    setSelectedActivities([]);
    setMinRating("0");
    setSortBy("default");
  }, []);

  const hasActiveFilters = searchQuery || priceRange[0] < 100 || selectedActivities.length > 0 || minRating !== "0";

  const sortedBuddies = useMemo(() => {
    const buddies = data?.buddies || [];
    const sorted = [...buddies];
    switch (sortBy) {
      case "rating-desc":
        sorted.sort((a: any, b: any) => (parseFloat(b.ratingAverage) || 0) - (parseFloat(a.ratingAverage) || 0));
        break;
      case "price-asc":
        sorted.sort((a: any, b: any) => (parseFloat(a.hourlyRate) || 0) - (parseFloat(b.hourlyRate) || 0));
        break;
      case "price-desc":
        sorted.sort((a: any, b: any) => (parseFloat(b.hourlyRate) || 0) - (parseFloat(a.hourlyRate) || 0));
        break;
    }
    return sorted;
  }, [data?.buddies, sortBy]);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-semibold mb-4">Hourly Rate</h3>
        <Slider
          value={priceRange}
          max={100}
          min={10}
          step={5}
          className="mb-2"
          onValueChange={setPriceRange}
          data-testid="slider-price-range"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>$10</span>
          <span>Up to ${priceRange[0]}/hr</span>
        </div>
      </div>

      <div>
        <h3 className="font-heading font-semibold mb-3">Minimum Rating</h3>
        <Select value={minRating} onValueChange={setMinRating}>
          <SelectTrigger data-testid="select-min-rating">
            <SelectValue placeholder="Any Rating" />
          </SelectTrigger>
          <SelectContent>
            {RATING_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value} data-testid={`option-rating-${opt.value}`}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <h3 className="font-heading font-semibold mb-2">Activities</h3>
        {ACTIVITIES.map((tag) => (
          <div key={tag} className="flex items-center space-x-2">
            <Checkbox
              id={`filter-${tag}`}
              checked={selectedActivities.includes(tag)}
              onCheckedChange={() => toggleActivity(tag)}
              data-testid={`checkbox-activity-${tag.toLowerCase()}`}
            />
            <Label htmlFor={`filter-${tag}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {tag}
            </Label>
          </div>
        ))}
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" className="w-full text-muted-foreground" onClick={clearFilters} data-testid="button-clear-filters">
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 md:py-12 mb-16 md:mb-0">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2 md:mb-4">Find a Buddy</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            Browse our community of verified companions. Filter by location, interests, and rate.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by city..."
              className="pl-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-city"
            />
          </div>

          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="shrink-0 lg:hidden relative" data-testid="button-open-filters">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Narrow down your buddy search.</SheetDescription>
              </SheetHeader>
              <FilterContent />
              <Button className="w-full mt-8" onClick={() => setIsFilterOpen(false)} data-testid="button-show-results">Show Results</Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block lg:col-span-1 space-y-8">
          <Card className="border-none shadow-none bg-transparent p-0">
            <FilterContent />
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground" data-testid="text-results-count">
              {isLoading ? "Searching..." : `${sortedBuddies.length} buddy${sortedBuddies.length !== 1 ? "ies" : ""} found`}
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} data-testid={`option-sort-${opt.value}`}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedActivities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedActivities.map(a => (
                <Badge
                  key={a}
                  variant="secondary"
                  className="cursor-pointer gap-1"
                  onClick={() => toggleActivity(a)}
                  data-testid={`badge-active-filter-${a.toLowerCase()}`}
                >
                  {a}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground" data-testid="text-loading">Loading buddies...</p>
              </div>
            </div>
          ) : sortedBuddies.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 text-center" data-testid="empty-state">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">No buddies found</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {hasActiveFilters
                  ? "Try adjusting your filters or search criteria to find more buddies."
                  : "There are no buddies available at the moment. Check back soon!"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters-empty">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {sortedBuddies.map((buddy: any) => (
                <Card key={buddy.id} className="overflow-hidden hover:shadow-lg transition-shadow border-border/50 group" data-testid={`card-buddy-${buddy.id}`}>
                  <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                    {buddy.profileImage ? (
                      <img
                        src={buddy.profileImage}
                        alt={buddy.user.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-coral-100">
                        <User className="h-24 w-24 text-teal-600/30" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      ${buddy.hourlyRate || "N/A"}/hr
                    </div>
                    <div className="absolute bottom-3 left-3 flex gap-1.5">
                      {buddy.identityVerified && (
                        <div className="bg-blue-600/90 backdrop-blur-sm text-white px-2 py-1 rounded flex items-center gap-1 text-xs font-medium shadow-sm" data-testid={`badge-identity-${buddy.id}`}>
                          <ScanEye className="h-3 w-3" />
                          ID Verified
                        </div>
                      )}
                      {buddy.backgroundCheckPassed && (
                        <div className="bg-green-600/90 backdrop-blur-sm text-white px-2 py-1 rounded flex items-center gap-1 text-xs font-medium shadow-sm" data-testid={`badge-background-${buddy.id}`}>
                          <ShieldCheck className="h-3 w-3" />
                          BG Check
                        </div>
                      )}
                      {buddy.isCertified && (
                        <div className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-2 py-1 rounded flex items-center gap-1 text-xs font-medium shadow-sm" data-testid={`badge-certified-${buddy.id}`}>
                          <BadgeCheck className="h-3 w-3" />
                          Certified
                        </div>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-heading font-bold text-lg" data-testid={`text-buddy-name-${buddy.id}`}>
                        {buddy.user.name}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-500 text-sm font-bold" data-testid={`text-buddy-rating-${buddy.id}`}>
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>{parseFloat(buddy.ratingAverage) > 0 ? parseFloat(buddy.ratingAverage).toFixed(1) : "New"}</span>
                        {buddy.ratingCount > 0 && (
                          <span className="text-muted-foreground font-normal text-xs">({buddy.ratingCount})</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                      <MapPin className="h-3.5 w-3.5" />
                      {buddy.city || "Location not specified"}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {buddy.bio || buddy.headline || "No bio available"}
                    </p>

                    {buddy.activities && buddy.activities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {buddy.activities.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="font-normal text-xs bg-secondary/10 text-secondary-foreground hover:bg-secondary/20">
                            {tag}
                          </Badge>
                        ))}
                        {buddy.activities.length > 3 && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            +{buddy.activities.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-5 pt-0">
                    <Button
                      onClick={() => setLocation(`/buddy/${buddy.userId}`)}
                      className="w-full font-semibold rounded-xl"
                      data-testid={`button-view-profile-${buddy.id}`}
                    >
                      View Profile
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Star, Filter } from "lucide-react";
import { MOCK_BUDDIES } from "@/lib/mockData";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export default function Buddies() {
  const [priceRange, setPriceRange] = useState([100]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-semibold mb-4">Hourly Rate</h3>
        <Slider 
          defaultValue={[60]} 
          max={100} 
          step={5} 
          className="mb-2"
          onValueChange={setPriceRange}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>$20</span>
          <span>${priceRange[0]}+</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="font-heading font-semibold mb-2">Activities</h3>
        {["Hiking", "Coffee", "Museums", "Events", "Gaming", "Travel"].map((tag) => (
          <div key={tag} className="flex items-center space-x-2">
            <Checkbox id={`filter-${tag}`} />
            <Label htmlFor={`filter-${tag}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {tag}
            </Label>
          </div>
        ))}
      </div>

      <div className="space-y-3">
         <h3 className="font-heading font-semibold mb-2">Gender Preference</h3>
         {["Male", "Female", "Non-binary", "No Preference"].map((g) => (
          <div key={g} className="flex items-center space-x-2">
            <Checkbox id={`filter-${g}`} />
            <Label htmlFor={`filter-${g}`} className="text-sm font-medium leading-none">
              {g}
            </Label>
          </div>
        ))}
      </div>
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
            <Input placeholder="Search by city or interest..." className="pl-10 bg-white" />
          </div>
          
          {/* Mobile Filter Trigger */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="shrink-0 lg:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Narrow down your buddy search.</SheetDescription>
              </SheetHeader>
              <FilterContent />
              <Button className="w-full mt-8" onClick={() => setIsFilterOpen(false)}>Show Results</Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1 space-y-8">
          <Card className="border-none shadow-none bg-transparent p-0">
            <FilterContent />
          </Card>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {MOCK_BUDDIES.map((buddy) => (
              <Card key={buddy.id} className="overflow-hidden hover:shadow-lg transition-shadow border-border/50 group">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img 
                    src={buddy.image} 
                    alt={buddy.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    ${buddy.rate}/hr
                  </div>
                  {buddy.verified && (
                    <div className="absolute bottom-3 left-3 bg-primary/90 backdrop-blur-sm text-primary-foreground px-2 py-1 rounded flex items-center gap-1 text-xs font-medium shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      Verified
                    </div>
                  )}
                </div>
                
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-heading font-bold text-lg">{buddy.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{buddy.rating}</span>
                      <span className="text-muted-foreground font-normal text-xs">({buddy.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                    <MapPin className="h-3.5 w-3.5" />
                    {buddy.city}
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {buddy.bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {buddy.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="font-normal text-xs bg-secondary/10 text-secondary-foreground hover:bg-secondary/20">
                        {tag}
                      </Badge>
                    ))}
                    {buddy.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        +{buddy.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="p-5 pt-0">
                  <Button className="w-full font-semibold rounded-xl">View Profile</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

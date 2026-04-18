import {
  Car,
  Bike,
  Building2,
  Smartphone,
  Monitor,
  Gamepad2,
  Home,
  Shirt,
  Gem,
  Sparkles,
  Baby,
  Briefcase,
  Leaf,
  PawPrint,
  Laptop,
  Package,
  Watch,
  Cpu,
  Mouse,
  Headphones,
  Camera,
  Tv,
  Sofa,
  Lightbulb,
  Microwave,
  ChefHat,
  Footprints,
  Diamond,
  Heart,
  SprayCan,
  Scissors,
  ToyBrick,
  Wrench,
  Code,
  Apple,
  Dog,
  Cat,
  Fish,
  Bird,
  Rabbit,
  Store,
  Truck,
} from 'lucide-react';

export const iconMap: Record<string, React.ElementType> = {
  // Level 1 Categories
  'Mobility': Car,
  'Real Estate': Building2,
  'Mobile Devices': Smartphone,
  'Computing & Electronics': Monitor,
  'Games': Gamepad2,
  'Home & Living': Home,
  'Fashion & Style': Shirt,
  'Jewelry': Gem,
  'Beauty & Personal Care': Sparkles,
  'Baby & Kids': Baby,
  'Services': Briefcase,
  'Food & Agriculture': Leaf,
  'Pets & Animals': PawPrint,

  // Level 2 - Mobility
  'Cars': Car,
  'Motorbikes': Bike,
  'Bicycles': Bike,

  // Level 2 - Real Estate
  'Rentals': Home,
  'Properties for Sale': Building2,
  'Houses': Home,
  'Apartments': Building2,
  'Hostels': Building2,
  'Offices': Building2,
  'Shops': Store,
  'Buildings': Building2,

  // Level 2 - Mobile Devices
  'Smartphones': Smartphone,
  'Tablets': Smartphone,
  'Mobile Accessories': Package,
  'Smartwatches': Watch,

  // Level 2 - Computing & Electronics
  'Laptops': Laptop,
  'Desktop Computers': Monitor,
  'Monitors': Monitor,
  'Computer Components': Cpu,
  'Computer Accessories': Mouse,
  'System Units': Cpu,
  'Televisions': Tv,
  'Audio Equipment': Headphones,
  'Headphones': Headphones,
  'Cameras': Camera,

  // Level 2 - Games
  'Video Games': Gamepad2,
  'Consoles & Controllers': Gamepad2,
  'Board & Card Games': Gamepad2,

  // Level 2 - Home & Living
  'Furniture': Sofa,
  'Lighting': Lightbulb,
  'Appliances': Microwave,
  'Cookware': ChefHat,
  'Kitchen Appliances': Microwave,
  'Home Appliances': Tv,

  // Level 2 - Fashion & Style
  'Men': Shirt,
  'Women': Shirt,
  'Kids': Baby,
  'Babies': Baby,
  'Clothing': Shirt,
  'Footwear': Footprints,
  'Accessories': Watch,

  // Level 2 - Jewelry
  'Rings & Earrings': Diamond,
  'Watches': Watch,
  'Necklaces': Heart,
  'Bracelets': Heart,
  'Bracelets & Bangles': Heart,
  'Cufflinks': Gem,
  'Beads': Heart,
  'Anklets': Footprints,

  // Level 2 - Beauty & Personal Care
  'Hair & Oral Care': Scissors,
  'Skincare': Sparkles,
  'Fragrances': SprayCan,
  'Makeup': SprayCan,
  'Intimate Wellness': Heart,
  'Beauty Accessories': Scissors,

  // Level 2 - Baby & Kids
  'Fashion': Baby,
  'Games & Toys': ToyBrick,
  'Baby Food & Nutrition': Baby,
  'Baby Accessories': Baby,
  'Playground & Outdoor': ToyBrick,

  // Level 2 - Services
  'Home Services': Wrench,
  'Tech Services': Code,
  'Repair & Maintenance': Wrench,
  'Other Services': Briefcase,

  // Level 2 - Food & Agriculture
  'Preserved Food': Package,
  'Fresh Food': Apple,
  'Farm Produce': Leaf,
  'Agricultural Supplies': Truck,

  // Level 2 - Pets & Animals
  'Pet Accessories': PawPrint,
  'Pet Food & Feed': Package,
  'Cats': Cat,
  'Dogs': Dog,
  'Fish': Fish,
  'Birds': Bird,
  'Rabbits': Rabbit,
  'Other Animals': PawPrint,
};

// Fallback icon for categories not found
export const getCategoryIcon = (categoryName: string): React.ElementType => {
  return iconMap[categoryName] || Package;
};

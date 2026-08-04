import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Platform, Dimensions, StatusBar } from 'react-native';
import { Theme } from '../theme';
import { CircleUserRound, Camera, Home, Package, Heart, ShoppingBasket } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { pantryService } from '../services/api';
const {
  width
} = Dimensions.get('window');
const INGREDIENT_DATA = [{
  id: 'veg',
  title: 'Vegetables & Greens',
  icon: '�',
  total: 100,
  more: 0,
  items: ['spinach', 'lettuce', 'romaine lettuce', 'iceberg lettuce', 'kale', 'cabbage', 'red cabbage', 'bok choy', 'pak choi', 'amaranth leaves', 'methi leaves', 'coriander leaves', 'mint leaves', 'curry leaves', 'drumstick leaves', 'mustard greens', 'collard greens', 'swiss chard', 'watercress', 'arugula', 'spring onion', 'leek', 'celery', 'broccoli', 'cauliflower', 'brussels sprouts', 'green beans', 'cluster beans', 'broad beans', 'yardlong beans', 'peas', 'snow peas', 'sweet corn', 'baby corn', 'carrot', 'beetroot', 'radish', 'white radish', 'turnip', 'potato', 'sweet potato', 'yam', 'taro root', 'cassava', 'onion', 'red onion', 'white onion', 'shallots', 'garlic', 'ginger', 'tomato', 'cherry tomato', 'green tomato', 'brinjal', 'eggplant', 'zucchini', 'yellow squash', 'bottle gourd', 'ridge gourd', 'snake gourd', 'bitter gourd', 'ash gourd', 'ivy gourd', 'pointed gourd', 'pumpkin', 'cucumber', 'capsicum', 'green bell pepper', 'red bell pepper', 'yellow bell pepper', 'green chilli', 'red chilli', 'jalapeno', 'okra', 'drumstick', 'banana flower', 'banana stem', 'plantain', 'raw banana', 'lotus root', 'artichoke', 'asparagus', 'fennel bulb', 'kohlrabi', 'chayote', 'rhubarb', 'sprouts', 'bean sprouts', 'alfalfa sprouts', 'microgreens', 'seaweed', 'nori', 'kelp', 'edamame', 'avocado', 'olives', 'green papaya', 'raw mango', 'jackfruit raw', 'bamboo shoots', 'sorrel leaves']
}, {
  id: 'mush',
  title: 'Mushrooms',
  icon: '🍄',
  total: 36,
  more: 0,
  items: ['button mushroom', 'portobello mushroom', 'shiitake mushroom', 'porcini', 'wild mushroom', 'mixed mushrooms', 'oyster mushroom', 'chestnut mushroom', 'enoki mushroom', 'black fungus', 'morel mushrooms', 'black truffle', 'shimeji mushroom', 'field mushroom', 'straw mushroom', 'king oyster mushroom', 'chanterelle mushroom', 'wood ear mushroom', 'cremini mushroom', 'beech mushroom', 'lion mane mushroom', 'maitake mushroom', 'reishi mushroom', 'matsutake mushroom', 'white truffle', 'brown mushroom', 'snow mushroom', 'hedgehog mushroom', 'paddy straw mushroom', 'caesar mushroom', 'milk cap mushroom', 'witch hat mushroom', 'parasol mushroom', 'almond mushroom', 'clamshell mushroom', 'ink cap mushroom']
}, {
  id: 'fruit',
  title: 'Fruits',
  icon: '🍎',
  total: 100,
  more: 0,
  items: ['apple', 'green apple', 'red apple', 'banana', 'orange', 'sweet lime', 'lemon', 'lime', 'mango', 'raw mango fruit', 'papaya', 'pineapple', 'watermelon', 'muskmelon', 'cantaloupe', 'grapes', 'black grapes', 'green grapes', 'pomegranate', 'guava', 'pear', 'peach', 'plum', 'apricot', 'nectarine', 'kiwi', 'dragon fruit', 'passion fruit', 'lychee', 'longan', 'rambutan', 'custard apple', 'soursop', 'jackfruit ripe', 'fig', 'dates', 'black dates', 'raisins', 'prunes', 'cranberry fruit', 'strawberry', 'blueberry', 'raspberry', 'blackberry', 'mulberry', 'gooseberry', 'amla', 'cherry', 'sour cherry', 'avocado fruit', 'coconut', 'tender coconut', 'sapodilla', 'chikoo', 'star fruit', 'wood apple', 'bael fruit', 'jamun', 'java plum', 'tamarind fruit', 'persimmon', 'dried persimmon', 'durian', 'mangosteen', 'breadfruit', 'pomelo', 'grapefruit', 'mandarin', 'tangerine', 'blood orange', 'bitter orange', 'fig leaves', 'plantain fruit', 'red banana', 'hill banana', 'ice apple', 'palmyra fruit', 'rose apple', 'water apple', 'wax apple', 'feijoa', 'physalis', 'cape gooseberry', 'crabapple', 'quince', 'jujube', 'ber fruit', 'dried orange slice', 'freeze dried pineapple', 'freeze dried strawberry', 'freeze dried raspberry', 'freeze dried blueberry', 'acai berry', 'goji berry', 'elderberry', 'blackcurrant', 'cloudberry', 'haskap berry', 'loganberry', 'pluot']
}, {
  id: 'seasoning',
  title: 'Seasonings & Spice Blends',
  icon: '🧂',
  total: 100,
  more: 0,
  items: ['salt', 'sea salt', 'rock salt', 'black salt', 'pink salt', 'black pepper', 'white pepper', 'red chilli powder', 'kashmiri chilli powder', 'paprika', 'smoked paprika', 'turmeric powder', 'cumin seeds', 'cumin powder', 'coriander seeds', 'coriander powder', 'mustard seeds', 'fenugreek seeds', 'fennel seeds', 'carom seeds', 'nigella seeds', 'sesame seeds', 'poppy seeds', 'cardamom', 'black cardamom', 'cloves', 'cinnamon stick', 'cinnamon powder', 'bay leaf', 'star anise', 'nutmeg', 'mace', 'saffron', 'asafoetida', 'garam masala', 'sambar powder', 'rasam powder', 'chole masala', 'pav bhaji masala', 'biryani masala', 'tandoori masala', 'chaat masala', 'kitchen king masala', 'curry powder', 'madras curry powder', 'peri peri seasoning', 'italian seasoning', 'mixed herbs', 'oregano', 'thyme', 'rosemary', 'basil dried', 'parsley dried', 'dill weed', 'sage', 'marjoram', 'tarragon', 'lemongrass powder', 'kaffir lime powder', 'galangal powder', 'ginger powder', 'garlic powder', 'onion powder', 'celery salt', 'lemon pepper', 'cajun seasoning', 'creole seasoning', 'mexican seasoning', 'taco seasoning', 'fajita seasoning', 'bbq rub', 'steak seasoning', 'pizza seasoning', 'ranch seasoning', 'zaatar', 'sumac', 'dukkah', 'berbere', 'harissa powder', 'ras el hanout', 'chinese five spice', 'sichuan pepper', 'wasabi powder', 'furikake', 'shichimi togarashi', 'gochugaru', 'thai seasoning', 'vindaloo masala', 'chettinad masala', 'kolhapuri masala', 'malvani masala', 'godha masala', 'pickle masala', 'panch phoron', 'moringa powder', 'dry mango powder', 'anardana powder', 'kasuri methi', 'edible camphor', 'vanilla salt']
}, {
  id: 'baking',
  title: 'Baking Ingredients',
  icon: '🍰',
  total: 100,
  more: 0,
  items: ['all purpose flour', 'cake flour', 'bread flour', 'whole wheat flour', 'self rising flour', 'almond flour', 'coconut flour', 'rice flour', 'corn flour', 'cornstarch', 'potato starch', 'tapioca starch', 'arrowroot powder', 'oat flour', 'buckwheat flour', 'rye flour', 'semolina flour', 'gram flour', 'millet flour', 'sorghum flour', 'baking powder', 'baking soda', 'active dry yeast', 'instant yeast', 'fresh yeast', 'sourdough starter', 'cream of tartar', 'gelatin powder', 'agar agar', 'pectin', 'caster sugar', 'granulated sugar', 'brown sugar', 'powdered sugar', 'icing sugar', 'demerara sugar', 'molasses sugar', 'coconut sugar', 'jaggery powder', 'palm sugar', 'honey baking', 'maple syrup baking', 'corn syrup', 'golden syrup', 'molasses', 'treacle', 'vanilla extract', 'vanilla bean paste', 'almond extract', 'lemon extract', 'orange extract', 'rose essence', 'butterscotch essence', 'cocoa powder', 'dark cocoa powder', 'chocolate chips', 'white chocolate chips', 'dark chocolate chunks', 'milk chocolate chunks', 'compound chocolate', 'baking chocolate', 'candied fruit', 'tutti frutti', 'raisins baking', 'dried cranberries baking', 'desiccated coconut', 'shredded coconut', 'chopped almonds', 'chopped walnuts', 'chopped pecans', 'hazelnut meal', 'pistachio powder', 'cashew powder', 'sunflower seeds baking', 'pumpkin seeds baking', 'chia seeds baking', 'flaxseed meal', 'poppy seeds baking', 'sesame seeds baking', 'sprinkles', 'colored sugar', 'edible glitter', 'fondant', 'gum paste', 'marzipan', 'cake gel', 'whipping cream powder', 'custard powder', 'milk powder', 'buttermilk powder', 'egg replacer', 'meringue powder', 'pastry cream mix', 'bread improver', 'dough conditioner', 'glucose syrup', 'invert sugar', 'caramel color', 'food coloring', 'edible wafer paper']
}, {
  id: 'doughs',
  title: 'Pre-made Doughs & Wrappers',
  icon: '🥟',
  total: 50,
  more: 0,
  items: ['pizza dough', 'whole wheat pizza dough', 'thin crust pizza base', 'naan dough', 'roti dough', 'chapati dough', 'paratha dough', 'puri dough', 'bhatura dough', 'kulcha dough', 'puff pastry sheet', 'shortcrust pastry', 'filo pastry', 'spring roll wrapper', 'wonton wrapper', 'dumpling wrapper', 'momos wrapper', 'samosa sheet', 'empanada dough', 'tortilla wrap', 'corn tortilla', 'flour tortilla', 'lasagna sheet fresh', 'fresh pasta sheet', 'gnocchi dough', 'pie crust', 'tart shell', 'croissant dough', 'brioche dough', 'pretzel dough', 'bagel dough', 'bread dough', 'sourdough dough', 'burger bun dough', 'hot dog bun dough', 'pita bread dough', 'lavash sheet', 'rice paper wrapper', 'kathi roll wrap', 'crepe batter', 'dosa batter', 'idli batter', 'appam batter', 'uttapam batter', 'pesarattu batter', 'adai batter', 'pancake batter', 'waffle batter', 'cookie dough', 'phyllo cups']
}, {
  id: 'grains',
  title: 'Grains & Cereals',
  icon: '🌾',
  total: 100,
  more: 0,
  items: ['white rice', 'basmati rice', 'sona masoori rice', 'brown rice', 'red rice', 'black rice', 'jasmine rice', 'sushi rice', 'sticky rice', 'wild rice', 'poha', 'flattened rice', 'puffed rice', 'rice flakes', 'rice vermicelli', 'wheat berries', 'bulgur wheat', 'broken wheat', 'dalia', 'semolina', 'rava', 'sooji', 'couscous', 'pearl couscous', 'quinoa', 'red quinoa', 'black quinoa', 'oats', 'rolled oats', 'steel cut oats', 'instant oats', 'oat bran', 'barley', 'pearl barley', 'foxtail millet', 'finger millet', 'ragi', 'little millet', 'kodo millet', 'barnyard millet', 'proso millet', 'pearl millet', 'bajra', 'sorghum', 'jowar', 'corn kernels dried', 'maize grits', 'cornmeal', 'polenta', 'popcorn kernels', 'amaranth grain', 'buckwheat groats', 'teff', 'spelt grain', 'farro', 'freekeh', 'rye berries', 'triticale', 'kamut', 'einkorn', 'muesli', 'granola', 'corn flakes', 'wheat flakes', 'ragi flakes', 'bran flakes', 'rice cereal', 'choco cereal', 'multigrain cereal', 'oat cereal', 'cream of wheat', 'cream of rice', 'idli rice', 'matta rice', 'ponni rice', 'kolam rice', 'arborio rice', 'risotto rice', 'paella rice', 'calrose rice', 'black barley', 'green wheat', 'hand pounded rice', 'bamboo rice', 'red poha', 'thin poha', 'thick poha', 'sabudana', 'tapioca pearls', 'makhana', 'lotus seeds', 'water chestnut flour grain', 'singhara atta', 'rajgira grain', 'quinoa flakes', 'millet flakes', 'wheat bran', 'rice bran', 'corn flakes plain', 'multigrain mix']
}, {
  id: 'legumes',
  title: 'Legumes',
  icon: '�',
  total: 71,
  more: 0,
  items: ['chickpeas', 'kabuli chana', 'black chickpeas', 'green chickpeas', 'chana dal', 'toor dal', 'arhar dal', 'moong dal', 'whole green gram', 'split green gram', 'urad dal', 'whole black gram', 'masoor dal', 'red lentils', 'brown lentils', 'green lentils', 'yellow lentils', 'black lentils', 'beluga lentils', 'puy lentils', 'kidney beans', 'rajma', 'black beans', 'pinto beans', 'navy beans', 'cannellini beans', 'great northern beans', 'lima beans', 'butter beans', 'fava beans', 'broad beans dried', 'adzuki beans', 'moth beans', 'matki', 'horse gram', 'kulthi', 'cowpeas', 'black eyed peas', 'lobia', 'white peas', 'green peas dried', 'yellow split peas', 'soybeans', 'edamame beans', 'soy chunks', 'soy granules', 'tofu beans', 'tempeh beans', 'peanuts', 'groundnuts', 'roasted chana', 'fried gram', 'sattu', 'besan legumes', 'sprouted moong', 'sprouted chana', 'sprouted matki', 'mung bean sprouts', 'lentil sprouts', 'mixed sprouts', 'pigeon peas whole', 'field beans', 'avarekalu', 'hyacinth beans', 'val beans', 'scarlet runner beans', 'borlotti beans', 'cranberry beans', 'mung whole yellow', 'pea protein legume', 'lupini beans']
}, {
  id: 'pasta',
  title: 'Pasta',
  icon: '🍝',
  total: 100,
  more: 0,
  items: ['spaghetti', 'penne', 'fusilli', 'macaroni', 'elbow macaroni', 'farfalle', 'rigatoni', 'tagliatelle', 'fettuccine', 'linguine', 'lasagna pasta', 'cannelloni', 'manicotti', 'ravioli', 'tortellini', 'gnocchi pasta', 'orzo', 'ditalini', 'ziti', 'bucatini', 'angel hair pasta', 'capellini', 'pappardelle', 'cavatappi', 'conchiglie', 'shell pasta', 'orecchiette', 'rotini', 'gemelli', 'radiatori', 'paccheri', 'strozzapreti', 'trofie', 'casarecce', 'mafaldine', 'mezze penne', 'mezzi rigatoni', 'tripoline', 'stelline', 'alphabet pasta', 'vermicelli pasta', 'whole wheat spaghetti', 'whole wheat penne', 'whole wheat fusilli', 'gluten free pasta', 'rice pasta', 'corn pasta', 'quinoa pasta', 'chickpea pasta', 'lentil pasta', 'black bean pasta', 'edamame pasta', 'spinach pasta', 'tomato pasta', 'beetroot pasta', 'squid ink pasta', 'egg noodles pasta', 'udon noodles', 'soba noodles', 'ramen noodles', 'hakka noodles', 'chow mein noodles', 'rice noodles', 'flat rice noodles', 'glass noodles', 'cellophane noodles', 'shirataki noodles', 'konjac noodles', 'pad thai noodles', 'laksa noodles', 'vermicelli noodles', 'sevai', 'idiyappam', 'instant noodles', 'maggi noodles', 'wheat noodles', 'millet noodles', 'ragi noodles', 'semolina pasta', 'durum wheat pasta', 'fresh egg pasta', 'fresh spinach pasta', 'fresh ravioli', 'fresh tortellini', 'cheese ravioli', 'mushroom ravioli', 'gnocchetti', 'sardinian fregola', 'fideua pasta', 'acini di pepe', 'pastina', 'anelli pasta', 'calamarata', 'lumache pasta', 'bigoli pasta', 'busiate pasta', 'corzetti pasta', 'garganelli pasta', 'malloreddus pasta', 'pici pasta']
}, {
  id: 'bread_snacks',
  title: 'Bread & Salty Snacks',
  icon: '🥨',
  total: 100,
  more: 0,
  items: ['white bread', 'brown bread', 'whole wheat bread', 'multigrain bread', 'sourdough bread', 'rye bread', 'milk bread', 'sandwich bread', 'garlic bread', 'banana bread', 'brioche', 'baguette', 'ciabatta', 'focaccia', 'pita bread', 'naan bread', 'kulcha bread', 'paratha bread', 'tandoori roti', 'chapati', 'tortilla chips', 'potato chips', 'banana chips', 'tapioca chips', 'corn chips', 'nachos', 'pretzels', 'salted crackers', 'cream crackers', 'rice crackers', 'cheese crackers', 'khakhra', 'mathri', 'namak para', 'sev', 'bhujia', 'mixture namkeen', 'boondi', 'chakli', 'murukku', 'kodubale', 'thattai', 'ribbon pakoda', 'masala peanuts', 'roasted makhana snack', 'popcorn salted', 'popcorn cheese', 'breadsticks', 'grissini', 'rusks', 'toast biscuits', 'pav bun', 'burger bun', 'hot dog bun', 'dinner roll', 'bagel', 'english muffin', 'croissant', 'lavash', 'crispbread', 'papad', 'appalam', 'fryums', 'prawn crackers', 'soy crisps', 'multigrain chips', 'sweet potato chips', 'kale chips', 'lentil chips', 'pita chips', 'cheese puffs', 'corn puffs', 'rice cakes', 'mini toasts', 'melba toast', 'soup sticks', 'masala crackers', 'jeera crackers', 'ajwain crackers', 'herb crackers', 'oat crackers', 'seed crackers', 'flatbread crackers', 'pretzel sticks', 'pretzel twists', 'bread crumbs', 'panko crumbs', 'croutons', 'garlic croutons', 'cheese croutons', 'mini naan', 'mini pita', 'naan chips', 'roti chips', 'khari biscuit', 'osmania biscuit salty', 'salt biscuit', 'cracker sandwich', 'baked mathri', 'baked chakli', 'taco shells', 'toast cups', 'bread cones', 'savory waffles', 'savory pancakes', 'rice papad', 'sabudana papad', 'jackfruit chips', 'beetroot chips', 'vegetable chips']
}, {
  id: 'oils',
  title: 'Oils & Fats',
  icon: '🛢️',
  total: 73,
  more: 0,
  items: ['sunflower oil', 'groundnut oil', 'peanut oil', 'mustard oil', 'coconut oil', 'sesame oil', 'gingelly oil', 'olive oil', 'extra virgin olive oil', 'rice bran oil', 'soybean oil', 'canola oil', 'corn oil', 'safflower oil', 'palm oil', 'palmolein oil', 'avocado oil', 'grapeseed oil', 'walnut oil', 'almond oil', 'flaxseed oil', 'hemp seed oil', 'pumpkin seed oil', 'macadamia oil', 'hazelnut oil', 'chilli oil', 'garlic oil', 'truffle oil', 'lemon oil', 'basil oil', 'butter', 'salted butter', 'unsalted butter', 'cultured butter', 'white butter', 'ghee', 'cow ghee', 'buffalo ghee', 'vanaspati', 'margarine', 'vegan butter', 'shortening', 'lard', 'duck fat', 'beef tallow', 'chicken fat', 'bacon fat', 'cocoa butter', 'coconut butter', 'peanut butter fat', 'tahini fat', 'cream', 'heavy cream', 'fresh cream', 'clotted cream', 'sour cream fat', 'malai', 'mayonnaise fat', 'olive paste fat', 'cashew cream', 'almond butter', 'hazelnut butter', 'sunflower seed butter', 'pumpkin seed butter', 'sesame paste', 'coconut cream', 'coconut milk thick', 'clarified butter', 'brown butter', 'compound butter', 'garlic butter', 'herb butter', 'chilli butter']
}, {
  id: 'dressings',
  title: 'Dressings & Vinegars',
  icon: '🥗',
  total: 85,
  more: 0,
  items: ['white vinegar', 'apple cider vinegar', 'rice vinegar', 'balsamic vinegar', 'red wine vinegar', 'white wine vinegar', 'malt vinegar', 'coconut vinegar', 'palm vinegar', 'sugarcane vinegar', 'date vinegar', 'sherry vinegar', 'champagne vinegar', 'black vinegar', 'ume vinegar', 'distilled vinegar', 'herb vinegar', 'garlic vinegar', 'chilli vinegar', 'lemon vinegar', 'vinaigrette', 'balsamic vinaigrette', 'honey mustard dressing', 'ranch dressing', 'caesar dressing', 'italian dressing', 'french dressing', 'thousand island dressing', 'blue cheese dressing', 'green goddess dressing', 'sesame dressing', 'ginger dressing', 'miso dressing', 'yogurt dressing', 'mint dressing', 'coriander dressing', 'tahini dressing', 'lemon herb dressing', 'olive oil dressing', 'garlic dressing', 'chilli lime dressing', 'avocado dressing', 'chipotle dressing', 'barbecue dressing', 'buffalo dressing', 'poppy seed dressing', 'raspberry vinaigrette', 'orange vinaigrette', 'lime vinaigrette', 'tamarind dressing', 'peanut dressing', 'soy sesame dressing', 'sweet onion dressing', 'pickle vinegar', 'jalapeno vinegar', 'kombucha vinegar', 'cider vinaigrette', 'mustard vinaigrette', 'maple vinaigrette', 'herb vinaigrette', 'kale salad dressing', 'coleslaw dressing', 'potato salad dressing', 'macaroni salad dressing', 'fruit salad dressing', 'chaat dressing', 'kachumber dressing', 'sprout salad dressing', 'greek dressing', 'tzatziki dressing', 'peri peri dressing', 'sweet chilli dressing', 'sriracha dressing', 'wasabi dressing', 'ponzu dressing', 'yuzu vinegar', 'sushi vinegar', 'seasoned rice vinegar', 'curry leaf vinegar', 'mango vinegar', 'pomegranate vinegar', 'fig balsamic', 'truffle balsamic', 'reduced balsamic glaze', 'vinegar powder']
}, {
  id: 'condiments',
  title: 'Condiments',
  icon: '�',
  total: 100,
  more: 0,
  items: ['tomato ketchup', 'mustard sauce', 'yellow mustard', 'dijon mustard', 'wholegrain mustard', 'english mustard', 'mayonnaise', 'eggless mayonnaise', 'garlic mayonnaise', 'chilli mayonnaise', 'sriracha', 'hot sauce', 'tabasco sauce', 'green chilli sauce', 'red chilli sauce', 'soy sauce', 'dark soy sauce', 'light soy sauce', 'tamari', 'teriyaki sauce', 'worcestershire sauce', 'fish sauce', 'oyster sauce', 'hoisin sauce', 'plum sauce', 'duck sauce', 'sweet chilli sauce', 'schezwan chutney', 'green chutney', 'mint chutney', 'tamarind chutney', 'coconut chutney', 'peanut chutney', 'tomato chutney', 'onion chutney', 'mango chutney', 'garlic chutney', 'imli chutney', 'date chutney', 'coriander chutney', 'pickle relish', 'sweet relish', 'dill relish', 'jalapeno relish', 'olive tapenade condiment', 'capers', 'pickled onions', 'pickled cucumber', 'dill pickles', 'gherkin pickles', 'mango pickle', 'lime pickle', 'mixed vegetable pickle', 'garlic pickle', 'green chilli pickle', 'gongura pickle', 'avakaya pickle', 'kimchi condiment', 'sauerkraut condiment', 'horseradish sauce', 'wasabi paste', 'ginger paste condiment', 'garlic paste condiment', 'ginger garlic paste', 'red curry paste', 'green curry paste', 'yellow curry paste', 'harissa paste', 'gochujang', 'miso paste', 'tahini', 'peanut sauce condiment', 'satay sauce', 'bbq sauce', 'smoky barbecue sauce', 'steak sauce', 'burger sauce', 'sandwich spread', 'cheese spread condiment', 'peri peri sauce', 'chipotle sauce', 'buffalo sauce', 'ranch sauce', 'caesar sauce', 'alfredo condiment', 'pesto condiment', 'marinara condiment', 'salsa', 'pico de gallo', 'guacamole condiment', 'hummus condiment', 'mustard oil pickle masala', 'chilli crisp', 'chilli garlic sauce', 'black bean sauce', 'xo sauce', 'mushroom soy sauce', 'kecap manis', 'maggi seasoning', 'liquid smoke']
}, {
  id: 'canned',
  title: 'Canned Foods',
  icon: '🫋',
  total: 100,
  more: 0,
  items: ['canned tomatoes', 'canned diced tomatoes', 'canned tomato puree', 'canned tomato paste', 'canned sweet corn', 'canned baby corn', 'canned green peas', 'canned carrots', 'canned mixed vegetables', 'canned mushrooms', 'canned button mushrooms', 'canned olives', 'canned jalapenos', 'canned beetroot', 'canned bamboo shoots', 'canned water chestnuts', 'canned artichokes', 'canned asparagus', 'canned spinach', 'canned pumpkin', 'canned jackfruit', 'canned chickpeas', 'canned kidney beans', 'canned black beans', 'canned pinto beans', 'canned baked beans', 'canned lentils', 'canned white beans', 'canned butter beans', 'canned black eyed peas', 'canned tuna', 'canned salmon', 'canned sardines', 'canned mackerel', 'canned anchovies', 'canned chicken', 'canned ham', 'canned corned beef', 'canned crab', 'canned shrimp', 'canned coconut milk', 'canned coconut cream', 'canned condensed milk', 'canned evaporated milk', 'canned peaches', 'canned pineapple', 'canned pears', 'canned cherries', 'canned lychee', 'canned fruit cocktail', 'canned mango pulp', 'canned apple slices', 'canned mandarin oranges', 'canned apricots', 'canned plums', 'canned cranberry sauce', 'canned pie filling', 'canned blueberry filling', 'canned cherry filling', 'canned apple filling', 'canned soup tomato', 'canned soup mushroom', 'canned soup chicken', 'canned soup vegetable', 'canned stock', 'canned broth', 'canned curry', 'canned dal', 'canned rajma', 'canned chole', 'canned pasta sauce', 'canned pesto', 'canned salsa', 'canned enchilada sauce', 'canned refried beans', 'canned nacho cheese', 'canned green chillies', 'canned roasted peppers', 'canned sauerkraut', 'canned kimchi', 'canned grape leaves', 'canned palm hearts', 'canned bean sprouts', 'canned lotus root', 'canned seaweed', 'canned sweet potato', 'canned yams', 'canned chestnuts', 'canned quail eggs', 'canned tofu', 'canned meatballs', 'canned ravioli', 'canned spaghetti', 'canned macaroni', 'canned pudding', 'canned custard', 'canned caramel', 'canned dulce de leche', 'canned syrup fruits', 'canned mixed berries']
}, {
  id: 'sauces',
  title: 'Sauces, Spreads & Dips',
  icon: '🥣',
  total: 100,
  more: 0,
  items: ['tomato sauce spread', 'marinara sauce', 'arrabbiata sauce', 'alfredo sauce', 'pesto sauce', 'white sauce', 'cheese sauce', 'pizza sauce', 'pasta sauce', 'bolognese sauce', 'bechamel sauce', 'mornay sauce', 'hollandaise sauce', 'brown sauce', 'demi glace', 'gravy sauce', 'mushroom sauce', 'pepper sauce', 'garlic sauce', 'chilli garlic sauce spread', 'green sauce', 'red sauce', 'schezwan sauce', 'manchurian sauce', 'sweet sour sauce', 'teriyaki spread sauce', 'hoisin spread sauce', 'satay spread sauce', 'peanut dip', 'hummus', 'baba ganoush', 'tzatziki', 'muhammara', 'labneh dip', 'guacamole', 'salsa dip', 'queso dip', 'spinach dip', 'artichoke dip', 'cheese dip', 'nacho cheese dip', 'bean dip', 'black bean dip', 'refried bean spread', 'olive tapenade', 'bruschetta spread', 'sun dried tomato spread', 'garlic spread', 'herb spread', 'sandwich spread sauce', 'mayonnaise spread', 'mustard spread', 'chocolate spread', 'hazelnut spread', 'peanut butter', 'almond butter spread', 'cashew butter spread', 'pistachio spread', 'cookie butter', 'lotus spread', 'fruit jam', 'strawberry jam', 'mixed fruit jam', 'mango jam', 'orange marmalade', 'pineapple jam', 'blueberry jam', 'raspberry jam', 'fig jam', 'date spread', 'apple butter', 'pumpkin butter', 'lemon curd', 'caramel spread', 'dulce de leche spread', 'honey spread', 'maple butter', 'coconut jam', 'kaya spread', 'rose petal jam', 'gulkand', 'tamarind sauce', 'date tamarind sauce', 'mint dip', 'coriander dip', 'raita dip', 'yogurt dip', 'pickle dip', 'achari dip', 'peri peri dip', 'bbq dip', 'buffalo dip', 'ranch dip', 'caesar dip', 'chipotle dip', 'sriracha mayo dip', 'wasabi mayo dip', 'miso sauce', 'gochujang sauce', 'curry sauce', 'thai red curry sauce', 'thai green curry sauce', 'korma sauce', 'tikka masala sauce', 'vindaloo sauce', 'butter masala sauce', 'sambal oelek', 'chilli oil dip', 'soy ginger sauce', 'ponzu sauce']
}, {
  id: 'soups',
  title: 'Soups, Stews & Stocks',
  icon: '🍲',
  total: 100,
  more: 0,
  items: ['tomato soup', 'sweet corn soup', 'hot and sour soup', 'manchow soup', 'vegetable soup', 'clear vegetable soup', 'mushroom soup', 'cream of mushroom soup', 'chicken soup', 'chicken clear soup', 'chicken noodle soup', 'mutton soup', 'bone broth', 'vegetable stock', 'chicken stock', 'mutton stock', 'fish stock', 'seafood stock', 'beef stock', 'mushroom stock', 'tomato stock', 'ramen broth', 'miso soup', 'pho broth', 'tom yum soup', 'tom kha soup', 'laksa soup', 'minestrone', 'lentil soup', 'dal soup', 'sambar', 'rasam', 'pepper rasam', 'lemon rasam', 'drumstick sambar', 'vegetable stew', 'kerala stew', 'chicken stew', 'mutton stew', 'fish stew', 'beef stew', 'irish stew', 'moroccan stew', 'tagine stew', 'chickpea stew', 'bean stew', 'rajma stew', 'chole stew', 'black bean soup', 'split pea soup', 'pea soup', 'pumpkin soup', 'butternut soup', 'carrot ginger soup', 'beetroot soup', 'spinach soup', 'broccoli soup', 'cauliflower soup', 'potato leek soup', 'onion soup', 'french onion soup', 'gazpacho', 'borscht', 'clam chowder', 'corn chowder', 'seafood chowder', 'chicken corn soup', 'egg drop soup', 'wonton soup', 'dumpling soup', 'noodle soup', 'udon soup', 'soba soup', 'clear broth', 'consomme', 'bisque', 'lobster bisque', 'crab soup', 'prawn soup', 'fish curry stock', 'thai curry broth', 'coconut soup', 'avial stew', 'kadhi', 'punjabi kadhi', 'gujarati kadhi', 'pakora kadhi', 'yakhni', 'payasam soup base', 'haleem stew', 'nihari stew', 'paya soup', 'harira', 'goulash', 'chili con carne stew', 'vegetarian chili', 'gumbo', 'jambalaya stew', 'sancocho', 'pozole', 'menudo soup', 'tortilla soup', 'matzo ball soup', 'barley soup', 'oat soup', 'millet soup', 'quinoa soup', 'kale soup', 'cabbage soup', 'mixed stock cube']
}, {
  id: 'desserts',
  title: 'Desserts & Sweet Snacks',
  icon: '�',
  total: 100,
  more: 0,
  items: ['chocolate bar', 'milk chocolate', 'dark chocolate', 'white chocolate', 'chocolate truffle', 'brownie', 'fudge', 'caramel candy', 'toffee', 'butterscotch candy', 'lollipop', 'gummy candy', 'jelly candy', 'marshmallow', 'nougat', 'halwa', 'gajar halwa', 'sooji halwa', 'moong dal halwa', 'kaju katli', 'barfi', 'coconut barfi', 'peda', 'rasgulla', 'gulab jamun', 'jalebi', 'laddu', 'motichoor laddu', 'boondi laddu', 'mysore pak', 'soan papdi', 'chikki', 'peanut chikki', 'til chikki', 'revdi', 'kulfi', 'ice cream', 'vanilla ice cream', 'chocolate ice cream', 'strawberry ice cream', 'gelato', 'sorbet', 'frozen yogurt', 'popsicle', 'cake slice', 'vanilla cake', 'chocolate cake', 'red velvet cake', 'cheesecake', 'cupcake', 'muffin', 'donut', 'eclair', 'cream puff', 'macaron', 'macaroon', 'cookie', 'chocolate chip cookie', 'butter cookie', 'oat cookie', 'biscuit sweet', 'wafer', 'cream wafer', 'sweet rusk', 'sweet bun', 'cinnamon roll', 'danish pastry', 'apple pie', 'fruit tart', 'custard tart', 'pudding', 'rice pudding', 'kheer', 'payasam', 'phirni', 'custard', 'jelly dessert', 'mousse', 'tiramisu', 'panna cotta', 'creme brulee', 'baklava', 'churros', 'waffle sweet', 'pancake sweet', 'crepe sweet', 'honey cake', 'plum cake', 'fruit cake', 'banana cake', 'dates roll', 'dry fruit roll', 'sesame candy', 'coconut candy', 'cotton candy', 'mango candy', 'orange candy', 'mint candy', 'sweet popcorn', 'caramel popcorn', 'chocolate popcorn', 'trail mix sweet', 'granola bar', 'protein sweet bar', 'energy bar', 'fruit leather', 'dried mango sweet', 'candied ginger', 'candied orange peel', 'sweet boondi']
}, {
  id: 'alcohol',
  title: 'Wine, Beer & Spirits',
  icon: '�',
  total: 100,
  more: 0,
  items: ['red wine', 'white wine', 'rose wine', 'sparkling wine', 'champagne', 'prosecco', 'cava', 'port wine', 'sherry', 'marsala wine', 'madeira wine', 'sake', 'rice wine', 'mirin', 'cooking wine', 'beer lager', 'beer ale', 'wheat beer', 'stout beer', 'porter beer', 'pilsner', 'ipa beer', 'craft beer', 'non alcoholic beer', 'cider', 'apple cider alcoholic', 'pear cider', 'mead', 'vodka', 'gin', 'rum', 'white rum', 'dark rum', 'spiced rum', 'whiskey', 'bourbon', 'scotch', 'irish whiskey', 'brandy', 'cognac', 'tequila', 'mezcal', 'absinthe', 'ouzo', 'sambuca', 'grappa', 'soju', 'baijiu', 'arak', 'feni', 'cashew feni', 'toddy', 'palm wine', 'arrack', 'liqueur', 'coffee liqueur', 'orange liqueur', 'amaretto', 'limoncello', 'triple sec', 'curacao', 'creme de menthe', 'creme de cacao', 'irish cream', 'vermouth', 'sweet vermouth', 'dry vermouth', 'bitters alcoholic', 'aperol', 'campari', 'pimm\'s', 'schnapps', 'peach schnapps', 'peppermint schnapps', 'anisette', 'chartreuse', 'benedictine', 'frangelico', 'drambuie', 'elderflower liqueur', 'cherry brandy', 'blackcurrant liqueur', 'melon liqueur', 'coconut rum', 'cream liqueur', 'mulled wine', 'sangria', 'wine cooler', 'hard seltzer', 'ginger beer alcoholic', 'cocktail mix mojito', 'cocktail mix margarita', 'cocktail mix bloody mary', 'cocktail mix pina colada', 'cooking brandy', 'beer batter ingredient', 'wine vinegar base', 'brandy essence alcoholic', 'rum essence alcoholic', 'whiskey marinade ingredient']
}, {
  id: 'beverages',
  title: 'Beverages',
  icon: '🥤',
  total: 100,
  more: 0,
  items: ['water', 'mineral water', 'sparkling water', 'soda water', 'tonic water', 'coconut water', 'lemon water', 'lime water', 'rose water drink', 'jeera water', 'buttermilk', 'chaas', 'lassi', 'sweet lassi', 'salted lassi', 'mango lassi', 'milk', 'toned milk', 'full cream milk', 'skim milk', 'almond milk', 'soy milk', 'oat milk', 'coconut milk drink', 'rice milk', 'cashew milk', 'coffee', 'black coffee', 'filter coffee', 'instant coffee', 'espresso', 'cold brew coffee', 'cappuccino', 'latte', 'mocha', 'tea', 'black tea', 'green tea', 'white tea', 'oolong tea', 'herbal tea', 'masala chai', 'ginger tea', 'lemon tea', 'mint tea', 'tulsi tea', 'chamomile tea', 'hibiscus tea', 'matcha', 'kombucha', 'orange juice', 'apple juice', 'grape juice', 'pineapple juice', 'mango juice', 'guava juice', 'pomegranate juice', 'cranberry juice', 'watermelon juice', 'sugarcane juice', 'lemonade', 'nimbu pani', 'jaljeera', 'aam panna', 'kokum juice', 'badam milk', 'thandai', 'falooda drink', 'hot chocolate', 'malted milk drink', 'protein shake beverage', 'smoothie', 'banana smoothie', 'berry smoothie', 'green smoothie', 'milkshake', 'vanilla milkshake', 'chocolate milkshake', 'strawberry milkshake', 'mango milkshake', 'cola', 'lemon soda', 'orange soda', 'ginger ale', 'root beer', 'energy drink', 'sports drink', 'electrolyte drink', 'iced tea', 'fruit punch', 'sharbat', 'rooh afza drink', 'rose milk', 'sattu drink', 'ragi malt drink', 'barley water', 'kanji drink', 'sol kadhi', 'panakam', 'tender coconut shake']
}, {
  id: 'supplements',
  title: 'Supplements & Extracts',
  icon: '📊',
  total: 100,
  more: 0,
  items: ['whey protein', 'casein protein', 'soy protein powder', 'pea protein powder', 'rice protein powder', 'hemp protein powder', 'collagen peptides', 'gelatin collagen', 'creatine monohydrate', 'bcaa powder', 'eaa powder', 'glutamine powder', 'electrolyte powder', 'ors powder', 'multivitamin powder', 'vitamin c powder', 'vitamin d drops', 'vitamin b12 drops', 'iron supplement', 'calcium supplement', 'magnesium supplement', 'zinc supplement', 'omega 3 capsules', 'fish oil capsules', 'cod liver oil', 'flaxseed oil capsules', 'probiotic powder', 'prebiotic fiber', 'psyllium husk', 'isabgol', 'inulin powder', 'mct oil', 'mct powder', 'green superfood powder', 'spirulina powder', 'chlorella powder', 'wheatgrass powder', 'barley grass powder', 'moringa powder supplement', 'beetroot powder', 'acai powder', 'amla powder supplement', 'ashwagandha powder', 'shatavari powder', 'brahmi powder', 'triphala powder', 'turmeric extract', 'curcumin extract', 'ginger extract', 'garlic extract', 'green tea extract', 'coffee extract', 'vanilla extract supplement', 'almond extract supplement', 'peppermint extract', 'lemon extract supplement', 'orange extract supplement', 'coconut extract', 'rose extract', 'kewra extract', 'saffron extract', 'cocoa extract', 'cinnamon extract', 'fenugreek extract', 'ginseng extract', 'milk thistle extract', 'cranberry extract', 'grape seed extract', 'pine bark extract', 'aloe vera extract', 'stevia extract', 'monk fruit extract', 'yeast extract', 'nutritional yeast', 'brewer yeast', 'apple cider vinegar powder', 'chlorophyll drops', 'sea moss gel', 'kelp supplement', 'iodine drops', 'fiber supplement', 'meal replacement powder', 'mass gainer', 'pre workout powder', 'post workout powder', 'carb powder', 'dextrose powder', 'maltodextrin powder', 'glucose powder', 'energy gel', 'caffeine powder', 'taurine powder', 'l carnitine', 'coq10 supplement', 'hyaluronic acid supplement', 'biotin supplement', 'folic acid supplement', 'elderberry extract', 'echinacea extract', 'licorice extract']
}];
const USER_ID = 1;
const AddItemScreen = () => {
  const {
    t
  } = useTranslation();
  const navigation = useNavigation();
  const [selectedIngredients, setSelectedIngredients] = useState(['onion']);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toggleIngredient = item => {
    if (selectedIngredients.includes(item)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== item));
    } else {
      setSelectedIngredients([...selectedIngredients, item]);
    }
  };
  const handleAddItemsToPantry = async () => {
    if (selectedIngredients.length === 0) {
      navigation.navigate('Main', {
        screen: 'Pantry'
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Create a promise array to add all items to the backend
      const promises = selectedIngredients.map(item => {
        const categoryObj = INGREDIENT_DATA.find(c => c.items.includes(item));
        const categoryName = categoryObj ? categoryObj.title : 'Uncategorized';
        const icon = categoryObj ? categoryObj.icon : '🥫';
        return pantryService.addItem(USER_ID, {
          name: item,
          category: categoryName,
          quantity: 1,
          unit: 'pcs',
          icon: icon
        });
      });
      await Promise.all(promises);
      setSelectedIngredients([]); // Clear selections after saving
      navigation.navigate('Main', {
        screen: 'Pantry'
      });
    } catch (error) {
      console.error('Failed to add items to pantry:', error);
      // Navigate anyway so the user isn't stuck
      navigation.navigate('Main', {
        screen: 'Pantry'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const filteredData = INGREDIENT_DATA.map(category => {
    if (!searchQuery) return category;
    const lowerQuery = searchQuery.toLowerCase();
    const categoryMatches = category.title.toLowerCase().includes(lowerQuery);
    const matchingItems = category.items.filter(item => item.toLowerCase().includes(lowerQuery));
    if (categoryMatches && matchingItems.length === 0) {
      return category;
    }
    return {
      ...category,
      items: matchingItems
    };
  }).filter(category => category.items.length > 0 || category.title.toLowerCase().includes(searchQuery.toLowerCase()));
  return <View style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.profileIcon}>
            <CircleUserRound size={20} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.searchContainer}>
            <Text style={{
            fontSize: 16,
            marginRight: 5
          }}>🔍</Text>
            <TextInput style={styles.searchInput} placeholder={t("AddItemScreen.placeholder_add_ingredients")} placeholderTextColor={Theme.colors.textLight} value={searchQuery} onChangeText={setSearchQuery} />
          </View>
          
          <TouchableOpacity style={styles.sortIcon}>
            <Text style={{
            fontSize: 20
          }}>↕️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer} showsVerticalScrollIndicator={false}>
        {filteredData.map(category => <View key={category.id} style={styles.categoryCard}>
            {/* Category Header */}
            <View style={styles.categoryHeader}>
              <View style={styles.categoryHeaderLeft}>
                <Text style={styles.categoryEmoji}>{category.icon}</Text>
                <View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categorySubtitle}>
                    {selectedIngredients.filter(i => category.items.includes(i)).length}/{category.total}{t("AddItemScreen.Ingredients")}</Text>
                </View>
              </View>
              <Text style={{
            fontSize: 16,
            color: Theme.colors.textLight
          }}>🔽</Text>
            </View>

            <View style={styles.divider} />

            {/* Ingredients Grid */}
            <View style={styles.ingredientsGrid}>
              {category.items.map(item => {
            const isSelected = selectedIngredients.includes(item);
            return <TouchableOpacity key={item} style={[styles.pill, isSelected && styles.pillSelected]} onPress={() => toggleIngredient(item)}>
                    <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                      {item}
                    </Text>
                  </TouchableOpacity>;
          })}
              {category.more > 0 && <TouchableOpacity style={styles.pillMore}>
                  <Text style={styles.pillTextMore}>+{category.more}{t("AddItemScreen.More")}</Text>
                </TouchableOpacity>}
            </View>
          </View>)}
        
        <TouchableOpacity style={styles.suggestButton}>
          <Text style={styles.suggestButtonText}>{t("AddItemScreen.Suggest_ingredient")}</Text>
        </TouchableOpacity>

        <View style={{
        height: 160
      }} /> {/* Padding for bottom bar and tab bar */}
      </ScrollView>

      {/* FLOATING ACTION BUTTONS */}
      <TouchableOpacity style={styles.fabMic} onPress={() => navigation.navigate('VoiceInput')}>
        <Text style={{
        fontSize: 24
      }}>🎤</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.fabCamera} onPress={() => navigation.navigate('BarcodeScanner')}>
        <Camera size={24} color="#FFF" />
      </TouchableOpacity>

      {/* BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.myPantryButton, isSubmitting && {
        opacity: 0.7
      }]} onPress={handleAddItemsToPantry} disabled={isSubmitting}>
          <Text style={styles.myPantryText}>{isSubmitting ? 'Saving...' : 'My Pantry'}</Text>
          {!isSubmitting && <View style={styles.badge}>
              <Text style={styles.badgeText}>{selectedIngredients.length}</Text>
            </View>}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.seeRecipesButton} onPress={() => navigation.navigate('Main', {
        screen: 'Recipes'
      })}>
          <Text style={styles.seeRecipesText}>{t("AddItemScreen.See_Recipes")}</Text>
        </TouchableOpacity>
      </View>

      {/* MOCK BOTTOM TAB BAR TO MATCH DESIGN */}
      <View style={styles.mockTabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Package size={24} color="#DF3F6D" />
          <Text style={[styles.tabText, {
          color: '#DF3F6D'
        }]}>{t("AddItemScreen.Pantry")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main', {
        screen: 'Dashboard'
      })}>
          <Home size={24} color="#9E9E9E" />
          <Text style={styles.tabText}>{t("AddItemScreen.Menu")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('FavoriteRecipes')}>
          <Heart size={24} color="#9E9E9E" />
          <Text style={styles.tabText}>{t("AddItemScreen.Favorites")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main', {
        screen: 'Grocery'
      })}>
          <ShoppingBasket size={24} color="#9E9E9E" />
          <Text style={styles.tabText}>{t("AddItemScreen.Shopping_List")}</Text>
        </TouchableOpacity>
      </View>
    </View>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA' // Light grey background
  },
  headerContainer: {
    backgroundColor: '#DF3F6D',
    // Pinkish red matching design
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 50
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    height: 40
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 15,
    color: Theme.colors.text
  },
  sortIcon: {
    padding: 4
  },
  scrollContent: {
    flex: 1
  },
  scrollContentContainer: {
    padding: 16
  },
  categoryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    ...Theme.shadows.sm
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  categoryEmoji: {
    fontSize: 32,
    marginRight: 12
  },
  categoryTitle: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 2
  },
  categorySubtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 13,
    color: Theme.colors.textLight
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 10
  },
  pill: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6
  },
  pillSelected: {
    backgroundColor: '#8BC34A' // Green matching design
  },
  pillText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: '#757575'
  },
  pillTextSelected: {
    color: '#FFF'
  },
  pillMore: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6
  },
  pillTextMore: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: '#9E9E9E'
  },
  suggestButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal: 16
  },
  suggestButtonText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 16,
    color: '#757575'
  },
  fabMic: {
    position: 'absolute',
    bottom: 160,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DF3F6D',
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
    zIndex: 10
  },
  fabCamera: {
    position: 'absolute',
    bottom: 235,
    right: 25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
    zIndex: 10
  },
  bottomBar: {
    position: 'absolute',
    bottom: 70,
    // Moved up to sit above the tab bar
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE'
  },
  myPantryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    height: 48,
    borderRadius: 8,
    marginRight: 10
  },
  myPantryText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 16,
    color: '#757575',
    marginRight: 8
  },
  badge: {
    backgroundColor: '#8BC34A',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: {
    color: '#FFF',
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 12
  },
  seeRecipesButton: {
    flex: 1.5,
    backgroundColor: '#8BC34A',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  seeRecipesText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 16,
    color: '#FFF'
  },
  mockTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE'
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 4
  }
});
export default AddItemScreen;
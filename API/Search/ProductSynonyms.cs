namespace BusinessPortal.API.Search;

// Search-term expansions so a product can be found under many names:
// "maggam" -> blouse, "decor" -> home decoration, "bugger" -> burger, etc.
public static class ProductSynonyms
{
    public static readonly IReadOnlyDictionary<string, string[]> Map =
        new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
        {
            // ---------- Food ----------
            ["burger"] = new[] { "buger", "bugger", "patty", "cheeseburger", "sandwich" },
            ["buger"] = new[] { "burger" },
            ["bugger"] = new[] { "burger" },
            ["fries"] = new[] { "fry", "fried", "chips", "french fries", "twisters" },
            ["fry"] = new[] { "fries", "fried" },
            ["fried"] = new[] { "fries", "fry" },
            ["noodles"] = new[] { "noodle", "chowmein", "pasta", "spaghetti", "haka noodles" },
            ["pasta"] = new[] { "noodles", "spaghetti", "macaroni", "penne" },
            ["biryani"] = new[] { "dum biryani", "pulao", "rice", "hyderabadi biryani" },
            ["rice"] = new[] { "biryani", "pulao", "fried rice", "veg rice", "steamed rice" },
            ["pulao"] = new[] { "biryani", "rice", "fried rice" },
            ["chicken"] = new[] { "tandoori", "nonveg", "non-veg", "meat", "mutton", "fish" },
            ["veg"] = new[] { "vegetarian", "veggie", "vegan", "pure veg" },
            ["vegetarian"] = new[] { "veg", "veggie" },
            ["paneer"] = new[] { "cottage cheese", "malai paneer", "paneer butter masala" },
            ["masala"] = new[] { "spicy", "gravy", "curry", "tandoori", "fried" },
            ["curry"] = new[] { "masala", "gravy", "tikka", "rogan josh" },
            ["gravy"] = new[] { "masala", "curry", "korma" },
            ["spicy"] = new[] { "masala", "hot", "peri peri", "chilly" },
            ["snacks"] = new[] { "snack", "fries", "chaat", "starters", "rolls", "tiffin", "bites" },
            ["food"] = new[] { "meals", "cuisine", "dish", "tiffin", "snacks" },
            ["drinks"] = new[] { "drink", "beverage", "juice", "milkshake", "lassi", "shake", "cold coffee" },
            ["juice"] = new[] { "fresh juice", "mocktail", "beverage", "drink" },
            ["dessert"] = new[] { "sweets", "ice cream", "gulab jamun", "cake", "pastry" },

            // ---------- Ice creams & flavours ----------
            ["ice"] = new[] { "icream", "icecream", "frozen", "chilled", "scoop", "frost" },
            ["cream"] = new[] { "ice cream", "icream", "icecream", "frozen dessert", "flavour", "flavor", "mango", "rasberry", "raspberry", "strawberry", "black forest", "vanilla", "chocolate", "butterscotch", "pista", "pistachio", "kulfi", "sundae", "scoop", "cone", "gelato", "kesar", "malai", "moisturizer", "lotion", "skincare", "face cream" },
            ["icream"] = new[] { "ice cream", "icecream", "frozen dessert", "scoop", "cone", "flavour", "flavor", "kulfi", "mango", "rasberry", "raspberry", "strawberry", "vanilla", "chocolate", "butterscotch", "pista", "pistachio", "malai" },
            ["icecream"] = new[] { "ice cream", "icream", "frozen dessert", "scoop", "kulfi", "flavour", "flavor", "mango", "rasberry", "raspberry", "strawberry", "vanilla", "chocolate", "butterscotch", "pista", "malai" },
            ["mango"] = new[] { "ice cream", "icream", "aam", "mango ice", "mango flavoured", "flavour" },
            ["rasberry"] = new[] { "raspberry", "ice cream", "berry", "berries" },
            ["raspberry"] = new[] { "rasberry", "ice cream", "berry", "berries" },
            ["strawberry"] = new[] { "ice cream", "strawberries", "berry", "flavour" },
            ["black"] = new[] { "black forest", "dark chocolate", "forest" },
            ["forest"] = new[] { "black forest", "forest cake" },
            ["vanilla"] = new[] { "ice cream", "vanilla scoops", "milkshake", "cream" },
            ["chocolate"] = new[] { "ice cream", "choco", "chocobar", "cocoa", "chocolate chip", "milkshake" },
            ["choco"] = new[] { "chocolate", "chocobar", "ice cream" },
            ["butterscotch"] = new[] { "butter scotch", "butter fist", "ice cream", "caramel" },
            ["pista"] = new[] { "pistachio", "ice cream", "pista flavoured" },
            ["pistachio"] = new[] { "pista", "ice cream" },
            ["kulfi"] = new[] { "ice cream", "malai kulfi", "matka kulfi", "frozen dessert" },
            ["sundae"] = new[] { "ice cream", "sundae cup", "sundae cone" },
            ["cone"] = new[] { "ice cream", "icecream cone", "sugar cone", "wafer cone" },
            ["scoop"] = new[] { "ice cream", "scoops", "scoop cup" },
            ["gelato"] = new[] { "ice cream", "italian ice cream" },
            ["malai"] = new[] { "kulfi", "malai kulfi", "cream" },
            ["kesar"] = new[] { "saffron", "pista kesar", "ice cream" },
            ["berry"] = new[] { "rasberry", "raspberry", "strawberry", "blueberry" },
            ["flavour"] = new[] { "flavor", "flavours", "ice cream" },
            ["flavor"] = new[] { "flavour", "flavors", "ice cream" },

            // ---------- Maggam work blouses ----------
            ["blouse"] = new[] { "maggam work blouse", "embroidery blouse", "bridal blouse", "saree blouse", "choli", "top" },
            ["maggam"] = new[] { "maggam work", "zari work", "embroidery", "resham work", "blouse work", "hand work" },
            ["embroidery"] = new[] { "maggam", "zari work", "resham work", "hand work", "thread work" },
            ["zari"] = new[] { "zari work", "gold zari", "embroidery", "hand work" },
            ["saree"] = new[] { "sari", "saree blouse", "half saree", "lehenga", "ethnic wear", "silk saree" },
            ["sari"] = new[] { "saree", "half saree" },
            ["bridal"] = new[] { "wedding", "bride", "marriage", "bridal blouse", "engagement" },
            ["wedding"] = new[] { "bridal", "bride", "marriage", "ceremony" },
            ["stone"] = new[] { "stone work", "mirror work", "sequin work", "beaded work" },

            // ---------- Ethnic wear (men & women) ----------
            ["ethnic"] = new[] { "traditional", "desi", "kurta", "kurti", "saree", "lehenga", "salwar", "dhoti", "dupatta", "sherwani", "chaniya choli", "south indian" },
            ["traditional"] = new[] { "ethnic", "desi", "kurta", "saree", "south indian" },
            ["kurti"] = new[] { "kurta", "top", "tunic", "ethnic", "frocks" },
            ["kurta"] = new[] { "kurti", "kurtas", "tunic", "ethnic", "sherwani" },
            ["lehenga"] = new[] { "lehenga choli", "ghagra", "skirt", "ethnic", "bride", "choli" },
            ["salwar"] = new[] { "salwar kameez", "anarkali", "suit", "ethnic", "churidar" },
            ["sherwani"] = new[] { "kurta", "ethnic coat", "ethnic", "wedding" },
            ["dupatta"] = new[] { "stole", "shawl", "chunni" },
            ["dhoti"] = new[] { "dhoti pants", "veshti", "pancha", "lungi" },
            ["men"] = new[] { "mens", "male", "gents" },
            ["women"] = new[] { "womens", "female", "ladies", "girls" },

            // ---------- Western wear (men & women) ----------
            ["western"] = new[] { "casual", "party wear", "fashion", "modern", "western wear" },
            ["denim"] = new[] { "jeans", "denim jacket", "jeggings", "indigo" },
            ["jeans"] = new[] { "denim", "jeggings", "trousers", "pants" },
            ["jacket"] = new[] { "denim jacket", "blazer", "outerwear", "hoodie", "windcheater" },
            ["shirt"] = new[] { "tshirt", "tee", "top", "formal shirt", "casual shirt", "polo" },
            ["tshirt"] = new[] { "t-shirt", "tee", "shirt", "apparel", "crew neck" },
            ["dress"] = new[] { "gown", "frock", "kaftan", "tunic", "maxi", "midi" },
            ["trousers"] = new[] { "pants", "jeans", "chinos", "formal trousers" },
            ["gown"] = new[] { "dress", "frock", "evening gown", "maxi" },

            // ---------- Beauty products ----------
            ["beauty"] = new[] { "makeup", "cosmetics", "skincare", "skin care", "beauty product" },
            ["makeup"] = new[] { "lipstick", "foundation", "mascara", "kajal", "compact", "blush", "eyeliner", "cosmetics", "contour" },
            ["cosmetics"] = new[] { "makeup", "beauty", "skincare" },
            ["lipstick"] = new[] { "lip color", "matte lipstick", "gloss", "makeup" },
            ["kajal"] = new[] { "kohl", "eyeliner", "eye pencil", "eye makeup" },
            ["skincare"] = new[] { "skin care", "face cream", "moisturizer", "serum", "sunscreen", "toner", "facewash", "face wash", "face pack" },
            ["skin"] = new[] { "skincare", "face cream", "serum", "glow" },
            ["face"] = new[] { "face cream", "facewash", "face wash", "face pack", "serum", "face mask" },
            ["serum"] = new[] { "face serum", "vitamin c", "skincare", "glow serum" },
            ["perfume"] = new[] { "fragrance", "attar", "body mist", "deodorant", "eau de toilette", "itri" },
            ["fragrance"] = new[] { "perfume", "attar", "body mist", "deodorant" },
            ["lotions"] = new[] { "lotion", "body butter", "moisturizer" },

            // ---------- Home decoration & decor ----------
            ["home"] = new[] { "home decor", "home decoration", "interior", "home decorator" },
            ["decor"] = new[] { "home decor", "decoration", "decorations", "showpiece", "wall art", "accents", "interior", "home decorator" },
            ["decoration"] = new[] { "home decor", "decor", "decorations", "showpiece", "wall art", "ornaments" },
            ["decorations"] = new[] { "home decor", "decor", "decoration", "showpiece", "wall art" },
            ["decorator"] = new[] { "home decor", "decor", "decoration", "home decorator" },
            ["showpiece"] = new[] { "decor piece", "statue", "idol", "vase", "art piece", "figurine" },
            ["wall"] = new[] { "wall art", "wall hanging", "wall decor", "frames", "paintings", "posters" },
            ["art"] = new[] { "wall art", "painting", "artwork", "canvas", "decor", "poster" },
            ["painting"] = new[] { "paintings", "artwork", "canvas", "wall art" },
            ["frame"] = new[] { "photo frame", "frames", "wall art", "mirror" },
            ["candle"] = new[] { "candles", "scented candle", "diya", "tealight" },
            ["vase"] = new[] { "vases", "flower pot", "planter", "flower vase" },
            ["planter"] = new[] { "planters", "pot", "potter", "terracotta" },
            ["light"] = new[] { "lamps", "lantern", "string lights", "diya", "lamp", "fairy lights" },
            ["mirror"] = new[] { "wall mirror", "decorative mirror", "frame" },
        };

    /// <summary>Expands one lowercase search word into itself plus its synonyms.</summary>
    public static IReadOnlyList<string> Expand(string word) =>
        Map.TryGetValue(word, out var alts)
            ? new[] { word }.Concat(alts).ToList()
            : new[] { word };
}
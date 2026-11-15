import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

interface EmojiEntry {
  char: string;
  name: string;
  keywords?: string;
}

interface EmojiCategory {
  id: string;
  label: string;
  icon: string;
  emojis: EmojiEntry[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: "smileys",
    label: "Smileys & People",
    icon: "😀",
    emojis: [
      { char: "😀", name: "grinning face", keywords: "happy smile" },
      { char: "😃", name: "grinning face with big eyes", keywords: "happy" },
      { char: "😄", name: "grinning face with smiling eyes", keywords: "happy" },
      { char: "😁", name: "beaming face", keywords: "grin happy" },
      { char: "😆", name: "grinning squinting face", keywords: "laugh" },
      { char: "😅", name: "grinning face with sweat", keywords: "relief" },
      { char: "🤣", name: "rolling on the floor laughing", keywords: "lol" },
      { char: "😂", name: "face with tears of joy", keywords: "lol laugh" },
      { char: "🙂", name: "slightly smiling face", keywords: "smile" },
      { char: "🙃", name: "upside down face", keywords: "silly" },
      { char: "😉", name: "winking face", keywords: "wink" },
      { char: "😊", name: "smiling face with smiling eyes", keywords: "blush" },
      { char: "😇", name: "smiling face with halo", keywords: "angel" },
      { char: "🥰", name: "smiling face with hearts", keywords: "love" },
      { char: "😍", name: "heart eyes", keywords: "love" },
      { char: "🤩", name: "star struck", keywords: "excited" },
      { char: "😘", name: "face blowing a kiss", keywords: "kiss love" },
      { char: "😗", name: "kissing face", keywords: "kiss" },
      { char: "😚", name: "kissing face with closed eyes", keywords: "kiss" },
      { char: "😙", name: "kissing face with smiling eyes", keywords: "kiss" },
      { char: "🥲", name: "smiling face with tear", keywords: "sad smile" },
      { char: "😋", name: "face savoring food", keywords: "yummy" },
      { char: "😛", name: "face with tongue", keywords: "tongue" },
      { char: "😜", name: "winking face with tongue", keywords: "silly" },
      { char: "🤪", name: "zany face", keywords: "crazy" },
      { char: "😝", name: "squinting face with tongue", keywords: "silly" },
      { char: "🤑", name: "money mouth face", keywords: "money" },
      { char: "🤗", name: "hugging face", keywords: "hug" },
      { char: "🤭", name: "face with hand over mouth", keywords: "oops" },
      { char: "🤫", name: "shushing face", keywords: "quiet" },
      { char: "🤔", name: "thinking face", keywords: "think" },
      { char: "🤐", name: "zipper mouth face", keywords: "quiet" },
      { char: "🤨", name: "face with raised eyebrow", keywords: "skeptical" },
      { char: "😐", name: "neutral face", keywords: "meh" },
      { char: "😑", name: "expressionless face", keywords: "blank" },
      { char: "😶", name: "face without mouth", keywords: "speechless" },
      { char: "😏", name: "smirking face", keywords: "smirk" },
      { char: "😒", name: "unamused face", keywords: "annoyed" },
      { char: "🙄", name: "face with rolling eyes", keywords: "eyeroll" },
      { char: "😬", name: "grimacing face", keywords: "awkward" },
      { char: "🤥", name: "lying face", keywords: "lie" },
      { char: "😌", name: "relieved face", keywords: "calm" },
      { char: "😔", name: "pensive face", keywords: "sad" },
      { char: "😪", name: "sleepy face", keywords: "tired" },
      { char: "🤤", name: "drooling face", keywords: "drool" },
      { char: "😴", name: "sleeping face", keywords: "sleep" },
      { char: "😷", name: "face with medical mask", keywords: "sick" },
      { char: "🤒", name: "face with thermometer", keywords: "sick" },
      { char: "🤕", name: "face with head bandage", keywords: "hurt" },
      { char: "🤢", name: "nauseated face", keywords: "sick" },
      { char: "🤮", name: "vomiting face", keywords: "sick" },
      { char: "🤧", name: "sneezing face", keywords: "sick" },
      { char: "🥵", name: "hot face", keywords: "heat" },
      { char: "🥶", name: "cold face", keywords: "freezing" },
      { char: "🥴", name: "woozy face", keywords: "dizzy" },
      { char: "😵", name: "dizzy face", keywords: "dead" },
      { char: "🤯", name: "exploding head", keywords: "mind blown" },
      { char: "🤠", name: "cowboy hat face", keywords: "cowboy" },
      { char: "🥳", name: "partying face", keywords: "party celebrate" },
      { char: "🥸", name: "disguised face", keywords: "incognito" },
      { char: "😎", name: "smiling face with sunglasses", keywords: "cool" },
      { char: "🤓", name: "nerd face", keywords: "geek" },
      { char: "🧐", name: "face with monocle", keywords: "inspect" },
      { char: "😕", name: "confused face", keywords: "confused" },
      { char: "😟", name: "worried face", keywords: "worry" },
      { char: "🙁", name: "slightly frowning face", keywords: "sad" },
      { char: "😮", name: "face with open mouth", keywords: "surprised" },
      { char: "😯", name: "hushed face", keywords: "surprised" },
      { char: "😲", name: "astonished face", keywords: "shocked" },
      { char: "😳", name: "flushed face", keywords: "embarrassed" },
      { char: "🥺", name: "pleading face", keywords: "please" },
      { char: "😦", name: "frowning face with open mouth", keywords: "sad" },
      { char: "😧", name: "anguished face", keywords: "sad" },
      { char: "😨", name: "fearful face", keywords: "scared" },
      { char: "😰", name: "anxious face with sweat", keywords: "nervous" },
      { char: "😥", name: "sad but relieved face", keywords: "sad" },
      { char: "😢", name: "crying face", keywords: "sad tear" },
      { char: "😭", name: "loudly crying face", keywords: "sad sob" },
      { char: "😱", name: "face screaming in fear", keywords: "shocked" },
      { char: "😖", name: "confounded face", keywords: "frustrated" },
      { char: "😣", name: "persevering face", keywords: "struggle" },
      { char: "😞", name: "disappointed face", keywords: "sad" },
      { char: "😓", name: "downcast face with sweat", keywords: "sad" },
      { char: "😩", name: "weary face", keywords: "tired" },
      { char: "😫", name: "tired face", keywords: "exhausted" },
      { char: "🥱", name: "yawning face", keywords: "bored" },
      { char: "😤", name: "face with steam from nose", keywords: "angry" },
      { char: "😡", name: "pouting face", keywords: "angry" },
      { char: "😠", name: "angry face", keywords: "angry" },
      { char: "🤬", name: "face with symbols on mouth", keywords: "swearing" },
      { char: "😈", name: "smiling face with horns", keywords: "devil" },
      { char: "👿", name: "angry face with horns", keywords: "devil" },
      { char: "💀", name: "skull", keywords: "dead" },
      { char: "💩", name: "pile of poo", keywords: "poop" },
      { char: "🤡", name: "clown face", keywords: "clown" },
      { char: "👋", name: "waving hand", keywords: "hello goodbye" },
      { char: "🤚", name: "raised back of hand", keywords: "stop" },
      { char: "✋", name: "raised hand", keywords: "stop" },
      { char: "🖖", name: "vulcan salute", keywords: "spock" },
      { char: "👌", name: "ok hand", keywords: "okay" },
      { char: "🤌", name: "pinched fingers", keywords: "italian" },
      { char: "🤏", name: "pinching hand", keywords: "small" },
      { char: "✌️", name: "victory hand", keywords: "peace" },
      { char: "🤞", name: "crossed fingers", keywords: "luck" },
      { char: "🤟", name: "love you gesture", keywords: "love" },
      { char: "🤘", name: "sign of the horns", keywords: "rock" },
      { char: "🤙", name: "call me hand", keywords: "call" },
      { char: "👈", name: "backhand index pointing left", keywords: "left" },
      { char: "👉", name: "backhand index pointing right", keywords: "right" },
      { char: "👆", name: "backhand index pointing up", keywords: "up" },
      { char: "👇", name: "backhand index pointing down", keywords: "down" },
      { char: "☝️", name: "index pointing up", keywords: "up" },
      { char: "👍", name: "thumbs up", keywords: "like yes" },
      { char: "👎", name: "thumbs down", keywords: "dislike no" },
      { char: "✊", name: "raised fist", keywords: "fist" },
      { char: "👊", name: "oncoming fist", keywords: "punch" },
      { char: "🤛", name: "left facing fist", keywords: "fist" },
      { char: "🤜", name: "right facing fist", keywords: "fist" },
      { char: "👏", name: "clapping hands", keywords: "applause" },
      { char: "🙌", name: "raising hands", keywords: "celebrate" },
      { char: "👐", name: "open hands", keywords: "hands" },
      { char: "🤲", name: "palms up together", keywords: "pray" },
      { char: "🤝", name: "handshake", keywords: "deal agreement" },
      { char: "🙏", name: "folded hands", keywords: "please thanks pray" },
      { char: "✍️", name: "writing hand", keywords: "write" },
      { char: "💅", name: "nail polish", keywords: "nails" },
      { char: "🤳", name: "selfie", keywords: "selfie" },
      { char: "💪", name: "flexed biceps", keywords: "strong" },
      { char: "🦾", name: "mechanical arm", keywords: "robot" },
      { char: "🫶", name: "heart hands", keywords: "love" },
      { char: "👀", name: "eyes", keywords: "look" },
      { char: "🧠", name: "brain", keywords: "smart" },
      { char: "👶", name: "baby", keywords: "child" },
      { char: "👦", name: "boy", keywords: "child" },
      { char: "👧", name: "girl", keywords: "child" },
      { char: "👨", name: "man", keywords: "person" },
      { char: "👩", name: "woman", keywords: "person" },
      { char: "🧑", name: "person", keywords: "person" },
      { char: "👴", name: "old man", keywords: "senior" },
      { char: "👵", name: "old woman", keywords: "senior" },
      { char: "👮", name: "police officer", keywords: "police" },
      { char: "👷", name: "construction worker", keywords: "worker" },
      { char: "💼", name: "briefcase", keywords: "work business" },
      { char: "🧑‍💻", name: "technologist", keywords: "developer laptop" },
      { char: "🧑‍🏫", name: "teacher", keywords: "school" },
      { char: "🧑‍⚕️", name: "health worker", keywords: "doctor" },
      { char: "🧑‍🍳", name: "cook", keywords: "chef" },
    ],
  },
  {
    id: "nature",
    label: "Animals & Nature",
    icon: "🐻",
    emojis: [
      { char: "🐶", name: "dog face", keywords: "puppy" },
      { char: "🐱", name: "cat face", keywords: "kitten" },
      { char: "🐭", name: "mouse face", keywords: "mouse" },
      { char: "🐹", name: "hamster", keywords: "hamster" },
      { char: "🐰", name: "rabbit face", keywords: "bunny" },
      { char: "🦊", name: "fox", keywords: "fox" },
      { char: "🐻", name: "bear", keywords: "bear" },
      { char: "🐼", name: "panda", keywords: "panda" },
      { char: "🐨", name: "koala", keywords: "koala" },
      { char: "🐯", name: "tiger face", keywords: "tiger" },
      { char: "🦁", name: "lion", keywords: "lion" },
      { char: "🐮", name: "cow face", keywords: "cow" },
      { char: "🐷", name: "pig face", keywords: "pig" },
      { char: "🐸", name: "frog", keywords: "frog" },
      { char: "🐵", name: "monkey face", keywords: "monkey" },
      { char: "🐔", name: "chicken", keywords: "chicken" },
      { char: "🐧", name: "penguin", keywords: "penguin" },
      { char: "🐦", name: "bird", keywords: "bird" },
      { char: "🦄", name: "unicorn", keywords: "unicorn" },
      { char: "🐝", name: "honeybee", keywords: "bee" },
      { char: "🦋", name: "butterfly", keywords: "butterfly" },
      { char: "🐢", name: "turtle", keywords: "turtle" },
      { char: "🐍", name: "snake", keywords: "snake" },
      { char: "🐙", name: "octopus", keywords: "octopus" },
      { char: "🦀", name: "crab", keywords: "crab" },
      { char: "🐬", name: "dolphin", keywords: "dolphin" },
      { char: "🐳", name: "whale", keywords: "whale" },
      { char: "🦈", name: "shark", keywords: "shark" },
      { char: "🐊", name: "crocodile", keywords: "alligator" },
      { char: "🦓", name: "zebra", keywords: "zebra" },
      { char: "🦒", name: "giraffe", keywords: "giraffe" },
      { char: "🐘", name: "elephant", keywords: "elephant" },
      { char: "🦕", name: "dinosaur", keywords: "dinosaur" },
      { char: "🌵", name: "cactus", keywords: "plant desert" },
      { char: "🎄", name: "christmas tree", keywords: "holiday" },
      { char: "🌲", name: "evergreen tree", keywords: "tree" },
      { char: "🌳", name: "deciduous tree", keywords: "tree" },
      { char: "🌴", name: "palm tree", keywords: "tropical" },
      { char: "🌱", name: "seedling", keywords: "plant grow" },
      { char: "🌿", name: "herb", keywords: "plant" },
      { char: "🍀", name: "four leaf clover", keywords: "luck" },
      { char: "🍁", name: "maple leaf", keywords: "autumn" },
      { char: "🌺", name: "hibiscus", keywords: "flower" },
      { char: "🌻", name: "sunflower", keywords: "flower" },
      { char: "🌹", name: "rose", keywords: "flower love" },
      { char: "🌷", name: "tulip", keywords: "flower" },
      { char: "🌸", name: "cherry blossom", keywords: "flower" },
      { char: "💐", name: "bouquet", keywords: "flowers" },
      { char: "🌎", name: "globe americas", keywords: "world earth" },
      { char: "🌙", name: "crescent moon", keywords: "night" },
      { char: "☀️", name: "sun", keywords: "sunny" },
      { char: "⭐", name: "star", keywords: "star" },
      { char: "🌈", name: "rainbow", keywords: "rainbow" },
      { char: "🔥", name: "fire", keywords: "hot flame" },
      { char: "❄️", name: "snowflake", keywords: "cold snow" },
      { char: "⚡", name: "high voltage", keywords: "lightning" },
    ],
  },
  {
    id: "food",
    label: "Food & Drink",
    icon: "🍔",
    emojis: [
      { char: "🍎", name: "red apple", keywords: "fruit" },
      { char: "🍐", name: "pear", keywords: "fruit" },
      { char: "🍊", name: "tangerine", keywords: "orange fruit" },
      { char: "🍋", name: "lemon", keywords: "fruit" },
      { char: "🍌", name: "banana", keywords: "fruit" },
      { char: "🍉", name: "watermelon", keywords: "fruit" },
      { char: "🍇", name: "grapes", keywords: "fruit" },
      { char: "🍓", name: "strawberry", keywords: "fruit" },
      { char: "🫐", name: "blueberries", keywords: "fruit" },
      { char: "🍒", name: "cherries", keywords: "fruit" },
      { char: "🍑", name: "peach", keywords: "fruit" },
      { char: "🥭", name: "mango", keywords: "fruit" },
      { char: "🍍", name: "pineapple", keywords: "fruit" },
      { char: "🥥", name: "coconut", keywords: "fruit" },
      { char: "🥑", name: "avocado", keywords: "fruit" },
      { char: "🍅", name: "tomato", keywords: "vegetable" },
      { char: "🥕", name: "carrot", keywords: "vegetable" },
      { char: "🌽", name: "ear of corn", keywords: "vegetable" },
      { char: "🌶️", name: "hot pepper", keywords: "spicy" },
      { char: "🥦", name: "broccoli", keywords: "vegetable" },
      { char: "🍞", name: "bread", keywords: "bakery" },
      { char: "🥐", name: "croissant", keywords: "bakery" },
      { char: "🧀", name: "cheese wedge", keywords: "cheese" },
      { char: "🍳", name: "cooking", keywords: "egg breakfast" },
      { char: "🥞", name: "pancakes", keywords: "breakfast" },
      { char: "🍔", name: "hamburger", keywords: "burger food" },
      { char: "🍟", name: "french fries", keywords: "fries" },
      { char: "🍕", name: "pizza", keywords: "pizza" },
      { char: "🌭", name: "hot dog", keywords: "hotdog" },
      { char: "🌮", name: "taco", keywords: "mexican" },
      { char: "🌯", name: "burrito", keywords: "mexican" },
      { char: "🍜", name: "steaming bowl", keywords: "ramen noodles" },
      { char: "🍣", name: "sushi", keywords: "japanese" },
      { char: "🍱", name: "bento box", keywords: "japanese" },
      { char: "🍚", name: "cooked rice", keywords: "rice" },
      { char: "🍛", name: "curry rice", keywords: "curry" },
      { char: "🍝", name: "spaghetti", keywords: "pasta" },
      { char: "🍩", name: "doughnut", keywords: "donut dessert" },
      { char: "🍪", name: "cookie", keywords: "dessert" },
      { char: "🎂", name: "birthday cake", keywords: "cake birthday" },
      { char: "🍰", name: "shortcake", keywords: "cake dessert" },
      { char: "🧁", name: "cupcake", keywords: "dessert" },
      { char: "🍫", name: "chocolate bar", keywords: "chocolate" },
      { char: "🍿", name: "popcorn", keywords: "movie snack" },
      { char: "☕", name: "hot beverage", keywords: "coffee tea" },
      { char: "🍵", name: "teacup without handle", keywords: "tea" },
      { char: "🥤", name: "cup with straw", keywords: "drink soda" },
      { char: "🧋", name: "bubble tea", keywords: "boba" },
      { char: "🍺", name: "beer mug", keywords: "beer" },
      { char: "🍷", name: "wine glass", keywords: "wine" },
      { char: "🥂", name: "clinking glasses", keywords: "cheers toast" },
      { char: "🍾", name: "bottle with popping cork", keywords: "celebrate" },
    ],
  },
  {
    id: "activity",
    label: "Activity",
    icon: "⚽",
    emojis: [
      { char: "⚽", name: "soccer ball", keywords: "football sport" },
      { char: "🏀", name: "basketball", keywords: "sport" },
      { char: "🏈", name: "american football", keywords: "sport" },
      { char: "⚾", name: "baseball", keywords: "sport" },
      { char: "🎾", name: "tennis", keywords: "sport" },
      { char: "🏐", name: "volleyball", keywords: "sport" },
      { char: "🏉", name: "rugby football", keywords: "sport" },
      { char: "🎱", name: "pool 8 ball", keywords: "billiards" },
      { char: "🏓", name: "ping pong", keywords: "table tennis" },
      { char: "🏸", name: "badminton", keywords: "sport" },
      { char: "🥊", name: "boxing glove", keywords: "boxing" },
      { char: "🥋", name: "martial arts uniform", keywords: "karate" },
      { char: "⛳", name: "flag in hole", keywords: "golf" },
      { char: "🎣", name: "fishing pole", keywords: "fishing" },
      { char: "🏹", name: "bow and arrow", keywords: "archery" },
      { char: "🎯", name: "direct hit", keywords: "target goal" },
      { char: "🎮", name: "video game", keywords: "gaming" },
      { char: "🕹️", name: "joystick", keywords: "gaming" },
      { char: "🎲", name: "game die", keywords: "dice game" },
      { char: "🧩", name: "puzzle piece", keywords: "puzzle" },
      { char: "🎨", name: "artist palette", keywords: "art" },
      { char: "🎬", name: "clapper board", keywords: "movie" },
      { char: "🎤", name: "microphone", keywords: "sing" },
      { char: "🎧", name: "headphone", keywords: "music" },
      { char: "🎸", name: "guitar", keywords: "music" },
      { char: "🎹", name: "musical keyboard", keywords: "piano" },
      { char: "🥁", name: "drum", keywords: "music" },
      { char: "🎺", name: "trumpet", keywords: "music" },
      { char: "🎻", name: "violin", keywords: "music" },
      { char: "🎉", name: "party popper", keywords: "celebrate party" },
      { char: "🎊", name: "confetti ball", keywords: "celebrate" },
      { char: "🎁", name: "wrapped gift", keywords: "gift present" },
      { char: "🏆", name: "trophy", keywords: "winner award" },
      { char: "🥇", name: "first place medal", keywords: "gold winner" },
      { char: "🏅", name: "sports medal", keywords: "medal" },
      { char: "🎖️", name: "military medal", keywords: "award" },
      { char: "🎪", name: "circus tent", keywords: "circus" },
    ],
  },
  {
    id: "travel",
    label: "Travel & Places",
    icon: "✈️",
    emojis: [
      { char: "🚗", name: "automobile", keywords: "car" },
      { char: "🚕", name: "taxi", keywords: "car" },
      { char: "🚙", name: "sport utility vehicle", keywords: "car" },
      { char: "🚌", name: "bus", keywords: "transport" },
      { char: "🚎", name: "trolleybus", keywords: "transport" },
      { char: "🏎️", name: "racing car", keywords: "fast" },
      { char: "🚓", name: "police car", keywords: "police" },
      { char: "🚑", name: "ambulance", keywords: "emergency" },
      { char: "🚒", name: "fire engine", keywords: "fire" },
      { char: "🚚", name: "delivery truck", keywords: "truck" },
      { char: "🚜", name: "tractor", keywords: "farm" },
      { char: "🛴", name: "kick scooter", keywords: "scooter" },
      { char: "🚲", name: "bicycle", keywords: "bike" },
      { char: "🛵", name: "motor scooter", keywords: "scooter" },
      { char: "🏍️", name: "motorcycle", keywords: "bike" },
      { char: "🚨", name: "police car light", keywords: "siren alert" },
      { char: "🚀", name: "rocket", keywords: "launch startup" },
      { char: "🛸", name: "flying saucer", keywords: "ufo" },
      { char: "✈️", name: "airplane", keywords: "travel flight" },
      { char: "🛫", name: "airplane departure", keywords: "flight" },
      { char: "🛬", name: "airplane arrival", keywords: "flight" },
      { char: "🚁", name: "helicopter", keywords: "fly" },
      { char: "⛵", name: "sailboat", keywords: "boat" },
      { char: "🚢", name: "ship", keywords: "boat" },
      { char: "🚂", name: "locomotive", keywords: "train" },
      { char: "🚆", name: "train", keywords: "rail" },
      { char: "🚇", name: "metro", keywords: "subway" },
      { char: "🗺️", name: "world map", keywords: "map travel" },
      { char: "🗽", name: "statue of liberty", keywords: "new york" },
      { char: "🗼", name: "tokyo tower", keywords: "japan" },
      { char: "🏰", name: "castle", keywords: "building" },
      { char: "🏠", name: "house", keywords: "home" },
      { char: "🏢", name: "office building", keywords: "work" },
      { char: "🏥", name: "hospital", keywords: "medical" },
      { char: "🏫", name: "school", keywords: "education" },
      { char: "🏖️", name: "beach with umbrella", keywords: "vacation" },
      { char: "🏝️", name: "desert island", keywords: "vacation" },
      { char: "🏔️", name: "snow capped mountain", keywords: "mountain" },
      { char: "🌋", name: "volcano", keywords: "mountain" },
      { char: "🏕️", name: "camping", keywords: "camp" },
      { char: "🌃", name: "night with stars", keywords: "city night" },
      { char: "🌆", name: "cityscape at dusk", keywords: "city" },
      { char: "🎡", name: "ferris wheel", keywords: "amusement" },
    ],
  },
  {
    id: "objects",
    label: "Objects",
    icon: "💡",
    emojis: [
      { char: "💡", name: "light bulb", keywords: "idea" },
      { char: "🔦", name: "flashlight", keywords: "light" },
      { char: "🕯️", name: "candle", keywords: "light" },
      { char: "📱", name: "mobile phone", keywords: "phone" },
      { char: "💻", name: "laptop", keywords: "computer work" },
      { char: "⌨️", name: "keyboard", keywords: "computer" },
      { char: "🖥️", name: "desktop computer", keywords: "computer" },
      { char: "🖨️", name: "printer", keywords: "print" },
      { char: "🖱️", name: "computer mouse", keywords: "mouse" },
      { char: "💾", name: "floppy disk", keywords: "save" },
      { char: "💿", name: "optical disc", keywords: "cd" },
      { char: "📷", name: "camera", keywords: "photo" },
      { char: "📸", name: "camera with flash", keywords: "photo" },
      { char: "📹", name: "video camera", keywords: "record" },
      { char: "🎥", name: "movie camera", keywords: "film" },
      { char: "📺", name: "television", keywords: "tv" },
      { char: "📻", name: "radio", keywords: "music" },
      { char: "🔋", name: "battery", keywords: "power" },
      { char: "🔌", name: "electric plug", keywords: "power" },
      { char: "📚", name: "books", keywords: "read study" },
      { char: "📖", name: "open book", keywords: "read" },
      { char: "📝", name: "memo", keywords: "note write" },
      { char: "✏️", name: "pencil", keywords: "write" },
      { char: "🖊️", name: "pen", keywords: "write" },
      { char: "📌", name: "pushpin", keywords: "pin" },
      { char: "📎", name: "paperclip", keywords: "attach" },
      { char: "📁", name: "file folder", keywords: "folder" },
      { char: "📂", name: "open file folder", keywords: "folder" },
      { char: "📅", name: "calendar", keywords: "date schedule" },
      { char: "📆", name: "tear off calendar", keywords: "date" },
      { char: "📊", name: "bar chart", keywords: "data analytics" },
      { char: "📈", name: "chart increasing", keywords: "growth analytics" },
      { char: "📉", name: "chart decreasing", keywords: "down" },
      { char: "💰", name: "money bag", keywords: "money" },
      { char: "💳", name: "credit card", keywords: "payment" },
      { char: "💎", name: "gem stone", keywords: "diamond" },
      { char: "🔑", name: "key", keywords: "key" },
      { char: "🔒", name: "locked", keywords: "secure lock" },
      { char: "🔓", name: "unlocked", keywords: "open" },
      { char: "🔔", name: "bell", keywords: "notification" },
      { char: "📢", name: "loudspeaker", keywords: "announce" },
      { char: "📣", name: "megaphone", keywords: "announce" },
      { char: "🛒", name: "shopping cart", keywords: "shop" },
      { char: "🛍️", name: "shopping bags", keywords: "shop" },
      { char: "🎓", name: "graduation cap", keywords: "education" },
      { char: "🧪", name: "test tube", keywords: "science" },
      { char: "🔬", name: "microscope", keywords: "science" },
      { char: "🔭", name: "telescope", keywords: "science space" },
      { char: "🩺", name: "stethoscope", keywords: "medical" },
      { char: "💊", name: "pill", keywords: "medicine" },
      { char: "🧰", name: "toolbox", keywords: "tools" },
      { char: "🔧", name: "wrench", keywords: "tools" },
      { char: "🔨", name: "hammer", keywords: "tools" },
      { char: "⚙️", name: "gear", keywords: "settings" },
    ],
  },
  {
    id: "symbols",
    label: "Symbols",
    icon: "❤️",
    emojis: [
      { char: "❤️", name: "red heart", keywords: "love" },
      { char: "🧡", name: "orange heart", keywords: "love" },
      { char: "💛", name: "yellow heart", keywords: "love" },
      { char: "💚", name: "green heart", keywords: "love" },
      { char: "💙", name: "blue heart", keywords: "love" },
      { char: "💜", name: "purple heart", keywords: "love" },
      { char: "🖤", name: "black heart", keywords: "love" },
      { char: "🤍", name: "white heart", keywords: "love" },
      { char: "🤎", name: "brown heart", keywords: "love" },
      { char: "💔", name: "broken heart", keywords: "sad love" },
      { char: "❣️", name: "heart exclamation", keywords: "love" },
      { char: "💕", name: "two hearts", keywords: "love" },
      { char: "💞", name: "revolving hearts", keywords: "love" },
      { char: "💓", name: "beating heart", keywords: "love" },
      { char: "💗", name: "growing heart", keywords: "love" },
      { char: "💖", name: "sparkling heart", keywords: "love" },
      { char: "💘", name: "heart with arrow", keywords: "love" },
      { char: "💝", name: "heart with ribbon", keywords: "love gift" },
      { char: "💯", name: "hundred points", keywords: "100 perfect" },
      { char: "✅", name: "check mark button", keywords: "done yes" },
      { char: "☑️", name: "check box with check", keywords: "done" },
      { char: "✔️", name: "check mark", keywords: "done" },
      { char: "❌", name: "cross mark", keywords: "no wrong" },
      { char: "❎", name: "cross mark button", keywords: "no" },
      { char: "➕", name: "plus", keywords: "add" },
      { char: "➖", name: "minus", keywords: "remove" },
      { char: "➗", name: "divide", keywords: "math" },
      { char: "✖️", name: "multiply", keywords: "math" },
      { char: "💲", name: "dollar sign", keywords: "money" },
      { char: "💱", name: "currency exchange", keywords: "money" },
      { char: "♻️", name: "recycling symbol", keywords: "recycle" },
      { char: "⚠️", name: "warning", keywords: "alert" },
      { char: "🚫", name: "prohibited", keywords: "no stop" },
      { char: "❓", name: "question mark", keywords: "question" },
      { char: "❔", name: "white question mark", keywords: "question" },
      { char: "❗", name: "exclamation mark", keywords: "alert" },
      { char: "‼️", name: "double exclamation mark", keywords: "alert" },
      { char: "💤", name: "zzz", keywords: "sleep" },
      { char: "💬", name: "speech balloon", keywords: "chat message" },
      { char: "💭", name: "thought balloon", keywords: "think" },
      { char: "🗯️", name: "right anger bubble", keywords: "angry" },
      { char: "🔴", name: "red circle", keywords: "red" },
      { char: "🟠", name: "orange circle", keywords: "orange" },
      { char: "🟡", name: "yellow circle", keywords: "yellow" },
      { char: "🟢", name: "green circle", keywords: "green" },
      { char: "🔵", name: "blue circle", keywords: "blue" },
      { char: "🟣", name: "purple circle", keywords: "purple" },
      { char: "⚫", name: "black circle", keywords: "black" },
      { char: "⚪", name: "white circle", keywords: "white" },
      { char: "🔺", name: "red triangle pointed up", keywords: "up" },
      { char: "🔻", name: "red triangle pointed down", keywords: "down" },
      { char: "🔶", name: "large orange diamond", keywords: "diamond" },
      { char: "🔷", name: "large blue diamond", keywords: "diamond" },
      { char: "✨", name: "sparkles", keywords: "shine magic" },
      { char: "🌟", name: "glowing star", keywords: "star" },
      { char: "💫", name: "dizzy", keywords: "star" },
      { char: "⚡", name: "high voltage", keywords: "lightning" },
      { char: "💥", name: "collision", keywords: "boom" },
      { char: "💦", name: "sweat droplets", keywords: "water" },
      { char: "💨", name: "dashing away", keywords: "fast wind" },
    ],
  },
  {
    id: "flags",
    label: "Flags",
    icon: "🏳️",
    emojis: [
      { char: "🏳️", name: "white flag", keywords: "flag" },
      { char: "🏴", name: "black flag", keywords: "flag" },
      { char: "🏁", name: "chequered flag", keywords: "race finish" },
      { char: "🚩", name: "triangular flag", keywords: "flag" },
      { char: "🏴‍☠️", name: "pirate flag", keywords: "pirate" },
      { char: "🇺🇸", name: "United States flag", keywords: "usa america" },
      { char: "🇬🇧", name: "United Kingdom flag", keywords: "uk britain" },
      { char: "🇨🇦", name: "Canada flag", keywords: "canada" },
      { char: "🇦🇺", name: "Australia flag", keywords: "australia" },
      { char: "🇮🇳", name: "India flag", keywords: "india" },
      { char: "🇩🇪", name: "Germany flag", keywords: "germany" },
      { char: "🇫🇷", name: "France flag", keywords: "france" },
      { char: "🇪🇸", name: "Spain flag", keywords: "spain" },
      { char: "🇮🇹", name: "Italy flag", keywords: "italy" },
      { char: "🇯🇵", name: "Japan flag", keywords: "japan" },
      { char: "🇨🇳", name: "China flag", keywords: "china" },
      { char: "🇧🇷", name: "Brazil flag", keywords: "brazil" },
      { char: "🇲🇽", name: "Mexico flag", keywords: "mexico" },
      { char: "🇰🇷", name: "South Korea flag", keywords: "korea" },
      { char: "🇿🇦", name: "South Africa flag", keywords: "africa" },
      { char: "🇦🇪", name: "United Arab Emirates flag", keywords: "uae dubai" },
      { char: "🇸🇬", name: "Singapore flag", keywords: "singapore" },
      { char: "🇳🇿", name: "New Zealand flag", keywords: "new zealand" },
      { char: "🇮🇪", name: "Ireland flag", keywords: "ireland" },
    ],
  },
];

const RECENT_KEY = "scaleup-chat-recent-emojis";

function readRecentEmojis(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string").slice(0, 16)
      : [];
  } catch {
    return [];
  }
}

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    EMOJI_CATEGORIES[0]?.id ?? ""
  );
  const [recent, setRecent] = useState<string[]>(readRecentEmojis);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return null;

    return EMOJI_CATEGORIES.flatMap((category) =>
      category.emojis.filter((emoji) =>
        `${emoji.name} ${emoji.keywords ?? ""} ${category.label}`
          .toLowerCase()
          .includes(normalized)
      )
    );
  }, [query]);

  const currentCategory = EMOJI_CATEGORIES.find(
    (category) => category.id === activeCategory
  );

  const handleSelect = (emoji: string) => {
    const nextRecent = [emoji, ...recent.filter((item) => item !== emoji)].slice(
      0,
      16
    );

    setRecent(nextRecent);

    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(nextRecent));
    } catch {
      // Storage may be unavailable in private mode.
    }

    onSelect(emoji);
  };

  const renderGrid = (emojis: EmojiEntry[]) => (
    <div className="grid grid-cols-8 gap-1">
      {emojis.map((emoji, index) => (
        <button
          key={`${emoji.char}-${emoji.name}-${index}`}
          type="button"
          title={emoji.name}
          onClick={() => handleSelect(emoji.char)}
          className="flex h-8 items-center justify-center rounded-md text-xl transition-colors hover:bg-accent"
        >
          {emoji.char}
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-[20rem] max-w-[calc(100vw-2rem)]">
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search emojis..."
          className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-8 text-xs outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear emoji search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {!searchResults && (
        <div className="mb-2 flex items-center justify-between gap-0.5 overflow-x-auto pb-1">
          {EMOJI_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              title={category.label}
              onClick={() => setActiveCategory(category.id)}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-base transition-colors ${
                activeCategory === category.id
                  ? "bg-primary/10 ring-1 ring-primary/30"
                  : "hover:bg-accent"
              }`}
            >
              {category.icon}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-56 overflow-y-auto pr-1">
        {searchResults ? (
          searchResults.length > 0 ? (
            renderGrid(searchResults)
          ) : (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No emojis found for “{query}”
            </p>
          )
        ) : (
          <div className="space-y-3">
            {recent.length > 0 && (
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Recently used
                </p>
                {renderGrid(
                  recent.map((char) => ({
                    char,
                    name: char,
                  }))
                )}
              </div>
            )}

            {currentCategory && (
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {currentCategory.label}
                </p>
                {renderGrid(currentCategory.emojis)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

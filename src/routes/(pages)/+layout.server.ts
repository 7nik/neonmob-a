const QUOTE_BANK = [
    "A website for the greatest people on the internet.",
    "We bring joy to people with at least a 28kbps connection.",
    "A picture is worth a thousand words.",
    "Go Green, Collect Digital.",
    "A line is a dot that went for a walk.",
    "All art is but imitation of nature.",
    "There is a purchase pack option, you should use it.",
    "This world is but a canvas to our imagination.",
    "Insanity is opening the same free pack over and over again, but expecting different results.",
    "An incomplete series is like a body without a soul.",
    "Life is like a pack of free packs, you never know what you're gonna get.",
    "Collect and prosper.",
    "Houston, we have a collector.",
    "I like my prints as I like my steak: rare.",
    "Hey, I just met you, and this is crazy! But here's my offer, so accept it maybe?",
    "Collecting is not a hobby, it's a lifestyle.",
    "Ready! Set! Collect!",
    "Trade offers are like buses: you wait around for one, then four come at once.",
    "Don't follow the hype, create it.",
    "Follow the Neon Brick Road.",
    "Trade your doubles and get rid of your bobbles.",
    "A free pack a day keeps the doctor away.",
];

// select quote on the server side so it won't change at hydration
export const load = () => ({
    quote: QUOTE_BANK[Math.floor(QUOTE_BANK.length * Math.random())],
});

// ====== Voice Assistant (Full Browser Version) ======
// Features: Auto language detect (Hindi/English), many commands, safe Google search open (no popup block)

// DOM refs
let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");

// ---- Helpers ----
function speak(text, lang = "en-IN") {
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1; u.pitch = 1; u.volume = 1; u.lang = lang;
  window.speechSynthesis.cancel(); // stop previous
  window.speechSynthesis.speak(u);
}

function detectLanguage(text) {
  const hindiRegex = /[\u0900-\u097F]/; // Devanagari
  // quick Hinglish hints:
  const romanHindiHints = ["kholo","samay","tarikh","kaun","tum","namaste","gaana","chalao","dikhao","karo","batao","ka"];
  if (hindiRegex.test(text) || romanHindiHints.some(w => text.includes(w))) return "hi-IN";
  return "en-IN";
}

function wishMe() {
  const hours = new Date().getHours();
  if (hours < 12) speak("Good Morning Sir", "en-IN");
  else if (hours < 16) speak("Good Afternoon Sir", "en-IN");
  else speak("Good Evening Sir", "en-IN");
}

function openInNewTabSafe(url) {
  // anchor click avoids popup blockers in many browsers
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  a.click();
}

function googleSearchSafe(query, delayMs = 1200) {
  setTimeout(() => openInNewTabSafe(`https://www.google.com/search?q=${encodeURIComponent(query)}`), delayMs);
}

function includesAny(message, arr) {
  return arr.some(k => message.includes(k));
}

function stripPhrase(message, phrases) {
  let m = message;
  phrases.forEach(p => { m = m.replace(p, " "); });
  return m.replace(/\s+/g, " ").trim();
}

// ---- Boot greeting ----
window.addEventListener("load", wishMe);

// ---- Speech recognition ----
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SR();
recognition.lang = "hi-IN";   // works well for Hindi + Hinglish
recognition.interimResults = false;
recognition.maxAlternatives = 1;

recognition.onresult = (e) => {
  const transcript = e.results[e.resultIndex][0].transcript;
  content.innerText = transcript;
  takeCommand(transcript.toLowerCase());
};

btn.addEventListener("click", () => {
  recognition.start();
  btn.style.display = "none";
  voice.style.display = "block";
});

// ---- Command router ----
function takeCommand(message) {
  btn.style.display = "flex";
  voice.style.display = "none";

  const lang = detectLanguage(message);
  const hi = (t)=>speak(t,"hi-IN");
  const en = (t)=>speak(t,"en-IN");
  const say = (hiText, enText)=> (lang==="hi-IN" ? hi(hiText) : en(enText));

  // ===== GREETINGS / IDENTITY =====
  if (includesAny(message, ["hello","hey","hi","namaste","नमस्ते","हैलो"])) {
    say("नमस्ते, मैं आपकी क्या मदद कर सकती हूँ?", "Hello! What can I help you with?");
    return;
  }
  if (includesAny(message, ["who are you","tum kaun ho","तुम कौन हो","what are you"])) {
    say("मैं एक वर्चुअल असिस्टेंट हूँ, जिसे विनय डॉन ने बनाया है।", "I’m a virtual assistant created by Vinay Don.");
    return;
  }

  // ===== TIME / DATE / DAY =====
  if (includesAny(message, ["time","samay","समय"])) {
    const time = new Date().toLocaleString(undefined,{hour:"numeric",minute:"numeric"});
    say(`अभी समय है ${time}`, `The time is ${time}`);
    return;
  }
  if (includesAny(message, ["date","tarikh","तारीख"])) {
    const d = new Date().toLocaleString(undefined,{day:"numeric",month:"short",year:"numeric"});
    say(`आज की तारीख है ${d}`, `Today's date is ${d}`);
    return;
  }
  if (includesAny(message, ["day","aaj ka din","दिन"])) {
    const w = new Date().toLocaleString(undefined,{weekday:"long"});
    say(`आज दिन है ${w}`, `Today is ${w}`);
    return;
  }

  // ===== QUICK OPEN WEBSITES =====
  if (includesAny(message, ["open youtube","youtube kholo","यूट्यूब खोलो"])) {
    say("यूट्यूब खोल रही हूँ...", "Opening YouTube...");
    openInNewTabSafe("https://www.youtube.com/");
    return;
  }
  if (includesAny(message, ["open google","google kholo","गूगल खोलो"])) {
    say("गूगल खोल रही हूँ...", "Opening Google...");
    openInNewTabSafe("https://www.google.com/");
    return;
  }
  if (includesAny(message, ["open instagram","instagram kholo","इंस्टाग्राम खोलो"])) {
    say("इंस्टाग्राम खोल रही हूँ...", "Opening Instagram...");
    openInNewTabSafe("https://www.instagram.com/");
    return;
  }
  if (includesAny(message, ["open whatsapp","whatsapp kholo","व्हाट्सऐप खोलो","व्हाट्सएप खोलो"])) {
    say("व्हाट्सऐप वेब खोल रही हूँ...", "Opening WhatsApp Web...");
    openInNewTabSafe("https://web.whatsapp.com/");
    return;
  }
  if (includesAny(message, ["open facebook","facebook kholo","फेसबुक खोलो"])) {
    say("फेसबुक खोल रही हूँ...", "Opening Facebook...");
    openInNewTabSafe("https://www.facebook.com/");
    return;
  }
  if (includesAny(message, ["open twitter","open x","twitter kholo","ट्विटर खोलो"])) {
    say("ट्विटर खोल रही हूँ...", "Opening Twitter...");
    openInNewTabSafe("https://twitter.com/");
    return;
  }
  if (includesAny(message, ["open linkedin","linkedin kholo","लिंक्डइन खोलो"])) {
    say("लिंक्डइन खोल रही हूँ...", "Opening LinkedIn...");
    openInNewTabSafe("https://www.linkedin.com/");
    return;
  }
  if (includesAny(message, ["open gmail","gmail kholo","जीमेल खोलो"])) {
    say("जीमेल खोल रही हूँ...", "Opening Gmail...");
    openInNewTabSafe("https://mail.google.com/");
    return;
  }
  if (includesAny(message, ["open maps","maps kholo","मैप खोलो","map kholo"])) {
    say("गूगल मैप्स खोल रही हूँ...", "Opening Google Maps...");
    openInNewTabSafe("https://maps.google.com/");
    return;
  }
  if (includesAny(message, ["open github","github kholo"])) {
    say("गिटहब खोल रही हूँ...", "Opening GitHub...");
    openInNewTabSafe("https://github.com/");
    return;
  }
  if (includesAny(message, ["open amazon","amazon kholo","अमेज़न खोलो"])) {
    say("अमेज़न खोल रही हूँ...", "Opening Amazon...");
    openInNewTabSafe("https://www.amazon.in/");
    return;
  }

  // ===== TOOLS / UTILITIES =====
  if (includesAny(message, ["open calculator","calculator kholo","कैलकुलेटर खोलो"])) {
    say("कैलकुलेटर खोल रही हूँ...", "Opening calculator...");
    openInNewTabSafe("https://www.google.com/search?q=calculator");
    return;
  }
  if (includesAny(message, ["open notepad","notepad kholo","नोटपैड खोलो"])) {
    say("ऑनलाइन नोटपैड खोल रही हूँ...", "Opening online notepad...");
    openInNewTabSafe("https://anotepad.com/");
    return;
  }
  if (includesAny(message, ["news","samachar","समाचार","latest news"])) {
    say("ताज़ा समाचार खोल रही हूँ...", "Opening latest news...");
    openInNewTabSafe("https://news.google.com/");
    return;
  }
  if (includesAny(message, ["browser info","browser","which browser","user agent"])) {
    const info = navigator.userAgent;
    say(`आप ${info} उपयोग कर रहे हैं।`, `You are using ${info}.`);
    return;
  }
  if (includesAny(message, ["battery","battery level","बैटरी"])) {
    if (navigator.getBattery) {
      navigator.getBattery().then(b => {
        const level = Math.round(b.level * 100);
        say(`बैटरी ${level}% चार्ज है।`, `Battery is at ${level} percent.`);
      });
    } else {
      say("बैटरी जानकारी उपलब्ध नहीं है।", "Battery info not available.");
    }
    return;
  }
  if (includesAny(message, ["my location","mera location","मेरा स्थान","location"])) {
    say("मैप्स पर स्थान दिखा रही हूँ...", "Opening maps for your location...");
    openInNewTabSafe("https://www.google.com/maps");
    return;
  }

  // ===== ENTERTAINMENT =====
  if (includesAny(message, ["play music","music chalao","गाना चलाओ","gaana chalao"])) {
    say("यूट्यूब म्यूज़िक खोल रही हूँ...", "Opening YouTube Music...");
    openInNewTabSafe("https://music.youtube.com/");
    return;
  }
  if (includesAny(message, ["joke","joke sunao","चुटकुला","jokes"])) {
    const jokes = [
      "Why don’t skeletons fight each other? Because they don’t have the guts.",
      "गब्बर: कितने आदमी थे? — बसंती: दो। — गब्बर: तो तालियां तो बजा सकती थी!",
      "Teacher: Why are you late? — Student: Sir, board pe likha tha ‘School Ahead’, so I went home."
    ];
    const j = jokes[Math.floor(Math.random()*jokes.length)];
    lang==="hi-IN" ? hi(j) : en(j);
    return;
  }

  // ===== SEARCH INTENTS =====
  if (includesAny(message, ["youtube search","search on youtube","यूट्यूब खोजो","यूट्यूब सर्च"])) {
    const q = stripPhrase(message, ["youtube search","search on youtube","यूट्यूब खोजो","यूट्यूब सर्च"]);
    say(`यूट्यूब पर खोज रही हूँ: ${q||"trending"}`, `Searching YouTube for ${q||"trending"}`);
    openInNewTabSafe(`https://www.youtube.com/results?search_query=${encodeURIComponent(q||"trending")}`);
    return;
  }
  if (includesAny(message, ["wikipedia","vikipedia","विकिपीडिया"])) {
    const q = stripPhrase(message, ["wikipedia","vikipedia","विकिपीडिया","on"]);
    say(`विकिपीडिया पर खोज रही हूँ: ${q||"home"}`, `Searching Wikipedia for ${q||"home"}`);
    openInNewTabSafe(`https://en.wikipedia.org/wiki/${encodeURIComponent((q||"Main_Page").trim())}`);
    return;
  }
  if (includesAny(message, ["search","find","ढूँढो","dhundo","खोजो"])) {
    const q = stripPhrase(message, ["search","find","ढूँढो","dhundo","खोजो","for","ke liye"]);
    say(`गूगल पर खोज रही हूँ: ${q||"news"}`, `Searching Google for ${q||"news"}`);
    googleSearchSafe(q||"news", 800);
    return;
  }
  if (includesAny(message, ["translate","अनुवाद","translate to hindi","translate to english"])) {
    const q = stripPhrase(message, ["translate","अनुवाद","translate to hindi","translate to english"]);
    say("गूगल ट्रांसलेट खोल रही हूँ...", "Opening Google Translate...");
    openInNewTabSafe(`https://translate.google.com/?sl=auto&tl=${lang==="hi-IN"?"en":"hi"}&text=${encodeURIComponent(q)}&op=translate`);
    return;
  }

  // ===== DEFAULT FALLBACK: GOOGLE SEARCH =====
  if (lang === "hi-IN") {
    hi("इंटरनेट पर आपके प्रश्न के बारे में यह मिला, खोल रही हूँ…");
  } else {
    en("This is what I found on the internet, opening results…");
  }
  googleSearchSafe(message, 1000);
}

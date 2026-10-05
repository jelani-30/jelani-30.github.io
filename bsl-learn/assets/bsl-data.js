/* UK British Sign Language data — NOT ASL.
   Fingerspelling descriptions follow the standard BSL two-handed alphabet.
   Always cross-check with Sign BSL / Commanding Hands / NDCS videos.
   External video URLs are demos we do NOT host. */

window.BSL_DATA = {
  disclaimer: "UK BSL only. Two-handed fingerspelling differs from ASL. Prefer Deaf-led video demos. We do not host external dictionary video files.",
  localDemo: "assets/media/demo-loop.mp4",
  dictLinks: {
    signbsl: "https://www.signbsl.com/sign/",
    signbank: "https://bslsignbank.ucl.ac.uk/",
    britishSign: "https://www.british-sign.co.uk/",
    commandingHandsAlphabet: "https://www.youtube.com/@CommandingHands",
    alphabetChart: "https://www.british-sign.co.uk/fingerspelling-alphabet-charts/",
    ndcs: "https://www.ndcs.org.uk/advice-and-support/language-and-communication/sign-language/british-sign-language-bsl-videos-and-resources",
    schoolOfSigns: "https://theschoolofsigns.org.uk/",
    bslSearch: "https://bslsearch.co.uk/dictionary.php",
    lumo: "https://lumotv.co.uk/",
    commandingHandsCourse: "https://commandinghands.co.uk/online-bsl-course/"
  },

  demoSources: [
    { id: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", note: "Largest free BSL video dictionary — many Deaf contributors.", url: "https://www.signbsl.com/" },
    { id: "signbank", label: "BSL SignBank (UCL)", variety: "Deaf adult / research", note: "Academic UK dictionary with regional variants.", url: "https://bslsignbank.ucl.ac.uk/" },
    { id: "british-sign", label: "british-sign.co.uk", variety: "multi-signer dictionary", note: "Everyday signs + free alphabet tools.", url: "https://www.british-sign.co.uk/" },
    { id: "commanding-hands", label: "Commanding Hands YT", variety: "family/child-friendly", note: "Short beginner lessons; Deaf-led tuition channel.", url: "https://www.youtube.com/@CommandingHands" },
    { id: "ndcs", label: "NDCS Family Sign Language", variety: "family/child-friendly", note: "Free family BSL lessons by Deaf tutors (nation playlists).", url: "https://www.youtube.com/@NationalDeafChildrensSociety" },
    { id: "school-of-signs", label: "School of Signs", variety: "family/child-friendly", note: "Primary-age video curriculum for home educators.", url: "https://theschoolofsigns.org.uk/" },
    { id: "bsl-search", label: "BSL Search", variety: "Deaf adult", note: "A–Z dictionary with clear Deaf signer demos.", url: "https://bslsearch.co.uk/dictionary.php" },
    { id: "lumo", label: "Lumo TV (BSL Zone)", variety: "Deaf adult / immersion", note: "Deaf entertainment & children’s BSL content — immersion, not a dictionary.", url: "https://lumotv.co.uk/" }
  ],

  alphabet: [
    { letter: "A", hands: "two", tip: "Point dominant index finger tip to the tip of the non-dominant thumb.", movement: "Hold steady contact.", face: "Neutral; look at conversation partner.", difficulty: 1 },
    { letter: "B", hands: "two", tip: "Place the flat palm of the dominant hand against the palm of the non-dominant hand (fingers up).", movement: "Hold.", face: "Neutral.", difficulty: 1 },
    { letter: "C", hands: "mainly dominant", tip: "Curve the dominant hand into a clear C shape (thumb and fingers).", movement: "Hold the C clearly.", face: "Neutral.", difficulty: 1 },
    { letter: "D", hands: "two", tip: "Non-dominant hand: fingers spread. Point dominant index at the tip of the non-dominant middle finger.", movement: "Precise point.", face: "Neutral.", difficulty: 2 },
    { letter: "E", hands: "two", tip: "Point dominant index tip to the tip of the non-dominant index finger.", movement: "Hold.", face: "Neutral.", difficulty: 1 },
    { letter: "F", hands: "two", tip: "Hold non-dominant index upright. Dominant thumb and index form a small circle / touch the tip of that index.", movement: "Hold.", face: "Neutral.", difficulty: 2 },
    { letter: "G", hands: "two", tip: "Point dominant index to the side tip / knuckle area of the non-dominant index finger.", movement: "Short point.", face: "Neutral.", difficulty: 2 },
    { letter: "H", hands: "two", tip: "Lay dominant index + middle fingers across non-dominant index + middle fingers.", movement: "Hold flat contact.", face: "Neutral.", difficulty: 2 },
    { letter: "I", hands: "two", tip: "Point dominant index to the tip of the non-dominant little finger.", movement: "Hold.", face: "Neutral.", difficulty: 1 },
    { letter: "J", hands: "two", tip: "Hook or trace a J using the dominant little finger around / from the non-dominant little finger.", movement: "Small hook or trace.", face: "Neutral.", difficulty: 3 },
    { letter: "K", hands: "two", tip: "Non-dominant: index and middle spread as a V. Point dominant index into the gap between them.", movement: "Hold.", face: "Neutral.", difficulty: 2 },
    { letter: "L", hands: "two", tip: "Form an L with dominant thumb + index on / against the non-dominant palm.", movement: "Hold clear L.", face: "Neutral.", difficulty: 1 },
    { letter: "M", hands: "two", tip: "Point dominant index to the tip of the non-dominant ring finger (third fingertip counting from thumb side index=1… ring).", movement: "Hold.", face: "Neutral.", difficulty: 2 },
    { letter: "N", hands: "two", tip: "Point dominant index to the tip of the non-dominant middle finger.", movement: "Hold.", face: "Neutral.", difficulty: 2 },
    { letter: "O", hands: "mainly dominant", tip: "Form a clear O / circle with dominant thumb and fingers (touch tips).", movement: "Hold round shape.", face: "Neutral.", difficulty: 1 },
    { letter: "P", hands: "two", tip: "Point dominant index down onto the non-dominant palm near the middle-finger base / palm centre as taught in your video demo.", movement: "Short tap or hold.", face: "Neutral.", difficulty: 2 },
    { letter: "Q", hands: "two", tip: "Point dominant index toward the non-dominant little-finger side / knuckle as in standard BSL Q.", movement: "Hold.", face: "Neutral.", difficulty: 3 },
    { letter: "R", hands: "two", tip: "Cross dominant index over middle (or cross on non-dominant palm) to show R.", movement: "Hold crossed shape.", face: "Neutral.", difficulty: 2 },
    { letter: "S", hands: "two", tip: "Hook dominant little finger around non-dominant little finger.", movement: "Link and hold.", face: "Neutral.", difficulty: 2 },
    { letter: "T", hands: "two", tip: "Place dominant index against the non-dominant thumb between the non-dominant index and middle (classic BSL T).", movement: "Hold.", face: "Neutral.", difficulty: 3 },
    { letter: "U", hands: "two", tip: "Touch tips of dominant index + middle to tips of non-dominant index + middle.", movement: "Hold.", face: "Neutral.", difficulty: 2 },
    { letter: "V", hands: "two", tip: "Dominant V (index + middle) tips touch the non-dominant palm.", movement: "Hold.", face: "Neutral.", difficulty: 1 },
    { letter: "W", hands: "two", tip: "Touch three dominant fingertips to three non-dominant fingertips (W).", movement: "Hold.", face: "Neutral.", difficulty: 2 },
    { letter: "X", hands: "two", tip: "Cross the index fingers (or wrists) to form X.", movement: "Hold cross.", face: "Neutral.", difficulty: 2 },
    { letter: "Y", hands: "two", tip: "Link dominant thumb + index tips with non-dominant thumb + index tips (Y join).", movement: "Hold.", face: "Neutral.", difficulty: 3 },
    { letter: "Z", hands: "two", tip: "Draw a Z on the non-dominant palm with the dominant index finger.", movement: "Trace Z clearly.", face: "Neutral.", difficulty: 2 }
  ],

  beginnerSigns: [
    {
      id: "hello", gloss: "HELLO", english: "Hello",
      tip: "Open flat hand near the side of the forehead / temple area; move the hand forward slightly in a small greeting arc (confirm with video — regional variation exists).",
      movement: "Small forward movement from head area.", face: "Smile / friendly expression — facial expression is part of BSL.",
      difficulty: 1, videoSearch: "https://www.signbsl.com/sign/hello", category: "greetings",
      videos: [
        { source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/hello" },
        { source: "ndcs", label: "NDCS Family", variety: "family/child-friendly", url: "https://www.youtube.com/@NationalDeafChildrensSociety" },
        { source: "commanding-hands", label: "Commanding Hands", variety: "family/child-friendly", url: "https://www.youtube.com/@CommandingHands" }
      ]
    },
    {
      id: "goodbye", gloss: "GOODBYE", english: "Goodbye",
      tip: "Open hand waves or closes in a goodbye motion at chest/head height — check Sign BSL for the form you will use at home.",
      movement: "Wave or closing action.", face: "Friendly.",
      difficulty: 1, videoSearch: "https://www.signbsl.com/sign/goodbye", category: "greetings",
      videos: [
        { source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/goodbye" },
        { source: "british-sign", label: "british-sign", variety: "multi-signer dictionary", url: "https://www.british-sign.co.uk/" }
      ]
    },
    {
      id: "please", gloss: "PLEASE", english: "Please",
      tip: "Flat hand circles on the chest (common PLEASE). Match the exact path in a UK BSL video.",
      movement: "Circular on chest.", face: "Polite / soft.",
      difficulty: 1, videoSearch: "https://www.signbsl.com/sign/please", category: "manners",
      videos: [
        { source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/please" },
        { source: "school-of-signs", label: "School of Signs", variety: "family/child-friendly", url: "https://theschoolofsigns.org.uk/" }
      ]
    },
    {
      id: "thank-you", gloss: "THANK-YOU", english: "Thank you",
      tip: "Fingertips of flat hand touch chin then move forward/down (common THANK-YOU).",
      movement: "Chin → forward.", face: "Grateful smile.",
      difficulty: 1, videoSearch: "https://www.signbsl.com/sign/thank-you", category: "manners",
      videos: [
        { source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/thank-you" },
        { source: "ndcs", label: "NDCS Family", variety: "family/child-friendly", url: "https://www.youtube.com/@NationalDeafChildrensSociety" }
      ]
    },
    {
      id: "yes", gloss: "YES", english: "Yes",
      tip: "Fist nods (like a head nod with the hand) — confirm local form on Sign BSL.",
      movement: "Nodding fist.", face: "Affirming; may nod head too.",
      difficulty: 1, videoSearch: "https://www.signbsl.com/sign/yes", category: "basics",
      videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/yes" }]
    },
    {
      id: "no", gloss: "NO", english: "No",
      tip: "Index and middle close onto thumb (or palm-out wave) — use the BSL video form, not ASL.",
      movement: "Closing or small shake.", face: "Negation: slight headshake often accompanies NO.",
      difficulty: 1, videoSearch: "https://www.signbsl.com/sign/no", category: "basics",
      videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/no" }]
    },
    {
      id: "name", gloss: "NAME", english: "Name",
      tip: "Two fingers extended together touch the forehead then rotate/move away (common NAME).",
      movement: "Forehead contact then rotate away.", face: "Neutral / questioning if asking.",
      difficulty: 2, videoSearch: "https://www.signbsl.com/sign/name", category: "intros",
      videos: [
        { source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/name" },
        { source: "commanding-hands", label: "Commanding Hands", variety: "family/child-friendly", url: "https://www.youtube.com/@CommandingHands" }
      ]
    },
    {
      id: "me", gloss: "ME", english: "Me / I",
      tip: "Point to yourself with the index finger.",
      movement: "Point to chest.", face: "Neutral.",
      difficulty: 1, videoSearch: "https://www.signbsl.com/sign/me", category: "intros",
      videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/me" }]
    },
    {
      id: "you", gloss: "YOU", english: "You",
      tip: "Point toward the other person with the index finger (eye contact matters).",
      movement: "Point to partner.", face: "Engaged eye contact.",
      difficulty: 1, videoSearch: "https://www.signbsl.com/sign/you", category: "intros",
      videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/you" }]
    },
    {
      id: "sorry", gloss: "SORRY", english: "Sorry",
      tip: "Fist circles on the chest (common SORRY).",
      movement: "Circular on chest.", face: "Apologetic.",
      difficulty: 2, videoSearch: "https://www.signbsl.com/sign/sorry", category: "manners",
      videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/sorry" }]
    },
    {
      id: "good", gloss: "GOOD", english: "Good",
      tip: "Thumb-up handshape, often from chin or in neutral space — verify on Sign BSL.",
      movement: "Short decisive movement.", face: "Positive expression.",
      difficulty: 1, videoSearch: "https://www.signbsl.com/sign/good", category: "basics",
      videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/good" }]
    },
    {
      id: "bad", gloss: "BAD", english: "Bad",
      tip: "Often a downward / negative hand movement with matching facial expression — check video.",
      movement: "Downward or dismissive path.", face: "Negative expression is important.",
      difficulty: 2, videoSearch: "https://www.signbsl.com/sign/bad", category: "basics",
      videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/bad" }]
    }
  ],

  packs: {
    family: [
      { id: "mum", gloss: "MUM", english: "Mum", tip: "Open hand taps side of chin/cheek twice (common MUM) — confirm on Sign BSL / NDCS.", movement: "Short taps at cheek.", face: "Warm.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/mum", category: "family",
        videos: [
          { source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/mum" },
          { source: "ndcs", label: "NDCS Family", variety: "family/child-friendly", url: "https://www.youtube.com/@NationalDeafChildrensSociety" }
        ]},
      { id: "dad", gloss: "DAD", english: "Dad", tip: "Open hand taps forehead/temple area twice (common DAD) — check video.", movement: "Short taps at forehead.", face: "Warm.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/dad", category: "family",
        videos: [
          { source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/dad" },
          { source: "ndcs", label: "NDCS Family", variety: "family/child-friendly", url: "https://www.youtube.com/@NationalDeafChildrensSociety" }
        ]},
      { id: "sister", gloss: "SISTER", english: "Sister", tip: "Often indexed from chin or linked fingers — verify exact UK BSL form on Sign BSL.", movement: "Short path from face/chin.", face: "Neutral / friendly.", difficulty: 2, videoSearch: "https://www.signbsl.com/sign/sister", category: "family",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/sister" }]},
      { id: "brother", gloss: "BROTHER", english: "Brother", tip: "Often indexed from forehead or linked fingers — check Sign BSL, not ASL.", movement: "Short path from forehead.", face: "Neutral.", difficulty: 2, videoSearch: "https://www.signbsl.com/sign/brother", category: "family",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/brother" }]},
      { id: "baby", gloss: "BABY", english: "Baby", tip: "Arms cradle / rock as if holding a baby.", movement: "Gentle rock.", face: "Soft / caring.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/baby", category: "family",
        videos: [
          { source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/baby" },
          { source: "ndcs", label: "NDCS Family", variety: "family/child-friendly", url: "https://www.youtube.com/@NationalDeafChildrensSociety" }
        ]},
      { id: "family", gloss: "FAMILY", english: "Family", tip: "Fingers linked or circle around family group — match Sign BSL demo.", movement: "Group / circle gesture.", face: "Inclusive.", difficulty: 2, videoSearch: "https://www.signbsl.com/sign/family", category: "family",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/family" }]},
      { id: "friend", gloss: "FRIEND", english: "Friend", tip: "Index fingers hook or tap together (common FRIEND).", movement: "Hook / tap.", face: "Friendly smile.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/friend", category: "family",
        videos: [
          { source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/friend" },
          { source: "school-of-signs", label: "School of Signs", variety: "family/child-friendly", url: "https://theschoolofsigns.org.uk/" }
        ]},
      { id: "love", gloss: "LOVE", english: "Love", tip: "Arms cross over chest (common LOVE) — confirm on video.", movement: "Cross arms to chest.", face: "Warm affection.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/love", category: "family",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/love" }]}
    ],
    feelings: [
      { id: "happy", gloss: "HAPPY", english: "Happy", tip: "Open hands brush up chest with bright face (common HAPPY).", movement: "Upward brush.", face: "Big smile — expression is key.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/happy", category: "feelings",
        videos: [
          { source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/happy" },
          { source: "ndcs", label: "NDCS Family", variety: "family/child-friendly", url: "https://www.youtube.com/@NationalDeafChildrensSociety" }
        ]},
      { id: "sad", gloss: "SAD", english: "Sad", tip: "Hands / fingers draw down the face with sad expression.", movement: "Downward face path.", face: "Sad expression essential.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/sad", category: "feelings",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/sad" }]},
      { id: "angry", gloss: "ANGRY", english: "Angry", tip: "Clawed hands near face with strong angry expression — check UK form.", movement: "Sharp claw near face.", face: "Angry brows.", difficulty: 2, videoSearch: "https://www.signbsl.com/sign/angry", category: "feelings",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/angry" }]},
      { id: "scared", gloss: "SCARED", english: "Scared", tip: "Hands flutter near chest/face with wide eyes — match Sign BSL.", movement: "Flutter / startle.", face: "Wide eyes.", difficulty: 2, videoSearch: "https://www.signbsl.com/sign/scared", category: "feelings",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/scared" }]},
      { id: "tired", gloss: "TIRED", english: "Tired", tip: "Hands drop from chin/face or limp wrists — confirm video.", movement: "Drop / sag.", face: "Weary.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/tired", category: "feelings",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/tired" }]},
      { id: "excited", gloss: "EXCITED", english: "Excited", tip: "Hands flutter up chest with bright face — check Sign BSL.", movement: "Upward flutter.", face: "Excited grin.", difficulty: 2, videoSearch: "https://www.signbsl.com/sign/excited", category: "feelings",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/excited" }]},
      { id: "proud", gloss: "PROUD", english: "Proud", tip: "Thumb or flat hand moves up chest with proud face.", movement: "Up chest.", face: "Proud smile.", difficulty: 2, videoSearch: "https://www.signbsl.com/sign/proud", category: "feelings",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/proud" }]},
      { id: "worried", gloss: "WORRIED", english: "Worried", tip: "Fingers circle or wring near forehead/chest — verify on Sign BSL.", movement: "Circle / wring.", face: "Concerned brows.", difficulty: 2, videoSearch: "https://www.signbsl.com/sign/worried", category: "feelings",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/worried" }]}
    ],
    school: [
      { id: "school", gloss: "SCHOOL", english: "School", tip: "Flat hands clap or tap together (common SCHOOL) — check Sign BSL.", movement: "Clap / tap.", face: "Neutral.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/school", category: "school",
        videos: [
          { source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/school" },
          { source: "school-of-signs", label: "School of Signs", variety: "family/child-friendly", url: "https://theschoolofsigns.org.uk/" }
        ]},
      { id: "teacher", gloss: "TEACHER", english: "Teacher", tip: "Flat hands move forward from forehead/temples (common TEACHER).", movement: "Forward from head.", face: "Neutral.", difficulty: 2, videoSearch: "https://www.signbsl.com/sign/teacher", category: "school",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/teacher" }]},
      { id: "book", gloss: "BOOK", english: "Book", tip: "Palms open like opening a book.", movement: "Open book.", face: "Neutral.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/book", category: "school",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/book" }]},
      { id: "write", gloss: "WRITE", english: "Write", tip: "Dominant hand writes on non-dominant palm.", movement: "Writing motion.", face: "Neutral.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/write", category: "school",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/write" }]},
      { id: "read", gloss: "READ", english: "Read", tip: "V or flat hand scans across open palm / book shape.", movement: "Scan across.", face: "Focused.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/read", category: "school",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/read" }]},
      { id: "draw", gloss: "DRAW", english: "Draw", tip: "Writing/drawing motion in air or on palm — confirm Sign BSL.", movement: "Draw path.", face: "Creative focus.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/draw", category: "school",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/draw" }]},
      { id: "friend-school", gloss: "FRIEND", english: "Friend (school)", tip: "Index fingers hook together — same FRIEND as family pack.", movement: "Hook.", face: "Friendly.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/friend", category: "school",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/friend" }]},
      { id: "learn", gloss: "LEARN", english: "Learn", tip: "Fingertips take knowledge from palm to forehead (common LEARN).", movement: "Palm → forehead.", face: "Curious.", difficulty: 2, videoSearch: "https://www.signbsl.com/sign/learn", category: "school",
        videos: [
          { source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/learn" },
          { source: "signbank", label: "BSL SignBank", variety: "Deaf adult / research", url: "https://bslsignbank.ucl.ac.uk/" }
        ]}
    ],
    food: [
      { id: "eat", gloss: "EAT", english: "Eat", tip: "Fingertips to mouth repeatedly (common EAT).", movement: "To mouth.", face: "Neutral / hungry.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/eat", category: "food",
        videos: [
          { source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/eat" },
          { source: "ndcs", label: "NDCS Family", variety: "family/child-friendly", url: "https://www.youtube.com/@NationalDeafChildrensSociety" }
        ]},
      { id: "drink", gloss: "DRINK", english: "Drink", tip: "C-hand tips to mouth like a cup.", movement: "Cup to mouth.", face: "Neutral.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/drink", category: "food",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/drink" }]},
      { id: "water", gloss: "WATER", english: "Water", tip: "W-hand taps chin or taps side of mouth — check Sign BSL (not ASL).", movement: "Tap chin/mouth.", face: "Neutral.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/water", category: "food",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/water" }]},
      { id: "apple", gloss: "APPLE", english: "Apple", tip: "Fist twists at cheek (common APPLE) — verify UK form.", movement: "Twist at cheek.", face: "Neutral.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/apple", category: "food",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/apple" }]},
      { id: "milk", gloss: "MILK", english: "Milk", tip: "Fist squeezes as if milking — confirm Sign BSL.", movement: "Squeeze.", face: "Neutral.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/milk", category: "food",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/milk" }]},
      { id: "bread", gloss: "BREAD", english: "Bread", tip: "Slicing motion on non-dominant hand — match video.", movement: "Slice.", face: "Neutral.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/bread", category: "food",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/bread" }]},
      { id: "hungry", gloss: "HUNGRY", english: "Hungry", tip: "Flat hand down chest or claw at stomach — check Sign BSL.", movement: "Down chest / stomach.", face: "Hungry look.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/hungry", category: "food",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/hungry" }]},
      { id: "biscuit", gloss: "BISCUIT", english: "Biscuit", tip: "Fingers tap or break on palm — UK biscuit, confirm video.", movement: "Tap / break.", face: "Neutral.", difficulty: 2, videoSearch: "https://www.signbsl.com/sign/biscuit", category: "food",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/biscuit" }]}
    ],
    play: [
      { id: "play", gloss: "PLAY", english: "Play", tip: "Y-hands shake or twist (common PLAY) — confirm UK BSL.", movement: "Shake / twist.", face: "Playful.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/play", category: "play",
        videos: [
          { source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/play" },
          { source: "ndcs", label: "NDCS Family", variety: "family/child-friendly", url: "https://www.youtube.com/@NationalDeafChildrensSociety" }
        ]},
      { id: "ball", gloss: "BALL", english: "Ball", tip: "Hands form a sphere shape.", movement: "Sphere hold.", face: "Neutral.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/ball", category: "play",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/ball" }]},
      { id: "game", gloss: "GAME", english: "Game", tip: "Similar to PLAY or fingers interlocking — check Sign BSL.", movement: "Playful shake.", face: "Excited.", difficulty: 2, videoSearch: "https://www.signbsl.com/sign/game", category: "play",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/game" }]},
      { id: "toy", gloss: "TOY", english: "Toy", tip: "Often related to PLAY handshape — verify Sign BSL.", movement: "Short playful motion.", face: "Happy.", difficulty: 2, videoSearch: "https://www.signbsl.com/sign/toy", category: "play",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/toy" }]},
      { id: "run", gloss: "RUN", english: "Run", tip: "Index fingers alternate forward like legs running.", movement: "Alternating forward.", face: "Energetic.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/run", category: "play",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/run" }]},
      { id: "dance", gloss: "DANCE", english: "Dance", tip: "V or flat hands sway as if dancing — confirm video.", movement: "Sway / bounce.", face: "Joyful.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/dance", category: "play",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/dance" }]},
      { id: "jump", gloss: "JUMP", english: "Jump", tip: "Hands hop upward or V on palm jumps — check Sign BSL.", movement: "Up hop.", face: "Energetic.", difficulty: 1, videoSearch: "https://www.signbsl.com/sign/jump", category: "play",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/jump" }]},
      { id: "fun", gloss: "FUN", english: "Fun", tip: "Nose tap or playful twist — verify UK form on Sign BSL (not ASL).", movement: "Playful tap/twist.", face: "Fun grin.", difficulty: 2, videoSearch: "https://www.signbsl.com/sign/fun", category: "play",
        videos: [{ source: "signbsl", label: "Sign BSL", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/fun" }]}
    ]
  },

  stories: [
    {
      id: "hello-friend",
      title: "Hello, friend!",
      blurb: "A short greeting dialogue for kids.",
      steps: [
        { glosses: ["HELLO"], english: "Hello!", signIds: ["hello"], demo: "https://www.signbsl.com/sign/hello", role: "you" },
        { glosses: ["ME", "NAME"], english: "My name is… (fingerspell your name).", signIds: ["me", "name"], demo: "https://www.signbsl.com/sign/name", role: "you" },
        { glosses: ["YOU", "NAME", "?"], english: "What is your name?", signIds: ["you", "name"], demo: "https://www.signbsl.com/sign/you", role: "partner" },
        { glosses: ["FRIEND"], english: "Friend!", signIds: ["friend"], demo: "https://www.signbsl.com/sign/friend", role: "partner" },
        { glosses: ["THANK-YOU"], english: "Thank you!", signIds: ["thank-you"], demo: "https://www.signbsl.com/sign/thank-you", role: "you" }
      ]
    },
    {
      id: "snack-time",
      title: "Snack time",
      blurb: "Hungry? Ask for a drink and a biscuit.",
      steps: [
        { glosses: ["HUNGRY"], english: "I'm hungry.", signIds: ["hungry"], demo: "https://www.signbsl.com/sign/hungry", role: "you" },
        { glosses: ["EAT", "PLEASE"], english: "Can I eat, please?", signIds: ["eat", "please"], demo: "https://www.signbsl.com/sign/eat", role: "you" },
        { glosses: ["DRINK", "WATER"], english: "I'd like a drink of water.", signIds: ["drink", "water"], demo: "https://www.signbsl.com/sign/drink", role: "partner" },
        { glosses: ["BISCUIT", "PLEASE"], english: "A biscuit, please!", signIds: ["biscuit", "please"], demo: "https://www.signbsl.com/sign/biscuit", role: "you" },
        { glosses: ["THANK-YOU", "GOOD"], english: "Thank you — that's good!", signIds: ["thank-you", "good"], demo: "https://www.signbsl.com/sign/thank-you", role: "partner" }
      ]
    },
    {
      id: "play-outside",
      title: "Let's play!",
      blurb: "Feelings + play signs for a sunny afternoon.",
      steps: [
        { glosses: ["HAPPY"], english: "I feel happy!", signIds: ["happy"], demo: "https://www.signbsl.com/sign/happy", role: "you" },
        { glosses: ["PLAY", "PLEASE"], english: "Can we play, please?", signIds: ["play", "please"], demo: "https://www.signbsl.com/sign/play", role: "you" },
        { glosses: ["BALL"], english: "Ball!", signIds: ["ball"], demo: "https://www.signbsl.com/sign/ball", role: "partner" },
        { glosses: ["RUN", "JUMP"], english: "Run and jump!", signIds: ["run", "jump"], demo: "https://www.signbsl.com/sign/run", role: "you" },
        { glosses: ["FUN", "GOODBYE"], english: "That was fun — goodbye!", signIds: ["fun", "goodbye"], demo: "https://www.signbsl.com/sign/fun", role: "partner" }
      ]
    },
    {
      id: "your-turn",
      title: "Your turn!",
      blurb: "Practise turn-taking: you ask, partner answers, you thank them.",
      steps: [
        { glosses: ["HELLO"], english: "Hello!", signIds: ["hello"], demo: "https://www.signbsl.com/sign/hello", role: "you" },
        { glosses: ["YOU", "GOOD", "?"], english: "Are you good?", signIds: ["you", "good"], demo: "https://www.signbsl.com/sign/you", role: "you" },
        { glosses: ["YES", "ME", "GOOD"], english: "Yes — I'm good!", signIds: ["yes", "me", "good"], demo: "https://www.signbsl.com/sign/yes", role: "partner" },
        { glosses: ["THANK-YOU"], english: "Thank you!", signIds: ["thank-you"], demo: "https://www.signbsl.com/sign/thank-you", role: "you" },
        { glosses: ["GOODBYE"], english: "Goodbye!", signIds: ["goodbye"], demo: "https://www.signbsl.com/sign/goodbye", role: "partner" }
      ]
    }
  ],

  modules: [
    { id: "fingerspelling", title: "Fingerspelling alphabet", level: "beginner", status: "live", blurb: "Learn the BSL two-handed alphabet with drills, audio and mirror practice." },
    { id: "greetings", title: "Greetings & manners", level: "beginner", status: "live", blurb: "Hello, please, thank you, sorry, yes/no — full interactive lessons." },
    { id: "family", title: "Family signs", level: "beginner", status: "live", blurb: "Mum, dad, sister, brother, baby, family, friend, love." },
    { id: "feelings", title: "Feelings", level: "beginner", status: "live", blurb: "Happy, sad, angry, scared, tired, excited, proud, worried." },
    { id: "school", title: "School", level: "beginner", status: "live", blurb: "School, teacher, book, write, read, draw, friend, learn." },
    { id: "food", title: "Food & drink", level: "beginner", status: "live", blurb: "Eat, drink, water, apple, milk, bread, hungry, biscuit." },
    { id: "play", title: "Play time", level: "beginner", status: "live", blurb: "Play, ball, game, toy, run, dance, jump, fun." },
    { id: "stories", title: "Signed stories", level: "beginner", status: "live", blurb: "Short kid dialogues stepping through glosses with English lines." },
    { id: "colours", title: "Colours & numbers", level: "beginner", status: "scaffold", blurb: "Coming next — practise via BSL SignBank quiz in the meantime." },
    { id: "conversation", title: "Short conversations", level: "beginner", status: "live", blurb: "Turn-taking coach on signed stories — English, glosses, how-to tips, spoken guidance." },
    { id: "fluency", title: "Receptive practice", level: "advanced", status: "scaffold", blurb: "Watch Lumo TV / Deaf content; journal signs you catch." }
  ],

  drillWords: ["CAT", "DOG", "MUM", "DAD", "YES", "NO", "HI", "LOVE", "BOOK", "PLAY", "NAME", "GOOD", "BAD", "HOME", "SCHOOL", "FRIEND", "WATER", "APPLE", "HAPPY", "PLEASE"],

  badges: [
    { id: "first-quiz", title: "First quiz", emoji: "🧠", desc: "Answered your first quiz question." },
    { id: "streak-7", title: "7-day streak", emoji: "🔥", desc: "Practised 7 days in a row." },
    { id: "pack-complete", title: "Pack complete", emoji: "📦", desc: "Finished every sign in a vocab pack." },
    { id: "leech-cleared", title: "Leech cleared", emoji: "💪", desc: "Cleared a weak sign from the leech list." },
    { id: "fav-10", title: "Favourite 10", emoji: "⭐", desc: "Starred 10 signs as favourites." },
    { id: "story-done", title: "Story star", emoji: "📖", desc: "Finished a signed story." },
    { id: "gem-collector", title: "Gem collector", emoji: "💎", desc: "Earned 25 gems." }
  ]
};

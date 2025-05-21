document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const navButtons = document.querySelectorAll('nav button');
    const currentYearSpan = document.getElementById('current-year');
    const largeCountdownDisplay = document.getElementById('large-countdown-timer');
    let largeCountdownInterval = null;
    let deferredInstallPrompt = null;
    const installButtonContainer = document.getElementById('install-button-container');
    const appTitleH1 = document.getElementById('app-title');
    const pageTitleTag = document.querySelector('title');
    const htmlTag = document.documentElement;

    let currentLanguage = localStorage.getItem('brainPowerMWLang') || (navigator.language.startsWith('ja') ? 'ja' : 'en');
    const languageToggleBtn = document.getElementById('language-toggle-btn');

    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- HELPER FUNCTIONS (DEFINED AT TOP) ---
    function formatTime(totalSeconds) {
        if (isNaN(totalSeconds) || totalSeconds < 0) return "0:00";
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function clearLargeCountdown() {
        if (largeCountdownInterval) {
            clearInterval(largeCountdownInterval);
            largeCountdownInterval = null;
        }
        if (largeCountdownDisplay) largeCountdownDisplay.style.display = 'none';
    }

    function updateInitialTimeDisplay(audioEl) {
        const timeDisplay = document.getElementById(`time-${audioEl.id}`);
        if (timeDisplay) {
            if (audioEl.duration && !isNaN(audioEl.duration) && audioEl.duration > 0) {
                const displayCurrentTime = (audioEl.currentTime > 0 && audioEl.currentTime < audioEl.duration && !audioEl.ended) ? audioEl.currentTime : 0;
                timeDisplay.textContent = `${formatTime(displayCurrentTime)} / ${formatTime(audioEl.duration)}`;
            } else {
                timeDisplay.textContent = `0:00 / --:--`;
            }
        }
    }
    
    window.loadColoringImage = (imageSrc) => {
        const container = document.getElementById('coloring-image-container');
        if (container) {
            container.innerHTML = `<img src="${imageSrc}" alt="Coloring Page Preview" style="max-width:100%; height:auto; border-radius: 8px;">`;
        }
    };
    // --- END OF HELPER FUNCTIONS ---

    const langStrings = {
        en: {
            appTitle: "Brain Power Mindfulness & Wellness",
            navHome: "Home",
            navPractices: "Practices",
            navStudentZone: "Student Zone",
            navElementary: "Kids (ES)",
            navJuniorHigh: "Kids (JHS)",
            navAdults: "Adults",
            navForParents: "For Parents",
            navSchoolPathways: "School Pathways",
            navTeacherResources: "Teacher Resources",
            navResearchEvidence: "Research",
            navAbout: "About MW",
            toggleToJapanese: "日本語へ",
            playBtn: "Play",
            pauseBtn: "Pause",
            restartBtn: "Restart",
            installAppBtn: "Install App ✨",

            // Home Page
            homeTitle: "Welcome to Mindful Moments!", 
            homeSubtitle: "Your sanctuary for calm, focus, and well-being. Discover practices tailored for students, educators, and anyone seeking a more mindful life.", 
            explorePracticesBtn: "Explore Practices", 
            forStudentsTitle: "For Students (ES & JHS)", 
            forStudentsDesc: "Engaging daily 'Mindful Minutes' and activities to help you understand your thoughts, feelings, and build inner strength.", 
            goToStudentZoneBtn: "Go to Student Zone", 
            forEducatorsTitle: "For Educators & Adults", 
            forEducatorsDesc: "Comprehensive modules and resources to deepen your own practice and support you in sharing mindfulness with others.", 
            adultCurriculumBtn: "Adult Curriculum", 
            teacherResourcesTitle: "Teacher Resources", 
            teacherResourcesDesc: "Downloadable guides, lesson plan ideas, and FAQs to support your mindfulness teaching journey.", 
            viewResourcesBtn: "View Resources", 
            featuredPracticeTitle: "Featured Practice: Quick Calm (1 Min Breath)", 
            featuredPracticeDesc: "A very short practice to quickly center yourself using your breath. Ideal for a quick reset during a busy day.", 
            whyMWJapanTitle: "The Urgency of Mindfulness in Japan",
            whyMWJapanDesc: "Recent reports highlight a critical need for mental wellness support among Japanese youth and educators. While physical health ranks high, mental well-being faces significant challenges including academic pressure and high stress levels. Mindfulness provides proven tools to build resilience.",
            learnMoreAboutNeedLink: "Learn more in 'About MW'",

            // Practices Page
            practicesTitle: "Guided Practices",
            coreMindfulnessCategory: "Core Mindfulness",
            thoughtsFeelingsCategory: "Working with Thoughts & Feelings",
            kindnessGratitudeCategory: "Kindness & Gratitude",
            quickCalmTitle: "Quick Calm (1 Minute)", quickCalmDesc: "A very short practice to quickly center yourself.",
            breathing3MinTitle: "Mindful Breathing (3 Minutes)", breathing3MinDesc: "A short practice to anchor yourself using your breath.",
            breathing5MinTitle: "Mindful Breathing (5 Minutes)", breathing5MinDesc: "A slightly longer breath awareness practice.",
            bodyScan10MinTitle: "Body Scan (10 Minutes)", bodyScan10MinDesc: "Connect with your body from head to toe.",
            listeningSounds3MinTitle: "Mindful Listening to Sounds (3 Min)", listeningSounds3MinDesc: "Expand awareness by focusing on sounds.",
            thoughtsClouds5MinTitle: "Observing Thoughts (Clouds - 5 Min)", thoughtsClouds5MinDesc: "Watch thoughts pass like clouds.",
            stopPractice2MinTitle: "S.T.O.P. Practice (2 Min)", stopPractice2MinDesc: "Pause, Take a breath, Observe, Proceed.",
            kindness5MinTitle: "Loving-Kindness (5 Minutes)", kindness5MinDesc: "Cultivate warmth for self and others.",
            gratitude4MinTitle: "Gratitude Reflection (4 Minutes)", gratitude4MinDesc: "Appreciate the good things in your life.",

            // Student Zone
            studentZoneTitle: "Student Zone - Fun & Focus!",
            studentZoneDesc: "Explore these activities to practice mindfulness in creative ways.",
            mindPuppyTitle: "Mind Puppy & Attention Games",
            mindPuppyDesc: "Our attention can be like a playful puppy - sometimes focused, sometimes wandering! Let's practice gently training our 'mind puppy'. Try listening to a sound until it fades completely. How long can you stay with it?",
            shakeFreezeTitle: "Shake & Freeze Fun",
            shakeFreezeDesc: "Shake your body all around when you hear 'Shake!' and freeze like a statue when you hear 'Freeze!'. Notice how your body feels when moving and when still. This helps us feel our bodies and learn to settle. (Inspired by MiSP 'dots')",
            amazingBrainTitle: "Explore Your Amazing Brain",
            amazingBrainDesc: "Your brain is incredible! It helps you learn, play, and feel. The 'Prefrontal Cortex' is like the team leader, helping you focus and make choices. We can train it like a muscle! (Inspired by MiSP 'Paws b')",
            mindfulWalkingTitle: "Mindful Walking Moment",
            mindfulWalkingDesc: "Next time you walk (to class, at home), try noticing the feeling of your feet on the ground for a few steps. What sensations do you feel?",
            storyTimeTitle: "Mindful Story Time",
            storyTimeDesc: "When listening to a story, try to really hear the words. Notice how the story makes you feel. What happens to the characters? What can you learn from them?",
            mindfulColoringTitle: "Mindful Coloring",
            mindfulColoringDesc: "Choose an image. As you color (on paper or imagine coloring digitally), focus on your breath and the sensation of coloring. Notice the colors and how they make you feel. There's no right or wrong way!",
            mandalaBtn: "Mandala Design",
            natureSceneBtn: "Nature Scene",
            selectImagePrompt: "Select an image above to view, or download a printable version below.",
            downloadMandalaLink: "Download Mandala PDF",
            downloadNatureLink: "Download Nature Scene PDF",
            gratitudeJournalTitle: "My Gratitude Journal",
            gratitudeJournalDesc: "What are you thankful for today? Take a moment to write down 1-3 things. Noticing the good things helps our hearts feel happy!",
            gratitudePlaceholder: "Today I am grateful for... (e.g., playing with my friend, a sunny day, a yummy snack)",
            addGratitudeBtn: "Add to Journal",
            myGratitudeListTitle: "My Gratitude List:",
            deleteBtnText: "Del",
            
            // Elementary Curriculum (ES: G4-6), Based on Daily 10-Min MW Sessions & MiSP Paws b/Dots
            esCurriculumTitle: "Mindful Minutes: Elementary Program (ES G4-6)",
            esCurriculumDesc: "Engaging daily 10-min 'Mindful Minutes' to build foundational awareness skills. Inspired by MiSP's Paws b (for 7-11 year olds) and Dots (for 3-6 year olds) principles, adapted for Upper Elementary.",
            
            esWeek1Title: "Week 1: Paying Attention - The Mind Puppy & Anchors",
            esDay1: "Day 1", esWeek1D1: "Hello, Attention! (Listening to the Bell). Concept: Introduce attention.",
            esDay2: "Day 2", esWeek1D2: "Our Breath Anchor. Concept: Breath as a primary anchor.",
            esDay3: "Day 3", esWeek1D3: "Body Anchors - Feet & Seat. Concept: Introduce other body parts as anchors.",
            esDay4: "Day 4", esWeek1D4: "Mindful Seeing - Noticing Details. Concept: Practice bringing focused attention to the sense of sight.",
            esDay5: "Day 5", esWeek1D5: "Review - Our Attention Toolkit So Far. Concept: Choiceless Awareness / Favorite Anchor.",
            esWeek1PracticeLinkText: "3-Min Breathing", 
            
            esWeek2Title: "Week 2: Noticing Our Thoughts - The Mind-Cinema",
            esWeek2D1: "Thoughts are Like Clouds. Concept: Introduce the idea that thoughts come and go.",
            esWeek2D2: "Thoughts are Not Facts. Concept: Introduce the idea that we don't have to believe every thought.",
            esWeek2D3: "The \"Unsticky\" Mind. Concept: Reinforce not getting stuck on thoughts (e.g., Leaves on a Stream).",
            esWeek2D4: "Helpful or Unhelpful Thoughts? Concept: Begin to discern if a thought is helpful or not.",
            esWeek2D5: "Review - Our Thinking Mind. Concept: Open Awareness of Thoughts.",
            esWeek2PracticeLinkText: "Observing Thoughts (5 Min)",

            esWeek3Title: "Week 3: Understanding Our Feelings - Inner Weather",
            esWeek3D1: "Feelings are Like Weather. Concept: Introduce the metaphor of emotions as weather.",
            esWeek3D2: "Where Do I Feel It? (Feelings in the Body). Concept: Connect emotions to physical sensations.",
            esWeek3D3: "All Feelings are Okay (Even Uncomfortable Ones). Concept: Normalize the experience of all emotions.",
            esWeek3D4: "The Breath Anchor for Big Feelings. Concept: Reinforce using breath as an anchor when emotions are strong.",
            esWeek3D5: "Review - Our Feeling World. Concept: Open Awareness of Feelings.",
            esWeek3PracticeLinkText: "S.T.O.P. Practice (2 Min)",

            esWeek4Title: "Week 4: Kindness & Gratitude - Connecting with Heart",
            esWeek4D1: "What is Kindness? Concept: Explore the meaning and feeling of kindness.",
            esWeek4D2: "Kindness to Ourselves (Self-Kindness). Concept: Introduce the idea of being a good friend to oneself.",
            esWeek4D3: "What is Gratitude? Concept: Introduce gratitude as noticing and appreciating good things.",
            esWeek4D4: "Small Things, Big Gratitude. Concept: Emphasize gratitude for everyday, simple things.",
            esWeek4D5: "Review - Our Mindful Hearts. Concept: Kindness & Gratitude Combo practice.",
            esWeek4PracticeLinkText: "Loving-Kindness (5 Min)",
            
            esWeek5Title: "Week 5 (Deeper Dive): The Attention Flashlight & F.L.O.A.T.",
            esWeek5D1: "The Attention Flashlight. Concept: Revisit attention as a flashlight we direct.",
            esWeek5D2: "'Beditation' / F.L.O.A.T. (Simplified). Concept: Introduce a simple settling practice (Feel, Listen, Observe, Awareness, Thoughts).",
            esWeek5D3: "Mini Body Scan (Hands & Feet). Concept: Brief body scan for grounding.",
            esWeek5D4: "Mindful Walking (Seated or Standing). Concept: Mindful movement in small spaces.",
            esWeek5D5: "Review - Expanding Our Anchors. Concept: Sound, Breath, Body Anchor Choice.",
            
            esWeek6Title: "Week 6 (Deeper Dive): Working with Thoughts - Thought Traffic Controller",
            esWeek6D1: "Noticing Thought Themes. Concept: Recognize common types of thoughts (worries, plans, memories).",
            esWeek6D2: "Is This Thought True? (Gentle Inquiry, from .b). Concept: Gently question the absolute truth of strong thoughts.",
            esWeek6D3: "'Thank You, Mind!' (Cognitive Diffusion). Concept: A lighthearted way to disengage from unhelpful thoughts.",
            esWeek6D4: "Choosing Your Focus - The 'Thought Traffic Controller'. Concept: Choosing where to place attention amidst thoughts.",
            esWeek6D5: "Review - Becoming Wiser About Our Thoughts. Concept: Mindful Choice Practice.",

            esWeek7Title: "Week 7 (Deeper Dive): Feelings & Emotional Regulation",
            esWeek7D1: "Emotions are Energy in Motion. Concept: Understand emotions as sensations/energy.",
            esWeek7D2: "S.T.O.P. for Feelings (from .b/Paws b). Concept: Apply S.T.O.P. to emotional triggers.",
            esWeek7D3: "Making Space for Feelings (Allowing). Concept: Practice allowing feelings without fighting them.",
            esWeek7D4: "Choosing Our Response to Feelings. Concept: Reinforce choice in how to act when feelings are strong.",
            esWeek7D5: "Review - Befriending Our Inner Weather. Concept: Mindful Check-in with Kindness.",

            esWeek8Title: "Week 8 (Deeper Dive): Kindness & Gratitude - Sharing Our Light",
            esWeek8D1: "The Ripple Effect of Kindness. Concept: Understand how small acts of kindness spread.",
            esWeek8D2: "Self-Kindness When Things are Tough (Soothing Touch/Kind Words from .b/Paws b). Concept: Practice self-compassion.",
            esWeek8D3: "Gratitude for Simple Pleasures (Three Good Things - Simplified). Concept: Cultivate appreciation for small positives.",
            esWeek8D4: "Expressing Gratitude to Others. Concept: Encourage showing appreciation.",
            esWeek8D5: "Review & Our Mindful Journey Continues. Concept: Open Awareness & Kind Wish.",
            esTeacherNote: "<em>Teachers: Find more guides in <a href=\"#\" onclick=\"window.loadPage('teacherResources'); return false;\">Teacher Resources</a>. The content is inspired by MiSP's Dots and Paws b curricula. Full curriculum training can be sought via MiSP or MfCP.</em>",

            // Junior High Curriculum (JHS: G7-9), Based on Daily 10-Min MW Sessions & MiSP .b
            jhsCurriculumTitle: "Mindful Foundations: Junior High Program (JHS G7-9)",
            jhsCurriculumDesc: "Daily 10-min 'Mindful Minutes' exploring attention, thoughts, emotions, and resilience for adolescent challenges. Inspired by MiSP's .b curriculum (for 11-18 year olds).",
            
            jhsWeek1Title: "Week 1: Playing Attention & The Puppy Mind (.b Lesson 1)",
            jhsDay1: "Day 1", jhsWeek1D1: "What is Mindfulness? Ground Rules & Possibilities.",
            jhsDay2: "Day 2", jhsWeek1D2: "Attention is like a Torch/Puppy - Directing & Exploring.",
            jhsDay3: "Day 3", jhsWeek1D3: "Mini Body Scan (Hands, Feet, Breath) (.b Lesson 1 Practice).",
            jhsDay4: "Day 4", jhsWeek1D4: "Training the Puppy Mind (Kindness, Patience, Repetition).",
            jhsDay5: "Day 5", jhsWeek1D5: "Finger Breathing & Home Practice Intro (.b Lesson 1 Practice).",
            jhsWeek1PracticeLinkText: "5-Min Breathing", 
            
            jhsWeek2Title: "Week 2: Noticing Our Thoughts - The Mind-Cinema & Thought Habits (.b L2)",
            jhsWeek2D1: "Thoughts are Like Clouds/Leaves (Observing thoughts without judgment).",
            jhsWeek2D2: "Thoughts are Not Facts (and we don't have to believe them).",
            jhsWeek2D3: "The 'Unsticky' Mind & Letting Go (Practice: Leaves on a Stream).",
            jhsWeek2D4: "Helpful or Unhelpful Thoughts? (Beginning to discern and question).",
            jhsWeek2D5: "Review: Our Thinking Mind & Open Awareness of Thoughts.",
            jhsWeek2PracticeLinkText: "Observing Thoughts (5 Min)",

            jhsWeek3Title: "Week 3: Understanding Feelings - Inner Weather & Emotional Regulation (.b L3, L4, L7)",
            jhsWeek3D1: "Feelings are Like Weather (they change; all are natural).",
            jhsWeek3D2: "Where Do I Feel It? (Body sensations of emotions; short body scan for feelings).",
            jhsWeek3D3: "S.T.O.P. for Difficult Moments (Academic/Social Stress).",
            jhsWeek3D4: "Responding vs. Reacting to Stressful Situations (The Pause Button).",
            jhsWeek3D5: "Review: Building Emotional Resilience Toolkit.",
            jhsWeek3PracticeLinkText: "S.T.O.P. Practice (2 Min)",

            jhsWeek4Title: "Week 4: Kindness, Gratitude & Connecting with the World (.b L8, L9, L10)",
            jhsWeek4D1: "What is Kindness? The Ripple Effect & Self-Kindness (Your Inner Friend).",
            jhsWeek4D2: "What is Gratitude? Noticing the Good & Three Good Things.",
            jhsWeek4D3: "Mindful Communication (Listening and Speaking with Awareness - simple tips).",
            jhsWeek4D4: "Taking in the Good (Savouring positive experiences).",
            jhsWeek4D5: "Review: Our Mindful Hearts & Living Mindfully (Kindness & Gratitude Combo).",
            jhsWeek4PracticeLinkText: "Gratitude Reflection (4 Min)",

            jhsWeek5Title: "Week 5 (Deeper Dive): The Attention Flashlight & F.L.O.A.T. (.b)",
            jhsWeek5D1: "Revisit Attention as a Flashlight (Directing with intention).",
            jhsWeek5D2: "'Beditation' / F.L.O.A.T. (Fuller version - Feel, Listen, Observe, Awareness, Thoughts).",
            jhsWeek5D3: "Body Scan Snippet (Focusing on different body areas as anchors).",
            jhsWeek5D4: "Mindful Walking (Seated or Standing, focusing on movement sensations).",
            jhsWeek5D5: "Review - Expanding Our Anchors & Choiceless Awareness practice.",

            jhsWeek6Title: "Week 6 (Deeper Dive): Working with Thoughts - Thought Traffic Controller (.b)",
            jhsWeek6D1: "Noticing Thought Themes & Habits (Worries, Plans, Judgments).",
            jhsWeek6D2: "'Is This Thought 100% True?' (Questioning from .b curriculum).",
            jhsWeek6D3: "'Thank You, Mind!' (Cognitive Diffusion, developing spaciousness).",
            jhsWeek6D4: "Choosing Your Focus - The 'Thought Traffic Controller' (Actively directing attention).",
            jhsWeek6D5: "Review - Becoming Wiser About Our Thoughts & Mindful Choice.",
            
            jhsWeek7Title: "Week 7 (Deeper Dive): Feelings, Emotional Regulation & R.A.I.N. (.b)",
            jhsWeek7D1: "Emotions as Energy in Motion (Exploring the physicality of emotions).",
            jhsWeek7D2: "S.T.O.P. for Strong Feelings (Applying to real-life scenarios).",
            jhsWeek7D3: "Making Space for Feelings with R.A.I.N. (Recognize, Allow, Investigate, Nurture - simplified).",
            jhsWeek7D4: "Choosing Our Response to Feelings (Cultivating wise action).",
            jhsWeek7D5: "Review - Befriending Our Inner Weather & Self-Compassion.",

            jhsWeek8Title: "Week 8 (Deeper Dive): Kindness, Gratitude & Sharing Our Light (.b)",
            jhsWeek8D1: "The Ripple Effect of Kindness & Interconnectedness.",
            jhsWeek8D2: "Self-Kindness When Things are Tough (Soothing Touch & Kind Words from .b).",
            jhsWeek8D3: "Gratitude for Simple Pleasures & Expressing Gratitude to Others.",
            jhsWeek8D4: "Mindful Speaking and Listening (further practice).",
            jhsWeek8D5: "Review & Our Mindful Journey Continues - Pulling it all together.",
            jhsTeacherNote: "<em>Teachers: Find more guides in <a href=\"#\" onclick=\"window.loadPage('teacherResources'); return false;\">Teacher Resources</a>. This content is inspired by MiSP's .b curriculum. Full curriculum training can be sought via MiSP or MfCP.</em>",

            // Adult Curriculum (Based on Adult Learners Guide P1-P8)
            adultCurriculumTitleFull: "Foundations of MW: For Adults, Educators & Parents",
            adultCurriculumDescFull: "An 8-module program inspired by MiSP's .begin and .b Foundations, adapted for adult learners. Develop a personal practice for well-being and learn to support others.",
            adultModule1Title: "Module 1: Introduction to Mindfulness - What It Is and Why It Matters",
            adultModule1Desc: "Defining mindfulness beyond simple relaxation. Understanding its core components (attention, present moment, non-judgment). Exploring \"autopilot\" mode and the \"full catastrophe\" of modern life, especially in education. Introductory practices like mindful arrival and breath awareness.",
            adultModule2Title: "Module 2: Befriending the Body - Anchoring in the Present",
            adultModule2Desc: "Deepening understanding of the body as a primary anchor for presence. Exploring the Body Scan meditation to cultivate interoception and recognize habitual tension patterns. Working mindfully with physical sensations (pleasant, unpleasant, neutral).",
            adultModule3Title: "Module 3: Understanding Our Thoughts - The \"Mind-Cinema\" & Cognitive Diffusion",
            adultModule3Desc: "Investigating thoughts as mental events, not necessarily facts. Introducing cognitive diffusion techniques (e.g., labeling thoughts, \"I am having the thought that...\") to create space and reduce fusion. Identifying and working with common unhelpful thinking patterns (e.g., inner critic).",
            adultModule4Title: "Module 4: Navigating Emotions - Understanding Our Inner Weather",
            adultModule4Desc: "Exploring emotions as transient states ('inner weather'). Understanding the interconnectedness of thoughts, emotions, and body sensations. Introducing and practicing R.A.I.N. (Recognize, Allow, Investigate, Nurture/Non-Identification) as a tool for working with difficult emotions.",
            adultModule5Title: "Module 5: Stress, Resilience, and the \"Full Catastrophe\" - Befriending Stress with Mindfulness",
            adultModule5Desc: "Understanding the body's stress response (acute vs. chronic). Identifying personal stress signatures (physical, emotional, cognitive, behavioral). Exploring how mindfulness cultivates stress resilience. Practicing the \"Three-Step Breathing Space\" (or S.T.O.P.) for in-the-moment stress reduction.",
            adultModule6Title: "Module 6: The Power of Self-Compassion & Cultivating Kindness",
            adultModule6Desc: "Defining self-compassion (self-kindness, common humanity, mindfulness) and differentiating it from self-pity or self-indulgence. Understanding the role of the 'inner critic' and learning to meet it with compassion. Practicing Loving-Kindness meditation for self and others.",
            adultModule7Title: "Module 7: Mindful Communication - Listening and Speaking with Awareness",
            adultModule7Desc: "Exploring the principles of mindful listening (attending fully, non-judgmentally) and mindful speech (speaking with intention, truthfulness, and kindness; awareness of impact). Applying these skills to improve relationships and navigate difficult conversations.",
            adultModule8Title: "Module 8: Integrating Mindfulness into Daily Life & Work - Review, Celebration, and Looking Ahead - Living Mindfully",
            adultModule8Desc: "Distinguishing between formal and informal mindfulness practice. Brainstorming ways to weave informal mindfulness into busy daily routines (mindful triggers/pauses). Creating a personal mindfulness plan for continued practice. Addressing potential challenges and identifying support systems. Celebrating the journey and looking ahead.",
            
            // For Parents - Detailed Content
            forParentsTitle: "Mindfulness for Parents & Guardians", 
            forParentsDesc: "Supporting your child's mindfulness journey and fostering well-being within the family. Inspired by principles from the Mindfulness in Schools Project (MiSP).",
            parentsWhyMWTitle: "Why is Mindfulness Beneficial for My Child?",
            parentsWhyMWP1: "In today's fast-paced world, children face numerous pressures. Mindfulness equips them with valuable life skills to navigate these challenges. It's not about emptying the mind, but about learning to pay attention to the present moment with kindness and curiosity.",
            parentsWhyMWP2: "Benefits often include:",
            parentsBenefitFocus: "<strong>Improved Focus & Concentration:</strong> Helping them in their studies and daily activities.",
            parentsBenefitEmotions: "<strong>Better Emotional Regulation:</strong> Understanding and managing feelings like stress, anxiety, or anger in healthier ways.",
            parentsBenefitResilience: "<strong>Increased Resilience:</strong> Developing the ability to bounce back from difficulties.",
            parentsBenefitKindness: "<strong>Enhanced Kindness & Empathy:</strong> Towards themselves and others, improving social interactions.",
            parentsSimplePracticesTitle: "Simple Mindfulness Practices to Try Together",
            parentsSimplePracticesIntro: "You don't need to be an expert! These simple activities, inspired by MiSP's approach, can be woven into your family life:",
            practiceMindfulMinuteTitle: "Mindful Minute",
            practiceMindfulMinuteDesc: "Sit quietly with your child for just one minute. You can choose to focus on the feeling of your breath, sounds around you, or the sensations in your hands or feet. Afterwards, gently ask, 'What did you notice?'",
            practiceMindfulListeningTitle: "Mindful Listening",
            practiceMindfulListeningDesc: "Choose a piece of music (perhaps one without words) or simply listen to the sounds in your environment (indoors or outdoors). Listen together for a few minutes without talking. Share what different sounds you each heard.",
            practiceGratitudeSharingTitle: "Gratitude Sharing",
            practiceGratitudeSharingDesc: "At dinnertime or bedtime, take turns sharing one small thing you were grateful for that day. It could be anything – a sunny moment, a kind word, a favorite food.",
            practiceMindfulEatingTitle: "Mindful Bite",
            practiceMindfulEatingDesc: "Take one bite of a snack (like a raisin or a piece of fruit). Encourage your child to notice its look, smell, texture, and taste very slowly. What's it like to eat this way?",
            parentsSupportChildTitle: "How Can I Support My Child's Mindfulness Practice?",
            parentsSupportChildP1: "Your supportive and curious attitude is key:",
            supportTipCuriosity: "<strong>Be Curious & Open:</strong> Ask them gently about what they're learning in their school's mindfulness sessions (e.g., about their 'Mind Puppy' if they're doing a Paws b inspired program, or their 'Attention Flashlight'). Listen without judgment.",
            supportTipModel: "<strong>Model Mindful Behavior:</strong> Children learn by watching. Try to show calm responses to your own daily stresses. Pausing before reacting can be a powerful example.",
            supportTipPatience: "<strong>Patience & Encouragement:</strong> Mindfulness is a skill that develops over time. Some days will be easier than others. Offer encouragement for their effort, not for 'getting it right'.",
            supportTipOwnPractice: "<strong>Consider Your Own Practice:</strong> If you're interested, exploring mindfulness for yourself (perhaps through our Adult Curriculum) can deepen your understanding and ability to support your child authentically.",
            parentsWorkingWithSchoolTitle: "Working with the School",
            parentsWorkingWithSchoolP1: "Stay informed about the mindfulness initiatives at your child's school. Attend any parent information sessions offered. Open communication with teachers about how mindfulness is being integrated can be very beneficial for a consistent approach.",
            parentsFurtherResourcesTitle: "Further Resources",
            parentsMiSPLink: "Learn more from the <a href='https://mindfulnessinschools.org/what-is-mindfulness/why-mindfulness-for-parents-carers/' target='_blank' rel='noopener'>Mindfulness in Schools Project (MiSP) about involving parents</a>.",
            parentsMfCPLink: "For resources specific to Japan, explore the <a href='http://mfcp.info' target='_blank' rel='noopener'>Kodomo Mindfulness Project (MfCP)</a>.",
            
            // School Pathways
            schoolPathwaysTitle: "School Implementation Pathways (Inspired by MiSP)",
            schoolPathwaysDesc: "A guide for schools to introduce and embed mindfulness for whole-school well-being, drawing on MiSP's established framework.",
            pathwayStep1Title: "Step 1: Explore - Understanding Mindfulness & Its Potential",
            pathwayStep1Desc: "Learn about MW, its benefits for students and staff. Review research (see MiSP's evidence base). Attend an info session or explore resources like MiSP's '10 Steps to Introduce Mindfulness'. (See our <a href='#' onclick='window.loadPage(\"about\"); return false;'>About MW</a> & <a href='#' onclick='window.loadPage(\"researchEvidence\"); return false;'>Research</a> pages).",
            pathwayStep2Title: "Step 2: Introduce - Staff Wellbeing & Foundational Training First",
            pathwayStep2Desc: "Crucially, encourage key staff to undertake an 8-week personal mindfulness course (like MiSP's .begin or our Adult Foundations). Teacher well-being and embodied practice are vital for authentic teaching. Consider inviting external MiSP-trained teachers for initial student sessions if staff aren't yet trained to teach specific curricula.",
            pathwayStep3Title: "Step 3: Develop - Student Curriculum Rollout & Teacher Training",
            pathwayStep3Desc: "Select appropriate Brain Power 'Mindful Minutes' curricula (ES/JHS), which are inspired by MiSP's age-appropriate approaches. For comprehensive delivery, train interested staff through official MiSP/MfCP programs to teach full curricula like Paws b or .b.",
            pathwayStep4Title: "Step 4: Embed & Sustain - Whole School Approach & Leadership",
            pathwayStep4Desc: "Integrate MW into school culture (assemblies, classroom 'mindful moments', staff meetings). Appoint a 'School Mindfulness Lead' (MiSP offers specific training for this role). Provide ongoing support for staff (e.g., practice groups). Involve parents. Make MW visible and part of the school's ethos. Sustain practice over time.",
            pathwayMiSPLink: "For detailed steps and extensive resources, see MiSP's <a href='https://mindfulnessinschools.org/mindfulness-in-education/how-to-do-it/' target='_blank' rel='noopener'>'How to Bring Mindfulness to Your School' guidance</a> and explore their Pathways model.",

            // Teacher Resources
            teacherResourcesTitleFull: "Teacher & Facilitator Resources",
            teacherResourcesDescFull: "Guides, MiSP-inspired implementation strategies, Brain Power offerings, and FAQs to support your mindfulness teaching journey.",
            implementingMWTitle: "Implementing MW in Your School (Key Principles Inspired by MiSP)",
            implementingMWP1: "Introducing mindfulness effectively is a journey. Key MiSP-aligned principles include: 1. Gaining Senior Leadership Team backing. 2. Staff experiencing mindfulness first (personal practice is paramount). 3. Designating a 'Mindfulness Champion' or Lead. 4. Thoughtful integration into the timetable (e.g., PSHE, form time, dedicated slots). 5. Starting small, piloting, and building sustainably. 6. Training enthusiastic and suitable teachers (the 'wow' teachers). 7. Providing ongoing support and CPD for trained staff. 8. Weaving mindfulness into the fabric of school life, not just isolated lessons. 9. Making mindfulness visible and part of the school's language. 10. Engaging the wider school community, including parents.",
            implementingMWP2: "MiSP offers extensive 'Top Tips' for challenges like funding, handling disruptive pupils, or being a 'lone voice' advocating for mindfulness. MfCP in Japan provides culturally adapted resources and training.",
            
            mindfulMeCurriculumTitle: "Mindful Me: 8-Lesson Core Curriculum (ES & JHS)",
            mindfulMeCurriculumDesc: "This foundational curriculum introduces core mindfulness principles and practices in an engaging, age-appropriate way for both Elementary and Junior High students. It can be adapted for 30-45 minute sessions. (Full lesson plans available in Brain Power's internal teacher guides).",
            mindfulMeL1Title: "Lesson 1: Hello Attention! Meet Your 'Mind Puppy'",
            mindfulMeL1Desc: "Objective: Introduce attention as trainable. Practice: Listening to the Bell. Key Idea: Our attention is like a playful puppy.",
            mindfulMeL2Title: "Lesson 2: Our Amazing Body & The Anchor of Breath",
            mindfulMeL2Desc: "Objective: Introduce the body and breath as anchors. Practice: Mindful Breathing & Body Anchor (feet/seat). Key Idea: Our body is always in the present.",
            mindfulMeL3Title: "Lesson 3: Befriending Our Thoughts - Surfing the Thought Waves",
            mindfulMeL3Desc: "Objective: Understand thoughts as mental events, not facts. Practice: Watching Thoughts (like clouds/river). Key Idea: We can observe thoughts without getting carried away.",
            mindfulMeL4Title: "Lesson 4: Working with Feelings - Weathering Our Inner Storms",
            mindfulMeL4Desc: "Objective: Identify emotions and understand they are like weather. Practice: Noticing Feelings in the Body & Breathing with Them. Key Idea: All feelings are natural and temporary.",
            mindfulMeL5Title: "Lesson 5: Mindful Action - Choosing Our Responses (The Pause Button)",
            mindfulMeL5Desc: "Objective: Differentiate reacting vs. responding. Practice: S.T.O.P. (Stop, Take a breath, Observe, Proceed). Key Idea: We can choose how to act.",
            mindfulMeL6Title: "Lesson 6: Connecting with Kindness - Friendship for Ourselves & Others",
            mindfulMeL6Desc: "Objective: Introduce kindness and self-compassion. Practice: Kindness Meditation (simple wishes). Key Idea: Being kind to ourselves and others feels good.",
            mindfulMeL7Title: "Lesson 7: Appreciating the Good - The Power of Gratitude",
            mindfulMeL7Desc: "Objective: Introduce gratitude. Practice: Gratitude Reflection (noticing good things). Key Idea: Gratitude helps us see the positive.",
            mindfulMeL8Title: "Lesson 8: Putting It All Together - Your Mindful Toolkit",
            mindfulMeL8Desc: "Objective: Review skills and create a personal 'mindful toolkit'. Practice: Favorite short practice. Key Idea: Mindfulness is an ongoing practice.",
            mindfulMeExt1Title: "Extension Lesson 1: Dealing with Difficulties Mindfully - Riding the Waves",
            mindfulMeExt1Desc: "Objective: Explore R.A.I.N. (Recognize, Allow, Investigate, Nurture - simplified) for challenges. Practice: Mini-R.A.I.N. with mild difficulty.",
            mindfulMeExt2Title: "Extension Lesson 2: Mindfulness in Daily Life - Weaving it In",
            mindfulMeExt2Desc: "Objective: Identify opportunities for informal practice. Practice: Three Mindful Breaths / Mindful on-the-go. Key Idea: Mindfulness is a way of being.",

            bpOfferingsTitle: "Brain Power's MW Offerings (Aligned with MiSP Principles)",
            bpOfferingsP1: "Brain Power is developing unique MW solutions for Japanese schools, leveraging MiSP's evidence-based approach:",
            bpOfferingsLi1: "<strong>'Plug-and-Play' Video Series:</strong> Short (5-15 min) MW sessions (guided meditations, mindful movement, emotional literacy) for JTEs. Inspired by MiSP's engaging style, suitable for classroom use. Led by experts or trained Japanese presenters, with English language integration.",
            bpOfferingsLi2: "<strong>JTE Training & Resources:</strong> 'Train-the-Facilitator' workshops for JTEs to deliver simple 'Mindful Minutes' practices. Resources for teacher self-care, stress management, and resilience, based on adult MW principles similar to MiSP's .begin/.b Foundations.",
            bpOfferingsLi3: "<strong>Unique 'English + MW' Programs:</strong> Integrating MW themes with English vocabulary and communication (Mindfulness + English, Yoga + English, Tea Ceremony (Zen) + English). These leverage our ALT expertise for culturally relevant and enriching experiences, complementing language learning with well-being skills.",
            bpOfferingsLi4: "<strong>Specialized Offerings (Future):</strong> Exploring deeper practices like gong bath relaxation sessions, advanced meditation workshops (drawing on expert resources, aligned with ethical mindfulness provision).",
            bpOfferingsP2: "Our USP: 'Culturally-sensitive, English-integrated Mindfulness & Wellness programs, created by international experts and tailored for the Japanese school environment, designed to support both student and teacher well-being.'",
            furtherLearningTitle: "Further Learning & Official MiSP/MfCP Training",
            furtherLearningP1: "This app provides introductory resources inspired by MiSP. For official, in-depth teacher training to deliver MiSP curricula like .b, Paws b, or dots:",
            furtherLearningLi1: "<strong>In Japan:</strong> Contact the <strong>Kodomo Mindfulness Project (MfCP)</strong> at <a href='http://mfcp.info' target='_blank' rel='noopener'>mfcp.info</a>. They are the MiSP-certified body for training in Japan.",
            furtherLearningLi2: "<strong>Internationally/UK:</strong> Visit the <strong>Mindfulness in Schools Project (MiSP)</strong> at <a href='https://mindfulnessinschools.org' target='_blank' rel='noopener'>mindfulnessinschools.org</a> for their full range of training and resources.",
            classroomTipsTitle: "Classroom Tips (Inspired by MiSP Best Practice)",
            classroomTipsP1: "<strong>Invitational Language:</strong> Always invite, never coerce. e.g., 'You might like to close your eyes, or if you prefer, keep a soft gaze downwards.'",
            classroomTipsP2: "<strong>Short & Consistent:</strong> Especially at first, keep practices brief (1-5 mins). Daily or regular consistency is more powerful than infrequent long sessions.",
            classroomTipsP3: "<strong>Acknowledge Restlessness & Wandering Mind:</strong> Normalize the 'mind puppy' (from Paws b). 'It's perfectly normal for your mind to wander. That's what minds do! When you notice, just gently bring your attention back.'",
            classroomTipsP4: "<strong>Use Anchors:</strong> Breath, sounds, body sensations are common anchors. Offer choices. This is a core MiSP principle.",
            classroomTipsP5: "<strong>Model It:</strong> Your own calm, present, and authentic presence is the most impactful teaching tool. Practice what you teach.",
            selfCareEducatorsTitle: "Self-Care for Educators (A Core MiSP Principle)",
            selfCareEducatorsP1: "Your well-being is fundamental. MiSP emphasizes that teachers should have their own practice. Try these short practices from the app: <a href='#' onclick='window.navigateToPractice(\"audio-quick-calm-list\"); return false;'>Quick Calm</a>, <a href='#' onclick='window.navigateToPractice(\"audio-breathing-3min\"); return false;'>3-Min Breathing</a>. Explore our Adult Curriculum for deeper personal practice, inspired by courses like MiSP's .begin.",

            // Research & Evidence
            researchEvidenceTitle: "Research & Evidence for MW in Schools (MiSP Focus)",
            researchIntroP1: "A robust and growing body of research supports the benefits of mindfulness for young people and educators. This app provides introductory practices inspired by leading evidence-based programs like the Mindfulness in Schools Project (MiSP).",
            researchStudentBenefitsTitle: "Benefits for Students (Drawing from MiSP Research & General Evidence):",
            researchStudentLi1: "Improved emotional regulation, leading to reduced stress, anxiety, and depressive symptoms (Key findings from .b and Paws b studies).",
            researchStudentLi2: "Enhanced attention, concentration, and executive functions like working memory and cognitive flexibility (Often cited benefits of MiSP curricula).",
            researchStudentLi3: "Increased self-awareness and metacognition (understanding one's own thoughts and feelings - a core aim of .b).",
            researchStudentLi4: "Greater compassion, empathy, and pro-social behavior (Paws b and .b include these elements).",
            researchStudentLi5: "Potential improvements in managing conditions like ADHD and behavior in class.",
            researchTeacherBenefitsTitle: "Benefits for Teachers & School Staff (MiSP .begin & .b Foundations focus):",
            researchTeacherLi1: "Significant reductions in stress, burnout, and anxiety symptoms (Primary outcomes of MiSP adult courses).",
            researchTeacherLi2: "Increased self-compassion, well-being, and teaching efficacy.",
            researchTeacherLi3: "Improved classroom management and more positive student-teacher relationships.",
            researchTeacherLi4: "Enhanced overall job satisfaction and a more positive school climate.",
            researchJapanContextTitle: "The Need & Potential in Japan:",
            researchJapanP1: "Given the statistics on youth mental well-being and teacher stress in Japan, mindfulness interventions offer a promising, secular, and skill-based approach. The Kodomo Mindfulness Project (MfCP) is actively working to adapt and implement MiSP curricula in Japan.",
            researchMispMyriad: "MiSP's .b curriculum was a focus of the large-scale MYRIAD research project (University of Oxford). While universal school-based mindfulness implementation showed complexity in achieving widespread impact without strong teacher training and school support, it provided valuable insights into effective scaling. MiSP continues to refine its approach based on such research. Find more on <a href='https://mindfulnessinschools.org/research-papers/' target='_blank' rel='noopener'>MiSP's research page</a>.",
            researchBrainPowerApproach: "Brain Power's approach is inspired by MiSP's success, focusing on accessible 'Mindful Minutes', empowering JTEs, and creating unique English+MW integrations tailored for the Japanese educational context. We aim to contribute positively to student and teacher well-being.",

            // About MW Page
            aboutMWTitle: "About Mindfulness & Wellness (MW)",
            aboutMWP1: "Mindfulness is paying attention in a particular way: on purpose, in the present moment, and non-judgmentally (Jon Kabat-Zinn). It's a practice of training our attention to be more aware of our thoughts, feelings, bodily sensations, and the world around us, with kindness and curiosity.",
            aboutMWP2: "Wellness encompasses a holistic approach to health, integrating mental, emotional, and physical well-being. Mindfulness is a key component of overall wellness.",
            aboutMWStudentsBenefit: "<strong>For Students:</strong> Reduce stress and anxiety, improve focus and concentration (beneficial for learning), increase self-awareness and emotional regulation, and cultivate compassion and kindness towards self and peers. (MiSP aims for these through its curricula like Paws b and .b)",
            aboutMWTeachersBenefit: "<strong>For Teachers & Staff:</strong> Manage classroom stress, prevent burnout, improve presence and engagement with students, enhance communication skills, and foster a more positive school climate. (MiSP's .begin and .b Foundations support this)",
            needInJapanTitle: "The Need in Japan:",
            needInJapanP1: "Recent UNICEF surveys (as reported by Nippon TV News NNN, May 2025) show that while Japanese children rank top in Physical Health, their Mental Well-being ranks 32nd out of 36 countries. High child suicide rates and pressures from academic/appearance standards are significant concerns. Concurrently, public school teachers are experiencing rising rates of mental health leave due to work-related stress.",
            needInJapanP2: "Mindfulness offers practical, secular tools to address these challenges by equipping individuals with skills for greater resilience and well-being.",
            brainPowerVisionTitle: "Brain Power's Vision for MW:",
            brainPowerVisionP1: "Brain Power aims to be a trusted provider of effective and accessible Mindfulness & Wellness solutions for the Japanese education community, leveraging our existing school network and English language expertise to support the holistic well-being of both students and educators.",
            brainPowerVisionP2: "This app is an initial step in that journey, designed by Brain Power to support your exploration of mindfulness.",
            mispInspiredTitle: "Inspired by Global Best Practices:",
            mispInspiredP1: "Our approach is informed by successful international programs like the <strong>Mindfulness in Schools Project (MiSP)</strong> from the UK, and its Japanese partner, the <strong>Kodomo Mindfulness Project (MfCP)</strong>, which adapts these evidence-based curricula specifically for Japan. We encourage exploring their comprehensive resources for deeper engagement.",
            
            // Nav buttons (repeated for clarity, ensure these are the primary ones)
            navHome: "Home", navPractices: "Practices", navStudentZone: "Student Zone", 
            navElementary: "Kids (ES)", navJuniorHigh: "Kids (JHS)", navAdults: "Adults", 
            navForParents: "For Parents", navSchoolPathways: "School Pathways", 
            navTeacherResources: "Teacher Resources", navResearchEvidence: "Research", navAbout: "About MW",
            
            // Universal
            toggleToJapanese: "日本語へ", 
            toggleToEnglish: "To English", 

            // Practice link texts
            practiceBreathing3MinText: "3-Min Breathing",
            practiceObservingThoughts5MinText: "Observing Thoughts (5 Min)",
            practiceKindness5MinText: "Loving-Kindness (5 Min)",
            practiceBreathing5MinText: "5-Min Breathing",
            practiceBodyScan10MinText: "Body Scan (10 Min)",
            practiceStop2MinText: "S.T.O.P. Practice (2 Min)",
            practiceGratitude4MinText: "Gratitude Reflection (4 Min)",

            // FAQ Keys 
            faqLengthTitle: "How long should a mindfulness session be for students?",
            faqLengthAnswer: "For ES (Grades 4-6), start with 1-3 minutes, gradually building to 5-7. For JHS (Grades 7-9), 3-5 minutes extending to 5-10+. Our \"Mindful Minutes\" are ~10 mins total. Consistency beats length initially.",
            faqEyesClosedTitle: "What if students don't want to close their eyes?",
            faqEyesClosedAnswer: "Always invitational: \"You can close your eyes, or soften your gaze downwards.\" Some prefer eyes open; the focus is inner attention.",
            faqRestlessClassTitle: "The class is very restless. What can I do?",
            faqRestlessClassAnswer: "Acknowledge the energy. Try mindful movement or sound practices first. Keep sitting practices very short. Consistency helps build settling capacity over time. MiSP's 'Shake and Freeze' from Dots is a great example for younger kids.",
            faqBoringTitle: "What if students say mindfulness is \"boring\"?",
            faqBoringAnswer: "Acknowledge: \"Yes, sitting still can feel boring sometimes.\" Reframe: It's noticing the \"mind puppy\" wanting to run. Focus on skill-building (attention, calm) that helps in other areas they enjoy. Use varied, short practices. Connect it to performance (sports, exams) for older students.",
            faqDifficultShareTitle: "How do I handle students sharing difficult experiences?",
            faqDifficultShareAnswer: "Listen empathetically, validate, maintain boundaries (it's not therapy). <strong>Crucially: If any disclosure raises safety concerns (abuse, self-harm, suicidal thoughts), immediately follow your school's established safeguarding and reporting protocol.</strong> For general sharing, focus on the *experience* of the *practice* itself.",
            faqExpertTeacherTitle: "Do I need to be an expert meditator to teach these?",
            faqExpertTeacherAnswer: "For \"Mindful Minutes,\" having your own regular (even brief) personal practice is key for authenticity. Follow scripts, be kind, understand core principles. Deeper teaching (like full MiSP curricula) requires more extensive training and personal practice, as emphasized by MiSP.",
            faqAudioFindTitle: "Where can I find audio practices for curriculum lessons?",
            faqAudioFindAnswer: "All guided audio practices linked from the curriculum pages can be found in the \"Practices\" section of this app. The links will take you there and often highlight the specific track.",
            faqMispTrainingTitle: "How can I get formal training to teach MiSP curricula?",
            faqMispTrainingAnswer: "Brain Power is inspired by MiSP. For official MiSP teacher training in Japan, please refer to the Kodomo Mindfulness Project (MfCP) at mfcp.info. For training outside Japan, visit mindfulnessinschools.org."
        },
        jp: { 
            appTitle: "ブレインパワー マインドフルネス＆ウェルネス",
            navHome: "ホーム",
            navPractices: "実践",
            navStudentZone: "生徒ゾーン",
            navElementary: "子供 (小)",
            navJuniorHigh: "子供 (中)",
            navAdults: "成人",
            navForParents: "保護者向け",
            navSchoolPathways: "学校パスウェイ",
            navTeacherResources: "教員リソース",
            navResearchEvidence: "研究",
            navAbout: "MWについて",
            toggleToEnglish: "To English",
            playBtn: "再生",
            pauseBtn: "一時停止",
            restartBtn: "再開",
            installAppBtn: "アプリをインストール ✨",

            // Home Page
            homeTitle: "マインドフルモーメントへようこそ！",
            homeSubtitle: "静けさ、集中力、そして幸福のためのあなたの聖域。生徒、教育者、そしてよりマインドフルな生活を求めるすべての人のために調整された実践を発見してください。",
            explorePracticesBtn: "実践を探る",
            forStudentsTitle: "生徒向け (小・中学生)",
            forStudentsDesc: "思考や感情を理解し、内なる力を育むための、魅力的な毎日の「マインドフルミニッツ」とアクティビティ。",
            goToStudentZoneBtn: "生徒ゾーンへ",
            forEducatorsTitle: "教育者・成人向け",
            forEducatorsDesc: "自身のプラクティスを深め、マインドフルネスを他者と共有するための包括的なモジュールとリソース。",
            adultCurriculumBtn: "成人向けカリキュラム",
            teacherResourcesTitle: "教員向けリソース",
            teacherResourcesDesc: "マインドフルネス教育の旅をサポートするためのダウンロード可能なガイド、授業計画のアイデア、FAQ。",
            viewResourcesBtn: "リソースを見る",
            featuredPracticeTitle: "特集実践：クイックカーム（1分間の呼吸）",
            featuredPracticeDesc: "呼吸を使って素早く自分をセンタリングするための非常に短い実践。忙しい一日の素早いリセットに最適です。",
            whyMWJapanTitle: "なぜ今、日本でマインドフルネスが重要なのか",
            whyMWJapanDesc: "最近の報告は、日本の若者と教育者の間でメンタルウェルネス支援の重要な必要性を浮き彫りにしています。身体的健康は高いランクにありますが、学業のプレッシャーや高いストレスレベルなど、メンタルウェルビーイングは大きな課題に直面しています。マインドフルネスはレジリエンスを構築するための実証済みのツールを提供します。",
            learnMoreAboutNeedLink: "「MWについて」で詳細を見る",

            // Practices Page
            practicesTitle: "ガイド付き実践",
            coreMindfulnessCategory: "コアマインドフルネス",
            thoughtsFeelingsCategory: "思考と感情の扱い方",
            kindnessGratitudeCategory: "優しさと感謝",
            quickCalmTitle: "クイックカーム（1分）", quickCalmDesc: "素早く自分をセンタリングするための非常に短い実践。",
            breathing3MinTitle: "マインドフル呼吸（3分）", breathing3MinDesc: "呼吸を使って自分をアンカーする短い実践。",
            breathing5MinTitle: "マインドフル呼吸（5分）", breathing5MinDesc: "少し長めの呼吸認識の実践。",
            bodyScan10MinTitle: "ボディスキャン（10分）", bodyScan10MinDesc: "頭のてっぺんからつま先まで、あなたの体とつながりましょう。",
            listeningSounds3MinTitle: "音へのマインドフルリスニング（3分）", listeningSounds3MinDesc: "音に集中することで意識を拡大します。",
            thoughtsClouds5MinTitle: "思考の観察（雲 - 5分）", thoughtsClouds5MinDesc: "思考が雲のように通り過ぎるのを見てください。",
            stopPractice2MinTitle: "S.T.O.P. 実践（2分）", stopPractice2MinDesc: "一時停止、深呼吸、観察、進行。",
            kindness5MinTitle: "慈悲の瞑想（5分）", kindness5MinDesc: "自己と他者への温かさを育みます。",
            gratitude4MinTitle: "感謝の反省（4分）", gratitude4MinDesc: "あなたの人生の良いことを感謝します。",

            // Student Zone
            studentZoneTitle: "スチューデントゾーン - 楽しさと集中！",
            studentZoneDesc: "創造的な方法でマインドフルネスを実践するために、これらのアクティビティを探求しましょう。",
            mindPuppyTitle: "マインドパピーとアテンションゲーム",
            mindPuppyDesc: "私たちのアテンションは、遊び好きな子犬のようです - 時には集中し、時にはさまよいます！優しく「マインドパピー」を訓練する練習をしましょう。音が完全に消えるまで耳を澄ませてみてください。どれくらい一緒にいられますか？",
            shakeFreezeTitle: "シェイク＆フリーズで遊ぼう",
            shakeFreezeDesc: "「シェイク！」と聞いたら体を思い切り振り、「フリーズ！」と聞いたら像のように固まってください！動いている時と静止している時の体の感じ方に注意してください。これは体を感じ、落ち着くことを学ぶのに役立ちます。(MiSP 「dots」より)",
            amazingBrainTitle: "素晴らしい脳を探検しよう",
            amazingBrainDesc: "あなたの脳は素晴らしいです！学ぶこと、遊ぶこと、感じることすべてを助けてくれます。「前頭前皮質」はチームリーダーのようなもので、集中したり選択したりするのを助けます。筋肉のように訓練できます！(MiSP 「Paws b」より)",
            mindfulWalkingTitle: "マインドフルウォーキングの瞬間",
            mindfulWalkingDesc: "次に歩くとき（授業へ、家で）、数歩の間、地面に足がつく感覚に注意してみてください。どんな感覚がありますか？",
            storyTimeTitle: "マインドフルストーリータイム",
            storyTimeDesc: "物語を聞くとき、言葉を本当に聞いてみてください。物語がどのように感じさせるか注意してください。登場人物に何が起こりますか？彼らから何を学べますか？",
            mindfulColoringTitle: "マインドフルカラーリング",
            mindfulColoringDesc: "画像を選んでください。紙に色を塗るか、デジタルで色を塗るのを想像しながら、呼吸と色を塗る感覚に集中してください。色とそれがあなたにどのように感じさせるかに注意してください。正しい方法も間違った方法もありません！",
            mandalaBtn: "曼荼羅デザイン",
            natureSceneBtn: "自然の風景",
            selectImagePrompt: "プレビューする画像を選択するか、印刷可能なバージョンを以下からダウンロードしてください。",
            downloadMandalaLink: "曼荼羅PDFをダウンロード",
            downloadNatureLink: "自然風景PDFをダウンロード",
            gratitudeJournalTitle: "感謝日記",
            gratitudeJournalDesc: "今日は何に感謝していますか？少し時間を取り、1～3つのことを書き留めてください。良いことに気づくことは、私たちの心を幸せにするのに役立ちます！",
            gratitudePlaceholder: "今日感謝していること...（例：友達と遊んだこと、晴れた日、美味しいおやつ）",
            addGratitudeBtn: "日記に追加",
            myGratitudeListTitle: "私の感謝リスト：",
            deleteBtnText: "削除",

            // Elementary Curriculum
            esCurriculumTitle: "マインドフルミニッツ：小学生プログラム（ES 4～6年生）",
            esCurriculumDesc: "基礎的な意識スキルを構築するための、魅力的な毎日の10分間の「マインドフルミニッツ」。MiSPのPaws b（7～11歳向け）とDots（3～6歳向け）の原則に触発され、上級小学校向けに適応。",
            
            esWeek1Title: "第1週：アテンションを払う - マインドパピーとアンカー",
            esDay1: "1日目", esWeek1D1: "こんにちは、アテンション！（ベルの音を聞く）。コンセプト：アテンションを紹介する。",
            esDay2: "2日目", esWeek1D2: "私たちの呼吸アンカー。コンセプト：主要なアンカーとしての呼吸。",
            esDay3: "3日目", esWeek1D3: "身体のアンカー - 足と座席。コンセプト：他の身体部分をアンカーとして紹介する。",
            esDay4: "4日目", esWeek1D4: "マインドフルな見方 - 詳細に気づく。コンセプト：視覚に焦点を当てたアテンションを練習する。",
            esDay5: "5日目", esWeek1D5: "復習 - これまでのアテンションツールキット。コンセプト：選択の余地のない気づき／お気に入りのアンカー。",
            esWeek1PracticeLinkText: "3分間の呼吸法",
            
            esWeek2Title: "第2週：私たちの思考に気づく - マインドシネマ",
            esWeek2D1: "思考は雲のよう。コンセプト：思考が来ては去るという考えを紹介する。",
            esWeek2D2: "思考は事実ではない。コンセプト：すべての思考を信じる必要はないという考えを紹介する。",
            esWeek2D3: "「くっつかない」心。コンセプト：思考に囚われないことを強化する（例：小川の葉）。",
            esWeek2D4: "役立つ思考か、役立たない思考か？コンセプト：思考が役立つかどうかを見分け始める。",
            esWeek2D5: "復習 - 私たちの思考する心。コンセプト：思考の開かれた気づき。",
            esWeek2PracticeLinkText: "思考の観察（5分）",

            esWeek3Title: "第3週：私たちの感情を理解する - 内なる天気",
            esWeek3D1: "感情は天気のようなもの。コンセプト：感情を天気というメタファーで紹介する。",
            esWeek3D2: "どこで感じる？（体の中の感情）。コンセプト：感情を身体感覚と結びつける。",
            esWeek3D3: "すべての感情はOK（不快なものでも）。コンセプト：すべての感情の経験を正常化する。",
            esWeek3D4: "大きな感情のための呼吸アンカー。コンセプト：感情が強いときに呼吸をアンカーとして使用することを強化する。",
            esWeek3D5: "復習 - 私たちの感情の世界。コンセプト：感情の開かれた気づき。",
            esWeek3PracticeLinkText: "S.T.O.P. 実践（2分）",

            esWeek4Title: "第4週：優しさと感謝 - 心とつながる",
            esWeek4D1: "優しさとは？コンセプト：優しさの意味と感情を探る。",
            esWeek4D2: "自分自身への優しさ（自己への優しさ）。コンセプト：自分自身の良き友人であるという考えを紹介する。",
            esWeek4D3: "感謝とは？コンセプト：良いことに気づき、感謝することとしての感謝を紹介する。",
            esWeek4D4: "小さなこと、大きな感謝。コンセプト：日常の簡単なことへの感謝を強調する。",
            esWeek4D5: "復習 - 私たちのマインドフルな心。コンセプト：優しさと感謝のコンボ実践。",
            esWeek4PracticeLinkText: "慈悲の瞑想（5分）",

            esWeek5Title: "第5週（深掘り）：アテンションフラッシュライトとF.L.O.A.T.",
            esWeek5D1: "アテンションフラッシュライト。コンセプト：私たちが指示する懐中電灯としてのアテンションを再訪する。",
            esWeek5D2: "「ベディテーション」／F.L.O.A.T.（簡略版）。コンセプト：簡単な落ち着きの実践を紹介する（感じる、聞く、観察する、気づく、思考する）。",
            esWeek5D3: "ミニボディスキャン（手と足）。コンセプト：グラウンディングのための短いボディスキャン。",
            esWeek5D4: "マインドフルウォーキング（座っていても立っていても）。コンセプト：小さなスペースでのマインドフルな動き。",
            esWeek5D5: "復習 - アンカーを広げる。コンセプト：音、呼吸、身体のアンカー選択。",

            esWeek6Title: "第6週（深掘り）：思考と向き合う - 思考の交通整理人",
            esWeek6D1: "思考のテーマに気づく。コンセプト：一般的な思考の種類（心配、計画、記憶）を認識する。",
            esWeek6D2: "この思考は本当？（.bからの優しい問いかけ）。コンセプト：強い思考の絶対的な真実を優しく問う。",
            esWeek6D3: "「ありがとう、心！」（認知的拡散）。コンセプト：役に立たない思考から距離を置く気楽な方法。",
            esWeek6D4: "焦点を決める - 「思考の交通整理人」。コンセプト：思考の中でどこに注意を向けるかを選ぶ。",
            esWeek6D5: "復習 - 思考について賢くなる。コンセプト：マインドフルな選択の実践。",
            
            esWeek7Title: "第7週（深掘り）：感情と感情調整",
            esWeek7D1: "感情は動きの中のエネルギー。コンセプト：感情を感覚/エネルギーとして理解する。",
            esWeek7D2: "感情のためのS.T.O.P.（.b/Paws bより）。コンセプト：感情的な引き金にS.T.O.P.を適用する。",
            esWeek7D3: "感情のためのスペースを作る（許容）。コンセプト：感情と戦わずに存在させる練習。",
            esWeek7D4: "感情への対応を選ぶ。コンセプト：感情が強いときに賢明に行動することを選ぶ力を養う。",
            esWeek7D5: "復習 - 内なる天気と親しむ。コンセプト：優しさをもってマインドフルにチェックインする。",
            
            esWeek8Title: "第8週（深掘り）：優しさと感謝 - 私たちの光を分かち合う",
            esWeek8D1: "優しさの波及効果。コンセプト：小さな親切がどのように広がるかを理解する。",
            esWeek8D2: "困難な時の自己への優しさ（.b/Paws bからのなだめるタッチ/優しい言葉）。コンセプト：自己共感の実践。",
            esWeek8D3: "簡単な喜びへの感謝（三つの良いこと - 簡略版）。コンセプト：小さなポジティブなことへの感謝を育む。",
            esWeek8D4: "他者への感謝の表現。コンセプト：感謝を示すことを奨励する。",
            esWeek8D5: "復習とマインドフルな旅の継続。コンセプト：開かれた気づきと優しい願い。",
            esTeacherNote: "<em>先生方へ：詳細は<a href=\"#\" onclick=\"window.loadPage('teacherResources'); return false;\">教員リソース</a>をご覧ください。この内容はMiSPのDotsとPaws bカリキュラムに触発されたものです。完全なカリキュラムトレーニングはMiSPまたはMfCPを通じて受講できます。</em>",

            // Junior High Curriculum
            jhsCurriculumTitle: "マインドフル・ファンデーションズ：中学生プログラム（JHS 7～9年生）",
            jhsCurriculumDesc: "MiSPの.bカリキュラム（11～18歳向け）に触発された、思春期の課題に対するアテンション、思考、感情、レジリエンスを探求する毎日の10分間の「マインドフルミニッツ」。",
            
            jhsWeek1Title: "第1週：アテンションを働かせるとパピーマインド (.b レッスン1)",
            jhsDay1: "1日目", jhsWeek1D1: "マインドフルネスとは？基本ルールと可能性。",
            jhsDay2: "2日目", jhsWeek1D2: "アテンションは懐中電灯/子犬のよう - 指向と探求。",
            jhsDay3: "3日目", jhsWeek1D3: "ミニボディスキャン（手、足、呼吸）(.b レッスン1 実践)。",
            jhsDay4: "4日目", jhsWeek1D4: "パピーマインドの訓練（優しさ、忍耐、反復）。",
            jhsDay5: "5日目", jhsWeek1D5: "指呼吸と宿題の紹介 (.b レッスン1 実践)。",
            jhsWeek1PracticeLinkText: "5分間の呼吸法",
            
            jhsWeek2Title: "第2週：思考に気づく - マインドシネマと思考習慣 (.b L2)",
            jhsWeek2D1: "思考は雲/葉のよう（判断せずに思考を観察する）。",
            jhsWeek2D2: "思考は事実ではない（そして信じる必要はない）。",
            jhsWeek2D3: "「くっつかない」心と手放し（実践：小川の葉）。",
            jhsWeek2D4: "役立つ思考か、役立たない思考か？（見分け始め、問いかける）。",
            jhsWeek2D5: "復習：私たちの思考する心と思考の開かれた気づき。",
            jhsWeek2PracticeLinkText: "思考の観察（5分）",

            jhsWeek3Title: "第3週：感情を理解する - 内なる天気と感情調整 (.b L3, L4, L7)",
            jhsWeek3D1: "感情は天気のようなもの（変わりやすく、すべて自然なもの）。",
            jhsWeek3D2: "どこで感じる？（感情の身体感覚；感情のための短いボディスキャン）。",
            jhsWeek3D3: "困難な瞬間のためのS.T.O.P.（学業/社会的なストレス）。",
            jhsWeek3D4: "ストレスフルな状況への対応と反応 - 賢明な選択（一時停止ボタン）。",
            jhsWeek3D5: "復習：感情的レジリエンスツールキットの構築。",
            jhsWeek3PracticeLinkText: "S.T.O.P. 実践（2分）",

            jhsWeek4Title: "第4週：優しさ、感謝、そして世界とつながる (.b L8, L9, L10)",
            jhsWeek4D1: "優しさとは？波及効果と自己への優しさ（あなたの内なる友人）。",
            jhsWeek4D2: "感謝とは？良いことに気づくことと三つの良いこと。",
            jhsWeek4D3: "マインドフルコミュニケーション（気づきをもって聞き、話す - 簡単なヒント）。",
            jhsWeek4D4: "良いものを取り込む（ポジティブな経験を味わう）。",
            jhsWeek4D5: "復習：私たちのマインドフルな心とマインドフルに生きる（優しさと感謝のコンボ）。",
            jhsWeek4PracticeLinkText: "感謝の反省（4分）",

            jhsWeek5Title: "第5週（深掘り）：アテンションフラッシュライトとF.L.O.A.T. (.b)",
            jhsWeek5D1: "懐中電灯としてのアテンションを再訪する（意図をもって指示する）。",
            jhsWeek5D2: "「ベディテーション」／F.L.O.A.T.（完全版 - 感じる、聞く、観察する、気づく、思考する）。",
            jhsWeek5D3: "ボディスキャン抜粋（アンカーとして異なる身体領域に焦点を当てる）。",
            jhsWeek5D4: "マインドフルウォーキング（座っていても立っていても、動きの感覚に焦点を当てる）。",
            jhsWeek5D5: "復習 - アンカーを広げると選択の余地のない気づきの実践。",
            
            jhsWeek6Title: "第6週（深掘り）：思考と向き合う - 思考の交通整理人 (.b)",
            jhsWeek6D1: "思考のテーマと習慣に気づく（心配、計画、判断）。",
            jhsWeek6D2: "「この思考は100％真実か？」（.bカリキュラムからの問いかけ）。",
            jhsWeek6D3: "「ありがとう、心！」（認知的拡散、広がりを育む）。",
            jhsWeek6D4: "焦点を決める - 「思考の交通整理人」（積極的に注意を向ける）。",
            jhsWeek6D5: "復習 - 思考について賢くなるとマインドフルな選択。",

            jhsWeek7Title: "第7週（深掘り）：感情、感情調整とR.A.I.N. (.b)",
            jhsWeek7D1: "感情は動きの中のエネルギー（感情の身体性を探る）。",
            jhsWeek7D2: "強い感情のためのS.T.O.P.（実生活のシナリオに適用する）。",
            jhsWeek7D3: "R.A.I.N.で感情のためのスペースを作る（認識、許容、調査、育成 - 簡略版）。",
            jhsWeek7D4: "感情への対応を選ぶ（賢明な行動を育む）。",
            jhsWeek7D5: "復習 - 内なる天気と親しくなると自己共感。",

            jhsWeek8Title: "第8週（深掘り）：優しさ、感謝、そして私たちの光を分かち合う (.b)",
            jhsWeek8D1: "優しさの波及効果と相互関連性。",
            jhsWeek8D2: "困難な時の自己への優しさ（.bからのなだめるタッチ/優しい言葉）。",
            jhsWeek8D3: "簡単な喜びへの感謝と他者への感謝の表現。",
            jhsWeek8D4: "マインドフルな話し方と聞き方（さらなる実践）。",
            jhsWeek8D5: "復習とマインドフルな旅の継続 - すべてをまとめる。",
            jhsTeacherNote: "<em>先生方へ：詳細は<a href=\"#\" onclick=\"window.loadPage('teacherResources'); return false;\">教員リソース</a>をご覧ください。この内容はMiSPの.bカリキュラムに触発されたものです。完全なカリキュラムトレーニングはMiSPまたはMfCPを通じて受講できます。</em>",

            // Adult Curriculum
            adultCurriculumTitleFull: "MWの基礎：成人、教育者、保護者向け",
            adultCurriculumDescFull: "MiSPの.beginと.b Foundationsに触発され、成人学習者向けに適応された8モジュールプログラム。ウェルビーイングのために個人的な実践を深め、他者を支援する方法を学びます。",
            adultModule1Title: "モジュール1：マインドフルネス入門 - それが何であり、なぜ重要なのか",
            adultModule1Desc: "単なるリラクゼーションを超えたマインドフルネスの定義。その核となる構成要素（注意、現在、非判断）の理解。「自動操縦」モードと現代生活、特に教育における「大惨事」の探求。マインドフルな到着や呼吸認識などの入門実践。",
            adultModule2Title: "モジュール2：身体と親しむ - 現在にアンカーする",
            adultModule2Desc: "存在の主要なアンカーとしての身体の理解を深める。内受容を養い、習慣的な緊張パターンを認識するためのボディスキャン瞑想の探求。身体感覚（快、不快、中立）とマインドフルに取り組む。",
            adultModule3Title: "モジュール3：思考を理解する - 「マインドシネマ」と認知的拡散",
            adultModule3Desc: "思考を精神的な出来事であり、必ずしも事実ではないものとして調査する。距離を置き、融合を減らすための認知的拡散技法（思考のラベリング、「私は～という思考を持っている」など）の導入。「内なる批評家」と非生産的な思考パターンに取り組む。",
            adultModule4Title: "モジュール4：感情をナビゲートする - 内なる天気を理解する",
            adultModule4Desc: "感情を「内なる天気」として一過性の状態として探求する。思考、感情、身体感覚の相互接続性の理解。困難な感情と取り組むためのツールとしてのR.A.I.N.（認識、許容、調査、育成/非同一化）の導入と実践。",
            adultModule5Title: "モジュール5：ストレス、レジリエンス、「大惨事」 - マインドフルネスでストレスと親しむ",
            adultModule5Desc: "身体のストレス反応（急性対慢性）の理解。個人的なストレスサイン（身体的、感情的、認知的、行動的）の特定。マインドフルネスがどのようにストレスレジリエンスを養うかの探求。その場でのストレス軽減のための「3段階呼吸空間法」（またはS.T.O.P.）の実践。",
            adultModule6Title: "モジュール6：自己共感の力と優しさの育成",
            adultModule6Desc: "自己共感（自己への優しさ、共通の人間性、マインドフルネス）の定義と、自己憐憫や自己耽溺との区別。「内なる批評家」の役割を理解し、共感をもってそれに応える方法を学ぶ。自己と他者への慈悲の瞑想の実践。",
            adultModule7Title: "モジュール7：マインドフルコミュニケーション - 気づきをもって聞き、話す",
            adultModule7Desc: "マインドフルリスニング（完全な注意、非判断的）とマインドフルスピーチ（意図、誠実さ、優しさをもって話すこと；影響への気づき）の原則の探求。これらのスキルを関係改善や困難な会話のナビゲートに応用する。",
            adultModule8Title: "モジュール8：日常生活と仕事へのマインドフルネスの統合 - マインドフルに生きる - レビュー、祝福、そして未来へ",
            adultModule8Desc: "公式および非公式のマインドフルネス実践の区別。忙しい日常に非公式のマインドフルネスを織り込む方法（マインドフルトリガー/ポーズ）のブレインストーミング。継続的な実践のための個人的マインドフルネス計画の作成。潜在的な課題への対処とサポートシステムの特定。旅を祝い、未来を見据える。",
            
            // For Parents - Detailed Content (Japanese)
            forParentsTitle: "保護者のためのマインドフルネス",
            forParentsDesc: "お子様のマインドフルネスの旅をサポートし、家族内の幸福を育む。Mindfulness in Schools Project (MiSP) の原則に触発されています。",
            parentsWhyMWTitle: "なぜ私の子供にとってマインドフルネスは有益なのですか？",
            parentsWhyMWP1: "現代のペースの速い世界では、子供たちは多くのプレッシャーに直面しています。マインドフルネスは、これらの課題を乗り越えるための貴重なライフスキルを子供たちに提供します。それは心を空にすることではなく、優しさや好奇心をもって現在の瞬間に注意を払うことを学ぶことです。",
            parentsWhyMWP2: "多くの場合、次のような利点があります：",
            parentsBenefitFocus: "<strong>集中力と注意力の向上：</strong>学業や日常活動での助けとなります。",
            parentsBenefitEmotions: "<strong>より良い感情調節：</strong>ストレス、不安、怒りなどの感情をより健康的な方法で理解し、管理します。",
            parentsBenefitResilience: "<strong>レジリエンスの向上：</strong>困難から立ち直る能力を養います。",
            parentsBenefitKindness: "<strong>優しさと思いやりの向上：</strong>自分自身や他者に対して、社会的な相互作用を改善します。",
            parentsSimplePracticesTitle: "一緒に試せる簡単なマインドフルネス実践",
            parentsSimplePracticesIntro: "専門家である必要はありません！MiSPのアプローチに触発されたこれらの簡単な活動は、家族生活に織り込むことができます：",
            practiceMindfulMinuteTitle: "マインドフルな1分間",
            practiceMindfulMinuteDesc: "お子さんと一緒に1分間静かに座ってみましょう。呼吸の感覚、周りの音、または手足の感覚に集中することができます。その後、優しく「何に気づいた？」と尋ねてみましょう。",
            practiceMindfulListeningTitle: "マインドフルリスニング",
            practiceMindfulListeningDesc: "音楽（できれば言葉のないもの）を選ぶか、単に環境の音（屋内または屋外）に耳を澄ませます。数分間、話さずに一緒に聞きます。それぞれがどんな異なる音を聞いたか共有しましょう。",
            practiceGratitudeSharingTitle: "感謝の共有",
            practiceGratitudeSharingDesc: "夕食時や就寝時に、その日感謝した小さなことを交代で共有します。晴れた瞬間、優しい言葉、好きな食べ物など、何でも構いません。",
            practiceMindfulEatingTitle: "マインドフルな一口",
            practiceMindfulEatingDesc: "おやつ（レーズンや果物など）を一口食べます。お子さんに、その見た目、匂い、食感、味を非常にゆっくりと気づくように促します。このように食べるのはどんな感じですか？",
            parentsSupportChildTitle: "子供のマインドフルネス実践をどのようにサポートできますか？",
            parentsSupportChildP1: "あなたの協力的で好奇心旺盛な態度が鍵です：",
            supportTipCuriosity: "<strong>好奇心を持ち、心を開く：</strong>学校のマインドフルネスセッションで何を学んでいるか（例：Paws bプログラムの「マインドパピー」について、または「注意の懐中電灯」について）優しく尋ねてみましょう。判断せずに耳を傾けます。",
            supportTipModel: "<strong>マインドフルな行動を手本にする：</strong>子供たちは見て学びます。あなた自身の日常のストレスに対して穏やかな反応を示すように努めてください。反応する前に一時停止することは、強力な手本となり得ます。",
            supportTipPatience: "<strong>忍耐と励まし：</strong>マインドフルネスは時間とともに発達するスキルです。楽な日もあれば、そうでない日もあります。「正しく行う」ことではなく、努力を励ましましょう。",
            supportTipOwnPractice: "<strong>自身のプラクティスを検討する：</strong>もし興味があれば、あなた自身のためにマインドフルネスを探求する（おそらく私たちの成人向けカリキュラムを通じて）ことで、お子さんを本物らしくサポートする理解と能力を深めることができます。",
            parentsWorkingWithSchoolTitle: "学校との連携",
            parentsWorkingWithSchoolP1: "お子さんの学校でのマインドフルネスの取り組みについて情報を得ましょう。提供される保護者向け情報セッションに参加してください。マインドフルネスがどのように統合されているかについて教師とオープンにコミュニケーションを取ることは、一貫したアプローチのために非常に有益です。",
            parentsFurtherResourcesTitle: "さらなるリソース",
            parentsMiSPLink: "<a href='https://mindfulnessinschools.org/what-is-mindfulness/why-mindfulness-for-parents-carers/' target='_blank' rel='noopener'>Mindfulness in Schools Project (MiSP) の保護者向け情報</a>でさらに学ぶ。",
            parentsMfCPLink: "日本に特化したリソースについては、<a href='http://mfcp.info' target='_blank' rel='noopener'>子どもマインドフルネスプロジェクト（MfCP）</a>をご覧ください。",
            
            // School Pathways
            schoolPathwaysTitle: "学校導入パスウェイ（MiSPより）",
            schoolPathwaysDesc: "MiSPの確立されたフレームワークを活用し、学校全体のウェルビーイングのためにマインドフルネスを導入し、定着させるためのガイド。",
            pathwayStep1Title: "ステップ1：探る - マインドフルネスとその可能性を理解する",
            pathwayStep1Desc: "MW、生徒とスタッフへの利点について学びます。研究を確認します（MiSPのエビデンスベースを参照）。情報セッションに参加するか、MiSPの「マインドフルネスを導入するための10ステップ」のようなリソースを探ります。（私たちの<a href='#' onclick='window.loadPage(\"about\"); return false;'>MWについて</a>と<a href='#' onclick='window.loadPage(\"researchEvidence\"); return false;'>研究</a>ページをご覧ください）。",
            pathwayStep2Title: "ステップ2：導入 - まずはスタッフのウェルビーイングと基礎トレーニングから",
            pathwayStep2Desc: "重要なのは、主要スタッフに8週間の個人的マインドフルネスコース（MiSPの.beginや私たちの成人向け基礎コースなど）の受講を奨励することです。教師のウェルビーイングと体現された実践は、本物の指導にとって不可欠です。スタッフが特定のカリキュラムを教える訓練を受けていない場合は、初期の生徒向けセッションのために外部のMiSP認定教師を招待することを検討してください。",
            pathwayStep3Title: "ステップ3：開発 - 生徒向けカリキュラムの展開と教師トレーニング",
            pathwayStep3Desc: "適切なブレインパワー「マインドフルミニッツ」カリキュラム（小/中）を選択します。これらはMiSPの年齢に応じたアプローチに触発されています。包括的な提供のためには、関心のあるスタッフを公式MiSP/MfCPプログラムを通じて訓練し、Paws bや.bのような完全なカリキュラムを教えるようにします。",
            pathwayStep4Title: "ステップ4：定着と持続 - 学校全体のアプローチとリーダーシップ",
            pathwayStep4Desc: "MWを学校文化に統合します（朝礼、教室での「マインドフルモーメント」、職員会議など）。「スクールマインドフルネスリード」を任命します（MiSPはこの役割のための特定のトレーニングを提供しています）。スタッフへの継続的なサポートを提供します（例：実践グループ）。保護者を巻き込みます。MWを目に見えるものにし、学校の精神の一部にします。時間をかけて実践を持続させます。",
            pathwayMiSPLink: "詳細なステップと豊富なリソースについては、MiSPの<a href='https://mindfulnessinschools.org/mindfulness-in-education/how-to-do-it/' target='_blank' rel='noopener'>「学校にマインドフルネスを導入する方法」ガイダンス</a>をご覧になり、彼らのパスウェイモデルを探求してください。",

            // Teacher Resources
            teacherResourcesTitleFull: "教師・ファシリテーター向けリソース",
            teacherResourcesDescFull: "ガイド、MiSPに触発された導入戦略、ブレインパワーの提供プログラム、そしてマインドフルネス教育の旅を支援するFAQ。",
            implementingMWTitle: "学校でのMW導入（MiSPに触発された主要原則）",
            implementingMWP1: "マインドフルネスを効果的に導入することは旅です。MiSPに沿った主要原則には以下が含まれます：1. 上級指導チームの支援を得る。2. スタッフが最初にマインドフルネスを体験する（個人的実践が最重要）。3. 「マインドフルネスチャンピオン」またはリードを指名する。4. 時間割への思慮深い統合（例：PSHE、ホームルーム、専用スロット）。5. 小さく始め、試験的に行い、持続的に構築する。6. 熱心で適切な教師（「すごい」教師）を訓練する。7. 訓練を受けたスタッフへの継続的なサポートとCPDを提供する。8. マインドフルネスを孤立したレッスンだけでなく、学校生活の構造に織り込む。9. マインドフルネスを目に見えるものにし、学校の言葉の一部にする。10. 保護者を含む広範な学校コミュニティを巻き込む。",
            implementingMWP2: "MiSPは、資金調達、問題行動のある生徒への対応、またはマインドフルネスを提唱する「孤独な声」であることなどの課題に対する広範な「トップヒント」を提供しています。日本のMfCPは、文化的に適応されたリソースとトレーニングを提供しています。",
            
            mindfulMeCurriculumTitle: "マインドフル・ミー：8つのコアレッスンカリキュラム（小・中学生向け）",
            mindfulMeCurriculumDesc: "この基礎カリキュラムは、小中学生向けに魅力的で年齢に適した方法で、マインドフルネスの主要な原則と実践を紹介します。30〜45分のセッションに適応可能です。（完全なレッスン計画はブレインパワーの内部教師用ガイドにあります）。",
            mindfulMeL1Title: "レッスン1：こんにちはアテンション！「マインドパピー」に会おう",
            mindfulMeL1Desc: "目的：訓練可能なものとしてアテンションを紹介する。実践：ベルの音を聞く。キーアイデア：私たちのアテンションは遊び好きな子犬のよう。",
            mindfulMeL2Title: "レッスン2：私たちの素晴らしい身体と呼吸のアンカー",
            mindfulMeL2Desc: "目的：身体と呼吸をアンカーとして紹介する。実践：マインドフル呼吸と身体のアンカー（足/座席）。キーアイデア：私たちの身体は常に現在にある。",
            mindfulMeL3Title: "レッスン3：思考と親しむ - 思考の波に乗る",
            mindfulMeL3Desc: "目的：思考を事実ではなく精神的な出来事として理解する。実践：思考を（雲/川のように）見る。キーアイデア：私たちは思考に巻き込まれずに観察できる。",
            mindfulMeL4Title: "レッスン4：感情と向き合う - 内なる嵐を乗り越える",
            mindfulMeL4Desc: "目的：感情を特定し、天気のようなものだと理解する。実践：身体の中の感情に気づき、それと共に呼吸する。キーアイデア：すべての感情は自然で一時的なもの。",
            mindfulMeL5Title: "レッスン5：マインドフルな行動 - 反応を選ぶ（一時停止ボタン）",
            mindfulMeL5Desc: "目的：反応することと対応することの違いを理解する。実践：S.T.O.P.（停止、呼吸、観察、進行）。キーアイデア：私たちはどのように行動するかを選ぶことができる。",
            mindfulMeL6Title: "レッスン6：優しさでつながる - 自分自身と他者への友情",
            mindfulMeL6Desc: "目的：優しさと自己共感を紹介する。実践：優しさの瞑想（簡単な願い）。キーアイデア：自分自身や他者に親切にすることは気分が良い。",
            mindfulMeL7Title: "レッスン7：良いものを感謝する - 感謝の力",
            mindfulMeL7Desc: "目的：感謝を紹介する。実践：感謝の反省（良いことに気づく）。キーアイデア：感謝は私たちがポジティブなことを見るのを助ける。",
            mindfulMeL8Title: "レッスン8：すべてをまとめる - あなたのマインドフルツールキット",
            mindfulMeL8Desc: "目的：スキルを復習し、個人的な「マインドフルツールキット」を作成する。実践：お気に入りの短い実践。キーアイデア：マインドフルネスは継続的な実践。",
            mindfulMeExt1Title: "拡張レッスン1：困難とマインドフルに向き合う - 波に乗る",
            mindfulMeExt1Desc: "目的：困難のためのR.A.I.N.（認識、許容、調査、育成 - 簡略版）を探る。実践：軽い困難を伴うミニR.A.I.N.",
            mindfulMeExt2Title: "拡張レッスン2：日常生活のマインドフルネス - それを織り込む",
            mindfulMeExt2Desc: "目的：非公式な実践の機会を特定する。実践：三つのマインドフルな呼吸/移動中のマインドフルネス。キーアイデア：マインドフルネスはあり方。",

            bpOfferingsTitle: "ブレインパワーのMW提供プログラム（MiSP原則と整合）",
            bpOfferingsP1: "ブレインパワーは、MiSPのエビデンスに基づくアプローチを活用し、日本の学校向けに独自のMWソリューションを開発しています：",
            bpOfferingsLi1: "<strong>「プラグアンドプレイ」ビデオシリーズ：</strong>JTE向けの短い（5～15分）MWセッション（ガイド付き瞑想、マインドフルムーブメント、感情リテラシー）。MiSPの魅力的なスタイルに触発され、教室での使用に適しています。専門家または訓練を受けた日本人プレゼンターが主導し、英語の言語統合を伴います。",
            bpOfferingsLi2: "<strong>JTE向けトレーニングとリソース：</strong>JTEが簡単な「マインドフルミニッツ」実践を提供するための「ファシリテーター養成」ワークショップ。MiSPの.begin/.b Foundationsのような成人向けMW原則に基づく、教師のセルフケア、ストレス管理、レジリエンスのためのリソース。",
            bpOfferingsLi3: "<strong>独自の「英語＋MW」プログラム：</strong>MWのテーマを英語の語彙とコミュニケーションと統合（マインドフルネス＋英語、ヨガ＋英語、茶道（禅）＋英語）。これらは私たちのALT専門知識を活用し、文化的に関連性のある豊かな体験を提供し、言語学習とウェルビーイングスキルを補完します。",
            bpOfferingsLi4: "<strong>専門的提供プログラム（将来）：</strong>ゴングバスリラクゼーションセッション、上級瞑想ワークショップなどのより深い実践の探求（倫理的なマインドフルネス提供と整合した専門家のリソースを活用）。",
            bpOfferingsP2: "私たちのUSP：「国際的な専門家と共同で作成され、日本の学校環境に合わせて調整された、文化的に配慮した英語統合型マインドフルネス＆ウェルネスプログラム。生徒と教師の両方のウェルビーイングを支援するように設計されています。」",
            furtherLearningTitle: "さらなる学習と公式MiSP/MfCPトレーニング",
            furtherLearningP1: "このアプリはMiSPに触発された入門リソースを提供します。.b、Paws b、dotsなどのMiSPカリキュラムを提供するための公式で詳細な教師トレーニングについては：",
            furtherLearningLi1: "<strong>日本国内：</strong><strong>子どもマインドフルネスプロジェクト（MfCP）</strong>（<a href='http://mfcp.info' target='_blank' rel='noopener'>mfcp.info</a>）にお問い合わせください。彼らは日本におけるMiSP認定トレーニング機関です。",
            furtherLearningLi2: "<strong>国際/英国：</strong><strong>Mindfulness in Schools Project (MiSP)</strong>（<a href='https://mindfulnessinschools.org' target='_blank' rel='noopener'>mindfulnessinschools.org</a>）で、彼らの全トレーニングとリソースをご覧ください。",
            classroomTipsTitle: "教室でのヒント（MiSPベストプラクティスより）",
            classroomTipsP1: "<strong>招待的な言葉遣い：</strong>常に招待し、決して強制しないでください。例：「目を閉じてもいいし、もしよければ視線を下に和らげてもいいよ」",
            classroomTipsP2: "<strong>短く、一貫して：</strong>特に最初は、実践を短く（1～5分）。毎日または定期的な一貫性が、まれな長いセッションよりも強力です。",
            classroomTipsP3: "<strong>落ち着きのなさと心のさまよいを認める：</strong>「マインドパピー」（Paws bより）を正常なものとして扱います。「心がさまようのはごく普通のこと。それが心の働きだから！気づいたら、優しく注意を戻してあげて」",
            classroomTipsP4: "<strong>アンカーを使う：</strong>呼吸、音、身体感覚は一般的なアンカーです。選択肢を提供します。これはMiSPの中核的な原則です。",
            classroomTipsP5: "<strong>手本を示す：</strong>あなた自身の穏やかで、存在感のある、本物の態度が最も影響力のある教育ツールです。教えることを実践してください。",
            selfCareEducatorsTitle: "教育者のためのセルフケア（MiSPの中核原則）",
            selfCareEducatorsP1: "あなたのウェルビーイングは基本です。MiSPは教師が自身のプラクティスを持つべきだと強調しています。アプリからこれらの短い実践を試してみてください：<a href='#' onclick='window.navigateToPractice(\"audio-quick-calm-list\"); return false;'>クイックカーム</a>、<a href='#' onclick='window.navigateToPractice(\"audio-breathing-3min\"); return false;'>3分間の呼吸</a>。MiSPの.beginのようなコースに触発された、私たちの成人向けカリキュラムでより深い個人的な実践を探求してください。",

            // Research & Evidence
            researchEvidenceTitle: "学校におけるMWの研究とエビデンス（MiSP焦点）",
            researchIntroP1: "若者と教育者のためのマインドフルネスの利点を支持する堅牢で成長している研究があります。このアプリは、Mindfulness in Schools Project (MiSP) のような主要なエビデンスに基づくプログラムに触発された入門的な実践を提供します。",
            researchStudentBenefitsTitle: "生徒への利点（MiSP研究および一般エビデンスより）：",
            researchStudentLi1: "感情調節の改善、ストレス、不安、抑うつ症状の軽減（.bおよびPaws b研究の主要な発見）。",
            researchStudentLi2: "注意、集中力、および作業記憶や認知的柔軟性などの実行機能の向上（MiSPカリキュラムのしばしば引用される利点）。",
            researchStudentLi3: "自己認識とメタ認知の向上（自身の思考と感情の理解 - .bの中核目標）。",
            researchStudentLi4: "思いやり、共感、向社会的行動の向上（Paws bと.bにはこれらの要素が含まれています）。",
            researchStudentLi5: "ADHDやクラスでの行動などの状態管理における潜在的な改善。",
            researchTeacherBenefitsTitle: "教師と学校スタッフへの利点（MiSP .begin＆.b Foundations焦点）：",
            researchTeacherLi1: "ストレス、燃え尽き症候群、不安症状の大幅な軽減（MiSP成人コースの主要な成果）。",
            researchTeacherLi2: "自己共感、ウェルビーイング、教育効果の向上。",
            researchTeacherLi3: "教室管理と生徒と教師の関係改善。",
            researchTeacherLi4: "全体的な仕事の満足度とよりポジティブな学校風土の向上。",
            researchJapanContextTitle: "日本における必要性と可能性：",
            researchJapanP1: "日本の若者の精神的ウェルビーイングと教師のストレスに関する統計を考えると、マインドフルネス介入は有望で、世俗的で、スキルベースのアプローチを提供します。子どもマインドフルネスプロジェクト（MfCP）は、日本でMiSPカリキュラムを適応させ、実施するために積極的に取り組んでいます。",
            researchMispMyriad: "MiSPの.bカリキュラムは、大規模研究プロジェクトMYRIAD（オックスフォード大学）の焦点でした。普遍的な学校ベースのマインドフルネス導入は、強力な教師トレーニングと学校のサポートなしに広範な影響を達成する上で複雑さを示しましたが、効果的なスケーリングに関する貴重な洞察を提供しました。MiSPはそのような研究に基づいてアプローチを改良し続けています。詳細は<a href='https://mindfulnessinschools.org/research-papers/' target='_blank' rel='noopener'>MiSPの研究ページ</a>で。",
            researchBrainPowerApproach: "ブレインパワーのアプローチはMiSPの成功に触発され、アクセスしやすい「マインドフルミニッツ」、JTEのエンパワーメント、そして日本の教育的文脈に合わせた独自の英語+MW統合に焦点を当てています。私たちは生徒と教師のウェルビーイングに積極的に貢献することを目指しています。",
            
            // About MW Page
            aboutMWTitle: "マインドフルネス＆ウェルネス（MW）について",
            aboutMWP1: "マインドフルネスとは、特定の方法で注意を払うことです：意図的に、現在の瞬間に、そして判断せずに（ジョン・カバットジン）。それは、私たちの思考、感情、身体感覚、そして周囲の世界に対して、優しさや好奇心をもって、より意識的になるための注意力の訓練の実践です。",
            aboutMWP2: "ウェルネスとは、精神的、感情的、身体的な幸福を統合する、健康へのホリスティックなアプローチを包含します。マインドフルネスは全体的なウェルネスの重要な構成要素です。",
            aboutMWStudentsBenefit: "<strong>生徒向け：</strong>ストレスや不安を軽減し、集中力を向上させ（学習に有益）、自己認識と感情調節を高め、自己や仲間への思いやりと優しさを育む。（MiSPはPaws bや.bのようなカリキュラムを通じてこれらを目指しています）",
            aboutMWTeachersBenefit: "<strong>教師とスタッフ向け：</strong>教室でのストレスを管理し、燃え尽き症候群を防ぎ、生徒との存在感と関与を改善し、コミュニケーションスキルを高め、よりポジティブな学校風土を育む。（MiSPの.beginと.b Foundationsがこれをサポートします）",
            needInJapanTitle: "日本における必要性：",
            needInJapanP1: "最近のユニセフの調査（日本テレビニュースNNN、2025年5月報道）によると、日本の子供たちは身体的健康ではトップクラスですが、精神的ウェルビーイングでは36カ国中32位です。高い子供の自殺率や学業/外見基準からのプレッシャーが重大な懸念事項です。同時に、公立学校の教師は仕事関連のストレスによる精神的健康休暇の取得率が上昇しています。",
            needInJapanP2: "マインドフルネスは、個人にレジリエンスとウェルビーイングのためのスキルを身につけさせることで、これらの課題に対処するための実践的で世俗的なツールを提供します。",
            brainPowerVisionTitle: "ブレインパワーのMWビジョン：",
            brainPowerVisionP1: "ブレインパワーは、既存の学校ネットワークと英語の専門知識を活用し、生徒と教育者の両方のホリスティックなウェルビーイングをサポートするために、日本の教育コミュニティ向けに効果的でアクセスしやすいマインドフルネス＆ウェルネスソリューションの信頼できる提供者になることを目指しています。",
            brainPowerVisionP2: "このアプリはその旅の第一歩であり、マインドフルネスの探求をサポートするためにブレインパワーによって設計されました。",
            mispInspiredTitle: "世界のベストプラクティスに触発されて：",
            mispInspiredP1: "私たちのアプローチは、英国の<strong>Mindfulness in Schools Project (MiSP)</strong>や、これらのエビデンスに基づくカリキュラムを日本向けに特別に適応させている日本のパートナーである<strong>子どもマインドフルネスプロジェクト（MfCP）</strong>のような成功した国際プログラムに情報提供されています。より深い関与のためには、彼らの包括的なリソースを探求することをお勧めします。",
            
            // Nav buttons
            navHome: "ホーム", navPractices: "実践", navStudentZone: "生徒ゾーン", 
            navElementary: "子供 (小)", navJuniorHigh: "子供 (中)", navAdults: "成人", 
            navForParents: "保護者向け", navSchoolPathways: "学校パスウェイ",
            navTeacherResources: "教員リソース", navResearchEvidence: "研究", navAbout: "MWについて",

            // Universal (Japanese)
            playBtn: "再生", pauseBtn: "一時停止", restartBtn: "再開", installAppBtn: "アプリをインストール ✨",
            toggleToJapanese: "日本語へ", toggleToEnglish: "To English", appTitle: "ブレインパワー マインドフルネス＆ウェルネス",
            // Practice link texts (Japanese)
            practiceBreathing3MinText: "3分間の呼吸法",
            practiceObservingThoughts5MinText: "思考の観察（5分）",
            practiceKindness5MinText: "慈悲の瞑想（5分）",
            practiceBreathing5MinText: "5分間の呼吸法",
            practiceBodyScan10MinText: "ボディスキャン（10分）",
            practiceStop2MinText: "S.T.O.P. 実践（2分）",
            practiceGratitude4MinText: "感謝の反省（4分）",

            // FAQ Keys 
            faqLengthTitle: "生徒向けのマインドフルネスセッションはどのくらいの長さがよいですか？",
            faqLengthAnswer: "小学生（4～6年生）の場合、1～3分から始め、徐々に5～7分に増やします。中学生（7～9年生）の場合、3～5分から始め、5～10分以上に延長します。私たちの「マインドフルミニッツ」は約10分です。最初は長さよりも一貫性が重要です。",
            faqEyesClosedTitle: "生徒が目を閉じたがらない場合はどうすればよいですか？",
            faqEyesClosedAnswer: "常に招待的に：「目を閉じてもいいし、下に優しく視線を向けてもいいよ」。目を開けたままを好む生徒もいます。焦点は内なる注意です。",
            faqRestlessClassTitle: "クラスが非常に落ち着かない場合はどうすればよいですか？",
            faqRestlessClassAnswer: "エネルギーを認めます。最初にマインドフルムーブメントや音の実践を試みてください。座る実践は非常に短くします。一貫性は時間をかけて落ち着く能力を構築するのに役立ちます。MiSPのDotsの「シェイク＆フリーズ」は、年少の子供たちにとって素晴らしい例です。",
            faqBoringTitle: "生徒がマインドフルネスは「退屈だ」と言ったらどうしますか？",
            faqBoringAnswer: "認める：「うん、じっと座っているのは時々退屈に感じるかもしれないね」。言い換える：それは「マインドパピー」が走り回りたいと思っているのに気づくこと。彼らが楽しむ他の分野で役立つスキル構築（注意、落ち着き）に焦点を当てます。変化に富んだ短い実践を使用します。年長の生徒にはパフォーマンス（スポーツ、試験）に関連付けます。",
            faqDifficultShareTitle: "生徒が困難な経験を共有した場合、どのように対処すればよいですか？",
            faqDifficultShareAnswer: "共感的に聞き、認め、境界を維持します（セラピーではありません）。<strong>重要：もし何らかの開示が安全上の懸念（虐待、自傷行為、自殺念慮）を引き起こした場合、直ちに学校の確立されたセーフガーディングおよび報告プロトコルに従ってください。</strong>一般的な共有については、実践そのものの*経験*に焦点を当てます。",
            faqExpertTeacherTitle: "これらを教えるために瞑想の専門家である必要がありますか？",
            faqExpertTeacherAnswer: "「マインドフルミニッツ」の場合、本物であるためには自身の定期的（たとえ短くても）な個人的実践が鍵です。スクリプトに従い、親切であり、中核原則を理解してください。より深い指導（完全なMiSPカリキュラムなど）には、MiSPが強調するように、より広範なトレーニングと個人的実践が必要です。",
            faqAudioFindTitle: "カリキュラムレッスンの音声実践はどこで見つけられますか？",
            faqAudioFindAnswer: "カリキュラムページからリンクされているすべてのガイド付き音声実践は、このアプリの「実践」セクションで見つけることができます。リンクはそこに移動し、しばしば特定のトラックを強調表示します。",
            faqMispTrainingTitle: "MiSPカリキュラムを教えるための正式なトレーニングはどこで受けられますか？",
            faqMispTrainingAnswer: "ブレインパワーはMiSPに触発されています。日本での公式MiSP教師トレーニングについては、子どもマインドフルネスプロジェクト（MfCP）mfcp.infoにお問い合わせください。日本国外でのトレーニングについては、mindfulnessinschools.orgをご覧ください。"
        }
    };    

    const practiceData = [ 
        {
            categoryKey: "coreMindfulnessCategory",
            tracks: [
                { id: "audio-quick-calm-list", titleKey: "quickCalmTitle", descriptionKey: "quickCalmDesc", src: "audio/quick_calm_1min.mp3" },
                { id: "audio-breathing-3min", titleKey: "breathing3MinTitle", descriptionKey: "breathing3MinDesc", src: "audio/mindful_breathing_3min.mp3" },
                { id: "audio-breathing-5min", titleKey: "breathing5MinTitle", descriptionKey: "breathing5MinDesc", src: "audio/mindful_breathing_5min.mp3" },
                { id: "audio-body-scan-10min", titleKey: "bodyScan10MinTitle", descriptionKey: "bodyScan10MinDesc", src: "audio/body_scan_10min.mp3" },
                { id: "audio-listening-sounds-3min", titleKey: "listeningSounds3MinTitle", descriptionKey: "listeningSounds3MinDesc", src: "audio/mindful_listening_sounds_3min.mp3" }
            ]
        },
        {
            categoryKey: "thoughtsFeelingsCategory",
            tracks: [
                { id: "audio-thoughts-clouds-5min", titleKey: "thoughtsClouds5MinTitle", descriptionKey: "thoughtsClouds5MinDesc", src: "audio/thoughts_as_clouds_5min.mp3" },
                { id: "audio-stop-practice-2min", titleKey: "stopPractice2MinTitle", descriptionKey: "stopPractice2MinDesc", src: "audio/stop_practice_2min.mp3" }
            ]
        },
        {
            categoryKey: "kindnessGratitudeCategory",
            tracks: [
                { id: "audio-kindness-5min", titleKey: "kindness5MinTitle", descriptionKey: "kindness5MinDesc", src: "audio/loving_kindness_5min.mp3" },
                { id: "audio-gratitude-4min", titleKey: "gratitude4MinTitle", descriptionKey: "gratitude4MinDesc", src: "audio/gratitude_reflection_4min.mp3" }
            ]
        }
    ];
    
    // Pages object now contains the full HTML for each page directly
    const pages = { 
        home: `
            <section id="home-page" class="page-content active">
                <div class="hero-section">
                    <h2 data-lang-key="homeTitle"></h2>
                    <p data-lang-key="homeSubtitle"></p>
                    <button class="general-app-button hero-button" onclick="window.loadPage('practices')" data-lang-key="explorePracticesBtn"></button>
                </div>
                <div class="content-section" style="background-color: #e9f3fd; border-left: 5px solid #4A90E2; margin-bottom: 2em; padding: 1.5em; text-align:left;">
                    <h3 data-lang-key="whyMWJapanTitle" style="color: #357ABD;"></h3>
                    <p data-lang-key="whyMWJapanDesc"></p>
                    <a href="#" onclick="window.loadPage('about'); return false;" data-lang-key="learnMoreAboutNeedLink" style="color: #4A90E2; font-weight: bold;"></a>
                </div>
                <div class="home-content-grid">
                    <div class="home-card">
                        <img src="images/icon-students.png" alt="Students icon" class="home-card-icon">
                        <h3 data-lang-key="forStudentsTitle"></h3>
                        <p data-lang-key="forStudentsDesc"></p>
                        <button class="general-app-button" onclick="window.loadPage('studentZone')" data-lang-key="goToStudentZoneBtn"></button>
                    </div>
                    <div class="home-card">
                        <img src="images/icon-teachers.png" alt="Teachers icon" class="home-card-icon">
                        <h3 data-lang-key="forEducatorsTitle"></h3>
                        <p data-lang-key="forEducatorsDesc"></p>
                        <button class="general-app-button" onclick="window.loadPage('adultCurriculum')" data-lang-key="adultCurriculumBtn"></button>
                    </div>
                    <div class="home-card">
                         <img src="images/icon-resources.png" alt="Resources icon" class="home-card-icon">
                        <h3 data-lang-key="teacherResourcesTitle"></h3>
                        <p data-lang-key="teacherResourcesDesc"></p>
                        <button class="general-app-button" onclick="window.loadPage('teacherResources')" data-lang-key="viewResourcesBtn"></button>
                    </div>
                </div>
                <div id="featured-practice">
                    <h3 data-lang-key="featuredPracticeTitle"></h3>
                    <audio id="audio-quick-calm" src="audio/quick_calm_1min.mp3" preload="metadata"></audio>
                    <div class="practice-controls">
                        <button data-action="play" class="general-app-button" onclick="window.handleAudioControl('audio-quick-calm', this)" data-lang-key="playBtn"></button>
                        <button data-action="restart" class="general-app-button restart-button" onclick="window.handleAudioControl('audio-quick-calm', this)" data-lang-key="restartBtn"></button>
                    </div>
                    <div class="progress-bar-container" onclick="window.seekAudio(event, 'audio-quick-calm')">
                        <div class="progress-bar" id="progress-audio-quick-calm"></div>
                    </div>
                    <div class="time-display" id="time-audio-quick-calm">0:00 / 0:00</div>
                    <p class="practice-description" data-lang-key="featuredPracticeDesc"></p>
                </div>
            </section>
        `,
        practices: `
            <section id="practices-page" class="page-content">
                <h2 data-lang-key="practicesTitle"></h2>
                <div id="practice-list-container"></div>
            </section>
        `,
        studentZone: `
            <section id="student-zone-page" class="page-content student-engagement-page">
                <h2 data-lang-key="studentZoneTitle"></h2>
                <p data-lang-key="studentZoneDesc"></p>
                <div class="engagement-section">
                    <h3 data-lang-key="mindPuppyTitle"></h3>
                    <img src="images/mind_puppy_icon.png" alt="Mind Puppy icon" style="max-width:100px; margin: 0 auto 1em auto; display:block;">
                    <p data-lang-key="mindPuppyDesc"></p>
                    <button class="general-app-button" onclick="window.navigateToPractice('audio-listening-sounds-3min')" data-lang-key="explorePracticesBtn" style="margin: 0.5em auto; display:block;"></button> 
                </div>
                <div class="engagement-section">
                    <h3 data-lang-key="shakeFreezeTitle"></h3>
                    <img src="images/shake_freeze_icon.png" alt="Shake & Freeze icon" style="max-width:100px; margin: 0 auto 1em auto; display:block;">
                    <p data-lang-key="shakeFreezeDesc"></p>
                </div>
                <div class="engagement-section">
                    <h3 data-lang-key="amazingBrainTitle"></h3>
                     <img src="images/amazing_brain_icon.png" alt="Brain icon" style="max-width:100px; margin: 0 auto 1em auto; display:block;">
                    <p data-lang-key="amazingBrainDesc"></p>
                </div>
                <div class="engagement-section">
                    <h3 data-lang-key="mindfulWalkingTitle"></h3>
                    <p data-lang-key="mindfulWalkingDesc"></p>
                </div>
                <div class="engagement-section">
                    <h3 data-lang-key="storyTimeTitle"></h3>
                    <p data-lang-key="storyTimeDesc"></p>
                </div>
                <div class="engagement-section" id="mindful-coloring-section">
                    <h3 data-lang-key="mindfulColoringTitle"></h3>
                    <p data-lang-key="mindfulColoringDesc"></p>
                    <div id="coloring-image-selector">
                        <button class="general-app-button" onclick="window.loadColoringImage('images/coloring_mandala.png')" data-lang-key="mandalaBtn"></button>
                        <button class="general-app-button" onclick="window.loadColoringImage('images/coloring_nature.png')" data-lang-key="natureSceneBtn"></button>
                    </div>
                    <div id="coloring-image-container">
                        <p data-lang-key="selectImagePrompt"></p> 
                    </div>
                    <p>
                        <a href="pdfs/coloring_mandala_printable.pdf" target="_blank" download data-lang-key="downloadMandalaLink"></a> | 
                        <a href="pdfs/coloring_nature_printable.pdf" target="_blank" download data-lang-key="downloadNatureLink"></a>
                    </p>
                </div>
                <div class="engagement-section" id="gratitude-journal-section">
                    <h3 data-lang-key="gratitudeJournalTitle"></h3>
                    <p data-lang-key="gratitudeJournalDesc"></p>
                    <textarea id="gratitude-input" data-lang-key="gratitudePlaceholder"></textarea>
                    <button id="add-gratitude-btn" class="general-app-button" data-lang-key="addGratitudeBtn"></button>
                    <h4 data-lang-key="myGratitudeListTitle"></h4>
                    <ul id="gratitude-list"></ul>
                </div>
            </section>
        `,
        elementaryCurriculum: `
            <section id="elementary-curriculum-page" class="page-content curriculum-page">
                <h2 data-lang-key="esCurriculumTitle"></h2>
                <p data-lang-key="esCurriculumDesc"></p>
                
                <div class="curriculum-module">
                    <h3 data-lang-key="esWeek1Title"></h3>
                    <p><strong data-lang-key="esDay1"></strong>: <span data-lang-key="esWeek1D1"></span></p>
                    <p><strong data-lang-key="esDay2"></strong>: <span data-lang-key="esWeek1D2"></span></p>
                    <p><strong data-lang-key="esDay3"></strong>: <span data-lang-key="esWeek1D3"></span></p>
                    <p><strong data-lang-key="esDay4"></strong>: <span data-lang-key="esWeek1D4"></span></p>
                    <p><strong data-lang-key="esDay5"></strong>: <span data-lang-key="esWeek1D5"></span></p>
                    <p><strong>Related Practice:</strong> <a href="#" onclick="window.navigateToPractice('audio-breathing-3min'); return false;" data-lang-key="practiceBreathing3MinText"></a></p>
                </div>
                <div class="curriculum-module">
                    <h3 data-lang-key="esWeek2Title"></h3>
                    <p><strong data-lang-key="esDay1"></strong>: <span data-lang-key="esWeek2D1"></span></p>
                    <p><strong data-lang-key="esDay2"></strong>: <span data-lang-key="esWeek2D2"></span></p>
                    <p><strong data-lang-key="esDay3"></strong>: <span data-lang-key="esWeek2D3"></span></p>
                    <p><strong data-lang-key="esDay4"></strong>: <span data-lang-key="esWeek2D4"></span></p>
                    <p><strong data-lang-key="esDay5"></strong>: <span data-lang-key="esWeek2D5"></span></p>
                    <p><strong>Related Practice:</strong> <a href="#" onclick="window.navigateToPractice('audio-thoughts-clouds-5min'); return false;" data-lang-key="practiceObservingThoughts5MinText"></a></p>
                </div>
                <div class="curriculum-module">
                    <h3 data-lang-key="esWeek3Title"></h3>
                    <p><strong data-lang-key="esDay1"></strong>: <span data-lang-key="esWeek3D1"></span></p>
                    <p><strong data-lang-key="esDay2"></strong>: <span data-lang-key="esWeek3D2"></span></p>
                    <p><strong data-lang-key="esDay3"></strong>: <span data-lang-key="esWeek3D3"></span></p>
                    <p><strong data-lang-key="esDay4"></strong>: <span data-lang-key="esWeek3D4"></span></p>
                    <p><strong data-lang-key="esDay5"></strong>: <span data-lang-key="esWeek3D5"></span></p>
                    <p><strong>Related Practice:</strong> <a href="#" onclick="window.navigateToPractice('audio-stop-practice-2min'); return false;" data-lang-key="practiceStop2MinText"></a></p>
                </div>
                <div class="curriculum-module">
                    <h3 data-lang-key="esWeek4Title"></h3>
                    <p><strong data-lang-key="esDay1"></strong>: <span data-lang-key="esWeek4D1"></span></p>
                    <p><strong data-lang-key="esDay2"></strong>: <span data-lang-key="esWeek4D2"></span></p>
                    <p><strong data-lang-key="esDay3"></strong>: <span data-lang-key="esWeek4D3"></span></p>
                    <p><strong data-lang-key="esDay4"></strong>: <span data-lang-key="esWeek4D4"></span></p>
                    <p><strong data-lang-key="esDay5"></strong>: <span data-lang-key="esWeek4D5"></span></p>
                    <p><strong>Related Practice:</strong> <a href="#" onclick="window.navigateToPractice('audio-kindness-5min'); return false;" data-lang-key="practiceKindness5MinText"></a></p>
                </div>
                <div class="curriculum-module">
                    <h3 data-lang-key="esWeek5Title"></h3>
                    <p><strong data-lang-key="esDay1"></strong>: <span data-lang-key="esWeek5D1"></span></p>
                    <p><strong data-lang-key="esDay2"></strong>: <span data-lang-key="esWeek5D2"></span></p>
                    <p><strong data-lang-key="esDay3"></strong>: <span data-lang-key="esWeek5D3"></span></p>
                    <p><strong data-lang-key="esDay4"></strong>: <span data-lang-key="esWeek5D4"></span></p>
                    <p><strong data-lang-key="esDay5"></strong>: <span data-lang-key="esWeek5D5"></span></p>
                </div>
                <div class="curriculum-module">
                    <h3 data-lang-key="esWeek6Title"></h3>
                     <p><strong data-lang-key="esDay1"></strong>: <span data-lang-key="esWeek6D1"></span></p>
                    <p><strong data-lang-key="esDay2"></strong>: <span data-lang-key="esWeek6D2"></span></p>
                    <p><strong data-lang-key="esDay3"></strong>: <span data-lang-key="esWeek6D3"></span></p>
                    <p><strong data-lang-key="esDay4"></strong>: <span data-lang-key="esWeek6D4"></span></p>
                    <p><strong data-lang-key="esDay5"></strong>: <span data-lang-key="esWeek6D5"></span></p>
                </div>
                <div class="curriculum-module">
                    <h3 data-lang-key="esWeek7Title"></h3>
                    <p><strong data-lang-key="esDay1"></strong>: <span data-lang-key="esWeek7D1"></span></p>
                    <p><strong data-lang-key="esDay2"></strong>: <span data-lang-key="esWeek7D2"></span></p>
                    <p><strong data-lang-key="esDay3"></strong>: <span data-lang-key="esWeek7D3"></span></p>
                    <p><strong data-lang-key="esDay4"></strong>: <span data-lang-key="esWeek7D4"></span></p>
                    <p><strong data-lang-key="esDay5"></strong>: <span data-lang-key="esWeek7D5"></span></p>
                </div>
                <div class="curriculum-module">
                    <h3 data-lang-key="esWeek8Title"></h3>
                    <p><strong data-lang-key="esDay1"></strong>: <span data-lang-key="esWeek8D1"></span></p>
                    <p><strong data-lang-key="esDay2"></strong>: <span data-lang-key="esWeek8D2"></span></p>
                    <p><strong data-lang-key="esDay3"></strong>: <span data-lang-key="esWeek8D3"></span></p>
                    <p><strong data-lang-key="esDay4"></strong>: <span data-lang-key="esWeek8D4"></span></p>
                    <p><strong data-lang-key="esDay5"></strong>: <span data-lang-key="esWeek8D5"></span></p>
                </div>
                <p data-lang-key="esTeacherNote"></p>
            </section>
        `,
        juniorHighCurriculum: `
            <section id="junior-high-curriculum-page" class="page-content curriculum-page">
                <h2 data-lang-key="jhsCurriculumTitle"></h2>
                <p data-lang-key="jhsCurriculumDesc"></p>
                <div class="curriculum-module">
                    <h3 data-lang-key="jhsWeek1Title"></h3>
                    <p><strong data-lang-key="jhsDay1"></strong>: <span data-lang-key="jhsWeek1D1"></span></p>
                    <p><strong data-lang-key="jhsDay2"></strong>: <span data-lang-key="jhsWeek1D2"></span></p>
                    <p><strong data-lang-key="jhsDay3"></strong>: <span data-lang-key="jhsWeek1D3"></span></p>
                    <p><strong data-lang-key="jhsDay4"></strong>: <span data-lang-key="jhsWeek1D4"></span></p>
                    <p><strong data-lang-key="jhsDay5"></strong>: <span data-lang-key="jhsWeek1D5"></span></p>
                    <p><strong>Related Practice:</strong> <a href="#" onclick="window.navigateToPractice('audio-breathing-5min'); return false;" data-lang-key="practiceBreathing5MinText"></a></p>
                </div>
                <div class="curriculum-module">
                    <h3 data-lang-key="jhsWeek2Title"></h3>
                    <p><strong data-lang-key="jhsDay1"></strong>: <span data-lang-key="jhsWeek2D1"></span></p>
                    <p><strong data-lang-key="jhsDay2"></strong>: <span data-lang-key="jhsWeek2D2"></span></p>
                    <p><strong data-lang-key="jhsDay3"></strong>: <span data-lang-key="jhsWeek2D3"></span></p>
                    <p><strong data-lang-key="jhsDay4"></strong>: <span data-lang-key="jhsWeek2D4"></span></p>
                    <p><strong data-lang-key="jhsDay5"></strong>: <span data-lang-key="jhsWeek2D5"></span></p>
                    <p><strong>Related Practice:</strong> <a href="#" onclick="window.navigateToPractice('audio-thoughts-clouds-5min'); return false;" data-lang-key="practiceObservingThoughts5MinText"></a></p>
                </div>
                 <div class="curriculum-module">
                    <h3 data-lang-key="jhsWeek3Title"></h3>
                    <p><strong data-lang-key="jhsDay1"></strong>: <span data-lang-key="jhsWeek3D1"></span></p>
                    <p><strong data-lang-key="jhsDay2"></strong>: <span data-lang-key="jhsWeek3D2"></span></p>
                    <p><strong data-lang-key="jhsDay3"></strong>: <span data-lang-key="jhsWeek3D3"></span></p>
                    <p><strong data-lang-key="jhsDay4"></strong>: <span data-lang-key="jhsWeek3D4"></span></p>
                    <p><strong data-lang-key="jhsDay5"></strong>: <span data-lang-key="jhsWeek3D5"></span></p>
                    <p><strong>Related Practice:</strong> <a href="#" onclick="window.navigateToPractice('audio-stop-practice-2min'); return false;" data-lang-key="practiceStop2MinText"></a></p>
                </div>
                <div class="curriculum-module">
                    <h3 data-lang-key="jhsWeek4Title"></h3>
                    <p><strong data-lang-key="jhsDay1"></strong>: <span data-lang-key="jhsWeek4D1"></span></p>
                    <p><strong data-lang-key="jhsDay2"></strong>: <span data-lang-key="jhsWeek4D2"></span></p>
                    <p><strong data-lang-key="jhsDay3"></strong>: <span data-lang-key="jhsWeek4D3"></span></p>
                    <p><strong data-lang-key="jhsDay4"></strong>: <span data-lang-key="jhsWeek4D4"></span></p>
                    <p><strong data-lang-key="jhsDay5"></strong>: <span data-lang-key="jhsWeek4D5"></span></p>
                    <p><strong>Related Practice:</strong> <a href="#" onclick="window.navigateToPractice('audio-gratitude-4min'); return false;" data-lang-key="practiceGratitude4MinText"></a></p>
                </div>
                <div class="curriculum-module">
                    <h3 data-lang-key="jhsWeek5Title"></h3>
                    <p><strong data-lang-key="jhsDay1"></strong>: <span data-lang-key="jhsWeek5D1"></span></p>
                    <p><strong data-lang-key="jhsDay2"></strong>: <span data-lang-key="jhsWeek5D2"></span></p>
                    <p><strong data-lang-key="jhsDay3"></strong>: <span data-lang-key="jhsWeek5D3"></span></p>
                    <p><strong data-lang-key="jhsDay4"></strong>: <span data-lang-key="jhsWeek5D4"></span></p>
                    <p><strong data-lang-key="jhsDay5"></strong>: <span data-lang-key="jhsWeek5D5"></span></p>
                </div>
                <div class="curriculum-module">
                    <h3 data-lang-key="jhsWeek6Title"></h3>
                     <p><strong data-lang-key="jhsDay1"></strong>: <span data-lang-key="jhsWeek6D1"></span></p>
                    <p><strong data-lang-key="jhsDay2"></strong>: <span data-lang-key="jhsWeek6D2"></span></p>
                    <p><strong data-lang-key="jhsDay3"></strong>: <span data-lang-key="jhsWeek6D3"></span></p>
                    <p><strong data-lang-key="jhsDay4"></strong>: <span data-lang-key="jhsWeek6D4"></span></p>
                    <p><strong data-lang-key="jhsDay5"></strong>: <span data-lang-key="jhsWeek6D5"></span></p>
                </div>
                <div class="curriculum-module">
                    <h3 data-lang-key="jhsWeek7Title"></h3>
                    <p><strong data-lang-key="jhsDay1"></strong>: <span data-lang-key="jhsWeek7D1"></span></p>
                    <p><strong data-lang-key="jhsDay2"></strong>: <span data-lang-key="jhsWeek7D2"></span></p>
                    <p><strong data-lang-key="jhsDay3"></strong>: <span data-lang-key="jhsWeek7D3"></span></p>
                    <p><strong data-lang-key="jhsDay4"></strong>: <span data-lang-key="jhsWeek7D4"></span></p>
                    <p><strong data-lang-key="jhsDay5"></strong>: <span data-lang-key="jhsWeek7D5"></span></p>
                </div>
                <div class="curriculum-module">
                    <h3 data-lang-key="jhsWeek8Title"></h3>
                    <p><strong data-lang-key="jhsDay1"></strong>: <span data-lang-key="jhsWeek8D1"></span></p>
                    <p><strong data-lang-key="jhsDay2"></strong>: <span data-lang-key="jhsWeek8D2"></span></p>
                    <p><strong data-lang-key="jhsDay3"></strong>: <span data-lang-key="jhsWeek8D3"></span></p>
                    <p><strong data-lang-key="jhsDay4"></strong>: <span data-lang-key="jhsWeek8D4"></span></p>
                    <p><strong data-lang-key="jhsDay5"></strong>: <span data-lang-key="jhsWeek8D5"></span></p>
                </div>
                <p data-lang-key="jhsTeacherNote"></p>
            </section>
        `,
        adultCurriculum: `
            <section id="adult-curriculum-page" class="page-content curriculum-page">
                <h2 data-lang-key="adultCurriculumTitleFull"></h2>
                <p data-lang-key="adultCurriculumDescFull"></p>
                <div class="curriculum-module"><h3 data-lang-key="adultModule1Title"></h3><p data-lang-key="adultModule1Desc"></p><p><strong>Key Practice:</strong> <a href="#" onclick="window.navigateToPractice('audio-breathing-5min'); return false;" data-lang-key="practiceBreathing5MinText"></a></p></div>
                <div class="curriculum-module"><h3 data-lang-key="adultModule2Title"></h3><p data-lang-key="adultModule2Desc"></p><p><strong>Key Practice:</strong> <a href="#" onclick="window.navigateToPractice('audio-body-scan-10min'); return false;" data-lang-key="practiceBodyScan10MinText"></a></p></div>
                <div class="curriculum-module"><h3 data-lang-key="adultModule3Title"></h3><p data-lang-key="adultModule3Desc"></p><p><strong>Key Practice:</strong> <a href="#" onclick="window.navigateToPractice('audio-thoughts-clouds-5min'); return false;" data-lang-key="practiceObservingThoughts5MinText"></a></p></div>
                <div class="curriculum-module"><h3 data-lang-key="adultModule4Title"></h3><p data-lang-key="adultModule4Desc"></p><p><strong>Key Practice:</strong> <a href="#" onclick="window.navigateToPractice('audio-stop-practice-2min'); return false;" data-lang-key="practiceStop2MinText"></a></p></div>
                <div class="curriculum-module"><h3 data-lang-key="adultModule5Title"></h3><p data-lang-key="adultModule5Desc"></p><p><strong>Key Practice:</strong> <a href="#" onclick="window.navigateToPractice('audio-breathing-3min'); return false;" data-lang-key="practiceBreathing3MinText"></a></p></div>
                <div class="curriculum-module"><h3 data-lang-key="adultModule6Title"></h3><p data-lang-key="adultModule6Desc"></p><p><strong>Key Practice:</strong> <a href="#" onclick="window.navigateToPractice('audio-kindness-5min'); return false;" data-lang-key="practiceKindness5MinText"></a></p></div>
                <div class="curriculum-module"><h3 data-lang-key="adultModule7Title"></h3><p data-lang-key="adultModule7Desc"></p></div>
                <div class="curriculum-module"><h3 data-lang-key="adultModule8Title"></h3><p data-lang-key="adultModule8Desc"></p><p><strong>Key Practice:</strong> <a href="#" onclick="window.navigateToPractice('audio-gratitude-4min'); return false;" data-lang-key="practiceGratitude4MinText"></a></p></div>
            </section>
        `,
        forParents: `
            <section id="for-parents-page" class="page-content parents-page">
                <h2 data-lang-key="forParentsTitle"></h2>
                <p data-lang-key="forParentsDesc"></p>
                
                <div class="content-section">
                    <h3 data-lang-key="parentsWhyMWTitle"></h3>
                    <p data-lang-key="parentsWhyMWP1"></p>
                    <p data-lang-key="parentsWhyMWP2"></p>
                    <ul style="margin-top:1em;">
                        <li data-lang-key="parentsBenefitFocus"></li>
                        <li data-lang-key="parentsBenefitEmotions"></li>
                        <li data-lang-key="parentsBenefitResilience"></li>
                        <li data-lang-key="parentsBenefitKindness"></li>
                    </ul>
                </div>
                
                <div class="content-section">
                    <h3 data-lang-key="parentsSimplePracticesTitle"></h3>
                    <p data-lang-key="parentsSimplePracticesIntro"></p>
                    <p><strong data-lang-key="practiceMindfulMinuteTitle"></strong>: <span data-lang-key="practiceMindfulMinuteDesc"></span></p>
                    <p><strong data-lang-key="practiceMindfulListeningTitle"></strong>: <span data-lang-key="practiceMindfulListeningDesc"></span></p>
                    <p><strong data-lang-key="practiceGratitudeSharingTitle"></strong>: <span data-lang-key="practiceGratitudeSharingDesc"></span></p>
                    <p><strong data-lang-key="practiceMindfulEatingTitle"></strong>: <span data-lang-key="practiceMindfulEatingDesc"></span></p>
                </div>
                
                <div class="content-section">
                    <h3 data-lang-key="parentsSupportChildTitle"></h3>
                    <p data-lang-key="parentsSupportChildP1"></p>
                    <ul>
                        <li data-lang-key="supportTipCuriosity"></li>
                        <li data-lang-key="supportTipModel"></li>
                        <li data-lang-key="supportTipPatience"></li>
                        <li data-lang-key="supportTipOwnPractice"></li>
                    </ul>
                </div>

                <div class="content-section">
                    <h3 data-lang-key="parentsWorkingWithSchoolTitle"></h3>
                    <p data-lang-key="parentsWorkingWithSchoolP1"></p>
                </div>

                 <div class="content-section">
                    <h3 data-lang-key="parentsFurtherResourcesTitle"></h3>
                    <p data-lang-key="parentsMiSPLink"></p>
                    <p data-lang-key="parentsMfCPLink"></p>
                </div>
            </section>
        `,
        schoolPathways: `
            <section id="school-pathways-page" class="page-content school-pathways-page">
                <h2 data-lang-key="schoolPathwaysTitle"></h2>
                <p data-lang-key="schoolPathwaysDesc"></p>
                <div class="content-section">
                    <h3 data-lang-key="pathwayStep1Title"></h3>
                    <p data-lang-key="pathwayStep1Desc"></p>
                </div>
                <div class="content-section">
                    <h3 data-lang-key="pathwayStep2Title"></h3>
                    <p data-lang-key="pathwayStep2Desc"></p>
                </div>
                <div class="content-section">
                    <h3 data-lang-key="pathwayStep3Title"></h3>
                    <p data-lang-key="pathwayStep3Desc"></p>
                </div>
                <div class="content-section">
                    <h3 data-lang-key="pathwayStep4Title"></h3>
                    <p data-lang-key="pathwayStep4Desc"></p>
                </div>
                <div class="content-section">
                     <p data-lang-key="pathwayMiSPLink"></p>
                </div>
            </section>
        `,
        teacherResources: `
            <section id="teacher-resources-page" class="page-content teacher-resources-page">
                <h2 data-lang-key="teacherResourcesTitleFull"></h2>
                <p data-lang-key="teacherResourcesDescFull"></p>
                <div class="resource-section">
                    <h3 data-lang-key="implementingMWTitle"></h3>
                    <p data-lang-key="implementingMWP1"></p>
                    <p data-lang-key="implementingMWP2"></p>
                </div>

                <div class="resource-section">
                    <h3 data-lang-key="mindfulMeCurriculumTitle"></h3>
                    <p data-lang-key="mindfulMeCurriculumDesc"></p>
                    <div class="curriculum-module">
                        <h4 data-lang-key="mindfulMeL1Title"></h4><p data-lang-key="mindfulMeL1Desc"></p>
                        <h4 data-lang-key="mindfulMeL2Title"></h4><p data-lang-key="mindfulMeL2Desc"></p>
                        <h4 data-lang-key="mindfulMeL3Title"></h4><p data-lang-key="mindfulMeL3Desc"></p>
                        <h4 data-lang-key="mindfulMeL4Title"></h4><p data-lang-key="mindfulMeL4Desc"></p>
                        <h4 data-lang-key="mindfulMeL5Title"></h4><p data-lang-key="mindfulMeL5Desc"></p>
                        <h4 data-lang-key="mindfulMeL6Title"></h4><p data-lang-key="mindfulMeL6Desc"></p>
                        <h4 data-lang-key="mindfulMeL7Title"></h4><p data-lang-key="mindfulMeL7Desc"></p>
                        <h4 data-lang-key="mindfulMeL8Title"></h4><p data-lang-key="mindfulMeL8Desc"></p>
                        <h5>Optional Extension Lessons:</h5>
                        <h4 data-lang-key="mindfulMeExt1Title"></h4><p data-lang-key="mindfulMeExt1Desc"></p>
                        <h4 data-lang-key="mindfulMeExt2Title"></h4><p data-lang-key="mindfulMeExt2Desc"></p>
                    </div>
                </div>
                
                <div class="resource-section">
                    <h3 data-lang-key="bpOfferingsTitle"></h3>
                    <p data-lang-key="bpOfferingsP1"></p>
                    <ul>
                        <li data-lang-key="bpOfferingsLi1"></li>
                        <li data-lang-key="bpOfferingsLi2"></li>
                        <li data-lang-key="bpOfferingsLi3"></li>
                        <li data-lang-key="bpOfferingsLi4"></li>
                    </ul>
                    <p><em><span data-lang-key="bpOfferingsP2"></span></em></p>
                </div>
                <div class="resource-section"> 
                    <h3 data-lang-key="classroomTipsTitle"></h3>
                    <ul>
                        <li data-lang-key="classroomTipsP1"></li>
                        <li data-lang-key="classroomTipsP2"></li>
                        <li data-lang-key="classroomTipsP3"></li>
                        <li data-lang-key="classroomTipsP4"></li>
                        <li data-lang-key="classroomTipsP5"></li>
                    </ul>
                </div>
                <div class="resource-section"> 
                    <h3 data-lang-key="selfCareEducatorsTitle"></h3>
                    <p data-lang-key="selfCareEducatorsP1"></p>
                </div>
                <div class="resource-section">
                    <h3>Downloadable Brain Power Guides (PDF)</h3>
                    <ul>
                        <li><a href="pdfs/What_Is_Mindfulness_BrainPower.pdf" target="_blank" download>What Is Mindfulness? - An Introduction</a></li>
                        <li><a href="pdfs/MiSP_MfCP_Overview_BrainPower.pdf" target="_blank" download>Overview of MiSP & MfCP Programs (Inspiration)</a></li>
                        <li><a href="pdfs/BrainPower_MW_Vision.pdf" target="_blank" download>Brain Power's Vision for MW in Schools</a></li>
                        <li><a href="pdfs/Mindful_Minutes_Guide_ES.pdf" target="_blank" download>Mindful Minutes Guide - Elementary School (ES)</a></li>
                        <li><a href="pdfs/Mindful_Minutes_Guide_JHS.pdf" target="_blank" download>Mindful Minutes Guide - Junior High School (JHS)</a></li>
                        <li><a href="pdfs/Adult_MW_Foundations_Overview.pdf" target="_blank" download>Adult MW Foundations - Course Overview</a></li>
                        <li><a href="pdfs/Tips_for_Teaching_Mindfulness.pdf" target="_blank" download>Tips for Teaching Mindfulness in the Classroom</a></li>
                        <li><a href="pdfs/Mindful_Me_Curriculum_Overview_BrainPower.pdf" target="_blank" download>Mindful Me - 8 Lesson Curriculum Overview</a></li> 
                    </ul>
                </div>
                <div class="resource-section">
                    <h3 data-lang-key="furtherLearningTitle"></h3>
                    <p data-lang-key="furtherLearningP1"></p>
                    <ul>
                        <li data-lang-key="furtherLearningLi1"></li>
                        <li data-lang-key="furtherLearningLi2"></li>
                    </ul>
                </div>
                <div class="faq-section">
                    <h3>Frequently Asked Questions (FAQs)</h3>
                    <div class="faq-item"><h3 class="faq-question" data-lang-key="faqLengthTitle"></h3><div class="faq-answer"><p data-lang-key="faqLengthAnswer"></p></div></div>
                    <div class="faq-item"><h3 class="faq-question" data-lang-key="faqEyesClosedTitle"></h3><div class="faq-answer"><p data-lang-key="faqEyesClosedAnswer"></p></div></div>
                    <div class="faq-item"><h3 class="faq-question" data-lang-key="faqRestlessClassTitle"></h3><div class="faq-answer"><p data-lang-key="faqRestlessClassAnswer"></p></div></div>
                    <div class="faq-item"><h3 class="faq-question" data-lang-key="faqBoringTitle"></h3><div class="faq-answer"><p data-lang-key="faqBoringAnswer"></p></div></div>
                    <div class="faq-item"><h3 class="faq-question" data-lang-key="faqDifficultShareTitle"></h3><div class="faq-answer"><p data-lang-key="faqDifficultShareAnswer"></p></div></div>
                    <div class="faq-item"><h3 class="faq-question" data-lang-key="faqExpertTeacherTitle"></h3><div class="faq-answer"><p data-lang-key="faqExpertTeacherAnswer"></p></div></div>
                    <div class="faq-item"><h3 class="faq-question" data-lang-key="faqAudioFindTitle"></h3><div class="faq-answer"><p data-lang-key="faqAudioFindAnswer"></p></div></div>
                    <div class="faq-item"><h3 class="faq-question" data-lang-key="faqMispTrainingTitle"></h3><div class="faq-answer"><p data-lang-key="faqMispTrainingAnswer"></p></div></div>
                </div>
            </section>
        `,
         researchEvidence: `
            <section id="research-evidence-page" class="page-content research-evidence-page">
                <h2 data-lang-key="researchEvidenceTitle"></h2>
                <p data-lang-key="researchIntroP1"></p>
                <div class="content-section">
                    <h3 data-lang-key="researchStudentBenefitsTitle"></h3>
                    <ul>
                        <li data-lang-key="researchStudentLi1"></li>
                        <li data-lang-key="researchStudentLi2"></li>
                        <li data-lang-key="researchStudentLi3"></li>
                        <li data-lang-key="researchStudentLi4"></li>
                        <li data-lang-key="researchStudentLi5"></li>
                    </ul>
                </div>
                <div class="content-section">
                    <h3 data-lang-key="researchTeacherBenefitsTitle"></h3>
                    <ul>
                        <li data-lang-key="researchTeacherLi1"></li>
                        <li data-lang-key="researchTeacherLi2"></li>
                        <li data-lang-key="researchTeacherLi3"></li>
                        <li data-lang-key="researchTeacherLi4"></li>
                    </ul>
                </div>
                <div class="content-section">
                    <h3 data-lang-key="researchJapanContextTitle"></h3>
                    <p data-lang-key="researchJapanP1"></p>
                </div>
                <div class="content-section">
                    <p data-lang-key="researchMispMyriad"></p>
                    <p data-lang-key="researchBrainPowerApproach"></p>
                </div>
            </section>
        `,
        about: `
            <section id="about-page" class="page-content about-section">
                <h2 data-lang-key="aboutMWTitle"></h2>
                <p data-lang-key="aboutMWP1"></p>
                <p data-lang-key="aboutMWP2"></p>
                <ul>
                    <li data-lang-key="aboutMWStudentsBenefit"></li>
                    <li data-lang-key="aboutMWTeachersBenefit"></li>
                </ul>
                <h3 data-lang-key="needInJapanTitle"></h3>
                <p data-lang-key="needInJapanP1"></p>
                <p data-lang-key="needInJapanP2"></p>
                <h3 data-lang-key="brainPowerVisionTitle"></h3>
                <p data-lang-key="brainPowerVisionP1"></p>
                <p data-lang-key="brainPowerVisionP2"></p>
                <h3 data-lang-key="mispInspiredTitle"></h3>
                <p data-lang-key="mispInspiredP1"></p>
            </section>
        `
    };
    
    function translatePage() {
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.dataset.langKey;
            const langObject = langStrings[currentLanguage] || langStrings.en; 

            if (langObject && langObject[key] !== undefined) {
                if (el.tagName === 'TEXTAREA' && key === 'gratitudePlaceholder') {
                    el.placeholder = langObject[key];
                } else {
                    el.innerHTML = langObject[key];
                }
            } else if (langStrings.en[key] !== undefined) { 
                 if (el.tagName === 'TEXTAREA' && key === 'gratitudePlaceholder') {
                    el.placeholder = langStrings.en[key];
                } else {
                    el.innerHTML = langStrings.en[key];
                }
            }
        });

        htmlTag.lang = currentLanguage;
        pageTitleTag.textContent = langStrings[currentLanguage]?.appTitle || langStrings.en.appTitle;
        if (appTitleH1) {
             appTitleH1.textContent = langStrings[currentLanguage]?.appTitle || langStrings.en.appTitle;
        }

        if (languageToggleBtn) {
            languageToggleBtn.textContent = currentLanguage === 'en' ? 
                (langStrings.en.toggleToJapanese || "日本語へ") : 
                (langStrings.jp.toggleToEnglish || "To English");
        }
        
        const practicesPage = document.getElementById('practices-page');
        if (practicesPage && practicesPage.classList.contains('active')) {
            renderPractices(true); 
        }
        
        const installBtn = document.getElementById('install-app-button');
        if (installBtn) {
            installBtn.textContent = langStrings[currentLanguage]?.installAppBtn || langStrings.en.installAppBtn;
        }
        
        const activePageContent = document.querySelector('.page-content.active');
        if (activePageContent) {
            activePageContent.querySelectorAll('.practice-controls button').forEach(btn => {
                const action = btn.dataset.action;
                let icon = btn.innerHTML.match(/^(▶ |❚❚ |↺ )/) ? btn.innerHTML.match(/^(▶ |❚❚ |↺ )/)[0] : '';

                if (action === 'play') {
                     if (icon.includes("❚❚")) icon = icon.replace("❚❚ ","▶ ");
                     btn.innerHTML = (icon || '▶ ') + (langStrings[currentLanguage]?.playBtn || langStrings.en.playBtn);
                } else if (action === 'pause') { 
                     if (icon.includes("▶")) icon = icon.replace("▶ ","❚❚ ");
                     btn.innerHTML = (icon || '❚❚ ') + (langStrings[currentLanguage]?.pauseBtn || langStrings.en.pauseBtn);
                } else if (action === 'restart') {
                    btn.innerHTML = (icon || '↺ ') + (langStrings[currentLanguage]?.restartBtn || langStrings.en.restartBtn);
                }
            });
             if(activePageContent.id === 'student-zone-page') {
                const gratitudeList = document.getElementById('gratitude-list');
                if(gratitudeList) {
                    gratitudeList.querySelectorAll('button.general-app-button').forEach(delBtn => {
                        delBtn.textContent = langStrings[currentLanguage]?.deleteBtnText || langStrings.en.deleteBtnText;
                    });
                }
                 const addGratitudeButton = document.getElementById('add-gratitude-btn');
                if(addGratitudeButton) {
                    addGratitudeButton.textContent = langStrings[currentLanguage]?.addGratitudeBtn || langStrings.en.addGratitudeBtn;
                }
            }
        }
    }
    
    function renderPractices(isTranslationUpdate = false) {
        const container = document.getElementById('practice-list-container');
        if (!container) {
            if (!isTranslationUpdate) console.error("Practice list container not found");
            return;
        }
        let html = '';
        practiceData.forEach(category => {
            const categoryTitle = langStrings[currentLanguage]?.[category.categoryKey] || langStrings.en[category.categoryKey];
            html += `<div class="practice-category"><h3>${categoryTitle}</h3><ul class="practice-list">`;
            category.tracks.forEach(track => {
                const trackTitle = langStrings[currentLanguage]?.[track.titleKey] || langStrings.en[track.titleKey];
                const trackDescription = langStrings[currentLanguage]?.[track.descriptionKey] || langStrings.en[track.descriptionKey];
                html += `
                    <li id="li-${track.id}">
                        <h3>${trackTitle}</h3>
                        <p class="practice-description">${trackDescription}</p>
                        <audio id="${track.id}" src="${track.src}" preload="metadata"></audio>
                        <div class="practice-controls">
                            <button data-action="play" class="general-app-button" onclick="window.handleAudioControl('${track.id}', this)">${langStrings[currentLanguage]?.playBtn || langStrings.en.playBtn}</button>
                            <button data-action="restart" class="general-app-button restart-button" onclick="window.handleAudioControl('${track.id}', this)">${langStrings[currentLanguage]?.restartBtn || langStrings.en.restartBtn}</button>
                        </div>
                        <div class="progress-bar-container" onclick="window.seekAudio(event, '${track.id}')">
                            <div class="progress-bar" id="progress-${track.id}"></div>
                        </div>
                        <div class="time-display" id="time-${track.id}">0:00 / 0:00</div>
                    </li>
                `;
            });
            html += `</ul></div>`;
        });
        container.innerHTML = html;
        document.querySelectorAll('#practices-page audio').forEach(audioEl => {
            audioEl.onloadedmetadata = null; 
            audioEl.addEventListener('loadedmetadata', () => updateInitialTimeDisplay(audioEl), {once: true});
            if (audioEl.readyState >= 1 && audioEl.duration && !isNaN(audioEl.duration)) {
                updateInitialTimeDisplay(audioEl);
            }
        });
    }
    
    function setupFaqToggle() {
        const faqItems = document.querySelectorAll('.faq-section .faq-item'); 
        faqItems.forEach(item => {
            const questionEl = item.querySelector('.faq-question');
            const answerEl = item.querySelector('.faq-answer');
            if (questionEl && answerEl) {
                answerEl.style.display = "none";
                item.classList.remove('open');

                const newQuestionEl = questionEl.cloneNode(true); 
                questionEl.parentNode.replaceChild(newQuestionEl, questionEl);

                newQuestionEl.addEventListener('click', () => {
                    const isCurrentlyOpen = item.classList.contains('open');
                    
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('open');
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            if (otherAnswer) otherAnswer.style.display = "none";
                        }
                    });

                    if (isCurrentlyOpen) {
                        item.classList.remove('open');
                        answerEl.style.display = "none";
                    } else {
                        item.classList.add('open');
                        answerEl.style.display = "block";
                    }
                });
            }
        });
    }

    function setupGratitudeJournal() {
        const addButton = document.getElementById('add-gratitude-btn');
        const gratitudeInput = document.getElementById('gratitude-input');
        const gratitudeList = document.getElementById('gratitude-list');

        if (!addButton || !gratitudeInput || !gratitudeList) return;

        let gratitudes = JSON.parse(localStorage.getItem('bpGratitudes')) || [];

        function renderGratitudes() {
            gratitudeList.innerHTML = '';
            gratitudes.forEach((item, index) => {
                const li = document.createElement('li');
                const textSpan = document.createElement('span');
                textSpan.textContent = item;
                li.appendChild(textSpan);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = langStrings[currentLanguage]?.deleteBtnText || langStrings.en.deleteBtnText;
                deleteBtn.classList.add('general-app-button');
                deleteBtn.title = 'Delete this item';
                deleteBtn.onclick = (e) => { e.stopPropagation(); deleteGratitude(index); };
                li.appendChild(deleteBtn);
                gratitudeList.appendChild(li);
            });
        }

        function addGratitude() {
            const text = gratitudeInput.value.trim();
            if (text) {
                gratitudes.unshift(text);
                if (gratitudes.length > 20) gratitudes.pop();
                localStorage.setItem('bpGratitudes', JSON.stringify(gratitudes));
                gratitudeInput.value = '';
                renderGratitudes();
            }
        }

        function deleteGratitude(index) {
            gratitudes.splice(index, 1);
            localStorage.setItem('bpGratitudes', JSON.stringify(gratitudes));
            renderGratitudes();
        }
        
        const newAddButton = addButton.cloneNode(true);
        addButton.parentNode.replaceChild(newAddButton, addButton);
        newAddButton.addEventListener('click', addGratitude);
        newAddButton.textContent = langStrings[currentLanguage]?.addGratitudeBtn || langStrings.en.addGratitudeBtn;
        
        renderGratitudes();
    }
    
    window.loadPage = (pageName, isLangChange = false) => { 
        clearLargeCountdown();
        if (pages[pageName]) {
            const previouslyActivePage = document.querySelector('nav button.active')?.dataset.page;

            if (!isLangChange || (isLangChange && previouslyActivePage !== pageName) ) {
                document.querySelectorAll('audio').forEach(audio => {
                    audio.pause(); 
                    audio.currentTime = 0;
                    const controlContainer = audio.closest('li, div#featured-practice');
                    if (controlContainer) {
                        const playButton = controlContainer.querySelector('button[data-action="pause"], button[data-action="play"]');
                        if (playButton) {
                            let currentIcon = playButton.innerHTML.match(/^(▶ |❚❚ |↺ )/) ? playButton.innerHTML.match(/^(▶ |❚❚ |↺ )/)[0] : '▶ ';
                            if (currentIcon.includes("❚❚")) currentIcon = currentIcon.replace("❚❚ ","▶ ");
                            playButton.innerHTML = currentIcon + (langStrings[currentLanguage]?.playBtn || langStrings.en.playBtn);
                            playButton.dataset.action = 'play';
                            playButton.classList.remove('playing');
                        }
                        const progressBar = controlContainer.querySelector('.progress-bar');
                        if (progressBar) progressBar.style.width = '0%';
                    }
                    updateInitialTimeDisplay(audio);
                });
            }

            contentArea.innerHTML = pages[pageName]; 
            
            if (pageName === 'practices') {
                renderPractices(); 
            } else if (pageName === 'teacherResources' || pageName === 'schoolPathways' || pageName === 'forParents' || pageName === 'researchEvidence') {
                setupFaqToggle();
            } else if (pageName === 'studentZone') {
                setupGratitudeJournal();
                 const coloringContainer = document.getElementById('coloring-image-container');
                 if (coloringContainer && !coloringContainer.querySelector('img')) {
                     coloringContainer.innerHTML = `<p data-lang-key="selectImagePrompt"></p>`;
                 }
            } else if (pageName === 'home') {
                const homeAudio = document.getElementById('audio-quick-calm');
                if (homeAudio) {
                     if (homeAudio.readyState >=1 && homeAudio.duration && !isNaN(homeAudio.duration)) {
                         updateInitialTimeDisplay(homeAudio);
                     } else {
                        homeAudio.onloadedmetadata = null;
                        homeAudio.addEventListener('loadedmetadata', () => updateInitialTimeDisplay(homeAudio), {once: true});
                     }
                }
            }
            
            const newPageContent = contentArea.querySelector('.page-content');
            document.querySelectorAll('.page-content.active').forEach(el => el.classList.remove('active'));
            if(newPageContent) newPageContent.classList.add('active');

            navButtons.forEach(button => {
                button.classList.remove('active');
                if (button.dataset.page === pageName) {
                    button.classList.add('active');
                }
            });
            translatePage();
        } else {
            contentArea.innerHTML = `<p>Content for '${pageName}' not found.</p>`;
            console.error("Page key not found in pages object:", pageName);
        }
    }

    navButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const pageName = event.target.dataset.page;
            window.loadPage(pageName);
        });
    });
    
    window.handleAudioControl = (audioId, buttonEl) => {
        const audio = document.getElementById(audioId);
        if (!audio) { console.error("Audio element not found:", audioId); return; }
        
        const action = buttonEl.dataset.action;
        const controlContainer = buttonEl.closest('li') || buttonEl.closest('#featured-practice');
        if (!controlContainer) { console.error("Control container not found for button:", buttonEl); return; }
        const playPauseButton = controlContainer.querySelector('button[data-action="play"], button[data-action="pause"]');

        clearLargeCountdown();

        if (action === 'restart') {
            document.querySelectorAll('audio').forEach(otherAudio => {
                if (otherAudio !== audio && !otherAudio.paused) {
                    otherAudio.pause(); 
                    const otherContainer = otherAudio.closest('li, div#featured-practice');
                    if(otherContainer){
                        const otherPlayBtn = otherContainer.querySelector('button[data-action="pause"]');
                        if (otherPlayBtn) { 
                            otherPlayBtn.innerHTML = '▶ ' + (langStrings[currentLanguage]?.playBtn || langStrings.en.playBtn);
                            otherPlayBtn.dataset.action = 'play'; 
                            otherPlayBtn.classList.remove('playing'); 
                        }
                    }
                    updateProgress(otherAudio.id);
                }
            });
            audio.currentTime = 0;
            audio.play();
            if (playPauseButton) { 
                playPauseButton.innerHTML = '❚❚ ' + (langStrings[currentLanguage]?.pauseBtn || langStrings.en.pauseBtn);
                playPauseButton.dataset.action = 'pause'; 
                playPauseButton.classList.add('playing'); 
            }
            startLargeCountdown(audio);
        } else if (audio.paused) { 
            document.querySelectorAll('audio').forEach(otherAudio => { 
                if (otherAudio !== audio && !otherAudio.paused) {
                    otherAudio.pause();
                    const otherContainer = otherAudio.closest('li, div#featured-practice');
                     if(otherContainer){
                        const otherPlayBtn = otherContainer.querySelector('button[data-action="pause"]');
                        if (otherPlayBtn) { 
                            otherPlayBtn.innerHTML = '▶ ' + (langStrings[currentLanguage]?.playBtn || langStrings.en.playBtn);
                            otherPlayBtn.dataset.action = 'play'; 
                            otherPlayBtn.classList.remove('playing'); 
                        }
                    }
                    updateProgress(otherAudio.id);
                }
            });
            audio.play();
            if (playPauseButton) { 
                playPauseButton.innerHTML = '❚❚ ' + (langStrings[currentLanguage]?.pauseBtn || langStrings.en.pauseBtn);
                playPauseButton.dataset.action = 'pause'; 
                playPauseButton.classList.add('playing'); 
            }
            startLargeCountdown(audio);
        } else { 
            audio.pause();
            if (playPauseButton) { 
                playPauseButton.innerHTML = '▶ ' + (langStrings[currentLanguage]?.playBtn || langStrings.en.playBtn);
                playPauseButton.dataset.action = 'play'; 
                playPauseButton.classList.remove('playing'); 
            }
        }

        audio.ontimeupdate = () => updateProgress(audioId);
        audio.onended = () => {
            if (playPauseButton) { 
                playPauseButton.innerHTML = '▶ ' + (langStrings[currentLanguage]?.playBtn || langStrings.en.playBtn);
                playPauseButton.dataset.action = 'play'; 
                playPauseButton.classList.remove('playing'); 
            }
            const progressBar = controlContainer.querySelector('.progress-bar');
            if(progressBar) progressBar.style.width = '0%';
            updateInitialTimeDisplay(audio); 
            clearLargeCountdown();
        };
        
        if (audio.readyState < 1 || isNaN(audio.duration)) {
             audio.onloadedmetadata = null; 
             audio.addEventListener('loadedmetadata', function onMeta() {
                updateInitialTimeDisplay(audio);
                if (!audio.paused) startLargeCountdown(audio);
            }, {once: true});
        } else {
            updateInitialTimeDisplay(audio);
             if (!audio.paused) startLargeCountdown(audio);
        }
    };
    
    function startLargeCountdown(audio) {
        if (!audio || isNaN(audio.duration) || audio.duration === 0) {
            clearLargeCountdown();
            return;
        }
        clearLargeCountdown(); 
        if(largeCountdownDisplay) largeCountdownDisplay.style.display = 'block';
        
        function updateTimer() {
            if (!audio || audio.paused || audio.ended || isNaN(audio.duration) || isNaN(audio.currentTime) || audio.duration === 0) {
                clearLargeCountdown();
                return;
            }
            const timeLeft = audio.duration - audio.currentTime;
            if(largeCountdownDisplay) largeCountdownDisplay.textContent = formatTime(timeLeft);
        }
        updateTimer();
        largeCountdownInterval = setInterval(updateTimer, 1000);
    }

    function updateProgress(audioId) {
        const audio = document.getElementById(audioId);
        if (!audio) return;
        const controlContainer = audio.closest('li') || audio.closest('#featured-practice'); 
        if (!controlContainer) return;

        const progressBar = controlContainer.querySelector('.progress-bar');
        const timeDisplay = controlContainer.querySelector('.time-display');

        if (audio && progressBar && timeDisplay) {
            if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
                const progressPercent = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = `${progressPercent}%`;
                const totalDuration = formatTime(audio.duration);
                const currentTimeFormatted = formatTime(audio.currentTime);
                timeDisplay.textContent = `${currentTimeFormatted} / ${totalDuration}`;
            } else if (timeDisplay) {
                 const currentTimeFormatted = formatTime(audio.currentTime || 0);
                 timeDisplay.textContent = `${currentTimeFormatted} / --:--`;
            }
        }
    }
    
    window.seekAudio = (event, audioId) => {
        const audio = document.getElementById(audioId);
        const progressBarContainer = event.currentTarget;
        if (audio && audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
            const rect = progressBarContainer.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const barWidth = progressBarContainer.offsetWidth;
            const seekTime = (clickX / barWidth) * audio.duration;
            audio.currentTime = seekTime;
            updateProgress(audioId); 
            if(!audio.paused) {
                startLargeCountdown(audio);
            } else {
                const timeLeft = audio.duration - audio.currentTime;
                if(largeCountdownDisplay && largeCountdownDisplay.style.display === 'block') {
                    largeCountdownDisplay.textContent = formatTime(timeLeft);
                }
            }
        }
    };

    window.navigateToPractice = (audioIdToHighlight) => {
        window.loadPage('practices');
        setTimeout(() => { 
            const practiceAudioElement = document.getElementById(audioIdToHighlight);
            if (practiceAudioElement) {
                const practiceItem = practiceAudioElement.closest('li');
                if (practiceItem) {
                    practiceItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    practiceItem.classList.add('highlighted-practice');
                    setTimeout(() => practiceItem.classList.remove('highlighted-practice'), 2500);
                }
            } else {
                console.warn("Could not find practice item for ID:", audioIdToHighlight);
            }
        }, 250); 
    };

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault(); 
        deferredInstallPrompt = event;
        if(installButtonContainer) showInstallButton();
        console.log('`beforeinstallprompt` event was fired.');
    });

    function showInstallButton() {
        if(!installButtonContainer) return;

        const installButton = document.createElement('button');
        installButton.id = 'install-app-button'; 
        installButton.classList.add('general-app-button');
        installButton.textContent = langStrings[currentLanguage]?.installAppBtn || langStrings.en.installAppBtn;

        installButtonContainer.innerHTML = ''; 
        installButtonContainer.appendChild(installButton);
        installButtonContainer.style.display = 'block'; 

        installButton.addEventListener('click', async () => { 
            installButtonContainer.style.display = 'none'; 
            if (deferredInstallPrompt) {
                deferredInstallPrompt.prompt();
                const { outcome } = await deferredInstallPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                deferredInstallPrompt = null;
            }
        });
    }

    window.addEventListener('appinstalled', () => {
        if(installButtonContainer) installButtonContainer.style.display = 'none';
        deferredInstallPrompt = null;
        console.log('Brain Power MW PWA was installed');
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(error => {
                    // Don't log error if running from file:/// as SW requires HTTP/HTTPS
                    if (!location.protocol.startsWith('file')) {
                        console.log('ServiceWorker registration failed: ', error);
                    }
                });
        });
    }
    
    // --- Language Toggle Setup and Initial Page Load ---
    if (languageToggleBtn) {
        languageToggleBtn.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'en' ? 'jp' : 'en';
            localStorage.setItem('brainPowerMWLang', currentLanguage);
            const currentPageButton = document.querySelector('nav button.active');
            if (currentPageButton) {
                window.loadPage(currentPageButton.dataset.page, true); 
            } else {
                window.loadPage('home', true); 
            }
        });
    }
    
    // Initial Page Load
    window.loadPage('home'); 
});
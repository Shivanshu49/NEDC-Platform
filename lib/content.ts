/**
 * NEDC official content — Vision, Mission, and the Welcome Message — used
 * verbatim across the homepage and About page. Kept in one place so the exact
 * wording stays consistent and is easy to edit.
 */

export const VISION_SUMMARY =
  "To build a strong entrepreneurial ecosystem that empowers youth, students, professionals, women, and rural communities to become innovators, startup founders, and job creators through skill development, innovation, technology, and sustainable business opportunities.";

export const VISION_FULL = [
  "To build a strong entrepreneurial ecosystem that empowers youth, students, professionals, women, and rural communities to become innovators, startup founders, and job creators through skill development, innovation, technology, and sustainable business opportunities.",
  "NEDC envisions transforming India into a globally recognized entrepreneurship-driven nation by promoting self-employment, startup culture, leadership, and economic growth.",
];

export const MISSION = [
  "To provide quality Entrepreneurship Development Programs (EDP) through online and offline platforms that enhance entrepreneurial knowledge and practical business skills.",
  "To encourage innovation, startup culture, self-employment, and leadership among youth, students, professionals, women, and rural communities.",
  "To create awareness about government schemes, MSME support systems, technology-driven opportunities, and sustainable entrepreneurship across various sectors.",
  "To support aspiring entrepreneurs through mentorship, skill development, networking, incubation guidance, and business development strategies for long-term economic growth.",
];

export const WELCOME_MESSAGE = [
  "Welcome to the National Entrepreneurship Development Center (NEDC).",
  "In today's rapidly changing world, entrepreneurship is not only a career option but also a powerful tool for innovation, employment generation, and nation building. NEDC is committed to empowering individuals with entrepreneurial knowledge, practical skills, startup guidance, and leadership development opportunities.",
  "Our goal is to inspire and support students, youth, professionals, and aspiring entrepreneurs to move beyond traditional job-seeking approaches and become creators of opportunities. Through Entrepreneurship Development Programs, startup mentoring, workshops, digital learning platforms, and industry interaction, we aim to build a new generation of confident and visionary entrepreneurs.",
  "We believe that every individual has the potential to create positive change through innovation, determination, and leadership.",
  "Let us work together to transform ideas into successful ventures and dreams into reality.",
  "Welcome to the journey of Innovation, Leadership, and Entrepreneurship.",
];

/** The EDP program's focus areas (homepage + EDP page cards). */
export const FOCUS_AREAS = [
  {
    title: "Startup Development",
    body: "Take an idea from concept to a launch-ready venture.",
    icon: "Rocket",
  },
  {
    title: "Business Planning",
    body: "Build models, plans, and the numbers that make a business work.",
    icon: "ClipboardList",
  },
  {
    title: "Innovation",
    body: "Turn fresh thinking into products people actually want.",
    icon: "Lightbulb",
  },
  {
    title: "Leadership",
    body: "Develop the confidence and skills to lead a team and a vision.",
    icon: "Users",
  },
  {
    title: "MSME Opportunities",
    body: "Tap government schemes, MSME support, and funding pathways.",
    icon: "Landmark",
  },
  {
    title: "Digital Entrepreneurship",
    body: "Grow online — digital products, marketing, and modern tools.",
    icon: "Globe",
  },
  {
    title: "Rural Entrepreneurship",
    body: "Create sustainable ventures and jobs in rural communities.",
    icon: "Sprout",
  },
  {
    title: "Skill Development",
    body: "Practical, real-world skills that power self-employment.",
    icon: "GraduationCap",
  },
] as const;

/** Motivational quotes strip. */
export const QUOTES = [
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
  },
  {
    text: "Ideas are easy. Implementation is hard.",
    author: "Guy Kawasaki",
  },
  {
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller",
  },
];

/** Eligibility — who the EDP is for. */
export const ELIGIBILITY = [
  "Students",
  "Youth",
  "Professionals",
  "Women",
  "Rural communities",
];

/** Program intro video (YouTube). Only the id is stored; VideoEmbed builds the URL. */
export const EDP_VIDEO_ID = "FpgvOhurEz4";

/** "What is the EDP?" — short, plain-language intro (from the official EDP brief). */
export const EDP_INTRO =
  "The Entrepreneurship Development Program (EDP) empowers young and aspiring business-minded people with insight into every facet of starting a new business — and the sustainable resources to settle into a career of their own. Every session is tailor-made to train you to start your own business or venture.";

/** Objectives of the programme (from the official EDP brief). */
export const EDP_OBJECTIVES = [
  "Prepare aspiring and existing entrepreneurs — women and men — to establish their own business activity.",
  "Guide you on generating funds for your project — whether a manufacturing unit, a service unit, or trading.",
  "Help you build a complete Business Plan and Project Report for your venture.",
];

/**
 * The 5-day EDP schedule (2 live sessions per day) from the official
 * Schedule_of_EDP_Training_2026. `theme` summarizes the day; `sessions` are the
 * two topics covered, in order.
 */
export const EDP_CURRICULUM = [
  {
    day: 1,
    theme: "Foundations & setting up",
    sessions: [
      "Introduction to the EDP — entrepreneur qualities, mindset, and an ease-of-doing-business approach",
      "Procedure for setting up a small business, including choosing your business entity",
    ],
  },
  {
    day: 2,
    theme: "Government support & leadership",
    sessions: [
      "Government initiatives for entrepreneurs — PMEGP, MUDRA & Stand-Up India schemes",
      "Planning, managing & leadership",
    ],
  },
  {
    day: 3,
    theme: "Opportunities & markets",
    sessions: [
      "Business opportunities in domestic & international markets — and your own business ideas",
      "Market overview, direct selling, target market, competition & marketing channels",
    ],
  },
  {
    day: 4,
    theme: "Finance & a real-world case",
    sessions: [
      "Composite loans — term loans for fixed assets and working-capital facilities",
      "Case study of a real business unit",
    ],
  },
  {
    day: 5,
    theme: "Project report & validation",
    sessions: [
      "Writing a Project Report — break-even point (BEP) and ratios for economic viability",
      "Feedback & valedictory session",
    ],
  },
] as const;

/** Footnote shown under the curriculum. */
export const EDP_SCHEDULE_NOTE =
  "Each session is a one-hour live online lecture, with a 15-minute break after the first session.";

/** Contact details — PLACEHOLDERS the team fills in. */
export const CONTACT = {
  phone: "+91 00000 00000",
  whatsapp: "910000000000", // digits only, for wa.me links
  email: "info@nedc.example",
  address: "NEDC Office, [City], India",
  socials: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
    youtube: "#",
    telegram: "#",
  },
};

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

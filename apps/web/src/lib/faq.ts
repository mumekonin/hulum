import type { ChatLink } from "./chat";

/** Fixed product answers. Shown in the chat without calling any AI. */
export type FaqEntry = { question: string; answer: string; links?: ChatLink[] };

export const FAQ: FaqEntry[] = [
  {
    question: "What is HULUM?",
    answer:
      "HULUM helps Ethiopian students, graduates, and young professionals decide which opportunities are worth their time. It compares your saved profile with an opportunity's stored requirements and tells you APPLY, MAYBE, or SKIP — then why, what is missing, and what to prepare.",
  },
  {
    question: "How does APPLY / MAYBE / SKIP work?",
    answer:
      "A fixed rules engine checks each requirement against your saved profile and marks it met, not met, or uncertain. A critical requirement not met gives SKIP. Key requirements met with nothing important uncertain gives APPLY. Everything else is MAYBE. AI can explain a result, but it never decides or changes it.",
  },
  {
    question: "What does APPLY mean?",
    answer:
      "You meet the key known requirements based on your saved profile. Prepare your materials, then confirm the details on the official source before you apply.",
  },
  {
    question: "What does MAYBE mean?",
    answer:
      "MAYBE means HULUM found that you may fit the opportunity, but an important requirement is missing, uncertain, or needs verification. Check the official opportunity source before applying.",
  },
  {
    question: "What does SKIP mean?",
    answer:
      "Based on your saved profile, a required eligibility condition is not met. HULUM shows which one, so you can focus on a closer match — or update your profile if something is out of date.",
  },
  {
    question: "How does HULUM use my profile?",
    answer:
      "HULUM compares the facts you saved — education, field, graduation year, location, languages, skills, experience, and documents — with each opportunity's requirements. Missing or unclear facts count as uncertain, never as met. HULUM never changes your profile without your confirmation.",
    links: [{ label: "View profile", href: "/profile" }],
  },
  {
    question: "What should I add to my profile?",
    answer:
      "Your education level, field of study, graduation year, country and city, languages, skills, experience, interests, and your CV. The more complete your profile, the fewer requirements end up uncertain.",
    links: [{ label: "Edit profile", href: "/profile" }],
  },
  {
    question: "How does HULUM use my CV?",
    answer:
      "Your CV records that you hold the document, and readable text from it can support experience and field matching during analysis. It never marks a requirement as met by itself and never rewrites your saved profile. The file is private to your account.",
    links: [{ label: "Upload CV", href: "/profile" }],
  },
  {
    question: "Can HULUM apply for me?",
    answer:
      "No. HULUM does not submit applications. It helps you decide and prepare, then links you to the official website where you apply yourself.",
  },
  {
    question: "Where do I submit my application?",
    answer:
      "On the official organization's website. Every opportunity page has an Apply on official website or View official opportunity button that uses the link stored from the official source.",
  },
  {
    question: "How accurate is HULUM's analysis?",
    answer:
      "It is only as accurate as the stored opportunity information and your saved profile. HULUM is a decision aid, not an eligibility authority, and it never guarantees acceptance. Always verify final eligibility and deadlines with the official organization.",
  },
];

/** Shown before "More questions". */
export const FAQ_PRIMARY_COUNT = 5;

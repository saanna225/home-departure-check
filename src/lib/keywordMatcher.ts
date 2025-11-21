import { Checklist } from "./types";

// Keywords that might indicate which checklist to use
const keywordMap: Record<string, string[]> = {
  gym: ["gym", "workout", "exercise", "fitness", "training", "sport", "yoga", "pilates", "spin", "zumba", "crossfit", "cardio", "weights", "run", "running", "jog", "jogging", "class", "session"],
  work: ["work", "office", "meeting", "presentation", "conference", "business", "seminar", "workshop", "client", "appointment", "call", "zoom"],
  beach: ["beach", "pool", "swim", "swimming", "ocean", "sea", "coast", "water park", "waterpark", "water", "amusement", "splash", "dive", "snorkel", "surf", "surfing", "bay", "lake", "aquatic"],
  travel: ["travel", "trip", "vacation", "holiday", "flight", "airport", "hotel", "tour", "getaway", "cruise", "road trip", "journey", "visit", "touring", "sightseeing"],
  hiking: ["hike", "hiking", "trek", "trekking", "mountain", "trail", "camp", "camping", "outdoor", "backpack", "backpacking", "climb", "climbing", "nature", "wilderness"],
  home: ["home", "house", "apartment", "place", "residence"],
  shopping: ["shop", "shopping", "grocery", "groceries", "store", "market", "mall", "errands", "supplies", "purchase", "buy"],
  school: ["school", "class", "college", "university", "study", "exam", "lecture", "homework", "assignment", "education", "learning", "course"],
};

// Display keywords for user hints (only 3 per category for simplicity)
const displayKeywords: Record<string, string[]> = {
  gym: ["gym", "workout", "fitness"],
  work: ["work", "meeting", "office"],
  beach: ["beach", "pool", "water"],
  travel: ["travel", "trip", "vacation"],
  hiking: ["hiking", "camping", "trail"],
  home: ["home", "house", "apartment"],
  shopping: ["shopping", "grocery", "mall"],
  school: ["school", "class", "study"],
};

export const getDisplayKeywords = (): string[] => {
  const allDisplayKeywords = Object.values(displayKeywords).flat();
  // Return unique keywords, limited to avoid overwhelming users
  return [...new Set(allDisplayKeywords)].slice(0, 15);
};

export const matchChecklistsByKeywords = (
  eventTitle: string,
  checklists: Checklist[]
): string[] => {
  const titleLower = eventTitle.toLowerCase();
  const matches: string[] = [];

  checklists.forEach((checklist) => {
    const checklistName = checklist.name.toLowerCase();
    
    // Check if checklist name appears in event title
    if (titleLower.includes(checklistName)) {
      matches.push(checklist.id);
      return;
    }

    // Check keyword matches
    Object.entries(keywordMap).forEach(([category, keywords]) => {
      const categoryMatch = keywords.some(keyword => titleLower.includes(keyword));
      const checklistMatch = keywords.some(keyword => checklistName.includes(keyword));
      
      if (categoryMatch && checklistMatch) {
        matches.push(checklist.id);
      }
    });
  });

  return [...new Set(matches)]; // Remove duplicates
};

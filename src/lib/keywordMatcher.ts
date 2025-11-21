import { Checklist } from "./types";

// Keywords that might indicate which checklist to use
const keywordMap: Record<string, string[]> = {
  gym: ["gym", "workout", "exercise", "fitness", "training", "sport"],
  work: ["work", "office", "meeting", "presentation", "conference"],
  beach: ["beach", "pool", "swim", "ocean", "sea", "coast"],
  travel: ["travel", "trip", "vacation", "holiday", "flight", "airport"],
  hiking: ["hike", "hiking", "trek", "mountain", "trail", "camp", "camping"],
  home: ["home", "house", "apartment", "place"],
  shopping: ["shop", "shopping", "grocery", "groceries", "store", "market"],
  school: ["school", "class", "college", "university", "study"],
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


import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date value into a consistent ISO date string (YYYY-MM-DD)
 * Handles various input formats: Excel serial dates, date strings, Date objects
 * @param dateValue - The date value to format
 * @returns Formatted date string or undefined if invalid
 */
export function formatDate(dateValue: any): string | undefined {
  if (!dateValue) return undefined;
  
  try {
    // Case 1: Excel serial date number (days since 1900-01-01)
    if (typeof dateValue === 'number') { 
      // Excel serial date number (subtract 25569 to get days since Unix epoch)
      const dateObj = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split('T')[0]; // Get only YYYY-MM-DD part
      }
    } 
    
    // Case 2: Date object
    if (dateValue instanceof Date) {
      if (!isNaN(dateValue.getTime())) {
        return dateValue.toISOString().split('T')[0];
      }
    }
    
    // Case 3: String date in various formats
    if (typeof dateValue === 'string') {
      // Try to normalize date string
      if (dateValue.trim() === '') return undefined;
      
      // Handle DD/MM/YYYY format
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
        const parts = dateValue.split('/');
        // Reorder to YYYY-MM-DD
        dateValue = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      
      // Handle MM/DD/YYYY format
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
        const parts = dateValue.split('/');
        // Reorder to YYYY-MM-DD
        dateValue = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      }
      
      // Try to parse as a date
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    return undefined;
  } catch (error) {
    console.error("Error formatting date:", error, dateValue);
    return undefined;
  }
}

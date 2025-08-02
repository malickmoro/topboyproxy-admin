export type CategoryDisplay = '50' | '100' | '200' | '300' | '400' | '600' | '800' | '1000';
export type CategoryBackend = 'FIFTY' | 'HUNDRED' | 'TWO_HUNDRED' | 'THREE_HUNDRED' | 'FOUR_HUNDRED' | 'SIX_HUNDRED' | 'EIGHT_HUNDRED' | 'THOUSAND';

// Convert display name to backend value
export function displayToBackend(display: CategoryDisplay): CategoryBackend {
  switch (display) {
    case '50':
      return 'FIFTY';
    case '100':
      return 'HUNDRED';
    case '200':
      return 'TWO_HUNDRED';
    case '300':
      return 'THREE_HUNDRED';
    case '400':
      return 'FOUR_HUNDRED';
    case '600':
      return 'SIX_HUNDRED';
    case '800':
      return 'EIGHT_HUNDRED';
    case '1000':
      return 'THOUSAND';
    default:
      throw new Error(`Invalid display category: ${display}`);
  }
}

// Convert backend value to display name
export function backendToDisplay(backend: CategoryBackend): CategoryDisplay {
  switch (backend) {
    case 'FIFTY':
      return '50';
    case 'HUNDRED':
      return '100';
    case 'TWO_HUNDRED':
      return '200';
    case 'THREE_HUNDRED':
      return '300';
    case 'FOUR_HUNDRED':
      return '400';
    case 'SIX_HUNDRED':
      return '600';
    case 'EIGHT_HUNDRED':
      return '800';
    case 'THOUSAND':
      return '1000';
    default:
      throw new Error(`Invalid backend category: ${backend}`);
  }
}

// Get all display categories
export const DISPLAY_CATEGORIES: CategoryDisplay[] = ['50', '100', '200', '300', '400', '600', '800', '1000'];

// Get all backend categories
export const BACKEND_CATEGORIES: CategoryBackend[] = ['FIFTY', 'HUNDRED', 'TWO_HUNDRED', 'THREE_HUNDRED', 'FOUR_HUNDRED', 'SIX_HUNDRED', 'EIGHT_HUNDRED', 'THOUSAND']; 
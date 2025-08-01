export type CategoryDisplay = '50' | '100';
export type CategoryBackend = 'FIFTY' | 'HUNDRED';

// Convert display name to backend value
export function displayToBackend(display: CategoryDisplay): CategoryBackend {
  switch (display) {
    case '50':
      return 'FIFTY';
    case '100':
      return 'HUNDRED';
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
    default:
      throw new Error(`Invalid backend category: ${backend}`);
  }
}

// Get all display categories
export const DISPLAY_CATEGORIES: CategoryDisplay[] = ['50', '100'];

// Get all backend categories
export const BACKEND_CATEGORIES: CategoryBackend[] = ['FIFTY', 'HUNDRED']; 
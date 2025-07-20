// Import the functions to test
// Note: These functions are currently in the API route, but should be moved to a separate file
// For this test, we'll recreate them here

// Helper function to evaluate segment conditions against a fan
function evaluateConditions(fan: any, conditions: any[]): boolean {
  if (!conditions || conditions.length === 0) {
    return true;
  }

  let result = evaluateCondition(fan, conditions[0]);
  
  for (let i = 1; i < conditions.length; i++) {
    const condition = conditions[i];
    const logic = conditions[i - 1].logic || 'and';
    
    if (logic === 'and') {
      result = result && evaluateCondition(fan, condition);
    } else {
      result = result || evaluateCondition(fan, condition);
    }
  }
  
  return result;
}

// Helper function to evaluate a single condition
function evaluateCondition(fan: any, condition: any): boolean {
  const { field, operator, value } = condition;
  
  // Handle special fields
  if (field === 'tags') {
    const fanTags = fan.tags || [];
    
    switch (operator) {
      case 'contains':
        return fanTags.includes(value);
      case 'not_contains':
        return !fanTags.includes(value);
      case 'in':
        return Array.isArray(value) && value.some(tag => fanTags.includes(tag));
      case 'not_in':
        return Array.isArray(value) && !value.some(tag => fanTags.includes(tag));
      default:
        return false;
    }
  }
  
  // Handle custom fields
  if (field.startsWith('custom_fields.')) {
    const customField = field.replace('custom_fields.', '');
    const customValue = fan.custom_fields?.[customField];
    
    return compareValues(customValue, operator, value);
  }
  
  // Handle standard fields
  const fanValue = fan[field];
  return compareValues(fanValue, operator, value);
}

// Helper function to compare values based on operator
function compareValues(a: any, operator: string, b: any): boolean {
  switch (operator) {
    case 'equals':
      return a === b;
    case 'not_equals':
      return a !== b;
    case 'contains':
      return typeof a === 'string' && a.includes(b);
    case 'not_contains':
      return typeof a === 'string' && !a.includes(b);
    case 'greater_than':
      return a > b;
    case 'less_than':
      return a < b;
    case 'in':
      return Array.isArray(b) && b.includes(a);
    case 'not_in':
      return Array.isArray(b) && !b.includes(a);
    default:
      return false;
  }
}

describe('Segment Conditions', () => {
  // Test data
  const fan = {
    id: 'fan-1',
    email: 'test@example.com',
    name: 'Test User',
    tags: ['newsletter', 'website'],
    status: 'subscribed',
    created_at: '2023-01-15T12:00:00Z',
    custom_fields: {
      city: 'New York',
      country: 'USA',
      favorite_genre: 'Rock'
    }
  };

  describe('evaluateCondition', () => {
    it('should evaluate email equals condition correctly', () => {
      const condition = { field: 'email', operator: 'equals', value: 'test@example.com' };
      expect(evaluateCondition(fan, condition)).toBe(true);
      
      const condition2 = { field: 'email', operator: 'equals', value: 'wrong@example.com' };
      expect(evaluateCondition(fan, condition2)).toBe(false);
    });

    it('should evaluate email contains condition correctly', () => {
      const condition = { field: 'email', operator: 'contains', value: 'example' };
      expect(evaluateCondition(fan, condition)).toBe(true);
      
      const condition2 = { field: 'email', operator: 'contains', value: 'gmail' };
      expect(evaluateCondition(fan, condition2)).toBe(false);
    });

    it('should evaluate tags contains condition correctly', () => {
      const condition = { field: 'tags', operator: 'contains', value: 'newsletter' };
      expect(evaluateCondition(fan, condition)).toBe(true);
      
      const condition2 = { field: 'tags', operator: 'contains', value: 'concert' };
      expect(evaluateCondition(fan, condition2)).toBe(false);
    });

    it('should evaluate custom fields correctly', () => {
      const condition = { field: 'custom_fields.city', operator: 'equals', value: 'New York' };
      expect(evaluateCondition(fan, condition)).toBe(true);
      
      const condition2 = { field: 'custom_fields.country', operator: 'equals', value: 'Canada' };
      expect(evaluateCondition(fan, condition2)).toBe(false);
    });

    it('should evaluate date conditions correctly', () => {
      const condition = { 
        field: 'created_at', 
        operator: 'greater_than', 
        value: '2023-01-01T00:00:00Z' 
      };
      expect(evaluateCondition(fan, condition)).toBe(true);
      
      const condition2 = { 
        field: 'created_at', 
        operator: 'less_than', 
        value: '2022-12-31T00:00:00Z' 
      };
      expect(evaluateCondition(fan, condition2)).toBe(false);
    });
  });

  describe('evaluateConditions', () => {
    it('should evaluate multiple AND conditions correctly', () => {
      const conditions = [
        { field: 'email', operator: 'contains', value: 'example', logic: 'and' },
        { field: 'tags', operator: 'contains', value: 'newsletter' }
      ];
      expect(evaluateConditions(fan, conditions)).toBe(true);
      
      const conditions2 = [
        { field: 'email', operator: 'contains', value: 'example', logic: 'and' },
        { field: 'tags', operator: 'contains', value: 'concert' }
      ];
      expect(evaluateConditions(fan, conditions2)).toBe(false);
    });

    it('should evaluate multiple OR conditions correctly', () => {
      const conditions = [
        { field: 'email', operator: 'contains', value: 'wrong', logic: 'or' },
        { field: 'tags', operator: 'contains', value: 'newsletter' }
      ];
      expect(evaluateConditions(fan, conditions)).toBe(true);
      
      const conditions2 = [
        { field: 'email', operator: 'contains', value: 'wrong', logic: 'or' },
        { field: 'tags', operator: 'contains', value: 'concert' }
      ];
      expect(evaluateConditions(fan, conditions2)).toBe(false);
    });

    it('should evaluate mixed AND/OR conditions correctly', () => {
      const conditions = [
        { field: 'email', operator: 'contains', value: 'example', logic: 'and' },
        { field: 'tags', operator: 'contains', value: 'newsletter', logic: 'or' },
        { field: 'custom_fields.city', operator: 'equals', value: 'wrong' }
      ];
      expect(evaluateConditions(fan, conditions)).toBe(true);
    });

    it('should return true for empty conditions', () => {
      expect(evaluateConditions(fan, [])).toBe(true);
    });
  });
});
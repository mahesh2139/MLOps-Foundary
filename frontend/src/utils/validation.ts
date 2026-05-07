/**
 * Form Validation Utilities
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Email validation
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation
 */
export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain a special character');
  }

  return errors;
};

/**
 * Project form validation
 */
export const validateProjectForm = (data: {
  name?: string;
  description?: string;
  environment?: string;
  githubRepo?: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Project name is required' });
  } else if (data.name.length < 3) {
    errors.push({ field: 'name', message: 'Project name must be at least 3 characters' });
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Description is required' });
  }

  if (!data.environment || !['dev', 'staging', 'prod'].includes(data.environment)) {
    errors.push({ field: 'environment', message: 'Valid environment is required' });
  }

  if (!data.githubRepo || data.githubRepo.trim().length === 0) {
    errors.push({ field: 'githubRepo', message: 'GitHub repository is required' });
  } else if (!/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(data.githubRepo)) {
    errors.push({ field: 'githubRepo', message: 'GitHub repo format should be owner/repo' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Pipeline form validation
 */
export const validatePipelineForm = (data: {
  name?: string;
  projectId?: string;
  nodes?: any[];
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Pipeline name is required' });
  }

  if (!data.projectId) {
    errors.push({ field: 'projectId', message: 'Project must be selected' });
  }

  if (!data.nodes || data.nodes.length === 0) {
    errors.push({ field: 'nodes', message: 'At least one node is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Model form validation
 */
export const validateModelForm = (data: {
  name?: string;
  version?: string;
  mlflowUri?: string;
  environment?: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Model name is required' });
  }

  if (!data.version || data.version.trim().length === 0) {
    errors.push({ field: 'version', message: 'Model version is required' });
  } else if (!/^\d+\.\d+\.\d+/.test(data.version)) {
    errors.push({ field: 'version', message: 'Version should follow semantic versioning (e.g., 1.0.0)' });
  }

  if (!data.mlflowUri || data.mlflowUri.trim().length === 0) {
    errors.push({ field: 'mlflowUri', message: 'MLflow URI is required' });
  } else if (!isValidUrl(data.mlflowUri)) {
    errors.push({ field: 'mlflowUri', message: 'Please provide a valid URL' });
  }

  if (!data.environment || !['dev', 'staging', 'prod'].includes(data.environment)) {
    errors.push({ field: 'environment', message: 'Valid environment is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Deployment form validation
 */
export const validateDeploymentForm = (data: {
  modelId?: string;
  environment?: string;
  version?: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.modelId) {
    errors.push({ field: 'modelId', message: 'Model must be selected' });
  }

  if (!data.environment || !['dev', 'staging', 'prod'].includes(data.environment)) {
    errors.push({ field: 'environment', message: 'Valid environment is required' });
  }

  if (!data.version || data.version.trim().length === 0) {
    errors.push({ field: 'version', message: 'Model version is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * User form validation
 */
export const validateUserForm = (data: {
  email?: string;
  name?: string;
  role?: string;
  password?: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email' });
  }

  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!data.role) {
    errors.push({ field: 'role', message: 'Role must be selected' });
  }

  if (data.password) {
    const passwordErrors = validatePassword(data.password);
    if (passwordErrors.length > 0) {
      errors.push({ field: 'password', message: passwordErrors[0] });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Alert form validation
 */
export const validateAlertForm = (data: {
  name?: string;
  metric?: string;
  condition?: string;
  threshold?: string;
  recipients?: string[];
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Alert name is required' });
  }

  if (!data.metric) {
    errors.push({ field: 'metric', message: 'Metric must be selected' });
  }

  if (!data.condition) {
    errors.push({ field: 'condition', message: 'Condition must be selected' });
  }

  if (!data.threshold || isNaN(Number(data.threshold))) {
    errors.push({ field: 'threshold', message: 'Please provide a valid threshold value' });
  }

  if (!data.recipients || data.recipients.length === 0) {
    errors.push({ field: 'recipients', message: 'At least one recipient is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * URL validation
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get error message for a specific field
 */
export const getFieldError = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find((e) => e.field === field);
  return error ? error.message : null;
};

/**
 * Check if field has error
 */
export const hasFieldError = (errors: ValidationError[], field: string): boolean => {
  return errors.some((e) => e.field === field);
};

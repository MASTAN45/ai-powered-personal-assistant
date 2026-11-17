// Frontend environment validation
class EnvironmentValidator {
  private errors: string[] = [];

  validate() {
    this.errors = [];

    // Check required environment variables
    this.checkRequired('VITE_API_URL', import.meta.env.VITE_API_URL);

    if (this.errors.length > 0) {
      const isDev = import.meta.env.DEV;

      if (isDev) {
        // In development, show clear error messages
        console.error('Environment Configuration Errors:');
        this.errors.forEach(error => console.error(`  - ${error}`));
        console.error('\nCreate a .env file in the frontend directory with:');
        console.error('  VITE_API_URL=http://localhost:3000');
        
        throw new Error('Missing required environment variables. Check console for details.');
      } else {
        // In production, fail safely without exposing details
        console.error('Application configuration error');
        throw new Error('Application is not properly configured');
      }
    }

    return this.getConfig();
  }

  private checkRequired(name: string, value: any) {
    if (!value || value === 'undefined') {
      this.errors.push(`${name} is required but not defined`);
    }
  }

  private getConfig() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Ensure API URL doesn't have trailing slash
    const cleanApiUrl = apiUrl.replace(/\/$/, '');

    return {
      apiUrl: cleanApiUrl,
      isDev: import.meta.env.DEV,
      isProduction: import.meta.env.PROD
    };
  }
}

export const environmentValidator = new EnvironmentValidator();

// Validate on module load
export const config = environmentValidator.validate();
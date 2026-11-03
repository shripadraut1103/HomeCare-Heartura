const withoutCredentials = (name: string) => name.split(',')[0].trim();

export const getFirstName = (name: string) => withoutCredentials(name).split(/\s+/)[0];

export const getInitials = (name: string) =>
  withoutCredentials(name)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join('');

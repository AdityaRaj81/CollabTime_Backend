export function success(message, data = {}) {
  return { success: true, message, data };
}

export function error(message, errors = []) {
  return { success: false, message, errors };
}

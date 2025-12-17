export interface ApiError {
  data: {
    message: string;
    statusCode?: number;
  };
}

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof (error as { data: unknown }).data === 'object' &&
    (error as { data: unknown }).data !== null &&
    'message' in (error as { data: { message: unknown } }).data
  );
};

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.data.message;
  }
  return 'An unexpected error occurred';
};

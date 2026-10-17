export type ServiceResult<T> = {
  data: T | null
  error: Error | null
}

export type ListOptions = {
  storeId?: string | null
}

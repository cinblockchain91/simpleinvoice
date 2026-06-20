export interface PaginationParams {
  readonly page: number;
  readonly pageSize: number;
}

export interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

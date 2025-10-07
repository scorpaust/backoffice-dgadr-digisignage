export interface EntityBase {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee extends EntityBase {
  name: string;
  startYear: string;
  startDate: string;
  endDate?: string;
  department?: string;
}

export interface NewsItem extends EntityBase {
  title: string;
}

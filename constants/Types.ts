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

export interface ImageItem extends EntityBase {
  name: string;
  url: string;
  path: string;
  size: number;
  type: string;
}

export interface Newsletter extends EntityBase {
  name: string;
  displayName: string;
  color: string;
  issues?: { [key: string]: NewsletterIssue };
}

export interface NewsletterIssue extends EntityBase {
  title: string;
  description: string;
  publishedAt: string;
  url: string;
  coverImagePath: string;
}

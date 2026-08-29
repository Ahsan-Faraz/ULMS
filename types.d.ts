interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  totalCopies: number;
  availableCopies: number;
  description: string;
  coverColor: string;
  coverUrl: string;
  videoUrl: string;
  isbn?: string | null;
  summary: string;
  createdAt?: Date | null;
  isLoanedBook?: boolean;
  borrowId?: string;
  dueDate?: string | Date | null;
  borrowDate?: string | Date | null;
  returnDate?: string | Date | null;
  borrowStatus?: "BORROWED" | "RETURNED";
  renewed?: boolean;
}

interface AuthCredentials {
  fullName: string;
  email: string;
  password: string;
  universityId: number;
  universityCard: string;
}

interface BookParams {
  title: string;
  author: string;
  genre: string;
  rating: number;
  coverUrl: string;
  coverColor: string;
  description: string;
  totalCopies: number;
  videoUrl: string;
  isbn?: string;
  summary: string;
}

interface BorrowBookParams {
  bookId: string;
  userId: string;
}

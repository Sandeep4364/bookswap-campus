-- Create books table with proper structure
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  course_code TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  condition TEXT NOT NULL,
  listing_type TEXT NOT NULL, -- 'sell', 'exchange', 'free'
  price DECIMAL(10,2),
  description TEXT,
  location TEXT NOT NULL,
  contact_method TEXT DEFAULT 'platform',
  images TEXT[], -- Array of image URLs
  verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active', -- 'active', 'sold', 'removed'
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Create policies for books
CREATE POLICY "Books are viewable by everyone" 
ON public.books 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can create their own books" 
ON public.books 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books" 
ON public.books 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books" 
ON public.books 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create book verification requests table
CREATE TABLE public.book_verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_type TEXT NOT NULL, -- 'isbn_verification', 'manual_verification'
  verification_data JSONB,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for verification requests
ALTER TABLE public.book_verification_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for verification requests
CREATE POLICY "Users can view their own verification requests" 
ON public.book_verification_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create verification requests for their books" 
ON public.book_verification_requests 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM public.books WHERE id = book_id AND user_id = auth.uid())
);

-- Create trigger for verification requests timestamp updates
CREATE TRIGGER update_verification_requests_updated_at
BEFORE UPDATE ON public.book_verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_books_category ON public.books(category);
CREATE INDEX idx_books_user_id ON public.books(user_id);
CREATE INDEX idx_books_status ON public.books(status);
CREATE INDEX idx_books_listing_type ON public.books(listing_type);
CREATE INDEX idx_verification_requests_book_id ON public.book_verification_requests(book_id);
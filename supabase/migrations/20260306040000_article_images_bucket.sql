-- Create public bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view images (public bucket)
CREATE POLICY "article_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'article-images');

-- Authenticated users can upload images
CREATE POLICY "article_images_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images');

-- Users can delete their own uploads (path starts with user_id/)
CREATE POLICY "article_images_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'article-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

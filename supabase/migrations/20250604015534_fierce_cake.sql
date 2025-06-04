/*
  # Create function to get popular products

  Creates a stored procedure that returns the most interacted with products,
  grouped by product_id and ordered by interaction count.
*/

CREATE OR REPLACE FUNCTION get_popular_products(limit_count integer)
RETURNS TABLE (
  product_id uuid,
  interaction_count bigint
) 
LANGUAGE SQL
AS $$
  SELECT 
    product_id,
    COUNT(*) as interaction_count
  FROM user_interactions
  GROUP BY product_id
  ORDER BY interaction_count DESC
  LIMIT limit_count;
$$;
-- Step 1: Add the title column (nullable first)
ALTER TABLE conversations 
ADD COLUMN title VARCHAR(255);

-- Step 2: Generate titles for existing conversations
WITH numbered_conversations AS (
  SELECT 
    c.id,
    c.is_ai_chat,
    c.created_at,
    CASE 
      WHEN c.is_ai_chat THEN 'Lari'
      ELSE COALESCE(
        (SELECT u.nickname 
         FROM conversation_participants cp
         JOIN users u ON u.id = cp.user_id
         WHERE cp.conversation_id = c.id
         LIMIT 1),
        'Unknown'
      )
    END AS base_title,
    ROW_NUMBER() OVER (
      PARTITION BY 
        CASE 
          WHEN c.is_ai_chat THEN 'Lari'
          ELSE COALESCE(
            (SELECT u.nickname 
             FROM conversation_participants cp
             JOIN users u ON u.id = cp.user_id
             WHERE cp.conversation_id = c.id
             LIMIT 1),
            'Unknown'
          )
        END,
        DATE(c.created_at)
      ORDER BY c.created_at
    ) as seq
  FROM conversations c
  WHERE c.title IS NULL
)
UPDATE conversations c
SET title = CASE 
  WHEN nc.seq = 1 THEN nc.base_title || ' - ' || TO_CHAR(nc.created_at, 'MM/DD/YYYY')
  ELSE nc.base_title || ' - ' || TO_CHAR(nc.created_at, 'MM/DD/YYYY') || ' (' || nc.seq || ')'
END
FROM numbered_conversations nc
WHERE c.id = nc.id;

-- Step 3: Set NOT NULL constraint
ALTER TABLE conversations 
ALTER COLUMN title SET NOT NULL;

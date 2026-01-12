-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    text VARCHAR(500) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE
    ON todos FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data from your existing database.json
INSERT INTO todos (id, text, completed) VALUES
    (1, 'Buy groceries', true),
    (2, 'Finish project updated', true),
    (3, 'Go to the gym', true)
ON CONFLICT DO NOTHING;

-- Reset the sequence to start from the max ID + 1
SELECT setval('todos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM todos), true);


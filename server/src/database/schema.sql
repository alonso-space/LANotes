CREATE TABLE IF NOT EXISTS roles (
    id_role SERIAL PRIMARY KEY,
    role_name VARCHAR(25) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id_user SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL,
    bio TEXT,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id)
        REFERENCES roles(id_role)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS notes (
    id_note SERIAL PRIMARY KEY,
    note_name VARCHAR(100) NOT NULL,
    note_content TEXT,
    author_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    public BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (author_id)
        REFERENCES users(id_user)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites (
    id_favorite SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    note_id INTEGER NOT NULL,

    UNIQUE (user_id, note_id),

    FOREIGN KEY (user_id)
        REFERENCES users(id_user)
        ON DELETE CASCADE,

    FOREIGN KEY (note_id)
        REFERENCES notes(id_note)
        ON DELETE CASCADE
);

INSERT INTO roles (role_name)
VALUES
    ('owner'),
    ('admin'),
    ('member')
ON CONFLICT (role_name) DO NOTHING;
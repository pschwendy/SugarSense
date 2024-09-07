CREATE USER clarify WITH PASSWORD 'supersecretpassword';

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO clarify;
CREATE TABLE learning_data (
    pk serial PRIMARY KEY,
    access_token VARCHAR(760),
    refresh_token VARCHAR(35),
    events jsonb,
    egvs jsonb,
    labels jsonb,
    access_time TIMESTAMP
);
GRANT ALL PRIVILEGES ON TABLE learning_data TO clarify;

/* TODO: look into refresh token backlogging
CREATE TABLE refresh_tokens (
    pk INT NOT NULL,
    token VARCHAR(35) NOT NULL,
    refresh_time TIMESTAMP NOT NULL,
);
*/
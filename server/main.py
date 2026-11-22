"""
SoulSync API (our own server, made with Python FastAPI)

It runs in 2 places, with the same code:

1. On a laptop (for testing), inside the server folder:
       uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   Data is saved in soulsync.db (SQLite = a database inside one file).

2. Online on Render, 24/7, so the app works without a laptop.
   There, the DATABASE_URL setting points to a Neon Postgres database,
   because Render's free servers forget their files on every restart.

Open /docs in a browser to see and try every endpoint.
Uploaded photos are saved inside the database (photos table).
"""

import base64
import binascii
import hashlib
import json
import os
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

HERE = Path(__file__).parent
DB_FILE = HERE / "soulsync.db"
UPLOADS = HERE / "uploads"  # old photos from before photos moved into the database
TEAM_PHOTOS = HERE.parent / "assets" / "team"  # the same photos the app already has

# Online (Render): DATABASE_URL = the Neon Postgres address. Laptop: not set -> SQLite.
DATABASE_URL = os.environ.get("DATABASE_URL")
USE_POSTGRES = bool(DATABASE_URL)

PH_TIME = timezone(timedelta(hours=8))  # Philippine time (online servers use UTC)

UPLOADS.mkdir(exist_ok=True)

app = FastAPI(title="SoulSync API")

# Let the app (and the web version) call this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Photos: /photos/abc.jpg (from the database), /team/jastin.jpg (files), /uploads/abc.jpg (old files)
app.mount("/uploads", StaticFiles(directory=UPLOADS), name="uploads")
if TEAM_PHOTOS.exists():
    app.mount("/team", StaticFiles(directory=TEAM_PHOTOS), name="team")


# ---------------------------------------------------------------- database

def now() -> str:
    """The time right now in the Philippines, as text: "2026-11-22T15:07:00"."""
    return datetime.now(PH_TIME).replace(tzinfo=None).isoformat(timespec="seconds")


class Row(tuple):
    """A Postgres row you can read like SQLite's: row["email"] or row[0]."""

    def __new__(cls, values, names):
        row = super().__new__(cls, values)
        row.names = names
        return row

    def __getitem__(self, key):
        if isinstance(key, str):
            key = self.names.index(key)
        return tuple.__getitem__(self, key)


def postgres_rows(cursor):
    names = [column.name for column in cursor.description or []]
    return lambda values: Row(values, names)


class Connection:
    """The same conn.execute("... WHERE id = ?", (1,)) for SQLite and Postgres.
    Postgres writes its placeholders as %s instead of ?, so we swap them."""

    def __init__(self, raw):
        self.raw = raw

    def execute(self, sql, params=None):
        if USE_POSTGRES:
            sql = sql.replace("?", "%s")
        return self.raw.execute(sql, params) if params is not None else self.raw.execute(sql)


if USE_POSTGRES:
    from psycopg_pool import ConnectionPool

    # A few connections that stay open, so each request doesn't wait for a new one
    pool = ConnectionPool(
        DATABASE_URL,
        min_size=1,
        max_size=5,
        kwargs={"row_factory": postgres_rows},
        check=ConnectionPool.check_connection,  # Neon closes idle connections; test before use
    )


@contextmanager
def db():
    """with db() as conn: ... -> saves everything at the end, or nothing if there was an error."""
    if USE_POSTGRES:
        with pool.connection() as raw:
            yield Connection(raw)
            raw.commit()
        return
    raw = sqlite3.connect(DB_FILE)
    raw.row_factory = sqlite3.Row
    raw.execute("PRAGMA foreign_keys = ON")
    try:
        yield Connection(raw)
        raw.commit()
    except Exception:
        raw.rollback()
        raise
    finally:
        raw.close()


def hash_password(password: str) -> str:
    # never save the real password, only a scrambled version of it
    return hashlib.sha256(("soulsync:" + password).encode()).hexdigest()


# What a brand-new user looks like before onboarding
DEFAULT_PROFILE = {
    "name": None,
    "age": None,
    "gender": None,
    "birthday": None,
    "showMe": "Everyone",
    "lookingFor": [],
    "title": "New on SoulSync",
    "location": "Cagayan de Oro, PH",
    "bio": "New to SoulSync. Say hi!",
    "avatar": None,  # profile picture
    "photos": [],  # up to 5 extra photos
    "tags": [],  # interests
    "prompts": [],
    "verified": False,
    "verificationPhoto": None,  # selfie from the front camera
    "latitude": None,  # GPS location (sent by the app)
    "longitude": None,
    "hideLocation": False,  # True = not on anyone's map, no distance shown
    "onboarded": False,  # True after the 3 onboarding steps
}

# Where our group mates are on the map (places around CDO)
TEAM_SPOTS = {
    "redeemer@gmail.com": (8.4859, 124.6569),  # USTP-CDO
    "jastin@gmail.com": (8.4816, 124.6539),  # Limketkai Center
    "jennifer@gmail.com": (8.4851, 124.6512),  # Ayala Centrio
    "shenaiah@gmail.com": (8.4563, 124.6243),  # SM CDO Uptown
    "tthrystan@gmail.com": (8.4843, 124.6545),  # SM CDO Downtown Premier
}

# Our group mates (added the first time the server starts)
TEAM = [
    ("redeemer", "redeemer@gmail.com", "123456", {
        "name": "Redeemer", "age": 22, "gender": "Man",
        "avatar": "/team/redeemer.jpg", "tags": ["Coding", "Coffee", "Gaming"],
        "bio": "Group creator and part-time bug hunter. Fueled by coffee and one more console.log.",
        "prompts": [{"question": "A perfect Sunday looks like",
                     "answer": "Zero errors in the terminal and a very long nap."}],
    }),
    ("jastin", "jastin@gmail.com", "jastin123", {
        "name": "Jastin", "age": 23, "gender": "Man",
        "avatar": "/team/jastin.jpg", "tags": ["Tech", "Music", "Late Night"],
        "bio": "Code by day, snacks by night. Ask me about my git commits (I will say 'fix').",
        "prompts": [{"question": "My most controversial opinion",
                     "answer": "Tabs are better than spaces, fight me."}],
    }),
    ("jennifer", "jennifer@gmail.com", "jennifer123", {
        "name": "Jennifer", "age": 22, "gender": "Woman",
        "avatar": "/team/barnedo.jpg", "tags": ["Design", "Movies", "Coffee"],
        "bio": "Professional deadline survivor. Will trade my notes for good conversation.",
        "prompts": [{"question": "I'll know it's a match when",
                     "answer": "You also say 'five more minutes' and mean it."}],
    }),
    ("shenaiah", "shenaiah@gmail.com", "shenaiah123", {
        "name": "Shenaiah", "age": 24, "gender": "Woman",
        "avatar": "/team/sabana.jpg", "tags": ["Travel", "Photography", "Music"],
        "bio": "Here for the good vibes and the group projects that somehow work out.",
        "prompts": [{"question": "The best way to win me over is",
                     "answer": "Bring snacks to our group meeting."}],
    }),
    ("tthrystan", "tthrystan@gmail.com", "tthrystan123", {
        "name": "Tthrystan", "age": 23, "gender": "Man",
        "avatar": "/team/amomas.jpeg", "tags": ["Gaming", "Tech", "Fitness"],
        "bio": "Calm on the outside, debugging on the inside. Always down for a quick game after class.",
        "prompts": [{"question": "Together we could",
                     "answer": "Win the group project and the late-night game."}],
    }),
]


# The tables. {ID} and {BYTES} are filled in for SQLite or Postgres.
SCHEMA = """
    CREATE TABLE IF NOT EXISTS users (
        id {ID},
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        profile TEXT NOT NULL            -- all profile fields as JSON
    );
    CREATE TABLE IF NOT EXISTS likes (
        from_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        to_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT,
        seen INTEGER NOT NULL DEFAULT 0, -- 1 = they saw the "X liked you" notification
        PRIMARY KEY (from_id, to_id)
    );
    CREATE TABLE IF NOT EXISTS blocks (
        from_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        to_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT,
        PRIMARY KEY (from_id, to_id)
    );
    CREATE TABLE IF NOT EXISTS messages (
        id {ID},
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        image TEXT,                      -- photo sent in chat (or NULL)
        created_at TEXT NOT NULL,
        read_at TEXT                     -- when the other person opened the chat
    );
    CREATE TABLE IF NOT EXISTS reactions (
        message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reaction TEXT NOT NULL,          -- love, like, haha, wow, sad, angry
        PRIMARY KEY (message_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS chat_clears (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        other_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_id INTEGER NOT NULL,        -- I deleted the chat up to this message id
        PRIMARY KEY (user_id, other_id)
    );
    CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,             -- /photos/<id>.jpg
        mime TEXT NOT NULL,              -- image/jpeg, image/png, image/webp
        data {BYTES} NOT NULL,           -- the photo itself
        created_at TEXT
    );
"""


def add_missing_columns(conn):
    """Laptop databases made with older versions of SoulSync miss some columns."""
    wanted = {
        "messages": [("image", "TEXT"), ("read_at", "TEXT")],
        "likes": [("created_at", "TEXT"), ("seen", "INTEGER NOT NULL DEFAULT 0")],
        "blocks": [("created_at", "TEXT")],
    }
    for table, columns in wanted.items():
        have = [c["name"] for c in conn.execute(f"PRAGMA table_info({table})")]
        for name, kind in columns:
            if name not in have:
                conn.execute(f"ALTER TABLE {table} ADD COLUMN {name} {kind}")


def setup_database():
    with db() as conn:
        if USE_POSTGRES:
            conn.execute(SCHEMA.format(ID="SERIAL PRIMARY KEY", BYTES="BYTEA"))
        else:
            conn.raw.executescript(SCHEMA.format(ID="INTEGER PRIMARY KEY AUTOINCREMENT", BYTES="BLOB"))
            add_missing_columns(conn)

        # Old databases: give our group mates their map spot if they have none yet
        for email, (lat, lng) in TEAM_SPOTS.items():
            row = conn.execute("SELECT id, profile FROM users WHERE email = ?", (email,)).fetchone()
            if row:
                profile = json.loads(row["profile"])
                if profile.get("latitude") is None:
                    profile["latitude"], profile["longitude"] = lat, lng
                    conn.execute("UPDATE users SET profile = ? WHERE id = ?", (json.dumps(profile), row["id"]))

        # Brand new (empty) database: add the 5 team accounts once
        empty = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0
        if empty:
            for account in TEAM:
                add_team_account(conn, *account)


def add_team_account(conn, username, email, password, fields):
    """Insert one of the hard-coded team accounts (see TEAM above)."""
    lat, lng = TEAM_SPOTS[email]
    profile = {
        **DEFAULT_PROFILE, "title": "BSIT Student", **fields,
        "latitude": lat, "longitude": lng, "onboarded": True,
    }
    conn.execute(
        "INSERT INTO users (username, email, password_hash, profile) VALUES (?, ?, ?, ?)",
        (username, email, hash_password(password), json.dumps(profile)),
    )


def restore_team() -> list:
    """Bring back only the team accounts that were deleted.
    Everyone else (and their chats, likes, photos) stays untouched."""
    restored = []
    with db() as conn:
        for account in TEAM:
            email = account[1]
            if conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone() is None:
                add_team_account(conn, *account)
                restored.append(account[3]["name"])
    return restored


setup_database()


def to_json(row, public=False) -> dict:
    """A user row from the database -> the JSON the app gets (no password).
    public=True: for OTHER people's eyes, so a hidden location is not sent."""
    profile = {**DEFAULT_PROFILE, **json.loads(row["profile"])}
    if public and profile["hideLocation"]:
        profile["latitude"] = profile["longitude"] = None
    images = [p for p in [profile["avatar"], *profile["photos"]] if p]
    return {
        "id": str(row["id"]),
        "username": row["username"],
        "email": row["email"],
        **profile,
        "images": images,  # profile picture first, then the extra photos
    }


def get_user_row(conn, user_id):
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return row


# ---------------------------------------------------------------- request bodies

class RegisterBody(BaseModel):
    username: str
    email: str
    password: str


class LoginBody(BaseModel):
    email: str
    password: str


class LikesSeenBody(BaseModel):
    user_id: int  # me
    from_ids: list[int]  # the people whose likes I saw


class ReadBody(BaseModel):
    reader_id: int  # me
    other_id: int  # the person whose messages I just read


class DeleteAccountBody(BaseModel):
    password: str


class InterestsBody(BaseModel):
    tags: list[str]  # the COMPLETE new list of interests


class PasswordBody(BaseModel):
    current_password: str
    new_password: str


class PairBody(BaseModel):
    from_id: int
    to_id: int


class MessageBody(BaseModel):
    sender_id: int
    receiver_id: int
    text: str = ""
    image: str | None = None  # "/uploads/abc.jpg" when sending a photo


class ReactionBody(BaseModel):
    user_id: int
    reaction: str  # love, like, haha, wow, sad, angry


REACTIONS = {"love", "like", "haha", "wow", "sad", "angry"}


class PhotoBody(BaseModel):
    data: str  # the photo as text: "data:image/jpeg;base64,/9j/4AAQ..."


# Fields the app is allowed to change with PATCH /users/{id}
EDITABLE = set(DEFAULT_PROFILE.keys())


# ---------------------------------------------------------------- endpoints

@app.get("/")
def home():
    return {"message": "SoulSync API is running. Open /docs to try it."}


# ---- accounts

@app.post("/register", status_code=201)
def register(body: RegisterBody):
    email = body.email.strip().lower()
    with db() as conn:
        if conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone():
            raise HTTPException(status_code=409, detail="An account with this email already exists.")
        new_id = conn.execute(
            "INSERT INTO users (username, email, password_hash, profile) VALUES (?, ?, ?, ?) RETURNING id",
            (body.username.strip(), email, hash_password(body.password), json.dumps(DEFAULT_PROFILE)),
        ).fetchone()[0]
        return to_json(get_user_row(conn, new_id))


@app.post("/login")
def login(body: LoginBody):
    with db() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ? AND password_hash = ?",
            (body.email.strip().lower(), hash_password(body.password)),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=401, detail="Incorrect email or password.")
        return to_json(row)


@app.post("/users/{user_id}/password")
def change_password(user_id: int, body: PasswordBody):
    """Settings -> Change password. The current password must be correct."""
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")
    with db() as conn:
        row = get_user_row(conn, user_id)
        if row["password_hash"] != hash_password(body.current_password):
            raise HTTPException(status_code=400, detail="Your current password is incorrect.")
        if body.current_password == body.new_password:
            raise HTTPException(status_code=400, detail="New password must be different from the current one.")
        conn.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            (hash_password(body.new_password), user_id),
        )
        return {"changed": True}


@app.post("/users/{user_id}/delete-account")
def delete_account(user_id: int, body: DeleteAccountBody):
    """Settings -> Delete account. Needs the password. Removes the profile,
    likes, blocks, messages, reactions (ON DELETE CASCADE) and uploaded photos."""
    with db() as conn:
        row = get_user_row(conn, user_id)
        if row["password_hash"] != hash_password(body.password):
            raise HTTPException(status_code=400, detail="Your password is incorrect.")
        profile = {**DEFAULT_PROFILE, **json.loads(row["profile"])}
        files = [profile["avatar"], profile["verificationPhoto"], *profile["photos"]]
        files += [r[0] for r in conn.execute(
            "SELECT image FROM messages WHERE sender_id = ? AND image IS NOT NULL", (user_id,)
        )]
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        # delete this user's photos from the database
        for path in files:
            if isinstance(path, str) and path.startswith("/photos/"):
                conn.execute("DELETE FROM photos WHERE id = ?", (photo_id(path),))
    # old photos (before the photos table) are files in the uploads folder
    for path in files:
        if isinstance(path, str) and path.startswith("/uploads/"):
            (UPLOADS / Path(path).name).unlink(missing_ok=True)
    return {"deleted": True, "id": str(user_id)}


# ---- users (CRUD)

@app.get("/users")
def list_users():
    """Everyone who finished onboarding (the app hides you and blocked people)."""
    with db() as conn:
        rows = conn.execute("SELECT * FROM users ORDER BY id").fetchall()
        users = [to_json(row, public=True) for row in rows]
        return [user for user in users if user["onboarded"]]


@app.get("/users/{user_id}")
def get_user(user_id: int):
    with db() as conn:
        return to_json(get_user_row(conn, user_id))


@app.patch("/users/{user_id}")
def update_user(user_id: int, changes: dict):
    with db() as conn:
        row = get_user_row(conn, user_id)
        profile = {**DEFAULT_PROFILE, **json.loads(row["profile"])}
        for key, value in changes.items():
            if key in EDITABLE:
                profile[key] = value
        profile["photos"] = (profile["photos"] or [])[:5]  # max 5 extra photos
        conn.execute("UPDATE users SET profile = ? WHERE id = ?", (json.dumps(profile), user_id))
        return to_json(get_user_row(conn, user_id))


# PUT vs PATCH:
#   PATCH /users/{id}           -> change only the fields you send (the rest stays)
#   PUT   /users/{id}/interests -> REPLACE the whole interests list with a new one
@app.put("/users/{user_id}/interests")
def replace_interests(user_id: int, body: InterestsBody):
    tags = [t.strip() for t in body.tags if t.strip()]
    if len(tags) < 3:
        raise HTTPException(status_code=400, detail="Pick at least 3 interests.")
    with db() as conn:
        row = get_user_row(conn, user_id)
        profile = {**DEFAULT_PROFILE, **json.loads(row["profile"])}
        profile["tags"] = tags[:10]  # max 10 interests
        conn.execute("UPDATE users SET profile = ? WHERE id = ?", (json.dumps(profile), user_id))
        return to_json(get_user_row(conn, user_id))


# ---- photos

# The app uses this one: the photo comes as base64 text inside normal JSON,
# so it works the same on Android, iPhone and web.
@app.post("/upload-base64", status_code=201)
def upload_photo_base64(body: PhotoBody):
    header, _, encoded = body.data.partition(",")
    if not encoded:  # sent without the "data:image/...;base64," part
        header, encoded = "", body.data
    try:
        photo_bytes = base64.b64decode(encoded, validate=True)
    except (binascii.Error, ValueError):
        raise HTTPException(status_code=400, detail="That photo could not be read.")
    if not photo_bytes:
        raise HTTPException(status_code=400, detail="The photo is empty.")
    if len(photo_bytes) > MAX_PHOTO_BYTES:
        raise HTTPException(status_code=413, detail="That photo is too big (max 8 MB).")
    ext, mime = (".png", "image/png") if "png" in header else \
        (".webp", "image/webp") if "webp" in header else (".jpg", "image/jpeg")
    new_id = uuid.uuid4().hex
    with db() as conn:
        conn.execute(
            "INSERT INTO photos (id, mime, data, created_at) VALUES (?, ?, ?, ?)",
            (new_id, mime, photo_bytes, now()),
        )
    return {"url": f"/photos/{new_id}{ext}"}


MAX_PHOTO_BYTES = 8 * 1024 * 1024


def photo_id(path: str) -> str:
    """"/photos/abc123.jpg" -> "abc123" """
    return Path(path).stem


@app.get("/photos/{name}")
def get_photo(name: str):
    """Send a photo saved in the database. It never changes, so phones can cache it."""
    with db() as conn:
        row = conn.execute("SELECT mime, data FROM photos WHERE id = ?", (photo_id(name),)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Photo not found.")
    return Response(
        content=bytes(row["data"]),
        media_type=row["mime"],
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


# ---- likes

def is_match(conn, a, b) -> bool:
    """A match = both liked each other."""
    count = conn.execute(
        "SELECT COUNT(*) FROM likes WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)",
        (a, b, b, a),
    ).fetchone()[0]
    return count == 2


def is_blocked(conn, a, b) -> bool:
    """True if one of them blocked the other."""
    return conn.execute(
        "SELECT 1 FROM blocks WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)",
        (a, b, b, a),
    ).fetchone() is not None


@app.get("/users/{user_id}/likes")
def get_likes(user_id: int):
    """liked = people I liked, likedBy = people who liked me,
    requests = people who liked me and I have NOT liked back yet (the notifications)."""
    with db() as conn:
        liked = [str(r[0]) for r in conn.execute("SELECT to_id FROM likes WHERE from_id = ?", (user_id,))]
        liked_by = [str(r[0]) for r in conn.execute("SELECT from_id FROM likes WHERE to_id = ?", (user_id,))]
        rows = conn.execute(
            """SELECT from_id, created_at, seen FROM likes
               WHERE to_id = ?
                 AND from_id NOT IN (SELECT to_id FROM likes WHERE from_id = ?)
                 AND from_id NOT IN (SELECT to_id FROM blocks WHERE from_id = ?)
                 AND from_id NOT IN (SELECT from_id FROM blocks WHERE to_id = ?)
               ORDER BY created_at DESC""",
            (user_id, user_id, user_id, user_id),
        ).fetchall()
        requests = [
            {"fromId": str(r["from_id"]), "createdAt": r["created_at"], "seen": bool(r["seen"])}
            for r in rows
        ]
        return {"liked": liked, "likedBy": liked_by, "requests": requests}


@app.post("/likes", status_code=201)
def add_like(body: PairBody):
    with db() as conn:
        conn.execute(
            "INSERT INTO likes (from_id, to_id, created_at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
            (body.from_id, body.to_id, now()),
        )
        return {
            "from_id": str(body.from_id),
            "to_id": str(body.to_id),
            "match": is_match(conn, body.from_id, body.to_id),  # did they already like me?
        }


@app.post("/likes/seen")
def mark_likes_seen(body: LikesSeenBody):
    """I saw the "X liked you" notification (pop-up "Later" or opened the bell list)."""
    with db() as conn:
        marks = ",".join("?" * len(body.from_ids)) or "NULL"
        conn.execute(
            f"UPDATE likes SET seen = 1 WHERE to_id = ? AND from_id IN ({marks})",
            [body.user_id, *body.from_ids],
        )
        return {"seen": len(body.from_ids)}


@app.delete("/likes/{from_id}/{to_id}")
def remove_like(from_id: int, to_id: int):
    with db() as conn:
        conn.execute("DELETE FROM likes WHERE from_id = ? AND to_id = ?", (from_id, to_id))
        return {"deleted": True}


# ---- blocks

@app.get("/users/{user_id}/blocks")
def get_blocks(user_id: int):
    """hidden = people I blocked + people who blocked me."""
    with db() as conn:
        rows = conn.execute(
            "SELECT to_id FROM blocks WHERE from_id = ? UNION SELECT from_id FROM blocks WHERE to_id = ?",
            (user_id, user_id),
        )
        return {"hidden": [str(r[0]) for r in rows]}


@app.get("/users/{user_id}/blocked")
def get_blocked(user_id: int):
    """Only the people I blocked (Settings -> Blocked users)."""
    with db() as conn:
        rows = conn.execute(
            "SELECT to_id FROM blocks WHERE from_id = ? ORDER BY created_at DESC NULLS LAST, to_id",
            (user_id,),
        )
        return {"blocked": [str(r[0]) for r in rows]}


@app.delete("/blocks/{from_id}/{to_id}")
def unblock_user(from_id: int, to_id: int):
    """Unblock. Old likes are not restored: it is a fresh start."""
    with db() as conn:
        conn.execute("DELETE FROM blocks WHERE from_id = ? AND to_id = ?", (from_id, to_id))
        return {"deleted": True}


@app.post("/blocks", status_code=201)
def block_user(body: PairBody):
    """Block = fresh start: my like is removed and the chat is deleted for me
    (the other person still has their copy)."""
    with db() as conn:
        conn.execute(
            "INSERT INTO blocks (from_id, to_id, created_at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
            (body.from_id, body.to_id, now()),
        )
        conn.execute("DELETE FROM likes WHERE from_id = ? AND to_id = ?", (body.from_id, body.to_id))
        clear_chat(conn, body.from_id, body.to_id)
        return {"from_id": str(body.from_id), "to_id": str(body.to_id)}


# ---- messages

def message_json(row, reactions=None) -> dict:
    created = datetime.fromisoformat(row["created_at"])
    return {
        "id": str(row["id"]),
        "senderId": str(row["sender_id"]),
        "receiverId": str(row["receiver_id"]),
        "text": row["text"],
        "image": row["image"],
        "reactions": reactions or {},  # { "userId": "love", ... }
        "seen": row["read_at"] is not None,  # the receiver opened the chat
        "createdAt": row["created_at"],
        "time": created.strftime("%I:%M %p").lstrip("0"),  # "3:07 PM"
    }


def get_reactions(conn, message_ids) -> dict:
    """{ message id: { user id: reaction } } for the given messages."""
    result = {}
    if not message_ids:
        return result
    marks = ",".join("?" * len(message_ids))
    rows = conn.execute(
        f"SELECT * FROM reactions WHERE message_id IN ({marks})", list(message_ids)
    )
    for r in rows:
        result.setdefault(r["message_id"], {})[str(r["user_id"])] = r["reaction"]
    return result


def get_message_row(conn, message_id):
    row = conn.execute("SELECT * FROM messages WHERE id = ?", (message_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Message not found.")
    return row


def cleared_up_to(conn, user_id, other_id) -> int:
    """'Delete chat' only hides old messages for ME. Messages with an id up to
    this number are hidden from me. 0 = I never deleted this chat."""
    row = conn.execute(
        "SELECT last_id FROM chat_clears WHERE user_id = ? AND other_id = ?", (user_id, other_id)
    ).fetchone()
    return row["last_id"] if row else 0


def clear_chat(conn, user_id, other_id) -> bool:
    """Hide every message so far between us, only for user_id.
    Returns False when there were no messages."""
    last = conn.execute(
        """SELECT MAX(id) FROM messages
           WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)""",
        (user_id, other_id, other_id, user_id),
    ).fetchone()[0]
    if last is None:
        return False
    conn.execute(
        """INSERT INTO chat_clears (user_id, other_id, last_id) VALUES (?, ?, ?)
           ON CONFLICT (user_id, other_id) DO UPDATE SET last_id = excluded.last_id""",
        (user_id, other_id, last),
    )
    # their old messages no longer count as unread for me
    conn.execute(
        "UPDATE messages SET read_at = ? WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL",
        (now(), other_id, user_id),
    )
    return True


@app.get("/messages")
def get_messages(user_a: int, user_b: int):
    """The conversation between two people, oldest first, as user_a sees it."""
    with db() as conn:
        rows = conn.execute(
            """SELECT * FROM messages
               WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
                 AND id > ?
               ORDER BY id""",
            (user_a, user_b, user_b, user_a, cleared_up_to(conn, user_a, user_b)),
        ).fetchall()
        reactions = get_reactions(conn, [r["id"] for r in rows])
        return [message_json(r, reactions.get(r["id"])) for r in rows]


@app.post("/messages", status_code=201)
def send_message(body: MessageBody):
    text = body.text.strip()
    image = body.image or None
    if not text and not image:
        raise HTTPException(status_code=400, detail="Message is empty.")
    me, other = body.sender_id, body.receiver_id
    with db() as conn:
        receiver = get_user_row(conn, other)
        name = json.loads(receiver["profile"]).get("name") or "them"
        if is_blocked(conn, me, other):
            raise HTTPException(status_code=403, detail="You can't message this person.")
        # Message requests: not a match yet?
        if not is_match(conn, me, other):
            they_wrote = conn.execute(
                "SELECT 1 FROM messages WHERE sender_id = ? AND receiver_id = ?", (other, me)
            ).fetchone()
            i_wrote = conn.execute(
                "SELECT 1 FROM messages WHERE sender_id = ? AND receiver_id = ?", (me, other)
            ).fetchone()
            if they_wrote:
                raise HTTPException(status_code=403, detail=f"Like {name} back to reply.")
            if i_wrote:
                raise HTTPException(
                    status_code=403,
                    detail=f"You can send more messages after {name} likes you back.",
                )
            # first message = a message request, and it also counts as liking them
            conn.execute(
                "INSERT INTO likes (from_id, to_id, created_at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
                (me, other, now()),
            )
        new_id = conn.execute(
            """INSERT INTO messages (sender_id, receiver_id, text, image, created_at)
               VALUES (?, ?, ?, ?, ?) RETURNING id""",
            (body.sender_id, body.receiver_id, text, image, now()),
        ).fetchone()[0]
        row = conn.execute("SELECT * FROM messages WHERE id = ?", (new_id,)).fetchone()
        return message_json(row)


# ---- unread / seen

@app.post("/messages/read")
def mark_read(body: ReadBody):
    """I opened the chat: all messages the other person sent me are now 'seen'."""
    with db() as conn:
        cursor = conn.execute(
            "UPDATE messages SET read_at = ? WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL",
            (now(), body.other_id, body.reader_id),
        )
        return {"marked": cursor.rowcount}


# ---- reactions (long press a message: love, like, haha, wow, sad, angry)

@app.post("/messages/{message_id}/reactions", status_code=201)
def react_to_message(message_id: int, body: ReactionBody):
    """One reaction per person per message: reacting again replaces the old one."""
    if body.reaction not in REACTIONS:
        raise HTTPException(status_code=400, detail="Unknown reaction.")
    with db() as conn:
        row = get_message_row(conn, message_id)
        conn.execute(
            """INSERT INTO reactions (message_id, user_id, reaction) VALUES (?, ?, ?)
               ON CONFLICT (message_id, user_id) DO UPDATE SET reaction = excluded.reaction""",
            (message_id, body.user_id, body.reaction),
        )
        return message_json(row, get_reactions(conn, [message_id]).get(message_id))


@app.delete("/messages/{message_id}/reactions/{user_id}")
def remove_reaction(message_id: int, user_id: int):
    with db() as conn:
        row = get_message_row(conn, message_id)
        conn.execute("DELETE FROM reactions WHERE message_id = ? AND user_id = ?", (message_id, user_id))
        return message_json(row, get_reactions(conn, [message_id]).get(message_id))


@app.delete("/messages/{message_id}")
def delete_message(message_id: int):
    with db() as conn:
        conn.execute("DELETE FROM messages WHERE id = ?", (message_id,))
        return {"deleted": True, "id": str(message_id)}


@app.delete("/users/{user_id}/chats/{other_id}")
def delete_chat(user_id: int, other_id: int):
    """Long press a chat -> Delete. Hides the whole chat for ME only:
    the other person still has it, the match stays, and a new message
    brings the chat back."""
    with db() as conn:
        if not clear_chat(conn, user_id, other_id):
            raise HTTPException(status_code=404, detail="There is no chat to delete.")
        return {"deleted": True, "otherId": str(other_id)}


@app.get("/users/{user_id}/inbox")
def get_inbox(user_id: int):
    """One item per person I have messages with: the newest message, newest first.
    Chats I deleted are skipped (until someone sends a new message)."""
    with db() as conn:
        rows = conn.execute(
            """SELECT * FROM messages WHERE id IN (
                   SELECT MAX(m.id) FROM messages m
                   LEFT JOIN chat_clears c ON c.user_id = ?
                        AND c.other_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
                   WHERE (m.sender_id = ? OR m.receiver_id = ?) AND m.id > COALESCE(c.last_id, 0)
                   GROUP BY CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
               ) ORDER BY id DESC""",
            (user_id, user_id, user_id, user_id, user_id),
        ).fetchall()
        unread = dict(conn.execute(
            """SELECT sender_id, COUNT(*) FROM messages
               WHERE receiver_id = ? AND read_at IS NULL GROUP BY sender_id""",
            (user_id,),
        ).fetchall())
        inbox = []
        for row in rows:
            other = row["receiver_id"] if row["sender_id"] == user_id else row["sender_id"]
            inbox.append({
                "otherId": str(other),
                "lastMessage": message_json(row),
                "unread": unread.get(other, 0),  # messages from them I haven't read
            })
        return inbox


# ---- command line
# python main.py --restore-team  -> bring back deleted team accounts
if __name__ == "__main__":
    import sys

    if "--restore-team" in sys.argv:
        names = restore_team()
        if names:
            print("Restored: " + ", ".join(names))
        else:
            print("All 5 team accounts are already here. Nothing to restore.")
    else:
        print("Start the server with: uvicorn main:app --host 0.0.0.0 --port 8000")
        print("Bring back deleted team accounts with: python main.py --restore-team")
